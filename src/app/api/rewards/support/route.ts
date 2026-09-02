import { NextRequest, NextResponse } from "next/server";
import { transactionDb, checkConnection } from "@/db";
import { userFeedback } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { and, eq, gte, sql } from "drizzle-orm";

const SUPPORT_TYPES = new Set(["physical-product", "digital-reward", "discount", "charity", "operations", "other"]);
const MAX_SUPPORT_PER_HOUR = 5;

function clean(value: FormDataEntryValue | null, max = 1000) {
    return typeof value === "string"
        ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max)
        : "";
}

function escapeHtml(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Please sign in before submitting support." }, { status: 401 });
    if (Number(request.headers.get("content-length") || 0) > 20_000) {
        return NextResponse.json({ error: "Support submission is too large." }, { status: 413 });
    }
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
        return NextResponse.json({ error: "Invalid support submission format." }, { status: 415 });
    }
    const connection = await checkConnection();
    if (!connection.success) return NextResponse.json({ error: "Database connection failure." }, { status: 503 });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_FEEDBACK_CHAT_ID;
    if (!botToken || !chatId) {
        return NextResponse.json({ error: "Telegram support is not configured." }, { status: 503 });
    }

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return NextResponse.json({ error: "Invalid support submission." }, { status: 400 });
    }
    const name = clean(form.get("name"), 160);
    const email = clean(form.get("email"), 320);
    const supportType = clean(form.get("supportType"), 40);
    const location = clean(form.get("location"), 160);
    const fulfillment = clean(form.get("fulfillment"), 40);
    const description = clean(form.get("description"), 3000);

    if (!name || !email || !description || !SUPPORT_TYPES.has(supportType)) {
        return NextResponse.json({ error: "Please complete the required support fields." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const submittedMessage = [
        `Name / organization: ${name}`,
        `Email: ${email}`,
        `Support type: ${supportType}`,
        `Location: ${location || "Not provided"}`,
        `Fulfillment: ${fulfillment || "Not provided"}`,
        `Description: ${description}`,
    ].join("\n");
    try {
        await transactionDb.transaction(async (tx) => {
            await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${session.user.id}))`);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const [{ count }] = await tx.select({ count: sql<number>`count(*)` }).from(userFeedback).where(and(
                eq(userFeedback.userId, session.user.id),
                eq(userFeedback.type, "support"),
                gte(userFeedback.createdAt, oneHourAgo),
            ));
            if (Number(count) >= MAX_SUPPORT_PER_HOUR) throw new Error("RATE_LIMIT");
            await tx.insert(userFeedback).values({
                userId: session.user.id,
                type: "support",
                message: submittedMessage,
                deviceInfo: { source: "rewards-support" },
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message === "RATE_LIMIT") {
            return NextResponse.json({ error: "Too many support submissions. Please try again later." }, { status: 429 });
        }
        throw error;
    }

    const message = [
        "<b>🎁 [REWARDS SUPPORT OFFER]</b>",
        "----------------------------------------",
        `<b>👤 Name / organization:</b> ${escapeHtml(name)}`,
        `<b>📧 Email:</b> ${escapeHtml(email)}`,
        `<b>🤝 Support type:</b> ${escapeHtml(supportType)}`,
        `<b>📍 Location:</b> ${escapeHtml(location || "Not provided")}`,
        `<b>📦 Fulfillment:</b> ${escapeHtml(fulfillment || "Not provided")}`,
        "",
        `<b>📝 Description:</b>\n${escapeHtml(description)}`,
    ].join("\n");

    let telegram: Response;
    try {
        telegram = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
        });
    } catch {
        return NextResponse.json({ error: "Telegram is temporarily unavailable." }, { status: 502 });
    }

    if (!telegram.ok) return NextResponse.json({ error: "Telegram could not receive the offer." }, { status: 502 });
    return NextResponse.json({ success: true });
}
