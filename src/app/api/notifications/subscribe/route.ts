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
import { eq, and, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const maxDuration = 30;

const DEVICE_TOKEN_HEADER = "x-device-token";

/**
 * The device token is a credential for the guest side of this app, so it travels in a header and never in a URL
 * (access logs, proxies and browser history keep URLs). The query form is still read for app versions that are
 * already installed; remove it once they have updated.
 */
function deviceToken(req: NextRequest): string | null {
    return req.headers?.get(DEVICE_TOKEN_HEADER) || new URL(req.url, "http://localhost").searchParams.get("token");
}

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = deviceToken(req);
    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const subscription = await db.query.pushSubscriptions.findFirst({
        where: and(
            eq(pushSubscriptions.token, token),
            eq(pushSubscriptions.userId, session.user.id),
        ),
        columns: {
            active: true,
            timezone: true,
            latitude: true,
            longitude: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({
        healthy: subscription?.active === 1,
        hasLocation: subscription?.latitude != null && subscription?.longitude != null,
        timezone: subscription?.timezone ?? null,
        updatedAt: subscription?.updatedAt ?? null,
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        const userId = session?.user?.id ?? null;
        const sessionEmail = session?.user?.email ?? null;

        const { token, deviceType, timezone, userLocation, prayerPreferences, locale } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const tokenFingerprint = `${String(token).slice(0, 12)}…${String(token).length}`;
        logger.info("FCM subscription received", {
            route: "/api/notifications/subscribe",
            userId: userId ?? undefined,
            tokenFingerprint,
            deviceType: deviceType || "web",
        });

        const effectiveDeviceType = deviceType || "web";

        const data = {
            updatedAt: new Date(),
            active: 1,
            deviceType: effectiveDeviceType,
            timezone: timezone || "UTC",
            latitude: userLocation?.lat || null,
            longitude: userLocation?.lng || null,
            // Prefer city-level name (Kabupaten/Kota), fallback to display name (kecamatan)
            city: userLocation?.city || userLocation?.name || null,
            // New geographic fields from enriched geocoding
            country: userLocation?.country || null,
            countryCode: userLocation?.countryCode || null,
            prayerPreferences: prayerPreferences || undefined,
            // Only a known language is stored, and a request that does not say keeps what is already there.
            ...(locale === "id" || locale === "en" ? { locale } : {}),
        };

        let validUserId: string | null = null;
        if (userId || sessionEmail) {
            try {
                const identity = [
                    userId ? eq(users.id, userId) : null,
                    sessionEmail ? eq(users.email, sessionEmail) : null,
                ].filter(Boolean) as Array<ReturnType<typeof eq>>;
                const userExists = await db.query.users.findFirst({
                    where: identity.length === 1 ? identity[0] : or(...identity),
                    columns: { id: true },
                });
                if (userExists) {
                    validUserId = userExists.id;
                } else {
                    return NextResponse.json({ error: "Authenticated account not found" }, { status: 401 });
                }
            } catch (e) {
                logger.error("Error checking user existence", e, { route: "/api/notifications/subscribe" });
                return NextResponse.json({ error: "Unable to verify authenticated account" }, { status: 503 });
            }
        }

        // Optimized: Single upsert operation
        await db.insert(pushSubscriptions)
            .values({
                token,
                ...data,
                prayerPreferences: prayerPreferences || null,
                userId: validUserId,
                lastUsedAt: null,
            })
            .onConflictDoUpdate({
                target: pushSubscriptions.token,
                // A guest subscription becomes the account's when the guest logs in. Without a session
                // the owner is left untouched.
                set: validUserId ? { ...data, userId: validUserId } : data,
            });

        logger.info("FCM subscription stored", {
            route: "/api/notifications/subscribe",
            userId: validUserId ?? undefined,
            tokenFingerprint,
            active: 1,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Subscribe API error", error, { route: "/api/notifications/subscribe" });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Called at logout: the device keeps its prayer alerts as a guest, but streak reminders and the
// account's identity no longer follow the device.
export async function DELETE(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = deviceToken(req);
    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await db.update(pushSubscriptions)
        .set({ userId: null, updatedAt: new Date() })
        .where(and(eq(pushSubscriptions.token, token), eq(pushSubscriptions.userId, session.user.id)));

    return NextResponse.json({ success: true });
}
