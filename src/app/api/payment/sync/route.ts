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

        if (!latestTx || !latestTx.mayarId) {
            return NextResponse.json({
                status: "nothing_to_check",
                isMuhsinin: user.isMuhsinin
            });
        }

        // 2. Check with Mayar API
        // Docs: Check Single Payment
        const apiKey = process.env.MAYAR_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Mayar API Key not configured" }, { status: 500 });
        }

        const mayarUrl = `https://api.mayar.id/hl/v1/payment/check/${latestTx.mayarId}`;
        const mayarRes = await fetch(mayarUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!mayarRes.ok) {
            return NextResponse.json({
                status: "failed_to_check_mayar",
                txStatus: latestTx.status
            });
        }

        const mayarData = await mayarRes.json();
        // Mayar status usually: PENDING, PAID, SETTLEMENT, EXPIRED, FAILED
        const status = mayarData.data?.status || latestTx.status;

        console.log(`[Payment Sync] User ${user.email} | Mayar Status: ${status}`);

        // 3. Update if PAID/SETTLEMENT
        if (status === "PAID" || status === "SETTLEMENT") {
            // Update Transaction
            await db.update(transactions)
                .set({ status: status.toLowerCase() })
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
                isMuhsinin: true
            });
        }

        return NextResponse.json({
            status: status.toLowerCase(),
            isMuhsinin: user.isMuhsinin
        });

    } catch (e) {
        console.error("[Payment Sync Error]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
