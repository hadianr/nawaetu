import {
    getConciseDisplayTopics,
    getConcisePage,
    getConcisePageLabel,
    getConcisePageNeighbors,
    getConcisePageRefs,
    getConcisePages,
    getConciseReadableSections,
    getConciseSection,
    getConciseSectionLabel,
    getConciseSirah,
    isConciseListChapter,
    isConcisePageRead,
    isConciseSectionRead,
    pageReadingMinutes,
    readingMinutes,
} from "./index";

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

    it("labels untitled sections by their first chapter and estimates reading time", () => {
        const first = getConciseReadableSections("en")[0];
        expect(first.title).toBeNull();
        expect(getConciseSectionLabel(first)).toBe(first.chapters[0].title);
        expect(readingMinutes(first)).toBeGreaterThanOrEqual(1);
        expect(readingMinutes({ id: "x", title: "x", chapters: [] })).toBe(1);
    });
});

describe("concise sirah pages", () => {
    const wordsOf = (ref: ReturnType<typeof getConcisePageRefs>[number]) =>
        ref.chapters.flatMap((c) => c.chapter.topics.flatMap((t) => t.items)).join(" ").split(/\s+/).length;

    it.each(["en", "id"])("%s: every chapter appears once, in order, on some page", (locale) => {
        for (const section of getConciseReadableSections(locale)) {
            const numbers = getConcisePages(section).flatMap((p) => p.chapters.map((c) => c.number));
            expect(numbers).toEqual(section.chapters.map((_, i) => i + 1));
        }
    });

    it.each(["en", "id"])("%s: short chapters share a page instead of standing alone", (locale) => {
        for (const page of getConcisePageRefs(locale)) {
            if (getConcisePages(page.section).length > 1) expect(wordsOf(page)).toBeGreaterThanOrEqual(100);
        }
    });

    it("puts the two short opening chapters of s03 on one page", () => {
        const first = getConcisePage("id", "s03", 1)!;
        expect(first.chapters.map((c) => c.number)).toEqual([1, 2]);
        expect(first.id).toBe("s03-1");
        expect(getConcisePageLabel(first)).toMatch(/^Nasabnya .* · Manusia Pilihan/);
        expect(pageReadingMinutes(first)).toBeGreaterThanOrEqual(1);
    });

    it("rejects bad page numbers and shows the last page past the end", () => {
        expect(getConcisePage("id", "s03", 0)).toBeUndefined();
        expect(getConcisePage("id", "s03", 1.5)).toBeUndefined();
        expect(getConcisePage("id", "s02", 1)).toBeUndefined(); // part title, no chapters
        const pages = getConcisePages(getConciseSection("id", "s03")!);
        expect(getConcisePage("id", "s03", 99)!.number).toBe(pages.length);
    });

    it("moves to the next part after a part's last page and stops at the ends", () => {
        const refs = getConcisePageRefs("id");
        const s03 = getConcisePages(getConciseSection("id", "s03")!);
        expect(getConcisePageNeighbors("id", s03[s03.length - 1]).next?.id).toBe("s04-1");
        expect(getConcisePageNeighbors("id", refs[0]).prev).toBeUndefined();
        expect(getConcisePageNeighbors("id", refs[refs.length - 1]).next).toBeUndefined();
    });

    it("counts a part as read when all its pages are, or when the old part id was saved", () => {
        const s03 = getConciseSection("id", "s03")!;
        const pages = getConcisePages(s03);
        expect(isConciseSectionRead(s03, ["s03"])).toBe(true);
        expect(isConcisePageRead(pages[1], ["s03"])).toBe(true);
        expect(isConciseSectionRead(s03, [pages[0].id])).toBe(false);
        expect(isConciseSectionRead(s03, pages.map((p) => p.id))).toBe(true);
        expect(isConcisePageRead(pages[1], [])).toBe(false);
    });

    it("treats name lists as tap-to-open lists but keeps stories as prose", () => {
        const s03 = getConciseSection("id", "s03")!;
        expect(isConciseListChapter(s03.chapters[2])).toBe(true);
        expect(isConciseListChapter(s03.chapters[0])).toBe(false);
    });
});

describe("display topics", () => {
    it("joins a passage the PDF cut across pages back onto its titled topic, word for word", () => {
        const manners = getConciseSection("id", "s03")!.chapters[5];
        const shown = getConciseDisplayTopics(manners);
        const raw = manners.topics.flatMap((tp) => tp.items).join(" ").replace(/\s+/g, " ");
        expect(shown.flatMap((tp) => tp.items).join(" ").replace(/\s+/g, " ")).toBe(raw);
        expect(shown.filter((tp) => !tp.title)).toHaveLength(0);
        expect(shown.length).toBe(manners.topics.length - 2);
    });

    it("keeps an untitled paragraph separate when the topic before it ends a sentence", () => {
        const names = getConciseSection("id", "s03")!.chapters[2];
        const shown = getConciseDisplayTopics(names);
        expect(shown[shown.length - 1].title).toBeNull();
        expect(shown[shown.length - 1].items[0]).toMatch(/^Dia Adalah Hamba Allah/);
    });
});

describe("shared page breaks", () => {
    it("splits a part the same way in both editions when it has the same chapters", () => {
        for (const section of getConciseReadableSections("id")) {
            const en = getConciseSection("en", section.id)!;
            if (en.chapters.length !== section.chapters.length) continue;
            const breaks = (s: typeof section) => getConcisePages(s).map((p) => p.chapters.map((c) => c.number));
            expect(breaks(en)).toEqual(breaks(section));
        }
    });
});

