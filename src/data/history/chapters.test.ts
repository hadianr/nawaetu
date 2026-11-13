import { describe, expect, it } from "vitest";
import { HISTORY_CHAPTERS, getHistoryChaptersForMonth } from "./chapters";
import { HISTORY_CONTENT } from "./content";
import { SIRAH_CHAPTERS, getSirahSectionById } from "../sirah";

const MONTH_PATTERNS: Record<number, string> = { 9: "Ramadhan", 10: "Syaw+al" };

describe("history chapters", () => {
    it("are numbered in order with unique slugs", () => {
        expect(HISTORY_CHAPTERS.map((c) => c.order)).toEqual(HISTORY_CHAPTERS.map((_, i) => i + 1));
        expect(new Set(HISTORY_CHAPTERS.map((c) => c.slug)).size).toBe(HISTORY_CHAPTERS.length);
    });

    it.each(HISTORY_CHAPTERS.filter((c) => c.date))("$slug has a date stated in the app's sirah text", (chapter) => {
        const { hijriDay, hijriMonth, hijriYear, sourceSectionId } = chapter.date!;
        const text = getSirahSectionById(sourceSectionId)!.content.join(" ");
        expect(text).toMatch(new RegExp(`${hijriDay ? `${hijriDay} ` : ""}${MONTH_PATTERNS[hijriMonth]}\\s+${hijriYear} H`));
    });

    it.each(HISTORY_CHAPTERS)("$slug ships every text in both languages with a HadeethEnc source", (chapter) => {
        expect(chapter.titleId && chapter.titleEn && chapter.introId && chapter.introEn).toBeTruthy();
        if (chapter.sirahChapterSlug) expect(SIRAH_CHAPTERS.some((s) => s.slug === chapter.sirahChapterSlug)).toBe(true);

        const hadiths = HISTORY_CONTENT[chapter.slug];
        expect(hadiths).toHaveLength(chapter.hadithCount);
        for (const h of hadiths) {
            expect(Number.isInteger(h.hadeethEncId)).toBe(true);
            expect(h.bridgeId && h.bridgeEn && h.arabic && h.translation && h.translationEn).toBeTruthy();
            expect(h.attributionId && h.attributionEn && h.gradeId && h.gradeEn).toBeTruthy();
        }
    });

    it("uses each hadith once across the chapters", () => {
        const ids = Object.values(HISTORY_CONTENT).flat().map((h) => h.hadeethEncId);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("lists dated chapters by Hijri month for the calendar", () => {
        expect(getHistoryChaptersForMonth(9).map((c) => c.slug)).toEqual(["perang-badar"]);
        expect(getHistoryChaptersForMonth(10).map((c) => c.slug)).toEqual(["perang-uhud", "perang-khandaq", "perang-hunain"]);
        expect(getHistoryChaptersForMonth(1)).toEqual([]);
    });
});
