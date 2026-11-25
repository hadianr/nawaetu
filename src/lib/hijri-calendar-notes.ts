import type { Madzhab } from "@/data/fasting/types";

/** The fields of a calendar day these helpers need (a subset of `HijriCalendarDay`). */
export interface NoteDay {
    gregorianIso: string;
    hijriDay: number;
    hijriMonthNumber: number;
    timings: { Subuh: string; Maghrib: string };
}

export interface OddNight {
    night: number;
    /** Maghrib of the day before: the Islamic day begins at sunset. */
    start: Date;
    /** Fajr of the night's own day. */
    end: Date;
    startDay: NoteDay;
    endDay: NoteDay;
}

const at = (iso: string, time: string) => new Date(`${iso}T${time.slice(0, 5)}:00`);

/** The night of Ramadan day `night` runs from Maghrib of day `night - 1` to Fajr of day `night`. */
export function getOddNight(days: NoteDay[], night: number): OddNight | null {
    const ramadan = days.filter(day => day.hijriMonthNumber === 9);
    const startDay = ramadan.find(day => day.hijriDay === night - 1);
    const endDay = ramadan.find(day => day.hijriDay === night);
    if (!startDay || !endDay) return null;
    return { night, start: at(startDay.gregorianIso, startDay.timings.Maghrib), end: at(endDay.gregorianIso, endDay.timings.Subuh), startDay, endDay };
}

/** The odd night under way now, or the next one to come; null once the last one has passed. */
export function getNextOddNight(days: NoteDay[], now: Date): (OddNight & { ongoing: boolean }) | null {
    for (const night of [21, 23, 25, 27, 29]) {
        const window = getOddNight(days, night);
        if (window && now < window.end) return { ...window, ongoing: now >= window.start };
    }
    return null;
}

export type ZakatTimingKey =
    | "hijriZakatTimingNone"
    | "hijriZakatTimingSyafii"
    | "hijriZakatTimingHanafi"
    | "hijriZakatTimingMaliki"
    | "hijriZakatTimingHanbali";

/** The earliest time to pay zakat al-Fitr is the one calendar line that follows the user's madhhab (plan §2.3). */
export function zakatTimingKey(madzhab: Madzhab | null): ZakatTimingKey {
    switch (madzhab) {
        case "syafii": return "hijriZakatTimingSyafii";
        case "hanafi": return "hijriZakatTimingHanafi";
        case "maliki": return "hijriZakatTimingMaliki";
        case "hanbali": return "hijriZakatTimingHanbali";
        default: return "hijriZakatTimingNone";
    }
}

/** Replaces `{name}` placeholders in a translation string. */
export function fillTemplate(template: unknown, values: Record<string, string | number>): string {
    return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), String(template));
}
