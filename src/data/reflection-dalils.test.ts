import { describe, expect, it } from "vitest";
import { reflectionDalils } from "./reflection-dalils";

describe("reflection dalils", () => {
    it("ship every dalil in both Indonesian and English with a source", () => {
        for (const d of reflectionDalils) {
            expect(d.textId && d.textEn, d.id).toBeTruthy();
            expect(d.sourceId && d.sourceEn, d.id).toBeTruthy();
        }
        expect(new Set(reflectionDalils.map((d) => d.id)).size).toBe(reflectionDalils.length);
    });

    it("credit QuranEnc and keep the Arabic for every civic verse", () => {
        const civic = reflectionDalils.filter((d) => d.id.startsWith("quran-"));
        expect(civic).toHaveLength(4);
        for (const d of civic) {
            expect(d.arabic, d.id).toBeTruthy();
            expect(d.sourceId).toContain("QuranEnc");
            expect(d.sourceEn).toContain("QuranEnc");
        }
    });
});
