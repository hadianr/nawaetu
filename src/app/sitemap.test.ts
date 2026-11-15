import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
    it("lists the English sirah pages next to the Indonesian ones, but not part URLs that only redirect", async () => {
        const urls = (await sitemap()).map((e) => e.url.replace("https://nawaetu.com", ""));
        expect(urls).toEqual(expect.arrayContaining([
            "/sirah/concise", "/en/sirah/concise", "/sirah/concise/s03/2", "/en/sirah/concise/s03/2",
            "/sirah/history", "/en/sirah/history", "/sirah/history/hijrah", "/en/sirah/history/hijrah",
        ]));
        expect(urls).not.toContain("/sirah/concise/s03");
        expect(urls.filter((u) => /\/sirah\/history\/masa-abu-bakar$/.test(u))).toEqual([]);
        expect(new Set(urls).size).toBe(urls.length);
    });
});
