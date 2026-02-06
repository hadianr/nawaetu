import { NextRequest, NextResponse } from "next/server";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { token, title, body } = await req.json();

        console.log("=== Test Push Request ===");
        console.log("Token received:", token?.substring(0, 50) + "...");
        console.log("Title:", title);
        console.log("Body:", body);
        console.log("messagingAdmin exists:", !!messagingAdmin);

        if (!messagingAdmin) {
            console.error("Firebase Admin not initialized");
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        if (!token) {
            console.error("No token provided");
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const message = {
            notification: {
                title: title || "Halo Sobat Nawaetu!",
                body: body || "Ini adalah notifikasi percobaan.",
            },
            data: {
                type: "test",
                timestamp: new Date().toISOString(),
            },
            token: token,
        };

        console.log("Sending message:", JSON.stringify(message, null, 2));

        const response = await messagingAdmin.send(message);
        console.log("Successfully sent message:", response);

        return NextResponse.json({ success: true, messageId: response });
    } catch (error: any) {
        console.error("=== Error sending push notification ===");
        console.error("Error name:", error?.name);
        console.error("Error message:", error?.message);
        console.error("Error code:", error?.code);
        console.error("Error stack:", error?.stack);
        console.error("Full error:", JSON.stringify(error, null, 2));

        return NextResponse.json({
            error: "Failed to send notification",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
