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
            timezone: timezone || "UTC",
            userLocation: userLocation || null, // Legacy (full object)
            latitude: userLocation?.lat || null,
            longitude: userLocation?.lng || null,
            // Prefer city-level name (Kabupaten/Kota), fallback to display name (kecamatan)
            city: userLocation?.city || userLocation?.name || null,
            // New geographic fields from enriched geocoding
            country: userLocation?.country || null,
            countryCode: userLocation?.countryCode || null,
            prayerPreferences: prayerPreferences || undefined,
        };

        // Optimized: Single upsert operation
        await db.insert(pushSubscriptions)
            .values({
                token,
                ...data,
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
