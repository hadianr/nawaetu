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
import { pushSubscriptions, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getMessaging } from "@/lib/notifications/firebase-admin";
import { logger } from "@/lib/logger";
import { getPrayerTimings } from "@/lib/notifications/prayer-times";
import { getPrayerNotificationCopy } from "@/lib/notifications/push-copy";
import { buildPrayerMessage, deactivate, dueSubscriptions, markSent, sendAlerts, setNextAlerts } from "@/lib/notifications/prayer-send";
import { ALERT_PRAYERS, nextAlertAt } from "@/lib/notifications/prayer-schedule";
import type { Message } from "firebase-admin/messaging";

/**
 * Enhanced Hybrid Prayer Notification API
 * 
 * Supports two modes:
 * 1. mode=sync  - Optional daily token validation and cleanup
 * 2. mode=alert - Prayer time notifications (cron-job.org, every minute)
 */

// === Precision Notification Window ===
// cron-job.org fires this endpoint every 1 minute.
// For fasting (puasa), notifications must be very close to the actual adzan time:
//   - Subuh: marks the end of suhoor — must NOT be late or misleading
//   - Maghrib: the iftar signal — people are waiting for this moment
// Window = 3 minutes: absorbs cron-job.org jitter while staying tight for fasting accuracy.
const PRAYER_NOTIFICATION_WINDOW_MINUTES = 3;

// NO DEFAULT COORDINATES: Application mandates location setup.

// Helper: Check if current time is AT or just AFTER prayer time (within precision window)
function isTimeInWindow(currentTime: string, rawPrayerTime: string): boolean {
    if (!rawPrayerTime) return false;
    // Clean string from trailing offsets like "04:35 (WIB)" or "04:35 (+07)"
    const cleanPrayerTime = rawPrayerTime.split(" ")[0].trim();

    const [cHour, cMin] = currentTime.split(":").map(Number);
    const [pHour, pMin] = cleanPrayerTime.split(":").map(Number);

    if (isNaN(cHour) || isNaN(cMin) || isNaN(pHour) || isNaN(pMin)) return false;

    const currentTotalMin = cHour * 60 + cMin;
    const prayerTotalMin = pHour * 60 + pMin;

    const diff = currentTotalMin - prayerTotalMin;

    // Fire ONLY when:
    // 1. Current time is AT or AFTER prayer time (diff >= 0) — no early adhan
    // 2. Within the 3-minute precision window — avoids late/stale notifications
    return diff >= 0 && diff <= PRAYER_NOTIFICATION_WINDOW_MINUTES;
}

// Helper: Safe JSON parsing for jsonb fields that might be object or stringified JSON
function parseJsonField<T>(val: unknown): T | null {
    if (!val) return null;
    if (typeof val === "object") return val as T;
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            if (typeof parsed === "string") return JSON.parse(parsed) as T;
            return parsed as T;
        } catch {
            return null;
        }
    }
    return null;
}

// Helper: Infer timezone from coordinates if sub.timezone is missing or UTC
function inferTimezoneFromCoords(lat: number, lng: number, rawTz?: string | null): string {
    if (rawTz && rawTz !== "UTC") {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: rawTz });
            return rawTz;
        } catch { }
    }
    // Indonesia boundaries fallback
    if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
        if (lng < 110) return "Asia/Jakarta";   // WIB
        if (lng < 125) return "Asia/Makassar";  // WITA
        return "Asia/Jayapura";                 // WIT
    }
    return rawTz || "UTC";
}

// Seconds. FCM sends; the cron runs every minute, so a longer run overlaps the next one anyway.
export const maxDuration = 60;

/** One run looks at no more than this many due subscriptions; the rest stay due and the next minute continues. */
const MAX_DUE_PER_RUN = 2000;

