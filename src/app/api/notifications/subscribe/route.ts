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
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { pushSubscriptions, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        const userId = session?.user?.id ?? null;

        const { token, deviceType, timezone, userLocation, prayerPreferences } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const effectiveDeviceType = deviceType || "web";

        const data = {
            updatedAt: new Date(),
            active: 1,
            deviceType: effectiveDeviceType,
            timezone: timezone || "UTC",
            userLocation: userLocation || undefined, // Legacy (full object)
            latitude: userLocation?.lat || null,
            longitude: userLocation?.lng || null,
            // Prefer city-level name (Kabupaten/Kota), fallback to display name (kecamatan)
            city: userLocation?.city || userLocation?.name || null,
            // New geographic fields from enriched geocoding
            country: userLocation?.country || null,
            countryCode: userLocation?.countryCode || null,
            prayerPreferences: prayerPreferences || undefined,
        };

        let validUserId: string | null = null;
        if (userId) {
            try {
                const userExists = await db.query.users.findFirst({
                    where: eq(users.id, userId),
                    columns: { id: true },
                });
                if (userExists) {
                    validUserId = userId;
                } else {
                    logger.warn("Session userId not found in database, subscribing anonymously", { userId, route: "/api/notifications/subscribe" });
                }
            } catch (e) {
                logger.warn("Error checking user existence", { route: "/api/notifications/subscribe", error: e instanceof Error ? e.message : String(e) });
            }
        }

        // Deactivate previous tokens for the same user and device type if user is logged in
        if (validUserId) {
            try {
                await db.update(pushSubscriptions)
                    .set({ active: 0, updatedAt: new Date() })
                    .where(and(
                        eq(pushSubscriptions.userId, validUserId),
                        eq(pushSubscriptions.deviceType, effectiveDeviceType),
                        ne(pushSubscriptions.token, token)
                    ));
            } catch (e) {
                // Non-fatal cleanup log
                logger.warn("Could not deactivate previous user tokens", { route: "/api/notifications/subscribe", error: e instanceof Error ? e.message : String(e) });
            }
        }

        // Optimized: Single upsert operation
        await db.insert(pushSubscriptions)
            .values({
                token,
                ...data,
                userLocation: userLocation || null,
                prayerPreferences: prayerPreferences || null,
                userId: validUserId,
                lastUsedAt: null,
            })
            .onConflictDoUpdate({
                target: pushSubscriptions.token,
                set: data,
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Subscribe API error", error, { route: "/api/notifications/subscribe" });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
