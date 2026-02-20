import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const { token, deviceType, timezone, userLocation, prayerPreferences } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const data = {
            updatedAt: new Date(),
            active: 1,
            deviceType: deviceType || "web",
            timezone: timezone || "Asia/Jakarta",
            userLocation: userLocation || null, // Legacy
            latitude: userLocation?.lat || null,
            longitude: userLocation?.lng || null,
            city: userLocation?.city || null,
            // If provided, update preferences; otherwise keep existing (undefined means Drizzle ignores it in 'set')
            prayerPreferences: prayerPreferences || undefined,
        };

        // Optimized: Single upsert operation
        await db.insert(pushSubscriptions)
            .values({
                token,
                ...data,
                // For new insert, ensure prayerPreferences is null if not provided
                prayerPreferences: prayerPreferences || null,
                userId: null,
                lastUsedAt: null,
            })
            .onConflictDoUpdate({
                target: pushSubscriptions.token,
                set: data,
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
