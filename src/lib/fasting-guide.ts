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
        : month === 8 && day > 15 && (madzhab === null || madzhab === "syafii") ? "afterMidSyaban" : null;

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
