import { describe, expect, it } from "vitest";
import { fillTemplate, getNextOddNight, getOddNight, zakatTimingKey, type NoteDay } from "@/lib/hijri-calendar-notes";

// 20-23 Ramadan 1448 on 28 Feb - 3 Mar 2027.
const days: NoteDay[] = [20, 21, 22, 23].map((hijriDay, index) => ({
    gregorianIso: `2027-0${index === 0 ? "2-28" : `3-0${index}`}`,
    hijriDay,
    hijriMonthNumber: 9,
    timings: { Subuh: "04:40", Maghrib: "18:10" },
}));

describe("odd nights", () => {
    it("starts the night of 21 Ramadan at Maghrib on the 20th and ends it at Fajr on the 21st", () => {
        const night = getOddNight(days, 21);
        expect(night?.start).toEqual(new Date("2027-02-28T18:10:00"));
        expect(night?.end).toEqual(new Date("2027-03-01T04:40:00"));
    });

    it("finds the night under way, then the next one", () => {
        expect(getNextOddNight(days, new Date("2027-02-28T12:00:00"))).toMatchObject({ night: 21, ongoing: false });
        expect(getNextOddNight(days, new Date("2027-02-28T22:00:00"))).toMatchObject({ night: 21, ongoing: true });
        expect(getNextOddNight(days, new Date("2027-03-01T12:00:00"))).toMatchObject({ night: 23, ongoing: false });
        expect(getNextOddNight(days, new Date("2027-03-04T12:00:00"))).toBeNull();
    });
});

describe("zakatTimingKey", () => {
    it("follows the madhhab and has a neutral default", () => {
        expect(zakatTimingKey(null)).toBe("hijriZakatTimingNone");
        expect(zakatTimingKey("syafii")).toBe("hijriZakatTimingSyafii");
        expect(zakatTimingKey("hanbali")).toBe("hijriZakatTimingHanbali");
    });
});

describe("fillTemplate", () => {
    it("replaces every placeholder", () => {
        expect(fillTemplate("Day {day} of {total}, {day}", { day: 3, total: 30 })).toBe("Day 3 of 30, 3");
    });
});
