import { describe, expect, it } from "vitest";
import { getConcisePages, getConciseSection } from "./index";
import { CONCISE_NOTES, conciseNoteKey, getConciseNote } from "./notes";

describe("Nawaetu notes on the concise sirah", () => {
    const keys = Object.keys(CONCISE_NOTES);

    it("match a real reading page, split the same way in both editions", () => {
        for (const key of keys) {
            const sectionId = key.split(":")[0];
            for (const locale of ["id", "en"]) {
                const pageKeys = getConcisePages(getConciseSection(locale, sectionId)!).map((p) => conciseNoteKey(sectionId, p.chapters.map((c) => c.number)));
                expect(pageKeys).toContain(key);
            }
        }
    });

    it.each(keys)("%s points at a real chapter and has every text in both languages", (key) => {
        const note = CONCISE_NOTES[key];
        for (const text of [note.contextId, note.contextEn, note.reflectId, note.reflectEn]) {
            expect(text.trim().length).toBeGreaterThan(10);
        }
        if (note.hadith) {
            expect(Number.isInteger(note.hadith.hadeethEncId)).toBe(true);
            expect(note.hadith.translation && note.hadith.translationEn).toBeTruthy();
            for (const r of note.hadith.references ?? []) expect(r.collection && /^\d+[a-z]?$/.test(r.number)).toBeTruthy();
            expect(note.hadith.attributionId && note.hadith.attributionEn && note.hadith.gradeId && note.hadith.gradeEn).toBeTruthy();
        }
    });

    it("looks a note up by page and returns nothing for pages without one", () => {
        const names = getConciseNote({ section: { id: "s03" }, chapters: [{ number: 3 }] })!;
        const hadithIds = names.origins!.flatMap((o) => o.sources).flatMap((s) => (s.kind === "hadith" ? [s.hadith.hadeethEncId] : []));
        expect(hadithIds).toEqual([10860, 10861]);
        expect(getConciseNote({ section: { id: "s08" }, chapters: [{ number: 1 }] })).toBeUndefined();
        expect(getConciseNote({ section: { id: "s03" }, chapters: [{ number: 1 }, { number: 2 }] })?.contextId).toMatch(/^Kisah dibuka/);
    });
});

describe("name origins", () => {
    const origins = Object.values(CONCISE_NOTES).flatMap((n) => n.origins ?? []);

    it.each(origins.map((o) => [o.fromEn, o] as const))("%s names its source and has both languages", (_, o) => {
        expect(o.names.length).toBeGreaterThan(0);
        expect(o.fromId && o.fromEn && o.detailId && o.detailEn).toBeTruthy();
        expect(o.sources.length).toBeGreaterThan(0);
        for (const s of o.sources) {
            if (s.kind === "sirah") expect(s.href).toMatch(/^\/sirah\/[a-z0-9-]+\/sec-\d+$/);
            if (s.kind === "quran") expect(s.textId && s.textEn && s.labelId && s.labelEn).toBeTruthy();
            if (s.kind === "hadith") expect(s.hadith.translation && s.hadith.translationEn).toBeTruthy();
        }
    });

    it("links only to sirah sections that exist", async () => {
        const { getSirahSectionById } = await import("@/data/sirah");
        for (const s of origins.flatMap((o) => o.sources)) {
            if (s.kind !== "sirah") continue;
            const [, , slug, id] = s.href.split("/");
            expect(getSirahSectionById(id)?.chapterSlug).toBe(slug);
        }
    });
});
