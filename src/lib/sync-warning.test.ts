import { describe, expect, it } from "vitest";
import { getSyncWarning } from "./sync-warning";

const DAY = 86_400_000;
const now = Date.UTC(2026, 10, 11);

describe("getSyncWarning", () => {
    it("is silent for a recent or missing marker", () => {
        expect(getSyncWarning(null, now).level).toBe(0);
        expect(getSyncWarning(now - 6 * DAY, now).level).toBe(0);
        expect(getSyncWarning(now + DAY, now).level).toBe(0);
    });

    it("gives a notice after a week and an urgent warning after 23 days with the days left", () => {
        expect(getSyncWarning(now - 7 * DAY, now)).toEqual({ level: 1, ageDays: 7, daysLeft: 23 });
        expect(getSyncWarning(now - 22 * DAY, now).level).toBe(1);
        expect(getSyncWarning(now - 23 * DAY, now)).toEqual({ level: 2, ageDays: 23, daysLeft: 7 });
        expect(getSyncWarning(now - 40 * DAY, now).daysLeft).toBe(0);
    });
});
