import type { Timings } from "./prayer-times";

/** The prayers that get an alert, in the order the day brings them. */
export const ALERT_PRAYERS = ["Imsak", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const DAY_MS = 86_400_000;

/** How far a zone is ahead of UTC at a given instant, in minutes (DST included). */
function offsetMinutes(utcMs: number, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(utcMs));
    const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
    const asIfUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
    return Math.round((asIfUtc - utcMs) / 60_000);
}

/** The instant at which a zone's wall clock reads `localDate` (YYYY-MM-DD) and `hhmm` (HH:MM); null if either is malformed. */
export function zonedInstant(localDate: string, hhmm: string, timeZone: string): Date | null {
    const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
    const time = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
    if (!date || !time) return null;
    const wall = Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3]), Number(time[1]), Number(time[2]));
    // The offset at the guess can differ from the offset at the wall time when a clock change lies between them: correct once.
    const first = wall - offsetMinutes(wall, timeZone) * 60_000;
    return new Date(wall - offsetMinutes(first, timeZone) * 60_000);
}

export const localDateOf = (now: Date, timeZone: string): string => now.toLocaleDateString("sv-SE", { timeZone });

const addDays = (isoDate: string, days: number): string => new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

/** The form Aladhan and the timings helper use: DD-MM-YYYY. */
export const toAladhanDate = (isoDate: string): string => isoDate.split("-").reverse().join("-");

export interface NextAlertInput {
    now: Date;
    timeZone: string;
    /** Prayer times for a date given as DD-MM-YYYY, or null when they cannot be had right now. */
    timingsFor: (aladhanDate: string) => Promise<Timings | null>;
    isEnabled: (prayer: string) => boolean;
}

/**
 * The next instant after `now` at which one of the enabled prayers falls due, looking at today and tomorrow in the
 * subscriber's own zone. Returns null when the times are unavailable (the caller leaves the row due, so the next minute
 * tries again) and a day from now when no prayer is enabled at all (look again tomorrow).
 */
export async function nextAlertAt({ now, timeZone, timingsFor, isEnabled }: NextAlertInput): Promise<Date | null> {
    const today = localDateOf(now, timeZone);
    for (const offset of [0, 1]) {
        const date = addDays(today, offset);
        const timings = await timingsFor(toAladhanDate(date));
        if (!timings) return null;

        let best: Date | null = null;
        for (const prayer of ALERT_PRAYERS) {
            const raw = timings[prayer];
            if (!raw || !isEnabled(prayer)) continue;
            const at = zonedInstant(date, raw.split(" ")[0].trim(), timeZone);
            if (at && at.getTime() > now.getTime() && (!best || at.getTime() < best.getTime())) best = at;
        }
        if (best) return best;
    }
    return new Date(now.getTime() + DAY_MS);
}
