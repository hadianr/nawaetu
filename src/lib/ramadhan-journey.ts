export const JOURNEY_DAYS = 100;

export type JourneyPhase = "reset" | "build" | "sharpen";

export interface RamadhanJourney {
    /** Days until 1 Ramadan on the user's (adjusted) Hijri calendar. 0 while Ramadan is running. */
    daysLeft: number;
    inRamadan: boolean;
    /** True only inside the 100-day window before Ramadan. */
    active: boolean;
    /** 1..100 while active, else 0. */
    dayNumber: number;
    phase: JourneyPhase | null;
}

const DAY_MS = 86_400_000;
const RAMADAN = 9;

// shortcut: Umm al-Qura via Intl (offline, no fetch); the user's Hijri offset fixes local moon-sighting differences.
const hijriFormat = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
});

function hijriDayAndMonth(utcMs: number): { day: number; month: number } {
    const parts = hijriFormat.formatToParts(new Date(utcMs));
    const get = (type: string) => Number(parts.find(part => part.type === type)?.value);
    return { day: get("day"), month: get("month") };
}

/**
 * @param now current moment (local calendar date is used)
 * @param adjustment same Hijri offset as Settings: +1 means the user's Hijri date is a day ahead.
 */
export function getRamadhanJourney(now: Date, adjustment = 0): RamadhanJourney {
    // Use the local calendar date at UTC noon so DST and timezones never move the day.
    const todayMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12) + adjustment * DAY_MS;

    if (hijriDayAndMonth(todayMs).month === RAMADAN) {
        return { daysLeft: 0, inRamadan: true, active: false, dayNumber: 0, phase: null };
    }

    let daysLeft = 1;
    // A Hijri year is at most 355 days; the bound only guards against a broken Intl.
    while (daysLeft <= 400) {
        const { day, month } = hijriDayAndMonth(todayMs + daysLeft * DAY_MS);
        if (month === RAMADAN && day === 1) break;
        daysLeft += 1;
    }

    const active = daysLeft <= JOURNEY_DAYS;
    return {
        daysLeft,
        inRamadan: false,
        active,
        dayNumber: active ? JOURNEY_DAYS - daysLeft + 1 : 0,
        phase: !active ? null : daysLeft > 70 ? "reset" : daysLeft > 30 ? "build" : "sharpen",
    };
}

/** Days-left values that earn a celebration. */
export const JOURNEY_MILESTONES = [100, 75, 50, 30, 10, 1] as const;

/** The milestone to celebrate today, or null if none or already seen. Joining after the day passes skips it. */
export function getJourneyMilestone(daysLeft: number, seen: number[]): number | null {
    return (JOURNEY_MILESTONES as readonly number[]).includes(daysLeft) && !seen.includes(daysLeft) ? daysLeft : null;
}
