import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { token, prayerPreferences, userLocation, timezone } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        // Update subscription with preferences
        const existing = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.token, token))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(pushSubscriptions)
                .set({
                    prayerPreferences: prayerPreferences ? JSON.stringify(prayerPreferences) : null,
                    userLocation: userLocation ? JSON.stringify(userLocation) : null,
                    latitude: userLocation?.lat || null,
                    longitude: userLocation?.lng || null,
                    city: userLocation?.city || null,
                    timezone: timezone || null,
                    updatedAt: new Date(),
                })
                .where(eq(pushSubscriptions.token, token));

            return NextResponse.json({ success: true, message: "Preferences updated" });
        } else {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
