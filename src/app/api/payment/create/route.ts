import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure user is logged in
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || amount < 10000) {
            return NextResponse.json({ error: "Minimum donation is Rp 10.000" }, { status: 400 });
        }

        // 1. Call Mayar API to create Single Payment Link (SPL)
        // Docs: https://docs.mayar.id/reference/create-payment
        const mayarUrl = "https://api.mayar.id/hl/v1/payment/create";
        const apiKey = process.env.MAYAR_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Mayar API Key not configured" }, { status: 500 });
        }

        const body = {
            amount: amount,
            type: "ONETIME",
            description: `Infaq Nawaetu - ${session.user.name || session.user.email} (${Date.now()})`,
            name: session.user.name || "Hamba Allah",
            email: session.user.email,
            mobile: "081234567890",
            redirectUrl: `${process.env.NEXTAUTH_URL}/atur?payment=success`,
            failureRedirectUrl: `${process.env.NEXTAUTH_URL}/atur?payment=failed`
        };

        const mayarRes = await fetch(mayarUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const mayarData = await mayarRes.json();

        if (!mayarRes.ok) {

            // Log to local file for agent to read
            try {
                const logMsg = `[${new Date().toISOString()}] BODY: ${JSON.stringify(body)} | ERROR: ${JSON.stringify(mayarData)}\n`;
                fs.appendFileSync(path.join(process.cwd(), "MAYAR_ERROR.log"), logMsg);
            } catch (err) {
            }

            // Mayar often uses 'messages' instead of 'message' or 'error'
            const errorMessage =
                mayarData?.messages ||
                mayarData?.message ||
                mayarData?.error ||
                (typeof mayarData === 'string' ? mayarData : "Failed to create payment link");

            return NextResponse.json({
                error: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
                debug: mayarData
            }, { status: 500 });
        }

        const paymentLink = mayarData.data.link;
        const mayarId = mayarData.data.id;

        // 2. Save Transaction to DB
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (user) {
            await db.insert(transactions).values({
                userId: user.id,
                amount: amount,
                status: "pending",
                paymentLinkId: mayarId, // Store Link ID here
                mayarId: null, // Actual Transaction ID will come from webhook
                paymentUrl: paymentLink,
                customerName: session.user.name,
                customerEmail: session.user.email
            });
        }

        return NextResponse.json({ link: paymentLink });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
