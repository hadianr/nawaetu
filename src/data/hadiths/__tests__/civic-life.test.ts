import { describe, expect, it } from "vitest";
import { HADITH_LIBRARY } from "@/data/hadiths";
import { CIVIC_LIFE_HADITHS } from "@/data/hadiths/civic-life";

const civic = HADITH_LIBRARY.filter((h) => h.topics?.includes("civic-life"));

// Mirrors the hadith page search: a query matches when any search field contains it.
const search = (q: string) =>
    HADITH_LIBRARY.filter((h) =>
        [h.title, h.titleEn, h.translation, h.translationEn, ...(h.searchTerms || [])]
            .some((f) => f?.toLowerCase().includes(q.toLowerCase())),
    );

describe("civic-life hadiths", () => {
    it("ship every entry in both Indonesian and English", () => {
        expect(civic.length).toBeGreaterThanOrEqual(19);
        for (const h of civic) {
            expect(h.title && h.titleEn, h.id).toBeTruthy();
            expect(h.translation && h.translationEn, h.id).toBeTruthy();
            expect(h.explanation && h.explanationEn, h.id).toBeTruthy();
        }
    });

    it("credit HadeethEnc for every copied text and keep ids unique", () => {
        const ids = CIVIC_LIFE_HADITHS.map((h) => h.hadeethEncId);
        expect(ids.every((id) => Number.isInteger(id))).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(HADITH_LIBRARY.map((h) => h.id)).size).toBe(HADITH_LIBRARY.length);
    });

    it.each([
        "privilege", "bagi-bagi kue", "cawe-cawe", "buzzer", "image-building",
        "pencitraan", "politik identitas", "identity politics", "apatis", "apathy",
        "oposisi", "opposition", "rezim", "regime", "serangan fajar", "ordal",
    ])("finds a civic hadith for the slang term %s", (term) => {
        expect(search(term).some((h) => h.topics?.includes("civic-life"))).toBe(true);
    });
});
