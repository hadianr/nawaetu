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
