import { describe, expect, it } from "vitest";
import {
    adjustHijriDate,
    formatHijriDate,
    getAdjustedCalendarHijriDate,
    parseHijriAdjustment,
} from "./hijri-date";

describe("Hijri date normalization", () => {
    it("adjusts normal dates and year boundaries", () => {
        expect(adjustHijriDate({ day: 10, month: 2, year: 1448 }, -1)).toMatchObject({ day: 9, month: 2, year: 1448 });
        expect(adjustHijriDate({ day: 30, month: 12, year: 1448 }, 1)).toMatchObject({ day: 1, month: 1, year: 1449 });
        expect(formatHijriDate(adjustHijriDate({ day: 30, month: 12, year: 1448 }, 1), "id")).toBe("1 Muharram 1449H");
    });

    it("uses adjacent API dates instead of assuming a 30-day month", () => {
        const dates = [
            { day: 29, month: 1, year: 1448 },
            { day: 1, month: 2, year: 1448 },
        ];

        expect(getAdjustedCalendarHijriDate(dates, 0, 1)).toMatchObject({ day: 1, month: 2, year: 1448 });
    });

    it("parses stored adjustments safely", () => {
        expect(parseHijriAdjustment("2")).toBe(2);
        expect(parseHijriAdjustment("invalid")).toBe(-1);
    });
});
