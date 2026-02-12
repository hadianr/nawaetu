
import { NextRequest, NextResponse } from "next/server";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        const { token, title, body } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        if (!messagingAdmin) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // Send a High Priority Test Notification optimized for Web Push (iOS/Android)
        const result = await messagingAdmin.send({
            token: token,
            notification: {
                title: "Test Notifikasi Nawaetu",
                body: "Ini adalah tes notifikasi langsung dari server. Jika Anda melihat ini, berarti koneksi FCM berfungsi normal! 🚀",
            },
            data: {
                type: "test_notification",
                url: "/"
            },
            // Simplified WebPush for maximum compatibility (iOS PWA + Android Chrome)
            webpush: {
                headers: {
                    "Urgency": "high",
                    "TTL": "86400"
                },
                notification: {
                    title: "Test Notifikasi Nawaetu",
                    body: "Tes notifikasi (WebPush High Urgency). Apakah ini muncul saat Kill App? 🚀",
                    icon: "/icon.png",
                    badge: "/icon.png",
                    requireInteraction: true,
                    data: {
                        url: "/"
                    }
                }
            },
            // Android Specifics
            android: {
                priority: "high",
                notification: {
                    channelId: "prayer-alerts",
                    priority: "max",
                    visibility: "public"
                }
            }
        });

        return NextResponse.json({ success: true, messageId: result });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code
        }, { status: 500 });
    }
}
