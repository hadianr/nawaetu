import { describe, expect, it } from "vitest";
import { getRamadhanJourney, JOURNEY_DAYS } from "@/lib/ramadhan-journey";

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
