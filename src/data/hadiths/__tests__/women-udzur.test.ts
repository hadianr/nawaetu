import { describe, expect, it } from "vitest";
import { HADITH_LIBRARY, getHadithById } from "@/data/hadiths";
import { UDZUR_HADITHS } from "@/data/hadiths/women-udzur";
import { UDZUR_MISSIONS } from "@/data/missions";

describe("udzur hadiths", () => {
    it("ship every entry in both languages with a unique id", () => {
        expect(UDZUR_HADITHS.length).toBeGreaterThanOrEqual(6);
        for (const h of UDZUR_HADITHS) {
            expect(h.title && h.titleEn && h.translation && h.translationEn && h.explanation && h.explanationEn, h.id).toBeTruthy();
            expect(h.topics, h.id).toContain("women");
        }
        expect(new Set(HADITH_LIBRARY.map((h) => h.id)).size).toBe(HADITH_LIBRARY.length);
    });

    it("credit HadeethEnc once per copied text", () => {
        const ids = UDZUR_HADITHS.flatMap((h) => (h.hadeethEncId ? [h.hadeethEncId] : []));
        expect(ids.length).toBe(5);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("back every udzur mission that links a hadith", () => {
        for (const mission of UDZUR_MISSIONS) {
            if (mission.hadithId) expect(getHadithById(mission.hadithId), mission.id).toBeDefined();
        }
    });

    it("are found by everyday words", () => {
        const search = (q: string) => HADITH_LIBRARY.filter((h) => (h.searchTerms ?? []).some((term) => term.includes(q)));
        for (const word of ["haid", "istihadah", "qadha", "flek"]) expect(search(word).length, word).toBeGreaterThan(0);
    });
});
