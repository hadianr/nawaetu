/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { fetchWithTimeout } from "@/lib/utils/fetch";

export async function GET(req: NextRequest) {
    void req;
    try {
        const session = await getServerSession();

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

        let status: string = latestTx.status;
        let method = "none";

        if (latestTx.mayarId) {
            const mayarUrl = `https://api.mayar.id/hl/v2/transactions/${latestTx.mayarId}`;
            const mayarRes = await fetchWithTimeout(mayarUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }, { timeoutMs: 10000 });

            if (mayarRes.ok) {
                const mayarData = await mayarRes.json();
                status = mayarData.data?.status || latestTx.status;
                method = "direct_id";
            }
        }

        if (!latestTx.mayarId && latestTx.paymentLinkId) {
            const listUrl = `https://api.mayar.id/hl/v2/transactions/unpaid?paymentLinkId=${encodeURIComponent(latestTx.paymentLinkId)}&limit=50`;
            const listRes = await fetchWithTimeout(listUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }, { timeoutMs: 10000 });

            if (listRes.ok) {
                const listData = await listRes.json();
                const matchedTx = (listData.data || []).find((tx: { amount?: number; status?: string; id?: string }) =>
                    tx.amount === latestTx.amount
                );

                if (matchedTx) {
                    // Update Local Transaction with correct Mayar ID
                    await db.update(transactions)
                        .set({
                            mayarId: matchedTx.id,
                            status: matchedTx.status?.toLowerCase() === "expired" ? "expired" : "pending"
                        })
                        .where(eq(transactions.id, latestTx.id));

                    status = matchedTx.status?.toLowerCase() === "expired" ? "expired" : "pending";
                    method = "fallback_list";
                }
            }
        }

        // Mayar v2 transaction statuses are lowercase: paid, unpaid, created, expired.
        if (status.toLowerCase() === "paid" || status.toLowerCase() === "settled" || status.toLowerCase() === "settlement") {
            await db.update(transactions)
                .set({ status: "settlement" })
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
            status: status.toLowerCase() === "unpaid" || status.toLowerCase() === "created" ? "pending" : status.toLowerCase(),
            isMuhsinin: user.isMuhsinin
        });

    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
