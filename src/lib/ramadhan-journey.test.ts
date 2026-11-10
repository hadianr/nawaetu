import { describe, expect, it } from "vitest";
import { getJourneyMilestone, getPhaseProgress, getRamadhanJourney, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

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

describe("getPhaseProgress", () => {
    it("counts the day inside its phase, matching the phase ranges", () => {
        expect(getPhaseProgress("reset", 100)).toEqual({ day: 1, total: 30 });
        expect(getPhaseProgress("reset", 90)).toEqual({ day: 11, total: 30 });
        expect(getPhaseProgress("reset", 71)).toEqual({ day: 30, total: 30 });
        expect(getPhaseProgress("build", 70)).toEqual({ day: 1, total: 40 });
        expect(getPhaseProgress("sharpen", 1)).toEqual({ day: 30, total: 30 });
    });
});
