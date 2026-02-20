import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, and, desc, or, ne } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

        // Log headers to see what Mayar actually sends in production
        const headersObj = Object.fromEntries(req.headers);
        console.log("[Mayar Webhook] Incoming Headers:", JSON.stringify(headersObj));

        // 1. Configuration Check
        if (!webhookSecret) {
            console.error("[Mayar Webhook] MAYAR_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration Error: Secret missing" }, { status: 500 });
        }

        const rawBody = await req.text();
        const signature = req.headers.get("x-mayar-signature") || req.headers.get("X-Mayar-Signature");
        const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
        const mayarToken = req.headers.get("x-webhook-token") || req.headers.get("X-Webhook-Token");

        let isValid = false;

        // Try exact token match first (if Mayar sends the token plainly as shown in dashboard)
        if (signature === webhookSecret ||
            authHeader === `Bearer ${webhookSecret}` ||
            authHeader === webhookSecret ||
            mayarToken === webhookSecret) {
            isValid = true;
            console.log("[Mayar Webhook] Signature verified via direct token match");
        } else if (signature) {
            // Try HMAC SHA256 hash (standard webhook pattern)
            const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
            if (signature === expectedSignature) {
                isValid = true;
                console.log("[Mayar Webhook] Signature verified via HMAC SHA256");
            } else {
                console.error(`[Mayar Webhook] HMAC mismatch. Received: ${signature}, Expected: ${expectedSignature}`);
            }
        }

        if (!isValid) {
            console.error("[Mayar Webhook] Invalid or Missing Signature. Headers:", JSON.stringify(headersObj));
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        const body = JSON.parse(rawBody);

        // 3. Handle Testing Event
        if (body.event === "testing") {
            return NextResponse.json({ status: "ok", message: "Webhook connection verified" });
        }

        // 3.5 Check Event Type
        if (body.event && body.event !== "payment.received" && body.event !== "payment.reminder") {
            console.log(`[Mayar Webhook] Ignoring unhandled event: ${body.event}`);
            return NextResponse.json({ status: "ok", message: `Event ${body.event} ignored` });
        }

        // 4. Data Extraction
        const data = body.data || body;
        const status = data.status;
        const mayarId = data.transactionId || data.id; // Corrected: Transaction ID is in data.transactionId
        const linkId = data.link_id || data.paymentLinkId;
        const productId = data.productId; // Should match our paymentLinkId

        if (!mayarId) {
            return NextResponse.json({ error: "Invalid Payload: Missing Transaction ID" }, { status: 400 });
        }

        console.log(`[Mayar Webhook] Processing: MayarID=${mayarId}, ProductID=${productId}, Status=${status}`);

        // 5. Transaction Lookup Strategy
        const conditions = [eq(transactions.mayarId, mayarId)];
        if (linkId) conditions.push(eq(transactions.paymentLinkId, linkId));
        if (productId) conditions.push(eq(transactions.paymentLinkId, productId));

        // Use OR to find any match, prioritizing mayarId, then paymentLinkId/productId
        let transaction = await db.query.transactions.findFirst({
            where: or(...conditions)
        });

        // 6. Fallback Lookup (Email & Amount)
        if (!transaction) {
            const email = data.customerEmail || data.customer?.email || data.merchantEmail;
            const amount = data.amount;

            console.log(`[Mayar Webhook] Transaction not found by ID. Trying fallback for Email: ${email}, Amount: ${amount}`);

            if (email && amount !== undefined && amount !== null) {
                // Find latest transaction with same email/amount, allowing pending or failed (retry scenario)
                const potentialTx = await db.query.transactions.findFirst({
                    where: and(
                        eq(transactions.customerEmail, String(email)),
                        eq(transactions.amount, Number(amount))
                        // Removed strict 'pending' check to allow recovering 'failed' attempts if Mayar says Success later
                        // But we should exclude already settled ones ideally?
                    ),
                    orderBy: [desc(transactions.createdAt)]
                });

                if (potentialTx && potentialTx.status !== 'settlement') {
                    // Link correct Mayar ID
                    await db.update(transactions)
                        .set({ mayarId: mayarId })
                        .where(eq(transactions.id, potentialTx.id));

                    transaction = potentialTx;
                    console.log(`[Mayar Webhook] Fallback Sucess. Linked to Transaction ID: ${transaction.id}`);
                }
            }
        }

        // 7. Final Transaction Check
        if (!transaction) {
            console.error("[Mayar Webhook] Transaction Not Found");
            return NextResponse.json({
                error: "Transaction not found",
                debug: { mayarId, productId, linkId, email: data.customerEmail, amount: data.amount }
            }, { status: 404 });
        }

        // 8. Idempotency Check
        if (transaction.status === 'settlement') {
            console.log("[Mayar Webhook] Transaction already settled. Ignoring.");
            return NextResponse.json({ status: "ok", message: "Already processed" });
        }

        // 9. Status Normalization
        let normalizedStatus = 'failed';
        if (typeof status === 'boolean') {
            normalizedStatus = status ? 'settlement' : 'failed';
        } else if (typeof status === 'string') {
            const lowerStatus = status.toLowerCase();
            if (lowerStatus === 'paid' || lowerStatus === 'success' || lowerStatus === 'settlement') {
                normalizedStatus = 'settlement';
            } else if (lowerStatus === 'pending' || lowerStatus === 'created') {
                normalizedStatus = 'pending';
            } else if (lowerStatus === 'expired') {
                normalizedStatus = 'expired';
            }
        }

        // 10. Update Transaction
        const updatedTransactions = await db.update(transactions)
            .set({
                status: normalizedStatus as any,
                mayarId: mayarId
            })
            .where(and(
                eq(transactions.id, transaction.id),
                ne(transactions.status, 'settlement')
            ))
            .returning();

        if (updatedTransactions.length === 0) {
            return NextResponse.json({ status: "ok", message: "Transaction update skipped (race condition)" });
        }

        const updatedTx = updatedTransactions[0];

        // 11. Grant Muhsinin Status
        if (updatedTx.status === "settlement" && transaction.userId) {
            const { sql } = await import("drizzle-orm");
            await db.update(users)
                .set({
                    isMuhsinin: true,
                    muhsininSince: new Date(),
                    totalInfaq: sql`${users.totalInfaq} + ${transaction.amount}`
                })
                .where(eq(users.id, transaction.userId));
            console.log(`[Mayar Webhook] Granted Muhsinin to User ${transaction.userId}`);
        }

        return NextResponse.json({ status: "ok", data: updatedTx });

    } catch (e: any) {
        console.error("[Mayar Webhook] Internal Error:", e);
        return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 });
    }
}
