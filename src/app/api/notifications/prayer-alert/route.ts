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
import { getMessaging } from "@/lib/notifications/firebase-admin";

/**
 * Enhanced Hybrid Prayer Notification API
 * 
 * Supports two modes:
 * 1. mode=sync  - Daily token validation (Vercel Cron, once per day)
 * 2. mode=alert - Prayer time notifications (GitHub Actions, targeted schedules)
 */

// In-memory cache for prayer times to avoid repeated API calls in the same request
const prayerTimesCache = new Map<string, any>();

// In-memory deduplication cache (backup layer — DB-based dedup is the primary)
const recentNotifications = new Map<string, number>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// === Precision Notification Window ===
// cron-job.org fires this endpoint every 1 minute.
// For fasting (puasa), notifications must be very close to the actual adzan time:
//   - Subuh: marks the end of suhoor — must NOT be late or misleading
//   - Maghrib: the iftar signal — people are waiting for this moment
// Window = 3 minutes: absorbs any cron-job.org jitter while staying tight for fasting accuracy.
const PRAYER_NOTIFICATION_WINDOW_MINUTES = 3;

// Default Coordinates: Jakarta (Monas)
const DEFAULT_LAT = -6.175392;
const DEFAULT_LNG = 106.827153;

// Helper: Check if current time is AT or just AFTER prayer time (within precision window)
function isTimeInWindow(currentTime: string, prayerTime: string): boolean {
    const [cHour, cMin] = currentTime.split(":").map(Number);
    const [pHour, pMin] = prayerTime.split(":").map(Number);

    const currentTotalMin = cHour * 60 + cMin;
    const prayerTotalMin = pHour * 60 + pMin;

    const diff = currentTotalMin - prayerTotalMin;

    // Fire ONLY when:
    // 1. Current time is AT or AFTER prayer time (diff >= 0) — no early adhan
    // 2. Within the 3-minute precision window — avoids late/stale notifications
    return diff >= 0 && diff <= PRAYER_NOTIFICATION_WINDOW_MINUTES;
}

// City-aware Maghrib correction — coordinate-based (mirrors usePrayerTimes.ts logic)
// Uses haversine distance from Bandung city center:
//   Within 25km → Kemenag Bandung ikhtiyath (+8)
//   Otherwise → standard Indonesian ikhtiyath (+3)
// This handles any kecamatan/kelurahan address within Bandung Raya correctly.
function getMaghribCorrection(lat: number, lng: number): number {
    const R = 6371;
    const dLat = (lat - (-6.9175)) * Math.PI / 180;
    const dLng = (lng - 107.6191) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(-6.9175 * Math.PI / 180) * Math.cos(lat * Math.PI / 180)
        * Math.sin(dLng / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm <= 25) return 8; // Bandung Raya
    return 3; // Other Indonesian cities
}

// Helper: Fetch prayer times from Aladhan API, with Kemenag RI tune for method 20
// tune format: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
async function fetchPrayerTimes(lat: number, lng: number, dateStr: string, method: string = "20"): Promise<any> {
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${dateStr}_${method}`;

    if (prayerTimesCache.has(cacheKey)) {
        return prayerTimesCache.get(cacheKey);
    }

    try {
        const tuneParam = method === "20"
            ? `&tune=2,2,0,4,4,${getMaghribCorrection(lat, lng)},0,2,0`
            : "";
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}${tuneParam}`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const result = await response.json();
        if (result && result.data && result.data.timings) {
            prayerTimesCache.set(cacheKey, result.data.timings);
            return result.data.timings;
        }
    } catch (e) {
    }
    return null;
}


