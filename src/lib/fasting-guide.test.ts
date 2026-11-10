import { describe, expect, it } from "vitest";
import { countRecommendedDays, getFastingGuide } from "@/lib/fasting-guide";

const at = (date: string) => new Date(`${date}T10:00:00`);

describe("getFastingGuide", () => {
    it("suggests a sunnah fast on a recommended day when nothing is owed", () => {
        // Thu 13 Sha'ban 1448: Thursday and Ayyamul Bidh together.
        const guide = getFastingGuide({ now: at("2027-01-21"), pendingQadha: 0, madzhab: "syafii" });
        expect(guide).toEqual({ today: "sunnah", timing: ["mondayThursday", "ayyamulBidh"], reason: null });
    });

    it("offers a make-up fast before a voluntary one when fasts are owed", () => {
        expect(getFastingGuide({ now: at("2027-01-21"), pendingQadha: 3, madzhab: "syafii" }).today).toBe("qadha");
    });

    it("suggests nothing on an ordinary day", () => {
        // Tue 18 Sha'ban: not Mon/Thu, not 13-15.
        expect(getFastingGuide({ now: at("2027-01-26"), pendingQadha: 2, madzhab: "syafii" }))
            .toEqual({ today: "none", timing: [], reason: null });
    });

    it("keeps Ayyamul Bidh on a Friday, because it is not a Friday singled out", () => {
        // Fri 14 Sha'ban.
        expect(getFastingGuide({ now: at("2027-01-22"), pendingQadha: 0, madzhab: null }).today).toBe("sunnah");
    });

    it("holds back a new voluntary fast after mid-Sha'ban for Shafi'i and an unset madhhab only", () => {
        // Mon 17 Sha'ban.
        const day = at("2027-01-25");
        expect(getFastingGuide({ now: day, pendingQadha: 0, madzhab: "syafii" })).toMatchObject({ today: "none", reason: "afterMidSyaban" });
        expect(getFastingGuide({ now: day, pendingQadha: 0, madzhab: null })).toMatchObject({ today: "none", reason: "afterMidSyaban" });
        expect(getFastingGuide({ now: day, pendingQadha: 0, madzhab: "hanafi" }).today).toBe("sunnah");
        expect(getFastingGuide({ now: day, pendingQadha: 0, madzhab: "hanbali" }).today).toBe("sunnah");
    });

    it("never blocks a make-up fast, even after mid-Sha'ban", () => {
        expect(getFastingGuide({ now: at("2027-01-25"), pendingQadha: 1, madzhab: "syafii" }).today).toBe("qadha");
    });

    it("holds back a voluntary fast in the last two days before Ramadan, for every madhhab", () => {
        // Thu 27 Jan 2028 is the day before 1 Ramadan 1449 by Umm al-Qura.
        for (const madzhab of ["syafii", "hanafi", "maliki", "hanbali"] as const) {
            expect(getFastingGuide({ now: at("2028-01-27"), pendingQadha: 0, madzhab })).toMatchObject({ today: "none", reason: "preRamadan" });
        }
        expect(getFastingGuide({ now: at("2028-01-27"), pendingQadha: 2, madzhab: "hanafi" }).today).toBe("qadha");
    });

    it("follows the user's Hijri adjustment", () => {
        // +1 moves Thu 13 Sha'ban to 14 Sha'ban: still Ayyamul Bidh. +3 moves it to 16, no longer.
        expect(getFastingGuide({ now: at("2027-01-21"), adjustment: 1, pendingQadha: 0, madzhab: "hanafi" }).timing).toContain("ayyamulBidh");
        expect(getFastingGuide({ now: at("2027-01-21"), adjustment: 3, pendingQadha: 0, madzhab: "hanafi" }).timing).toEqual(["mondayThursday"]);
    });

    it("suggests nothing during Ramadan", () => {
        expect(getFastingGuide({ now: at("2027-02-11"), pendingQadha: 5, madzhab: "syafii" }).today).toBe("none");
    });
});

describe("countRecommendedDays", () => {
    it("counts Mon/Thu and 13-15 Hijri days once each, up to the day before Ramadan", () => {
        // 21 Jan to 7 Feb 2027: Thu 21, Mon 25, Thu 28, Mon 1, Thu 4 = 5 Mon/Thu, plus 13-15 Sha'ban = 21 (already Thu), 22, 23.
        expect(countRecommendedDays(at("2027-01-21"))).toBe(7);
    });

    it("is zero during Ramadan", () => {
        expect(countRecommendedDays(at("2027-02-11"))).toBe(0);
    });
});
