import { describe, expect, it } from "vitest";
import { localDateIn, validTimezone } from "./timezone";

describe("timezone helpers", () => {
    it("files an early-morning WIB instant under the local day, not the UTC day", () => {
        const instant = new Date("2026-11-11T04:30:00+07:00");
        expect(instant.toISOString().slice(0, 10)).toBe("2026-11-10");
        expect(localDateIn(instant, "Asia/Jakarta")).toBe("2026-11-11");
    });

    it("falls back to UTC for a missing or invalid timezone", () => {
        const instant = new Date("2026-11-11T04:30:00+07:00");
        expect(validTimezone("Not/AZone")).toBe("UTC");
        expect(validTimezone(undefined)).toBe("UTC");
        expect(localDateIn(instant, "Not/AZone")).toBe("2026-11-10");
    });
});
