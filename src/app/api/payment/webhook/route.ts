import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, and, desc, or, ne } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;
        const signature = req.headers.get("X-Mayar-Signature");

        if (!webhookSecret) {
            console.error("MAYAR_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: "Missing Signature" }, { status: 400 });
        }

        // Get raw body for signature verification
        const rawBody = await req.text();

        // Verify HMAC-SHA256 Signature
        // Ensuring integrity and authenticity of the webhook payload
        const hmac = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

        // Use timing-safe comparison to prevent timing attacks
        const signatureBuffer = Buffer.from(signature);
        const hmacBuffer = Buffer.from(hmac);

        if (signatureBuffer.length !== hmacBuffer.length || !crypto.timingSafeEqual(signatureBuffer, hmacBuffer)) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
        }

        const body = JSON.parse(rawBody);

        // Handle Mayar "Testing URL" event
        if (body.event === "testing") {
            return NextResponse.json({ status: "ok", message: "Webhook connection verified" });
        }

        // Validate Event Type & Payload Structure
        // Payload might be wrapped in 'data' object based on screenshots
        const data = body.data || body;
        const status = data.status; // e.g. "SETTLEMENT" or "SUCCESS"
        const mayarId = data.id;
        const linkId = data.link_id || data.paymentLinkId; // Adjust based on possible field names
        const productId = data.productId; // Matches paymentLinkId often

        if (!mayarId) {
            console.error("Webhook Error: Invalid Payload (Missing ID)", body);
            return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
        }

        // Find Transaction by ID (Transaction ID or Payment Link ID)
        const conditions = [eq(transactions.mayarId, mayarId)];
        if (linkId) {
            conditions.push(eq(transactions.paymentLinkId, linkId));
        }
        if (productId) {
            conditions.push(eq(transactions.paymentLinkId, productId));
        }
        // Also check if stored paymentLinkId matches incoming Transaction ID
        conditions.push(eq(transactions.paymentLinkId, mayarId));

        let transaction = await db.query.transactions.findFirst({
            where: or(...conditions)
        });

        if (!transaction) {
            // Fallback: Find pending transaction by email and amount
            const email = data.customer?.email || data.customer_email || data.customerEmail || data.merchantEmail; // Added proper field check
            const amount = data.amount;

            console.log(`[Webhook] Fallback lookup for email: ${email}, amount: ${amount}`);

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
                    console.warn(`Webhook: Transaction not found for email ${email} amount ${amount}`);
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

        // Check if already processed
        if (transaction.status === 'settlement') {
            return NextResponse.json({ status: "ok", message: "Transaction already processed" });
        }

        // Normalize Status for Enum compatibility
        let normalizedStatus = status ? status.toLowerCase() : 'failed';
        if (normalizedStatus === "paid" || normalizedStatus === "success") normalizedStatus = "settlement";

        // Ensure valid enum value (fallback to failed if unknown)
        const validStatuses = ["pending", "settlement", "expired", "failed"];
        if (!validStatuses.includes(normalizedStatus)) {
            console.warn(`Unknown payment status received: ${status}, mapped to: ${normalizedStatus}`);
            // If unknown status but strictly 'pending' or similar, we might want to be careful.
            // But if it is 'created' (from transactionStatus), we generally ignore or keep pending.
            // If the MAIN status is SUCCESS/SETTLEMENT, we proceed.
            // If status is undefined, we default to failed above.

            // Should we map 'created' to pending?
            if (normalizedStatus === 'created') normalizedStatus = 'pending';
            else normalizedStatus = 'failed';
        }

        // Atomic Update: Ensure we only update if status is NOT 'settlement'
        const updatedTransactions = await db.update(transactions)
            .set({
                status: normalizedStatus as any,
                mayarId: mayarId // Always ensure the actual Transaction ID is stored
            })
            .where(and(
                eq(transactions.id, transaction.id),
                ne(transactions.status, 'settlement') // Prevent race condition
            ))
            .returning();

        if (updatedTransactions.length === 0) {
            // Already processed by another request (or failed to match condition)
            return NextResponse.json({ status: "ok", message: "Transaction already processed (concurrent)" });
        }

        const updatedTx = updatedTransactions[0];

        // If Paid (SETTLEMENT), Update User to Muhsinin
        // Use updated transaction status to be sure
        if (updatedTx.status === "settlement") {
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
