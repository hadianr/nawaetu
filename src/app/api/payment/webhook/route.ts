import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.MAYAR_WEBHOOK_SECRET;
        const signature = req.headers.get("X-Mayar-Signature");

        if (!secret) {
            console.error("MAYAR_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: "Missing Signature" }, { status: 400 });
        }

        // Get raw body for signature verification
        const rawBody = await req.text();

        // Verify HMAC-SHA256 Signature
        const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

        // Use timing-safe comparison to prevent timing attacks
        const signatureBuffer = Buffer.from(signature);
        const hmacBuffer = Buffer.from(hmac);

        if (signatureBuffer.length !== hmacBuffer.length || !crypto.timingSafeEqual(signatureBuffer, hmacBuffer)) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);


        // Validate Event Type
        // Usually event is "payment.received" or similar
        // Adjust based on real Mayar webhook payload structure
        const status = body.status; // e.g. "SETTLEMENT"
        const mayarId = body.id;

        if (!mayarId) {
            return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
        }

        // Find Transaction by ID (Transaction ID or Payment Link ID)
        const conditions = [eq(transactions.mayarId, mayarId)];
        if (body.link_id) {
            conditions.push(eq(transactions.paymentLinkId, body.link_id));
        }
        // Also check if stored paymentLinkId matches incoming Transaction ID (e.g. sometimes same?)
        conditions.push(eq(transactions.paymentLinkId, mayarId));

        let transaction = await db.query.transactions.findFirst({
            where: or(...conditions)
        });

        if (!transaction) {
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
                    // Update the transaction with the real Transaction ID from webhook
                    await db.update(transactions)
                        .set({ mayarId: mayarId })
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

        // Normalize Status for Enum compatibility
        let normalizedStatus = status.toLowerCase();
        if (normalizedStatus === "paid") normalizedStatus = "settlement";

        // Ensure valid enum value (fallback to failed if unknown, or keep existing? safer to fail or set to failed)
        // For safe typing, we cast to any or check validity
        const validStatuses = ["pending", "settlement", "expired", "failed"];
        if (!validStatuses.includes(normalizedStatus)) {
            console.warn(`Unknown payment status received: ${status}`);
            // If unknown, maybe we shouldn't fail the webhook but perhaps we shouldn't update status to invalid value.
            // Let's assume we map unknown to 'failed' or keep pending?
            // Safest is to not update status if invalid, but we want to store the MayarID.
            // We'll proceed but rely on Drizzle/DB to error if we don't handle it. 
            // Let's map to 'failed' if truly unknown to be safe on DB side.
            normalizedStatus = 'failed';
        }

        // Update Transaction (Status and ensure real Transaction ID is stored)
        await db.update(transactions)
            .set({
                status: normalizedStatus as any,
                mayarId: mayarId // Always ensure the actual Transaction ID is stored
            })
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
