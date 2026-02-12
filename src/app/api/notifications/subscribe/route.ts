import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { token, deviceType, timezone, userLocation, prayerPreferences } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Upsert logic: if token exists, update it, otherwise insert
        const existing = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, token))
            .limit(1);

        const data = {
            updatedAt: new Date(),
            active: 1,
            deviceType: deviceType || "web",
            timezone: timezone || "Asia/Jakarta",
            userLocation: userLocation ? JSON.stringify(userLocation) : null,
            // If provided, update preferences; otherwise keep existing or null
            prayerPreferences: prayerPreferences ? JSON.stringify(prayerPreferences) : undefined,
        };

        if (existing.length > 0) {
            await db
                .update(pushSubscriptions)
                .set(data)
                .where(eq(pushSubscriptions.token, token));
        } else {
            await db.insert(pushSubscriptions).values({
                token,
                ...data,
                // For new insert, use provided prefs or null
                prayerPreferences: prayerPreferences ? JSON.stringify(prayerPreferences) : null,
                userId: null,
                lastUsedAt: null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