/** Aladhan calculation method for a place. */
function methodFor(lat: number, lng: number): string {
    if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) return "20"; // Indonesia
    if (lng >= -170 && lng <= -50) return "2"; // North America
    if (lat >= 12 && lat <= 32 && lng >= 34 && lng <= 60) return "4"; // Makkah / Middle East
    return "3"; // MWL, the global default
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            return NextResponse.json({ error: "Prayer alert scheduler is not configured" }, { status: 503 });
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url, "http://localhost");
        const mode = searchParams.get("mode") || req.nextUrl?.searchParams?.get("mode") || "alert";


        const now = new Date();

        // Guests are included: prayer alerts are a core feature, not an account feature.
        // The job runs every minute but a prayer falls due only five times a day, so it reads only the subscriptions whose
        // time has come, or that have never been scheduled (new, or location / timezone / preferences just changed), and
        // stores the next time once it has handled them. Sync mode still visits everyone.
        const subscriptions = mode === "alert"
            ? await dueSubscriptions(now, MAX_DUE_PER_RUN)
            : await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.active, 1));

        // Lazy: this cron fires every minute and most runs send nothing, so only
        // query users once a prayer is actually due (and never in sync mode).
        let localeByUserPromise: Promise<Map<string, unknown>> | null = null;
        const getLocaleByUser = () => (localeByUserPromise ??= (async () => {
            const userIds = [...new Set(subscriptions.map((sub) => sub.userId).filter((id): id is string => Boolean(id)))];
            const userRows = userIds.length
                ? await db.select({ id: users.id, settings: users.settings }).from(users).where(inArray(users.id, userIds))
                : [];
            return new Map(userRows.map((user) => [user.id, (user.settings as Record<string, unknown> | null)?.locale]));
        })());

        if (subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                mode,
                results: { total: 0, sent: 0, failed: 0, invalidTokens: 0, skipped: 0, noLocation: 0, errors: [] },
            });
        }

        const messagingAdmin = await getMessaging();

        if (!messagingAdmin) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        const results = {
            total: subscriptions.length,
            sent: 0,
            failed: 0,
            invalidTokens: 0,
            skipped: 0,
            noLocation: 0,  // subscriptions skipped due to missing coordinates
            errors: [] as string[],
        };

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
                } catch (e: unknown) {
                    results.failed++;
                    const code = typeof e === "object" && e !== null && "code" in e ? e.code : undefined;
                    if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
                        results.invalidTokens++;
                        await db.update(pushSubscriptions).set({ active: 0 }).where(eq(pushSubscriptions.id, sub.id));
                    }
                }
            }
            return NextResponse.json({ success: true, mode: "sync", results });
        }

        if (mode === "alert") {
            // Group subscriptions by location (rounded) to minimize API calls
            const groups = new Map<string, { lat: number, lng: number, timezone: string, subs: typeof subscriptions }>();
            // Who has been handled this run, and when to look at them next. Anyone not listed stays due and is seen again next minute.
            const handled: Array<{ id: string; at: Date }> = [];
            const oneDayOn = new Date(now.getTime() + 86_400_000);

            for (const sub of subscriptions) {
                const lat: number | null = sub.latitude ?? null;
                const lng: number | null = sub.longitude ?? null;

                if (!lat || !lng) {
                    results.noLocation++;
                    results.skipped++;
                    // Without a location there is nothing to schedule; looking again tomorrow keeps it out of every run. Setting a
                    // location resets this (subscribe and preferences clear next_alert_at).
                    handled.push({ id: sub.id, at: oneDayOn });
                    continue;
                }

                const timezone = inferTimezoneFromCoords(lat, lng, sub.timezone);

                // Key based on rounded location and timezone
                // shortcut: 0.1° (~11km) cells share one Aladhan call (<~15s timing drift); tighten if accuracy complaints
                const key = `${lat.toFixed(1)}_${lng.toFixed(1)}_${timezone}`;

                if (!groups.has(key)) {
                    groups.set(key, { lat, lng, timezone, subs: [] });
                }
                groups.get(key)!.subs.push(sub);
            }

            // Process groups in parallel
            await Promise.all(Array.from(groups.values()).map(async (group) => {
                try {
                    const { lat, lng, timezone: safeTimezone, subs } = group;

                    // 1. User local date for deduplication and Aladhan API
                    const todayStr = now.toLocaleDateString("sv-SE", { timeZone: safeTimezone }); // YYYY-MM-DD

                    // 2. Fetch prayer times for this location (timezone-aware date)
                    const rawDateStr = now.toLocaleDateString("en-GB", {
                        timeZone: safeTimezone,
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });
                    const localDateStr = rawDateStr.replace(/[^\d/]/g, "").split("/").join("-"); // DD-MM-YYYY

                    const userMethod = methodFor(lat, lng);
                    const timingsFor = (aladhanDate: string) => getPrayerTimings(lat, lng, aladhanDate, userMethod);

                    const timings = await timingsFor(localDateStr);
                    if (!timings) {
                        results.skipped += subs.length;
                        return; // they stay due: the next minute asks again
                    }

                    // When to look at a subscriber next depends only on which prayers they switched off, so work it out once per kind.
                    const nextByKind = new Map<string, Promise<Date | null>>();
                    const nextFor = (sub: (typeof subs)[number]) => {
                        const prefs = sub.prayerPreferences ? parseJsonField<Record<string, boolean>>(sub.prayerPreferences) : null;
                        const isEnabled = (prayer: string) => !(prefs && prefs[prayer.toLowerCase()] === false);
                        const kind = ALERT_PRAYERS.filter(isEnabled).join(",");
                        let next = nextByKind.get(kind);
                        if (!next) {
                            next = nextAlertAt({ now, timeZone: safeTimezone, timingsFor, isEnabled });
                            nextByKind.set(kind, next);
                        }
                        return next;
                    };
                    const schedule = async (ids: Set<string>) => {
                        for (const sub of subs) {
                            if (!ids.has(sub.id)) continue;
                            const at = await nextFor(sub);
                            if (at) handled.push({ id: sub.id, at });
                        }
                    };

                    // 3. Get current time in that timezone
                    const localTimeStr = now.toLocaleTimeString("en-US", {
                        timeZone: safeTimezone,
                        hourCycle: "h23",
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    // 4. Check each prayer (including Imsak)
                    let activePrayer: string | null = null;

                    for (const prayer of ALERT_PRAYERS) {
                        if (isTimeInWindow(localTimeStr, timings[prayer])) {
                            activePrayer = prayer;
                            break;
                        }
                    }

                    if (!activePrayer) {
                        results.skipped += subs.length;
                        await schedule(new Set(subs.map((sub) => sub.id)));
                        return;
                    }

                    // Decide who is due, then send them all at once. Alerts used to be sent one by one, each followed by its own
                    // database write: slow with a few hundred subscribers in one place, since they all fall due in the same minute.
                    const due: Array<{ id: string; message: Message }> = [];
                    const settled = new Set<string>(); // nothing more to do for these this prayer: deduplicated or switched off
                    const localeByUser = await getLocaleByUser();
                    for (const sub of subs) {
                        // 5. Deduplication (DB-based for precision)
                        const lastSentMap = parseJsonField<Record<string, string>>(sub.lastNotificationSent) ?? {};
                        if (lastSentMap[activePrayer] === todayStr) {
                            results.skipped++; // already sent today
                            settled.add(sub.id);
                            continue;
                        }

                        // 6. Check preferences
                        const prefs = sub.prayerPreferences ? parseJsonField<Record<string, boolean>>(sub.prayerPreferences) : null;
                        if (prefs && prefs[activePrayer.toLowerCase()] === false) {
                            results.skipped++;
                            settled.add(sub.id);
                            continue;
                        }

                        // 7. Prepare the notification
                        const copy = getPrayerNotificationCopy(localeByUser.get(sub.userId ?? "") ?? sub.locale, activePrayer);
                        due.push({ id: sub.id, message: buildPrayerMessage(sub.token, activePrayer, copy, req.url) });
                    }

                    const outcome = due.length > 0 ? await sendAlerts(messagingAdmin, due) : { sent: [], failed: [], invalid: [] };
                    results.sent += outcome.sent.length;
                    results.failed += outcome.failed.length;
                    results.invalidTokens += outcome.invalid.length;

                    // Those that failed (and are not switched off) are NOT scheduled: they stay due and the next minute, still
                    // inside the 3 minute window, tries again.
                    await schedule(new Set([...settled, ...outcome.sent]));

                    try {
                        await markSent(outcome.sent, activePrayer, todayStr);
                        await deactivate(outcome.invalid);
                    } catch (e: unknown) {
                        // The alerts went out. If this write is lost the next minute may send them again, so say so loudly.
                        logger.error(`Could not record sent alerts for ${group.lat},${group.lng}`, e, { route: "/api/notifications/prayer-alert" });
                        results.errors.push(`Group ${group.lat},${group.lng} bookkeeping error: ${e instanceof Error ? e.message : String(e)}`);
                    }
                } catch (e: unknown) {
                    logger.error(`Group processing error for ${group.lat},${group.lng}`, e, { route: "/api/notifications/prayer-alert" });
                    results.errors.push(`Group ${group.lat},${group.lng} error: ${e instanceof Error ? e.message : String(e)}`);
                    results.skipped += group.subs.length;
                }
            }));

            try {
                await setNextAlerts(handled);
            } catch (e: unknown) {
                // Nothing is lost: those rows stay due and are looked at again next minute.
                logger.error("Could not store the next alert times", e, { route: "/api/notifications/prayer-alert" });
                results.errors.push(`Schedule write error: ${e instanceof Error ? e.message : String(e)}`);
            }

            if (results.sent > 0 || results.failed > 0 || results.invalidTokens > 0 || results.noLocation > 0 || results.errors.length > 0) {
                logger.info("Prayer alert run completed", {
                    route: "/api/notifications/prayer-alert",
                    action: "fcm_delivery_summary",
                    sent: results.sent,
                    skipped: results.skipped,
                    failed: results.failed,
                    invalidTokens: results.invalidTokens,
                    noLocation: results.noLocation,
                    errors: results.errors.length,
                });
            }
            return NextResponse.json({ success: true, mode: "alert", results });
        }

        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });

    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}
