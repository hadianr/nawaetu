import { describe, expect, it } from "vitest";
import { getConcisePageRefs } from "./index";
import { CONCISE_BOOK_INFO, concisePageSeoDescription, concisePageSeoTitle } from "./seo";

describe("concise sirah SEO", () => {
    const pages = getConcisePageRefs("id");

    it("gives every reading page its own description", () => {
        const descriptions = pages.map(concisePageSeoDescription);
        expect(new Set(descriptions).size).toBe(descriptions.length);
    });

    it("keeps titles short, readable and free of the ligature", () => {
        for (const page of pages) {
            const title = concisePageSeoTitle(page);
            expect(title).not.toMatch(/ﷺ|[؀-ۿ]/);
            expect(title.length).toBeLessThanOrEqual(56);
            expect(title.match(/Nabi Muhammad SAW/g)?.length ?? 0).toBeLessThanOrEqual(1);
            expect(title.length).toBeGreaterThan(3);
        }
    });

    it("credits all three translators and both sources", () => {
        expect(CONCISE_BOOK_INFO.translators).toHaveLength(3);
        expect(CONCISE_BOOK_INFO.sameAs).toEqual(expect.arrayContaining([expect.stringContaining("islamhouse.com"), expect.stringContaining("sarhaan.com")]));
    });
});
