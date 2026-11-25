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

    it("marks every day of Ramadan as the obligatory fast, with no sunnah fast on top", () => {
        for (let day = 1; day <= 30; day++) {
            const events = getHijriEvents({ hijriDay: day, hijriMonth: 9, gregorianWeekday: 1 });
            expect(events[0]).toEqual({ id: "ramadan", kind: "obligatory" });
            expect(events.map(event => event.id)).not.toContain("mondayThursday");
            expect(events.map(event => event.id)).not.toContain("ayyamulBidh");
        }
    });

    it("marks only the odd nights of Ramadan's last ten", () => {
        const nights = Array.from({ length: 30 }, (_, i) => i + 1).filter(day => ids(day, 9).includes("lailatulQadr"));
        expect(nights).toEqual([21, 23, 25, 27, 29]);
    });
});
