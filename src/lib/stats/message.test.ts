import { describe, expect, it } from "vitest";
import { mostMissedPrayer, prayersDue, statsMessageKind } from "./message";

const map = {
    "2026-11-01": new Set(["subuh", "dzuhur", "ashar", "maghrib", "isya"]),
    "2026-11-02": new Set(["dzuhur", "ashar", "maghrib", "isya"]),
    "2026-11-03": new Set(["subuh"]),
};
const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"];

describe("prayersDue", () => {
    it("counts five a day, but only what was prayed on an udzur day", () => {
        expect(prayersDue(days, map, new Set())).toBe(20);
        expect(prayersDue(days, map, new Set(["2026-11-03", "2026-11-04"]))).toBe(11);
    });
});

describe("mostMissedPrayer", () => {
    it("names the prayer missed most on days it was due", () => {
        expect(mostMissedPrayer(days, map, new Set(["2026-11-03", "2026-11-04"]))).toBe("subuh");
        expect(mostMissedPrayer(["2026-11-01"], map, new Set())).toBeNull();
    });
});

describe("statsMessageKind", () => {
    it("puts udzur first, then a first step, a way back, growth or praise", () => {
        expect(statsMessageKind({ prayed: 0, due: 0, excusedToday: true, hasHistory: true })).toBe("udzur");
        expect(statsMessageKind({ prayed: 0, due: 70, excusedToday: false, hasHistory: false })).toBe("start");
        expect(statsMessageKind({ prayed: 0, due: 70, excusedToday: false, hasHistory: true })).toBe("return");
        expect(statsMessageKind({ prayed: 30, due: 70, excusedToday: false, hasHistory: true })).toBe("grow");
        expect(statsMessageKind({ prayed: 56, due: 70, excusedToday: false, hasHistory: true })).toBe("strong");
    });
});
