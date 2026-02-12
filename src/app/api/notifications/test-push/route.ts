import { NextRequest, NextResponse } from "next/server";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { token, title, body } = await req.json();


        if (!messagingAdmin) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        if (!token) {
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


        const response = await messagingAdmin.send(message);

        return NextResponse.json({ success: true, messageId: response });
    } catch (error: any) {

        return NextResponse.json({
            error: "Failed to send notification",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
