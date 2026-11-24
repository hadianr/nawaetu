import { describe, expect, it } from "vitest";
import { isLocale, sanitizeSyncedSettings, unwrapSetting } from "./sync";

describe("locale settings", () => {
    it("keeps only the two app languages", () => {
        expect(isLocale("en")).toBe(true);
        expect(isLocale("id")).toBe(true);
        expect(isLocale('"en"')).toBe(false);
        expect(isLocale(null)).toBe(false);
    });

    it("drops a locale that is not one of the two languages", () => {
        expect(sanitizeSyncedSettings({ locale: "fr", theme: "daylight" })).toEqual({ theme: "daylight" });
        expect(sanitizeSyncedSettings({ locale: "id" })).toEqual({ locale: "id" });
    });
});

describe("unwrapSetting", () => {
    it("peels every layer of JSON encoding off a string setting", () => {
        let wrapped: string = "en";
        for (let i = 0; i < 6; i++) wrapped = JSON.stringify(wrapped);
        expect(unwrapSetting(wrapped)).toBe("en");
        expect(sanitizeSyncedSettings({ locale: wrapped, theme: JSON.stringify("daylight") })).toEqual({ locale: "en", theme: "daylight" });
    });

    it("leaves clean values and unrelated quotes alone", () => {
        expect(unwrapSetting("daylight")).toBe("daylight");
        expect(unwrapSetting(2)).toBe(2);
        expect(unwrapSetting('"not json')).toBe('"not json');
    });
});
