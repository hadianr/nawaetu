import { describe, expect, it, vi } from "vitest";
import { RAMADHAN_PAGE_ENABLED } from "./features";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

describe("Ramadan page switch", () => {
    it("is off until Ramadan", () => {
        expect(RAMADHAN_PAGE_ENABLED).toBe(false);
    });

    it("answers 404 for the page while off", async () => {
        const { default: RamadhanLayout } = await import("@/app/ramadhan/layout");
        expect(() => RamadhanLayout({ children: null })).toThrow("NEXT_NOT_FOUND");
    });

    it("keeps the page out of the sitemap and llms.txt while off", async () => {
        const sitemap = (await import("@/app/sitemap")).default;
        const entries = await sitemap();
        expect(entries.some((entry) => entry.url.endsWith("/ramadhan"))).toBe(false);

        const { GET } = await import("@/app/llms.txt/route");
        const text = await (await GET()).text();
        expect(text).not.toContain("/ramadhan");
        expect(text).toContain("/hijri-calendar");
    });
});
