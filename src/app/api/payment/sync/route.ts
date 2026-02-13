import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user from DB
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 1. Find latest pending transaction
        const latestTx = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.userId, user.id),
                eq(transactions.status, "pending")
            ),
            orderBy: [desc(transactions.createdAt)]
        });

        if (!latestTx || (!latestTx.mayarId && !latestTx.paymentLinkId)) {
            return NextResponse.json({
                status: "nothing_to_check",
                isMuhsinin: user.isMuhsinin
            });
        }

        // 2. Check with Mayar API
        const apiKey = process.env.MAYAR_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Mayar API Key not configured" }, { status: 500 });
        }

        let status = latestTx.status;
        let method = "none";

        if (latestTx.mayarId) {
            const mayarUrl = `https://api.mayar.id/hl/v1/payment/check/${latestTx.mayarId}`;
            const mayarRes = await fetch(mayarUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (mayarRes.ok) {
                const mayarData = await mayarRes.json();
                status = mayarData.data?.status || latestTx.status;
                method = "direct_id";
            }
        }

        if ((status as string) !== "PAID" && (status as string) !== "SETTLEMENT") {
            const listUrl = `https://api.mayar.id/hl/v1/transactions?email=${encodeURIComponent(session.user.email)}&limit=5`;
            const listRes = await fetch(listUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (listRes.ok) {
                const listData = await listRes.json();
                const transactionsList = listData.data || [];

                // Find matching transaction (Link ID or Amount + recent)
                const matchedTx = transactionsList.find((tx: any) =>
                    (latestTx.paymentLinkId && tx.link_id === latestTx.paymentLinkId) ||
                    (tx.amount === latestTx.amount &&
                        (tx.status === "PAID" || tx.status === "SETTLEMENT"))
                );

                if (matchedTx) {
                    // Update Local Transaction with correct Mayar ID
                    await db.update(transactions)
                        .set({
                            mayarId: matchedTx.id,
                            status: (matchedTx.status.toLowerCase() === "paid" ? "settlement" : matchedTx.status.toLowerCase()) as any
                        })
                        .where(eq(transactions.id, latestTx.id));

                    status = matchedTx.status;
                    method = "fallback_list";
                }
            }
        }

        // 3. Update if PAID/SETTLEMENT
        if ((status as string) === "PAID" || (status as string) === "SETTLEMENT") {
            // Update Transaction
            let validStatus = status.toLowerCase();
            if (validStatus === 'paid') validStatus = 'settlement';
            await db.update(transactions)
                .set({ status: validStatus as any })
                .where(eq(transactions.id, latestTx.id));

            // Update User
            await db.update(users)
                .set({
                    isMuhsinin: true,
                    muhsininSince: new Date(),
                    totalInfaq: sql`${users.totalInfaq} + ${latestTx.amount}`
                })
                .where(eq(users.id, user.id));

            return NextResponse.json({
                status: "verified",
                isMuhsinin: true,
                method: method
            });
        }

        return NextResponse.json({
            status: status.toLowerCase(),
            isMuhsinin: user.isMuhsinin
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
