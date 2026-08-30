import { describe, expect, it } from "vitest";
import { getHijriEvents } from "./hijri-events";

const ids = (day: number, month: number, weekday = 2) =>
    getHijriEvents({ hijriDay: day, hijriMonth: month, gregorianWeekday: weekday }).map(event => event.id);

describe("Hijri calendar events", () => {
    it("marks weekly and monthly Sunnah fasting opportunities", () => {
        expect(ids(8, 2, 1)).toContain("mondayThursday");
        expect(ids(14, 2)).toContain("ayyamulBidh");
    });

    it("marks Muharram, Shawwal, and Arafah opportunities", () => {
        expect(ids(10, 1)).toEqual(expect.arrayContaining(["muharram", "ashura"]));
        expect(ids(2, 10)).toContain("shawwalSix");
        expect(ids(9, 12)).toContain("arafah");
    });

    it("lets prohibited days override recommendations", () => {
        expect(getHijriEvents({ hijriDay: 1, hijriMonth: 10, gregorianWeekday: 1 })).toEqual([
            { id: "eidFitrProhibited", kind: "prohibited" },
        ]);
        expect(ids(13, 12, 4)).toEqual(["tashreeqProhibited"]);
    });
});
