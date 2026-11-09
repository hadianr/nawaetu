import { describe, expect, it } from "vitest";
import { getJourneyMilestone, getRamadhanJourney, getRecentDays, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

const at = (iso: string) => new Date(`${iso}T10:00:00`);

describe("getRamadhanJourney", () => {
    it("is active with a consistent day number inside the 100-day window", () => {
        const journey = getRamadhanJourney(at("2026-11-09"));
        expect(journey.active).toBe(true);
        expect(journey.daysLeft).toBeGreaterThan(80);
        expect(journey.daysLeft).toBeLessThanOrEqual(JOURNEY_DAYS);
        expect(journey.dayNumber + journey.daysLeft).toBe(JOURNEY_DAYS + 1);
    });

    it("is inactive far from Ramadan", () => {
        const journey = getRamadhanJourney(at("2026-04-01"));
        expect(journey).toMatchObject({ active: false, dayNumber: 0, phase: null, inRamadan: false });
        expect(journey.daysLeft).toBeGreaterThan(JOURNEY_DAYS);
    });

    it("reports Ramadan itself instead of a countdown", () => {
        expect(getRamadhanJourney(at("2026-03-05"))).toMatchObject({ inRamadan: true, active: false, daysLeft: 0 });
    });

    it("moves the target one day later for adjustment -1, matching Settings", () => {
        const base = getRamadhanJourney(at("2026-11-09"), 0);
        expect(getRamadhanJourney(at("2026-11-09"), -1).daysLeft).toBe(base.daysLeft + 1);
        expect(getRamadhanJourney(at("2026-11-09"), 1).daysLeft).toBe(base.daysLeft - 1);
    });

    it("walks through reset, build and sharpen phases as days pass", () => {
        const first = getRamadhanJourney(at("2026-11-09"));
        // Move the clock so exactly `daysLeft` days remain.
        const phaseWithDaysLeft = (daysLeft: number) => {
            const date = at("2026-11-09");
            date.setDate(date.getDate() + first.daysLeft - daysLeft);
            return getRamadhanJourney(date).phase;
        };
        expect(phaseWithDaysLeft(90)).toBe("reset");
        expect(phaseWithDaysLeft(60)).toBe("build");
        expect(phaseWithDaysLeft(20)).toBe("sharpen");
    });
});

describe("getRecentDays", () => {
    it("returns the last 7 local days, oldest first, with today last", () => {
        const days = getRecentDays(at("2026-11-09"), ["2026-11-09", "2026-11-07", "2026-10-01"]);
        expect(days.map(day => day.date)).toEqual([
            "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09",
        ]);
        expect(days.map(day => day.done)).toEqual([false, false, false, false, true, false, true]);
        expect(days.filter(day => day.isToday)).toHaveLength(1);
        expect(days[6].isToday).toBe(true);
    });

    it("crosses month and year boundaries", () => {
        expect(getRecentDays(at("2027-01-02"), [], 4).map(day => day.date)).toEqual([
            "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02",
        ]);
    });
});

describe("getJourneyMilestone", () => {
    it("celebrates a milestone day once", () => {
        expect(getJourneyMilestone(75, [])).toBe(75);
        expect(getJourneyMilestone(75, [75])).toBeNull();
        expect(getJourneyMilestone(1, [100, 75])).toBe(1);
    });

    it("ignores ordinary days", () => {
        expect(getJourneyMilestone(74, [])).toBeNull();
        expect(getJourneyMilestone(0, [])).toBeNull();
    });
});
