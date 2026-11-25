import { describe, expect, it } from "vitest";
import { HIJRI_MONTH_INFO, getHijriMonthInfo } from "@/data/hijri-months";
import { hijriCalendarEN } from "@/data/translations/en/hijri-calendar";
import { hijriCalendarID } from "@/data/translations/id/hijri-calendar";

describe("Hijri month card content", () => {
    it("covers all twelve months in both languages", () => {
        expect(HIJRI_MONTH_INFO.map(info => info.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        for (const info of HIJRI_MONTH_INFO) {
            expect(info.arabic).not.toBe("");
            expect(info.insight.id).not.toBe("");
            expect(info.insight.en).not.toBe("");
            for (const practice of info.practices) {
                expect([practice.title.id, practice.title.en, practice.body.id, practice.body.en, practice.source]).not.toContain("");
            }
        }
    });

    it("marks the four sacred months and Ramadan", () => {
        const sacred = HIJRI_MONTH_INFO.filter(info => info.chip === "sacred").map(info => info.month);
        expect(sacred).toEqual([1, 7, 11, 12]);
        expect(getHijriMonthInfo(9)?.chip).toBe("ramadan");
    });

    it("does not repeat the weekly and monthly fasts the grid already marks", () => {
        const text = JSON.stringify(HIJRI_MONTH_INFO.map(info => info.practices.map(practice => [practice.title, practice.body])));
        expect(text).not.toMatch(/Ayyamul Bidh|Senin|Monday/);
    });

    it("keeps no claim of a specific Rajab practice", () => {
        expect(getHijriMonthInfo(7)?.practices).toEqual([]);
    });

    it("has the same keys in both locale files", () => {
        expect(Object.keys(hijriCalendarID).sort()).toEqual(Object.keys(hijriCalendarEN).sort());
    });
});
