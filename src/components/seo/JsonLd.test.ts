import { describe, expect, it } from "vitest";
import { article, book, breadcrumbList, chapterPart, collectionPage } from "@/components/seo/JsonLd";

describe("JsonLd helpers", () => {
    it("numbers breadcrumb items from 1 with absolute URLs", () => {
        const list = breadcrumbList([{ name: "Nawaetu", path: "/" }, { name: "Quran", path: "/quran" }]);
        expect(list.itemListElement.map((i) => [i.position, i.item])).toEqual([
            [1, "https://nawaetu.com/"],
            [2, "https://nawaetu.com/quran"],
        ]);
    });

    it("builds an Article pointing at the page URL", () => {
        const a = article("T", "D", "/sirah/x");
        expect(a.mainEntityOfPage).toBe("https://nawaetu.com/sirah/x");
        expect(a["@type"]).toBe("Article");
    });
});

describe("book JSON-LD", () => {
    const info = { name: "B", alternateName: "B en", author: "A", translators: ["T1", "T2"], inLanguage: ["id", "en"], sameAs: ["https://x"], path: "/sirah/concise" };

    it("credits the author, each translator and the original source", () => {
        const b = book(info);
        expect(b["@type"]).toBe("Book");
        expect(b.author.name).toBe("A");
        expect(b.translator.map((t) => t.name)).toEqual(["T1", "T2"]);
        expect(b.sameAs).toEqual(["https://x"]);
        expect(b.url).toBe("https://nawaetu.com/sirah/concise");
        expect(b.alternateName).toBe("B en");
    });

    it("places a page in its book and lists a hub's parts", () => {
        const c = chapterPart("C", "D", "/sirah/concise/s03/2", info, 2);
        expect(c.isPartOf.name).toBe("B");
        expect(c.url).toBe("https://nawaetu.com/sirah/concise/s03/2");
        const hub = collectionPage("H", "D", "/sirah", [{ name: "P", path: "/sirah/full", description: "d" }]);
        expect(hub.hasPart[0].url).toBe("https://nawaetu.com/sirah/full");
    });
});

