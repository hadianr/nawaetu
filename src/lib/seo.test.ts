import { describe, expect, it } from "vitest";
import { OG_IMAGE, pageMetadata, seoTitle } from "./seo";

describe("seoTitle", () => {
    it("names the Prophet in full instead of a pronoun with the ligature", () => {
        expect(seoTitle("Nama-Namanya ﷺ")).toBe("Nama-Nama Nabi Muhammad SAW");
        expect(seoTitle("Tuntunannya ﷺ Dalam Berjalan")).toBe("Tuntunan Nabi Muhammad SAW Dalam Berjalan");
        expect(seoTitle("Karakter dan Kepribadian Rasulullah ﷺ")).toBe("Karakter dan Kepribadian Rasulullah");
        expect(seoTitle("Gangguan Kaum Musyrikin Kepada Nabi ﷺ Dan Para Sahabatnya")).toBe("Gangguan Kaum Musyrikin Kepada Nabi Muhammad SAW Dan Para Sahabatnya");
    });

    it("writes Companions' honorifics as RA and drops other Arabic script", () => {
        expect(seoTitle("Khadijah رضي الله عنها")).toBe("Khadijah RA");
        expect(seoTitle("Nama-Nama Istrinya ﷺ Terkumpul Pada Kalimat: (حَجَزَ صَخْرٌ سَمْعَهُ)")).toBe("Nama-Nama Istri Nabi Muhammad SAW Terkumpul Pada Kalimat");
        expect(seoTitle("Sakit Dan Wafatnya ﷺ · Penutup:")).toBe("Sakit Dan Wafat Nabi Muhammad SAW · Penutup");
    });
});

describe("English seoTitle", () => {
    it("names the Prophet in full and drops the ligature and trailing punctuation", () => {
        expect(seoTitle("His ﷺ Names", "en")).toBe("Prophet Muhammad SAW's Names");
        expect(seoTitle("His Lineage ﷺ", "en")).toBe("Prophet Muhammad SAW's Lineage");
        expect(seoTitle("His Family.", "en")).toBe("Prophet Muhammad SAW's Family");
        expect(seoTitle("Description of His ﷺ Creation", "en")).toBe("Description of His Creation");
        expect(seoTitle("Khadijah رضي الله عنها", "en")).toBe("Khadijah RA");
    });
});

describe("pageMetadata social card", () => {
    it("gives Open Graph and X the sized card with alt text", () => {
        const m = pageMetadata("T", "D", "/quran");
        expect(m.openGraph?.images).toEqual([OG_IMAGE]);
        expect(m.twitter?.images).toEqual([OG_IMAGE]);
        expect((m.twitter as { card?: string }).card).toBe("summary_large_image");
        expect(OG_IMAGE).toMatchObject({ width: 1200, height: 630 });
    });
});

describe("pageMetadata social description", () => {
    it("gives link previews the short text and keeps the full description for search", () => {
        const m = pageMetadata("T", "Full description for search results.", "/", { socialDescription: "Short preview." });
        expect(m.description).toBe("Full description for search results.");
        expect(m.openGraph?.description).toBe("Short preview.");
        expect(m.twitter?.description).toBe("Short preview.");
        expect(pageMetadata("T", "D", "/x").openGraph?.description).toBe("D");
    });
});

describe("pageMetadata languages", () => {
    it("links both language versions with x-default on Indonesian", () => {
        const m = pageMetadata("T", "D", "/en/sirah/history", { locale: "en", languages: { id: "/sirah/history", en: "/en/sirah/history" } });
        expect(m.alternates?.canonical).toBe("https://nawaetu.com/en/sirah/history");
        expect(m.alternates?.languages).toEqual({
            "id-ID": "https://nawaetu.com/sirah/history",
            en: "https://nawaetu.com/en/sirah/history",
            "x-default": "https://nawaetu.com/sirah/history",
        });
        expect((m.openGraph as { locale?: string }).locale).toBe("en_US");
    });

    it("leaves pages without a pair alone", () => {
        expect(pageMetadata("T", "D", "/sirah/full").alternates).toEqual({ canonical: "https://nawaetu.com/sirah/full" });
    });
});

