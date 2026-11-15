import { describe, expect, it } from "vitest";
import { getConciseNeighbors, getConciseReadableSections, getConciseSection, getConciseSectionLabel, getConciseSirah, readingMinutes } from "./index";

describe("concise sirah", () => {
    it("serves the English edition for en and the Indonesian edition otherwise", () => {
        expect(getConciseSirah("en").title).toMatch(/^A Concise Biography/);
        expect(getConciseSirah("id").title).toMatch(/^CATATAN PENTING/);
        expect(getConciseSirah("ar")).toBe(getConciseSirah("id"));
    });

    it.each(["en", "id"])("%s edition credits its translators and has readable text", (locale) => {
        const book = getConciseSirah(locale);
        expect(book.author).toMatch(/Sarh/);
        expect(book.translators.length).toBeGreaterThan(0);
        expect(new Set(book.sections.map(s => s.id)).size).toBe(book.sections.length);
        for (const section of book.sections) {
            expect(section.title ?? section.chapters[0]?.title).toBeTruthy();
            for (const chapter of section.chapters) {
                for (const topic of chapter.topics) {
                    expect(topic.items.length).toBeGreaterThan(0);
                    topic.items.forEach(item => expect(item.trim()).not.toBe(""));
                }
            }
        }
    });
});

describe("concise sirah navigation", () => {
    it("pages only the sections that have text, with matching ids in both editions", () => {
        const en = getConciseReadableSections("en").map((s) => s.id);
        const id = getConciseReadableSections("id").map((s) => s.id);
        expect(en).toEqual(id);
        expect(en.length).toBeGreaterThan(0);
        expect(getConciseSection("id", "s02")).toBeUndefined(); // part title, no chapters
    });

    it("links neighbours and stops at the ends", () => {
        const list = getConciseReadableSections("id");
        expect(getConciseNeighbors("id", list[0].id).prev).toBeUndefined();
        expect(getConciseNeighbors("id", list[0].id).next?.id).toBe(list[1].id);
        expect(getConciseNeighbors("id", list[list.length - 1].id).next).toBeUndefined();
        expect(getConciseNeighbors("id", "nope")).toEqual({});
    });

    it("labels untitled sections by their first chapter and estimates reading time", () => {
        const first = getConciseReadableSections("en")[0];
        expect(first.title).toBeNull();
        expect(getConciseSectionLabel(first)).toBe(first.chapters[0].title);
        expect(readingMinutes(first)).toBeGreaterThanOrEqual(1);
        expect(readingMinutes({ id: "x", title: "x", chapters: [] })).toBe(1);
    });
});
