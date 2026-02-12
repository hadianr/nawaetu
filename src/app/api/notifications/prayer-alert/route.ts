import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { messagingAdmin } from "@/lib/notifications/firebase-admin";

/**
 * Enhanced Hybrid Prayer Notification API
 * 
 * Supports two modes:
 * 1. mode=sync  - Daily token validation (Vercel Cron, once per day)
 * 2. mode=alert - Prayer time notifications (GitHub Actions, targeted schedules)
 */

// In-memory cache for prayer times to avoid repeated API calls in the same request
const prayerTimesCache = new Map<string, any>();

// In-memory deduplication cache
const recentNotifications = new Map<string, number>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const PRAYER_WINDOW_MS = 15 * 60 * 1000; // +15 minutes tolerance only (No early notifications)

// Default Coordinates: Jakarta (Monas)
const DEFAULT_LAT = -6.175392;
const DEFAULT_LNG = 106.827153;

// Helper: Check if current time is AFTER prayer time but within window
function isTimeInWindow(currentTime: string, prayerTime: string): boolean {
    const [cHour, cMin] = currentTime.split(":").map(Number);
    const [pHour, pMin] = prayerTime.split(":").map(Number);

    const currentTotalMin = cHour * 60 + cMin;
    const prayerTotalMin = pHour * 60 + pMin;

    const diff = currentTotalMin - prayerTotalMin;

    // STRICT LOGIC:
    // 1. Must be AFTER or EQUAL to prayer time (diff >= 0) -> No early Adhan!
    // 2. Must be within 15 minutes (diff <= 15) -> Catches 10-min cron delays
    return diff >= 0 && diff <= 15;
}

// Helper: Fetch prayer times from Aladhan API
async function fetchPrayerTimes(lat: number, lng: number, dateStr: string): Promise<any> {
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${dateStr}`;

    if (prayerTimesCache.has(cacheKey)) {
        return prayerTimesCache.get(cacheKey);
    }

    try {
        const response = await fetch(
            `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=20` // Method 20 = Kemenag RI
        );

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

            for (const sub of subscriptions) {
                try {
                    // 1. Get location (parse from JSON string in DB)
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

                    // 2. Fetch prayer times for this location (timezone-aware date)
                    const localDateStr = now.toLocaleDateString("en-GB", {
                        timeZone: timezone,
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }).split("/").join("-"); // DD-MM-YYYY

                    const timings = await fetchPrayerTimes(lat, lng, localDateStr);
                    if (!timings) {
                        results.skipped++;
                        continue;
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
                        results.skipped++;
                        continue;
                    }

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

                    await messagingAdmin.send({
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
