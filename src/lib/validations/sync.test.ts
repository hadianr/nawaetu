import { describe, expect, it } from "vitest";
import { isLocale, sanitizeSyncedSettings } from "./sync";

describe("locale settings", () => {
    it("keeps only the two app languages", () => {
        expect(isLocale("en")).toBe(true);
        expect(isLocale("id")).toBe(true);
        expect(isLocale('"en"')).toBe(false);
        expect(isLocale(null)).toBe(false);
    });

    it("drops a JSON-encoded locale but keeps the other settings", () => {
        expect(sanitizeSyncedSettings({ locale: JSON.stringify(JSON.stringify("en")), theme: "daylight" })).toEqual({ theme: "daylight" });
        expect(sanitizeSyncedSettings({ locale: "id" })).toEqual({ locale: "id" });
    });
});
