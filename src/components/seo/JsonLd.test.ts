import { describe, expect, it } from "vitest";
import { article, breadcrumbList } from "@/components/seo/JsonLd";

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
