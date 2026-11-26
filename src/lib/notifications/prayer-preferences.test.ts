import { describe, expect, it } from "vitest";
import { isPaused } from "./prayer-preferences";

describe("isPaused", () => {
    const now = new Date("2026-11-26T10:00:00Z");

    it("holds alerts until the pause runs out, then sends them again", () => {
        expect(isPaused("2026-11-30T00:00:00Z", now)).toBe(true);
        expect(isPaused("2026-11-25T00:00:00Z", now)).toBe(false);
    });

    it("ignores anything that is not a time", () => {
        expect(isPaused(null, now)).toBe(false);
        expect(isPaused(true, now)).toBe(false);
        expect(isPaused("not a date", now)).toBe(false);
    });
});
