import { describe, expect, it } from "vitest";
import {
    SIRAH_CHAPTERS,
    SIRAH_SECTIONS,
    getSirahChapterBySlug,
    getSirahChapters,
    getSirahChaptersByEra,
    getSirahSectionById,
    getSirahSectionsByChapterSlug,
    searchSirah,
} from "@/data/sirah";

describe("sirah data helpers", () => {
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
});
