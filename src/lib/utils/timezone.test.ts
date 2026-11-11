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

import { addDays, isInSyncWindow } from "./timezone";

describe("sync window", () => {
    it("accepts 30 days back and 1 day forward, nothing outside", () => {
        expect(isInSyncWindow("2026-10-12", "2026-11-11")).toBe(true);   // exactly 30 days back
        expect(isInSyncWindow("2026-10-11", "2026-11-11")).toBe(false);  // 31 days back
        expect(isInSyncWindow("2026-11-12", "2026-11-11")).toBe(true);   // tomorrow (timezone skew)
        expect(isInSyncWindow("2026-11-13", "2026-11-11")).toBe(false);
        expect(isInSyncWindow("2027-11-11", "2026-11-11")).toBe(false);  // a year ahead
    });

    it("adds days across month and year ends", () => {
        expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
        expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    });
});