// Helper: Check if notification was recently sent
function wasRecentlyNotified(key: string): boolean {
    const lastSent = recentNotifications.get(key);
    if (!lastSent) return false;
    const now = Date.now();
    if (now - lastSent > DEDUP_WINDOW_MS) {
        recentNotifications.delete(key);
        return false;
    }
    return true;
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "sync";


        const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.active, 1));

        const messagingAdmin = await getMessaging();

        if (!messagingAdmin) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        const results = {
            total: subscriptions.length,
            sent: 0,
            failed: 0,
            skipped: 0,
            errors: [] as string[],
        };

        const now = new Date();
        // Convert to WIB (UTC+7) manually for logging/checking if needed, 
        // but Aladhan API uses local time based on lat/lng.
        // We compare against the server's current time (which should be UTC or intended local).
        // Let's use the actual local time of the user's location if possible.

        // Aladhan timings are in 24h format "HH:mm" based on the location.
        // We need to compare it with the current time in that location.

        if (mode === "sync") {
            const syncMessage = {
                data: {
                    type: "daily_sync",
                    timestamp: now.toISOString(),
                },
                apns: {
                    payload: { aps: { "content-available": 1 } },
                    headers: { "apns-priority": "5", "apns-push-type": "background" },
                },
                android: { priority: "normal" as const },
            };

            for (const sub of subscriptions) {
                try {
                    await messagingAdmin.send({ ...syncMessage, token: sub.token });
                    results.sent++;
                    await db.update(pushSubscriptions).set({ lastUsedAt: new Date() }).where(eq(pushSubscriptions.id, sub.id));
                } catch (e: any) {
                    results.failed++;
                    if (e.code === "messaging/invalid-registration-token" || e.code === "messaging/registration-token-not-registered") {
                        await db.update(pushSubscriptions).set({ active: 0 }).where(eq(pushSubscriptions.id, sub.id));
                    }
                }
            }
            return NextResponse.json({ success: true, mode: "sync", results });
        }

        if (mode === "alert") {
            const todayStr = now.toISOString().split('T')[0];

            // Group subscriptions by location (rounded) to minimize API calls
            const groups = new Map<string, { lat: number, lng: number, timezone: string, subs: typeof subscriptions }>();

            for (const sub of subscriptions) {
                let lat = DEFAULT_LAT;
                let lng = DEFAULT_LNG;
                let timezone = sub.timezone || "Asia/Jakarta";

                if (sub.userLocation) {
                    try {
                        const loc = sub.userLocation as { lat?: number; lng?: number };
                        if (loc.lat && loc.lng) {
                            lat = loc.lat;
                            lng = loc.lng;
                        }
                    } catch (e) { }
                }

                // Key based on rounded location and timezone
                const key = `${lat.toFixed(2)}_${lng.toFixed(2)}_${timezone}`;

                if (!groups.has(key)) {
                    groups.set(key, { lat, lng, timezone, subs: [] });
                }
                groups.get(key)!.subs.push(sub);
            }

            // Process groups in parallel
            await Promise.all(Array.from(groups.values()).map(async (group) => {
                try {
                    const { lat, lng, timezone, subs } = group;

                    // 2. Fetch prayer times for this location (timezone-aware date)
                const localDateStr = now.toLocaleDateString("en-GB", {
                    timeZone: timezone,
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }).split("/").join("-"); // DD-MM-YYYY

                // Use method 20 (Kemenag RI) — the app default for Indonesian users.
                const userMethod = "20";
                const timings = await fetchPrayerTimes(lat, lng, localDateStr, userMethod);
                if (!timings) {
                    results.skipped += subs.length;
                    return;
                }

                // 3. Get current time in that timezone
                const localTimeStr = now.toLocaleTimeString("en-US", {
                    timeZone: timezone,
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit"
                });

                // 4. Check each prayer
                const relevantPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
                let activePrayer: string | null = null;

                for (const prayer of relevantPrayers) {
                    if (isTimeInWindow(localTimeStr, timings[prayer])) {
                        activePrayer = prayer;
                        break;
                    }
                }

                if (!activePrayer) {
                    results.skipped += subs.length;
                    return;
                }

                // Process subscriptions in this group
                for (const sub of subs) {
                    try {
                        // 5. Deduplication (DB-based for precision)
                        let lastSentMap: Record<string, string> = {};
                        if (sub.lastNotificationSent) {
                            try {
                                lastSentMap = sub.lastNotificationSent as Record<string, string>;
                            } catch (e) { }
                        }

                        if (lastSentMap[activePrayer] === todayStr) {
                            // Already sent for today
                            results.skipped++;
                            continue;
                        }

                        // 6. Check preferences
                        if (sub.prayerPreferences) {
                            try {
                                const prefs = sub.prayerPreferences as Record<string, boolean>;
                                const key = activePrayer.toLowerCase();
                                if (prefs[key] === false) {
                                    results.skipped++;
                                    continue;
                                }
                            } catch (e) { }
                        }

                        // 7. Send Notification
                        const prayerLabels: Record<string, string> = {
                            Fajr: "Subuh", Dhuhr: "Dzuhur", Asr: "Ashar", Maghrib: "Maghrib", Isha: "Isya"
                        };
                        const label = prayerLabels[activePrayer];

                        // Mindfulness Wording
                        const titles = [
                            `Waktunya Sholat ${label}`,
                            `Panggilan ${label} Telah Tiba`,
                            `${label} Telah Masuk`
                        ];

                        const bodies = [
                            `Mari sejenak menghadap Sang Pencipta.`,
                            `Segarkan jiwa dengan air wudhu dan sholat.`,
                            `"Hayya 'alas shalah" - Mari meraih kemenangan.`,
                            `Rehat sejenak dari dunia, tunaikan kewajiban.`
                        ];

                        // Randomize for variety
                        const title = titles[Math.floor(Math.random() * titles.length)];
                        const body = bodies[Math.floor(Math.random() * bodies.length)];

                        await messagingAdmin!.send({
                            token: sub.token,
                            notification: {
                                title: title,
                                body: body
                            },
                            data: {
                                type: "prayer_alert",
                                prayer: activePrayer,
                                url: "/jadwal-sholat" // Open specific page
                            },
                            // CRITICAL for iOS Safari PWA
                            webpush: {
                                headers: {
                                    "Urgency": "high",
                                    "TTL": "86400"
                                },
                                notification: {
                                    title: title,
                                    body: body,
                                    icon: "/icon-192x192.png?v=1.5.7",
                                    badge: "/icon-192x192.png?v=1.5.7",
                                    tag: `prayer-${activePrayer.toLowerCase()}`,
                                    requireInteraction: true,
                                    data: {
                                        url: "/jadwal-sholat"
                                    }
                                }
                            },
                            android: {
                                priority: "high",
                                notification: {
                                    channelId: "prayer-alerts",
                                    priority: "max",
                                    visibility: "public"
                                }
                            },
                        });

                        results.sent++;

                        // Update DB with new "last sent" map
                        lastSentMap[activePrayer] = todayStr;

                        await db.update(pushSubscriptions).set({
                            lastUsedAt: new Date(),
                            lastNotificationSent: lastSentMap
                        }).where(eq(pushSubscriptions.id, sub.id));

                    } catch (e: any) {
                        results.failed++;
                        if (e.code === "messaging/invalid-registration-token" || e.code === "messaging/registration-token-not-registered") {
                            await db.update(pushSubscriptions).set({ active: 0 }).where(eq(pushSubscriptions.id, sub.id));
                        }
                    }
                }
                } catch (e: any) {
                    console.error(`Group processing error for ${group.lat},${group.lng}:`, e);
                    results.errors.push(`Group ${group.lat},${group.lng} error: ${e.message}`);
                    results.skipped += group.subs.length;
                }
            }));

            return NextResponse.json({ success: true, mode: "alert", results });
        }

        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}
