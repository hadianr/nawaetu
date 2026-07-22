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
import { db, checkConnection } from "@/db";
import { userFeedback } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { and, eq, gte, sql } from "drizzle-orm";

const MAX_FEEDBACK_PER_HOUR = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_COUNT = 3;

export async function POST(req: NextRequest) {
    try {
        // 1. Health check
        const dbStatus = await checkConnection();
        if (!dbStatus.success) {
            return NextResponse.json(
                { error: "Database connection failure" },
                { status: 503 }
            );
        }

        // 2. Validate Session (Required login)
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Silakan masuk terlebih dahulu untuk mengirim masukan." },
                { status: 401 }
            );
        }
        const userId = session.user.id;
        const userName = session.user.name || "Sobat Nawaetu";
        const userEmail = session.user.email || "Tidak ada email";

        // 3. Database-Backed Rate Limiting (Zero Packages)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(userFeedback)
            .where(
                and(
                    eq(userFeedback.userId, userId),
                    gte(userFeedback.createdAt, oneHourAgo)
                )
            );

        if (count >= MAX_FEEDBACK_PER_HOUR) {
            return NextResponse.json(
                { error: "Batas pengiriman terlampaui. Anda hanya dapat mengirim 5 masukan per jam." },
                { status: 429 }
            );
        }

        // 4. Parse Form Data
        const formData = await req.formData();
        const type = formData.get("type") as string;
        const message = formData.get("message") as string;
        const deviceInfoStr = formData.get("deviceInfo") as string;
        const screenshots = formData.getAll("screenshots") as File[];

        if (!type || !message || !deviceInfoStr) {
            return NextResponse.json(
                { error: "Mohon isi semua data yang diperlukan." },
                { status: 400 }
            );
        }

        if (type !== "bug" && type !== "feature") {
            return NextResponse.json(
                { error: "Tipe masukan tidak valid." },
                { status: 400 }
            );
        }

        let deviceInfo: any = {};
        try {
            deviceInfo = JSON.parse(deviceInfoStr);
        } catch (e) {
            return NextResponse.json(
                { error: "Format data perangkat tidak valid." },
                { status: 400 }
            );
        }

        // 5. Images Validation (Optional, Max 3 images, 5MB each)
        if (screenshots.length > MAX_IMAGES_COUNT) {
            return NextResponse.json(
                { error: `Maksimal hanya diperbolehkan mengunggah ${MAX_IMAGES_COUNT} gambar.` },
                { status: 400 }
            );
        }

        for (const file of screenshots) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                return NextResponse.json(
                    { error: `Ukuran file "${file.name}" melebihi batas maksimal 5MB.` },
                    { status: 400 }
                );
            }
            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { error: `File "${file.name}" bukan format gambar yang valid.` },
                    { status: 400 }
                );
            }
        }

        // 6. Save textual info to Database
        await db.insert(userFeedback).values({
            userId,
            type,
            message,
            deviceInfo,
        });

        // 7. Format Telegram Notification Content
        const emoji = type === "bug" ? "🐛 [BUG REPORT]" : "💡 [FEATURE REQUEST]";
        const parseMode = "HTML";
        
        // Build rich HTML message (safe tags: <b>, <i>, <code>, <a>)
        const captionText = [
            `<b>${emoji}</b>`,
            `----------------------------------------`,
            `<b>👤 Pengirim:</b>`,
            `• Nama: ${userName}`,
            `• Email: ${userEmail}`,
            `• User ID: <code>${userId}</code>`,
            ``,
            `<b>📝 Pesan:</b>`,
            `<i>"${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</i>`,
            ``,
            `<b>📱 Detail Perangkat:</b>`,
            `• Versi App: <code>${deviceInfo.appVersion || "N/A"}</code>`,
            `• OS: <code>${deviceInfo.os || "N/A"}</code>`,
            `• Browser: <code>${deviceInfo.browser || "N/A"}</code>`,
            `• Ukuran Layar: <code>${deviceInfo.screenSize || "N/A"}</code>`,
            `• User Agent: <code>${deviceInfo.userAgent || "N/A"}</code>`,
        ].join("\n");

        // 8. Forward to Telegram (if credentials are set)
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_FEEDBACK_CHAT_ID;

        if (botToken && chatId) {
            try {
                if (screenshots.length === 0) {
                    // Send text message only
                    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: captionText,
                            parse_mode: parseMode,
                        }),
                    });

                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error("Telegram sendMessage API failed:", errText);
                        throw new Error("Gagal mengirim pesan ke Telegram.");
                    }
                } else if (screenshots.length === 1) {
                    // Send single photo
                    const file = screenshots[0];
                    const tgFormData = new FormData();
                    tgFormData.append("chat_id", chatId);
                    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                    tgFormData.append("photo", blob, file.name);
                    tgFormData.append("caption", captionText);
                    tgFormData.append("parse_mode", parseMode);

                    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                        method: "POST",
                        body: tgFormData,
                    });

                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error("Telegram sendPhoto API failed:", errText);
                        throw new Error("Gagal mengirim gambar ke Telegram.");
                    }
                } else {
                    // Send multiple photos via sendMediaGroup
                    const tgFormData = new FormData();
                    tgFormData.append("chat_id", chatId);

                    const media = screenshots.map((file, index) => ({
                        type: "photo",
                        media: `attach://photo_${index}`,
                        caption: index === 0 ? captionText : undefined,
                        parse_mode: index === 0 ? parseMode : undefined,
                    }));

                    tgFormData.append("media", JSON.stringify(media));

                    for (let i = 0; i < screenshots.length; i++) {
                        const file = screenshots[i];
                        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                        tgFormData.append(`photo_${i}`, blob, file.name);
                    }

                    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                        method: "POST",
                        body: tgFormData,
                    });

                    if (!tgRes.ok) {
                        const errText = await tgRes.text();
                        console.error("Telegram sendMediaGroup API failed:", errText);
                        throw new Error("Gagal mengirim kumpulan gambar ke Telegram.");
                    }
                }
            } catch (err) {
                console.error("Error communicating with Telegram Bot:", err);
                // We do NOT fail the user's request if Telegram fails, since the feedback is already stored in the DB
                return NextResponse.json({ 
                    success: true, 
                    warning: "Masukan disimpan, namun gagal mengirimkan notifikasi ke Telegram.",
                });
            }
        } else {
            console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_FEEDBACK_CHAT_ID is missing. Notification skipped.");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API error submitting feedback:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan internal. Silakan coba lagi nanti." },
            { status: 500 }
        );
    }
}
