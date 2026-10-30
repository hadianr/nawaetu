import { afterEach, describe, expect, it, vi } from "vitest";
import {
    SIRAH_CHAPTERS,
    SIRAH_SECTIONS,
    getDailySirahHighlight,
    getSirahChapterBySlug,
    getSirahChapters,
    getSirahChaptersByEra,
    getSirahSectionById,
    getSirahSectionsByChapterSlug,
    searchSirah,
} from "@/data/sirah";
import { SIRAH_QUIZ_BANK, getRandomSirahQuestions } from "@/data/sirah/quiz-questions";

describe("sirah data helpers", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns every chapter and filters by era", () => {
        expect(getSirahChapters()).toBe(SIRAH_CHAPTERS);
        const era = SIRAH_CHAPTERS[0].era;
        const inEra = getSirahChaptersByEra(era);
        expect(inEra.length).toBeGreaterThan(0);
        expect(inEra.every((c) => c.era === era)).toBe(true);
    });

    it("finds a chapter by slug and a section by id", () => {
        const chapter = SIRAH_CHAPTERS[0];
        expect(getSirahChapterBySlug(chapter.slug)).toBe(chapter);
        expect(getSirahChapterBySlug("does-not-exist")).toBeUndefined();

        const section = SIRAH_SECTIONS[0];
        expect(getSirahSectionById(section.id)).toBe(section);
        expect(getSirahSectionById("sec-missing")).toBeUndefined();
    });

    it("groups sections by chapter without losing any", () => {
        const grouped = SIRAH_CHAPTERS.reduce((n, c) => n + getSirahSectionsByChapterSlug(c.slug).length, 0);
        expect(grouped).toBe(SIRAH_SECTIONS.length);
        expect(getSirahSectionsByChapterSlug("does-not-exist")).toEqual([]);
    });

    it("searches subbab titles, ignores short queries and case", () => {
        expect(searchSirah("")).toEqual([]);
        expect(searchSirah(" a ")).toEqual([]);

        const section = SIRAH_SECTIONS[0];
        const hits = searchSirah(section.subbab.toUpperCase());
        expect(hits).toContain(section);
    });

    it("rotates the daily highlight deterministically by day of year", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 0, 10, 8, 0, 0));
        const first = getDailySirahHighlight();
        vi.setSystemTime(new Date(2026, 0, 10, 23, 0, 0));
        expect(getDailySirahHighlight()).toBe(first);

        vi.setSystemTime(new Date(2026, 0, 11, 8, 0, 0));
        const next = getDailySirahHighlight();
        expect(SIRAH_SECTIONS).toContain(next);
        expect(next).not.toBe(first);
    });
});

describe("sirah quiz bank", () => {
    it("returns the requested number of distinct questions from the bank", () => {
        const picked = getRandomSirahQuestions(5);
        expect(picked).toHaveLength(5);
        expect(new Set(picked.map((q) => q.id)).size).toBe(5);
        expect(picked.every((q) => SIRAH_QUIZ_BANK.includes(q))).toBe(true);
    });

    it("never returns more than the bank holds", () => {
        expect(getRandomSirahQuestions(SIRAH_QUIZ_BANK.length + 10)).toHaveLength(SIRAH_QUIZ_BANK.length);
    });

    it("keeps each correct answer index inside its options", () => {
        for (const q of SIRAH_QUIZ_BANK) {
            expect(q.correctIndex).toBeGreaterThanOrEqual(0);
            expect(q.correctIndex).toBeLessThan(q.options.length);
        }
    });
});
