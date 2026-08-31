import { describe, expect, it } from "vitest";
import { SETTINGS_EN } from "./translations/en";
import { SETTINGS_ID } from "./translations/id";
import { SPIRITUAL_CONTENT, normalizeSpiritualCategory } from "./spiritual-content";

describe("spiritual content categories", () => {
    it("uses translation keys instead of raw source aliases", () => {
        for (const item of SPIRITUAL_CONTENT) {
            expect(SETTINGS_ID[item.category as keyof typeof SETTINGS_ID]).toBeTruthy();
            expect(SETTINGS_EN[item.category as keyof typeof SETTINGS_EN]).toBeTruthy();
            expect(item.category).toBe(normalizeSpiritualCategory(item.category));
        }
    });
});
