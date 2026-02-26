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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure user is logged in
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || amount < 5000) {
            return NextResponse.json({ error: "Minimum donation is Rp 5.000" }, { status: 400 });
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
            description: `Infaq Pengembangan Nawaetu - Amal Jariyah atas nama ${session.user.name || "Hamba Allah"}`,
            name: session.user.name || "Hamba Allah",
            email: session.user.email,
            mobile: "081234567890",
            redirectUrl: `${process.env.NEXTAUTH_URL}/settings?payment=success`,
            failureRedirectUrl: `${process.env.NEXTAUTH_URL}/settings?payment=failed`
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
            // Mayar often uses 'messages' instead of 'message' or 'error'
            const errorMessage =
                mayarData?.messages ||
                mayarData?.message ||
                mayarData?.error ||
                (typeof mayarData === 'string' ? mayarData : "Failed to create payment link");

            console.error(`[${new Date().toISOString()}] Mayar Payment Creation Failed:`, errorMessage);

            return NextResponse.json({
                error: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage
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
