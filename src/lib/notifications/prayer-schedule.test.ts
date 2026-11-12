import { describe, expect, it } from "vitest";
import { localDateOf, nextAlertAt, toAladhanDate, zonedInstant } from "./prayer-schedule";

const iso = (date: Date | null) => date?.toISOString();

describe("zonedInstant", () => {
    it("reads a wall clock in a zone without daylight saving", () => {
        expect(iso(zonedInstant("2026-11-12", "04:06", "Asia/Jakarta"))).toBe("2026-11-11T21:06:00.000Z"); // UTC+7
        expect(iso(zonedInstant("2026-11-12", "04:06", "Asia/Jayapura"))).toBe("2026-11-11T19:06:00.000Z"); // UTC+9
    });

    it("follows daylight saving in both directions", () => {
        expect(iso(zonedInstant("2026-07-01", "12:00", "Europe/London"))).toBe("2026-07-01T11:00:00.000Z"); // BST, UTC+1
        expect(iso(zonedInstant("2026-12-01", "12:00", "Europe/London"))).toBe("2026-12-01T12:00:00.000Z"); // GMT
        expect(iso(zonedInstant("2026-07-01", "12:00", "America/New_York"))).toBe("2026-07-01T16:00:00.000Z"); // EDT, UTC-4
        expect(iso(zonedInstant("2026-12-01", "12:00", "America/New_York"))).toBe("2026-12-01T17:00:00.000Z"); // EST, UTC-5
    });

    it("is right on the day the clocks change, before and after the change", () => {
        // Europe/London springs forward on 2026-03-29 at 01:00 UTC: 05:00 local that morning is already BST.
        expect(iso(zonedInstant("2026-03-29", "05:00", "Europe/London"))).toBe("2026-03-29T04:00:00.000Z");
        expect(iso(zonedInstant("2026-03-28", "05:00", "Europe/London"))).toBe("2026-03-28T05:00:00.000Z");
        // America/New_York falls back on 2026-11-01 at 06:00 UTC (02:00 EDT becomes 01:00 EST): the day before is EDT, and
        // 05:00 and 07:00 that morning are both already EST.
        expect(iso(zonedInstant("2026-10-31", "05:00", "America/New_York"))).toBe("2026-10-31T09:00:00.000Z");
        expect(iso(zonedInstant("2026-11-01", "05:00", "America/New_York"))).toBe("2026-11-01T10:00:00.000Z");
        expect(iso(zonedInstant("2026-11-01", "07:00", "America/New_York"))).toBe("2026-11-01T12:00:00.000Z");
    });

    it("refuses what it cannot read", () => {
        expect(zonedInstant("12-11-2026", "04:06", "Asia/Jakarta")).toBeNull();
        expect(zonedInstant("2026-11-12", "soon", "Asia/Jakarta")).toBeNull();
    });
});

describe("dates", () => {
    it("takes the date in the subscriber's zone, not the server's", () => {
        const instant = new Date("2026-11-11T20:00:00Z"); // already the 12th in Jakarta, still the 11th in London
        expect(localDateOf(instant, "Asia/Jakarta")).toBe("2026-11-12");
        expect(localDateOf(instant, "Europe/London")).toBe("2026-11-11");
        expect(toAladhanDate("2026-11-12")).toBe("12-11-2026");
    });
});

describe("nextAlertAt", () => {
    const day = { Imsak: "04:25 (WIB)", Fajr: "04:35 (WIB)", Dhuhr: "11:41 (WIB)", Asr: "15:00 (WIB)", Maghrib: "17:48 (WIB)", Isha: "19:04 (WIB)" };
    const tomorrow = { ...day, Imsak: "04:24", Fajr: "04:34" };
    const timingsFor = async (date: string) => (date === "12-11-2026" ? day : date === "13-11-2026" ? tomorrow : null);
    const all = () => true;
    const at = (utc: string) => new Date(utc);

    it("picks the next prayer later today", async () => {
        // 08:00 in Jakarta: Dhuhr (11:41) is next.
        expect(iso(await nextAlertAt({ now: at("2026-11-12T01:00:00Z"), timeZone: "Asia/Jakarta", timingsFor, isEnabled: all }))).toBe("2026-11-12T04:41:00.000Z");
    });

    it("does not pick the prayer that has just been alerted: it must lie after now", async () => {
        // 11:41:20 in Jakarta, Dhuhr is at 11:41:00 and was just sent: the next is Asr.
        expect(iso(await nextAlertAt({ now: at("2026-11-12T04:41:20Z"), timeZone: "Asia/Jakarta", timingsFor, isEnabled: all }))).toBe("2026-11-12T08:00:00.000Z");
    });

    it("rolls over to tomorrow's first prayer after Isha", async () => {
        // 21:00 in Jakarta: tomorrow's Imsak (04:24 on the 13th).
        expect(iso(await nextAlertAt({ now: at("2026-11-12T14:00:00Z"), timeZone: "Asia/Jakarta", timingsFor, isEnabled: all }))).toBe("2026-11-12T21:24:00.000Z");
    });

    it("skips prayers the subscriber switched off", async () => {
        const onlyMaghrib = (prayer: string) => prayer === "Maghrib";
        expect(iso(await nextAlertAt({ now: at("2026-11-12T01:00:00Z"), timeZone: "Asia/Jakarta", timingsFor, isEnabled: onlyMaghrib }))).toBe("2026-11-12T10:48:00.000Z");
    });

    it("looks again tomorrow when every prayer is off", async () => {
        const now = at("2026-11-12T01:00:00Z");
        const result = await nextAlertAt({ now, timeZone: "Asia/Jakarta", timingsFor, isEnabled: () => false });
        expect(result?.getTime()).toBe(now.getTime() + 86_400_000);
    });

    it("gives up, leaving the row due, when the times cannot be had", async () => {
        expect(await nextAlertAt({ now: at("2026-11-12T01:00:00Z"), timeZone: "Asia/Jakarta", timingsFor: async () => null, isEnabled: all })).toBeNull();
        // today is fine but tomorrow's is not, and nothing is left today
        expect(await nextAlertAt({ now: at("2026-11-12T14:00:00Z"), timeZone: "Asia/Jakarta", timingsFor: async (d) => (d === "12-11-2026" ? day : null), isEnabled: all })).toBeNull();
    });
});
