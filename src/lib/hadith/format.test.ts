import { describe, expect, it } from "vitest";
import { HADITH_LIBRARY } from "@/data/hadiths";
import { formatHadithSource } from "./format";

describe("formatHadithSource", () => {
    it("names both books for a hadith in Bukhari and Muslim", () => {
        const item = { collection: "Bukhari", hadithNumber: "321 / 335", authenticity: "Muttafaq 'Alaih" };
        expect(formatHadithSource(item)).toBe("HR. Bukhari No. 321 & Muslim No. 335");
        expect(formatHadithSource(item, "en")).toBe("Bukhari No. 321 & Muslim No. 335");
    });

    it("uses the second book given in the data", () => {
        expect(formatHadithSource({ collection: "Tirmidzi", hadithNumber: "2969 / 1479", authenticity: "Sahih", secondCollection: "Abu Dawud" }))
            .toBe("HR. Tirmidzi No. 2969 & Abu Dawud No. 1479");
    });

    it("leaves a single number, or a second number of unknown book, as stored", () => {
        expect(formatHadithSource({ collection: "Muslim", hadithNumber: 334, authenticity: "Sahih" })).toBe("HR. Muslim No. 334");
        expect(formatHadithSource({ collection: "Tirmidzi", hadithNumber: "417 / 427", authenticity: "Sahih" })).toBe("HR. Tirmidzi No. 417 / 427");
    });

    it("leaves no slash behind in the library except where the second book is unknown", () => {
        const ambiguous = HADITH_LIBRARY.filter((item) => formatHadithSource(item).includes("/")).map((item) => item.id);
        expect(ambiguous).toEqual(["hadith_sholat_rawatib"]);
    });
});
