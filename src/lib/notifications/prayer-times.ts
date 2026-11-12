import { API_CONFIG } from "@/config/apis";
import { logger } from "@/lib/logger";
import { fetchWithTimeout } from "@/lib/utils/fetch";

/**
 * Prayer times for the push job, which runs every minute. The times for a place and a day never change, so asking
 * Aladhan once per place per minute (what this used to do) was a request for the same answer over and over, and it
 * showed up in Sentry as an N+1. Now one call per location cell per MONTH (the calendar endpoint) serves every minute
 * of every day in it, and the day endpoint is only a fallback.
 */
export type Timings = Record<string, string>;

/** Kemenag RI (method 20) tune: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight. Maghrib stays 0: the method already includes ikhtiyath. */
const TUNE_KEMENAG = "2,2,0,4,4,0,0,2,0";
/** How long Next's server-side fetch cache may serve a month before asking again. */
const MONTH_REVALIDATE_SECONDS = 24 * 60 * 60;
/** shortcut: the cache is per server instance and cleared when it grows past this; raise it if cells outgrow it. */
const MAX_CACHED_ENTRIES = 2000;

const months = new Map<string, Map<string, Timings>>();
const days = new Map<string, Timings>();
const inFlight = new Map<string, Promise<Map<string, Timings> | null>>();

/**
 * Places are grouped into 0.1 degree cells (about 11 km) that share one answer. The cell's centre is used, not whichever
 * subscriber happened to be first, so the request is the same every minute and can be cached.
 */
export const cellOf = (lat: number, lng: number) => ({ lat: Number(lat.toFixed(1)), lng: Number(lng.toFixed(1)) });

const tuneFor = (method: string) => (method === "20" ? `&tune=${TUNE_KEMENAG}` : "");

function remember<V>(store: Map<string, V>, key: string, value: V) {
    if (store.size >= MAX_CACHED_ENTRIES) store.clear();
    store.set(key, value);
}

async function fetchMonth(cell: { lat: number; lng: number }, year: string, month: number, method: string): Promise<Map<string, Timings> | null> {
    const url = `${API_CONFIG.ALADHAN.BASE_URL}/calendar/${year}/${month}?latitude=${cell.lat}&longitude=${cell.lng}&method=${method}${tuneFor(method)}`;
    try {
        const response = await fetchWithTimeout(url, { next: { revalidate: MONTH_REVALIDATE_SECONDS } }, { timeoutMs: 10_000 });
        if (!response.ok) return null;
        const body = await response.json();
        if (!Array.isArray(body?.data)) return null;

        const byDate = new Map<string, Timings>();
        for (const entry of body.data) {
            const date = entry?.date?.gregorian?.date; // DD-MM-YYYY, the same form the caller uses
            if (typeof date === "string" && entry.timings && typeof entry.timings === "object") byDate.set(date, entry.timings as Timings);
        }
        return byDate.size > 0 ? byDate : null;
    } catch (error) {
        logger.error(`Fetch prayer calendar error: url=${url}`, error, { route: "/api/notifications/prayer-alert" });
        return null;
    }
}

async function fetchDay(cell: { lat: number; lng: number }, dateStr: string, method: string): Promise<Timings | null> {
    const url = `${API_CONFIG.ALADHAN.BASE_URL}/timings/${dateStr}?latitude=${cell.lat}&longitude=${cell.lng}&method=${method}${tuneFor(method)}`;
    try {
        const response = await fetchWithTimeout(url, {}, { timeoutMs: 8_000 });
        if (!response.ok) return null;
        const result = await response.json();
        return result?.data?.timings ?? null;
    } catch (error) {
        logger.error(`Fetch prayer times error: url=${url}`, error, { route: "/api/notifications/prayer-alert" });
        return null;
    }
}

/**
 * The prayer times for a place on a local date (DD-MM-YYYY), or null when Aladhan cannot be reached. Failures are not
 * remembered, so the next minute tries again.
 */
export async function getPrayerTimings(lat: number, lng: number, dateStr: string, method: string = "20"): Promise<Timings | null> {
    const cell = cellOf(lat, lng);
    const [, monthText, year] = dateStr.split("-");
    const month = Number(monthText);

    if (Number.isInteger(month) && month >= 1 && month <= 12 && /^\d{4}$/.test(year ?? "")) {
        const monthKey = `${cell.lat}_${cell.lng}_${year}-${month}_${method}`;
        let monthMap = months.get(monthKey);
        if (!monthMap) {
            // Two groups in the same cell and month share one request.
            let pending = inFlight.get(monthKey);
            if (!pending) {
                pending = fetchMonth(cell, year, month, method).finally(() => inFlight.delete(monthKey));
                inFlight.set(monthKey, pending);
            }
            monthMap = (await pending) ?? undefined;
            if (monthMap) remember(months, monthKey, monthMap);
        }
        const fromMonth = monthMap?.get(dateStr);
        if (fromMonth) return fromMonth;
    }

    // The calendar was unavailable or did not hold that day: ask for the single day, as before.
    const dayKey = `${cell.lat}_${cell.lng}_${dateStr}_${method}`;
    const cached = days.get(dayKey);
    if (cached) return cached;
    const timings = await fetchDay(cell, dateStr, method);
    if (timings) remember(days, dayKey, timings);
    return timings;
}
