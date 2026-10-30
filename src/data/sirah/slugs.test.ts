import { describe, expect, it } from "vitest";
import { SIRAH_CHAPTERS, SIRAH_SECTIONS } from "@/data/sirah";
import { SIRAH_QUIZ_BANK } from "@/data/sirah/quiz-questions";

// Next hands route params over percent-encoded, so a non-ASCII slug never matches its data and the page 404s.
describe("sirah slugs", () => {
    const chapterSlugs = new Set(SIRAH_CHAPTERS.map((c) => c.slug));

    it("are URL-safe ASCII", () => {
        for (const slug of chapterSlugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
        for (const s of SIRAH_SECTIONS) expect(s.id).toMatch(/^[a-z0-9-]+$/);
    });

    it("link every section and quiz question to an existing chapter", () => {
        for (const s of SIRAH_SECTIONS) expect(chapterSlugs.has(s.chapterSlug)).toBe(true);
        for (const q of SIRAH_QUIZ_BANK) expect(chapterSlugs.has(q.targetChapterSlug)).toBe(true);
    });
});
