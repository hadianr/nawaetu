// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { JourneyAuto } from "@/data/ramadhan-journey";
import { isAutoHabitDone } from "@/lib/journey-auto";

const quran: JourneyAuto = { source: "quran", minSeconds: 60, href: "/quran" };
const dhikr: JourneyAuto = { source: "dhikr", minCount: 33, href: "/dhikr" };
const now = new Date("2026-11-11T12:00:00Z");

describe("isAutoHabitDone", () => {
    beforeEach(() => localStorage.clear());

    it("is false for a manual habit", () => {
        expect(isAutoHabitDone(null, "2026-11-11", now)).toBe(false);
    });

    it("reads today's Quran reading time", () => {
        expect(isAutoHabitDone(quran, "2026-11-11", now)).toBe(false);
        localStorage.setItem("nawaetu_quran_daily_total_2026-11-11", "59");
        expect(isAutoHabitDone(quran, "2026-11-11", now)).toBe(false);
        localStorage.setItem("nawaetu_quran_daily_total_2026-11-11", "60");
        expect(isAutoHabitDone(quran, "2026-11-11", now)).toBe(true);
    });

    it("ignores Quran time from another day", () => {
        localStorage.setItem("nawaetu_quran_daily_total_2026-11-10", "900");
        expect(isAutoHabitDone(quran, "2026-11-11", now)).toBe(false);
    });

    it("reads today's Tasbih count, and ignores a count left from another day", () => {
        localStorage.setItem("nawaetu_dhikr_daily_count", "40");
        localStorage.setItem("nawaetu_dhikr_last_date", "2026-11-10");
        expect(isAutoHabitDone(dhikr, "2026-11-11", now)).toBe(false);
        localStorage.setItem("nawaetu_dhikr_last_date", "2026-11-11");
        expect(isAutoHabitDone(dhikr, "2026-11-11", now)).toBe(true);
        localStorage.setItem("nawaetu_dhikr_daily_count", "32");
        expect(isAutoHabitDone(dhikr, "2026-11-11", now)).toBe(false);
    });

    it("falls back to false when storage throws", () => {
        const original = Storage.prototype.getItem;
        Storage.prototype.getItem = () => { throw new Error("blocked"); };
        try {
            expect(isAutoHabitDone(quran, "2026-11-11", now)).toBe(false);
        } finally {
            Storage.prototype.getItem = original;
        }
    });
});
