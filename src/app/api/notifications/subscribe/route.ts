import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { token, deviceType } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Upsert logic: if token exists, update it, otherwise insert
        const existing = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, token))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(pushSubscriptions)
                .set({
                    updatedAt: new Date(),
                    active: 1,
                    deviceType: deviceType || existing[0].deviceType,
                })
                .where(eq(pushSubscriptions.token, token));
        } else {
            await db.insert(pushSubscriptions).values({
                token,
                deviceType: deviceType || "web",
                active: 1,
                userId: null,
                prayerPreferences: null,
                userLocation: null,
                timezone: null,
                lastUsedAt: null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in push subscription API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
