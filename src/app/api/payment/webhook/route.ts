import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.MAYAR_WEBHOOK_SECRET;
        const signature = req.headers.get("X-Mayar-Signature"); // Check if Mayar sends signature

        // Note: Mayar Webhook verification might vary. 
        // For now, we assume standard payload.

        const body = await req.json();

        console.log("[Mayar Webhook]", body);

        // Validate Event Type
        // Usually event is "payment.received" or similar
        // Adjust based on real Mayar webhook payload structure
        const status = body.status; // e.g. "SETTLEMENT"
        const mayarId = body.id;

        if (!mayarId) {
            return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
        }

        // Find Transaction
        let transaction = await db.query.transactions.findFirst({
            where: eq(transactions.mayarId, mayarId)
        });

        if (!transaction) {
            console.log(`[Mayar Webhook] Transaction not found by ID: ${mayarId}. Trying fallback by email/amount...`);
            // Fallback: Find pending transaction by email and amount
            const email = body.customer?.email || body.customer_email;
            const amount = body.amount;

            if (email && amount) {
                const potentialTx = await db.query.transactions.findFirst({
                    where: and(
                        eq(transactions.customerEmail, email),
                        eq(transactions.amount, amount),
                        eq(transactions.status, "pending")
                    ),
                    orderBy: [desc(transactions.createdAt)]
                });

                if (potentialTx) {
                    console.log(`[Mayar Webhook] Fallback matched transaction: ${potentialTx.id}`);
                    // Update the transaction with the real Transaction ID from webhook
                    await db.update(transactions)
                        .set({ mayarId: mayarId }) // Update link ID to actual transaction ID
                        .where(eq(transactions.id, potentialTx.id));

                    // Assign to transaction variable
                    transaction = potentialTx;
                } else {
                    return NextResponse.json({ message: "Transaction not found (fallback failed)" }, { status: 404 });
                }
            } else {
                return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
            }
        }

        // Safety check again
        if (!transaction) {
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }

        // Update Transaction Status
        await db.update(transactions)
            .set({ status: status.toLowerCase() })
            .where(eq(transactions.id, transaction.id));

        // If Paid (SETTLEMENT), Update User to Muhsinin
        if (status === "SETTLEMENT" || status === "PAID") {
            if (transaction.userId) {
                const { sql } = await import("drizzle-orm");
                await db.update(users)
                    .set({
                        isMuhsinin: true,
                        muhsininSince: new Date(),
                        totalInfaq: sql`${users.totalInfaq} + ${transaction.amount}`
                    })
                    .where(eq(users.id, transaction.userId));
            }
        }

        return NextResponse.json({ status: "ok" });

    } catch (e) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
