/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { getStorageService } from "@/core/infrastructure/storage";
import { parseStored } from "./stored-json";

describe("parseStored", () => {
    it("reads what the real storage layer returns for a value written with JSON.stringify", () => {
        const storage = getStorageService();
        storage.set("parse_probe", JSON.stringify({ currentJuz: 3, completedJuz: [1, 2] }));

        // The layer hands back an object; a bare JSON.parse on it would throw.
        const back = storage.getOptional<unknown>("parse_probe");
        expect(typeof back).toBe("object");
        expect(parseStored<{ currentJuz: number }>(back)).toEqual({ currentJuz: 3, completedJuz: [1, 2] });
        storage.remove("parse_probe");
    });

    it("accepts the string form, and returns null for empty or broken input", () => {
        expect(parseStored<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
        expect(parseStored(null)).toBeNull();
        expect(parseStored("")).toBeNull();
        expect(parseStored("{not json")).toBeNull();
    });
});
