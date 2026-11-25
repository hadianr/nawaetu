import type { Madzhab } from "@/data/fasting/types";
import { getHijriEvents } from "@/data/hijri-events";
import { getHijriToday, getRamadhanJourney } from "@/lib/ramadhan-journey";

export type FastingTiming = "mondayThursday" | "ayyamulBidh";

export interface FastingGuide {
    /** What today suits: a make-up fast first when one is owed, else a sunnah fast, else nothing. */
    today: "qadha" | "sunnah" | "none";
    /** The recommended-day kinds that apply today (Mon/Thu, 13-15 Hijri). */
    timing: FastingTiming[];
    /** Why a voluntary fast is not suggested today, when it is a recommended day. Qadha is never blocked. */
    reason: "preRamadan" | "afterMidSyaban" | null;
}

export type FastingCaution = "preRamadan" | "afterMidSyaban" | "fridayAlone";

/** Voluntary fasting after 15 Sha'ban is held back for Shafi'i, and for an unset madhhab as the cautious default. */
export function isAfterMidSyaban(month: number, day: number, madzhab: Madzhab | null): boolean {
    return month === 8 && day > 15 && (madzhab === null || madzhab === "syafii");
}

/**
 * Cautions for a voluntary fast on one calendar day. They depend on context, so the calendar shows them as notes,
 * never as grid markers. `monthLength` is the number of days in that Hijri month (29 or 30).
 */
export function getFastingCautions(input: { day: number; month: number; weekday: number; monthLength: number; madzhab: Madzhab | null }): FastingCaution[] {
    const { day, month, weekday, monthLength, madzhab } = input;
    const events = getHijriEvents({ hijriDay: day, hijriMonth: month, gregorianWeekday: weekday });
    if (events.some(event => event.kind === "prohibited" || event.kind === "obligatory")) return [];
    if (month === 8 && day > monthLength - 2) return ["preRamadan"];
    if (isAfterMidSyaban(month, day, madzhab)) return ["afterMidSyaban"];
    // Singling out Friday is discouraged (Bukhari 1985); a Friday that is itself a sunnah day is not singled out.
    return weekday === 5 && events.length === 0 ? ["fridayAlone"] : [];
}

const NONE: FastingGuide = { today: "none", timing: [], reason: null };

function timingOf(date: Date, adjustment: number): { timing: FastingTiming[]; day: number; month: number; blocked: boolean } {
    const { day, month } = getHijriToday(date, adjustment);
    const events = getHijriEvents({ hijriDay: day, hijriMonth: month, gregorianWeekday: date.getDay() });
    const timing = events
        .filter(event => event.id === "mondayThursday" || event.id === "ayyamulBidh")
        .map(event => event.id as FastingTiming);
    return { timing, day, month, blocked: events.some(event => event.kind === "prohibited") };
}

/**
 * The fasting suggestion for today on the user's Hijri calendar.
 * Qadha comes before voluntary fasts. A voluntary fast is held back in the last two days before Ramadan, and
 * after 15 Sha'ban for Shafi'i (or an unset madhhab, the cautious default). Where scholars differ, the copy says so.
 */
export function getFastingGuide(input: { now: Date; adjustment?: number; pendingQadha: number; madzhab: Madzhab | null }): FastingGuide {
    const { now, adjustment = 0, pendingQadha, madzhab } = input;
    const journey = getRamadhanJourney(now, adjustment);
    if (journey.inRamadan) return NONE;

    const { timing, day, month, blocked } = timingOf(now, adjustment);
    if (blocked || timing.length === 0) return NONE;

    const reason = journey.daysLeft <= 2
        ? "preRamadan"
        : isAfterMidSyaban(month, day, madzhab) ? "afterMidSyaban" : null;

    if (pendingQadha > 0) return { today: "qadha", timing, reason };
    return reason ? { today: "none", timing, reason } : { today: "sunnah", timing, reason };
}

/** Mon/Thu and Ayyamul Bidh days from today up to the day before Ramadan; each day counts once. */
export function countRecommendedDays(now: Date, adjustment = 0): number {
    const { daysLeft, inRamadan } = getRamadhanJourney(now, adjustment);
    if (inRamadan) return 0;
    let count = 0;
    for (let offset = 0; offset < daysLeft; offset++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
        const { timing, blocked } = timingOf(date, adjustment);
        if (!blocked && timing.length > 0) count += 1;
    }
    return count;
}
