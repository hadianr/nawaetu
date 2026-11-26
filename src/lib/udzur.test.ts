import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const { values } = vi.hoisted(() => ({ values: new Map<string, unknown>() }));

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({
        getOptional: (key: string) => values.get(key) ?? null,
        set: (key: string, value: unknown) => values.set(key, value),
    }),
}));

import {
    UDZUR_HARD_CAP_DAYS,
    UdzurInputError,
    endUdzur,
    getActivePeriod,
    getExcusedDateSet,
    getExcusedDates,
    getPrayerWindows,
    isPrayerExcused,
    parseUdzurPeriods,
    periodDay,
    readUdzurPeriods,
    startUdzur,
    udzurLimitDays,
    type UdzurPeriod,
} from "./udzur";

const at = (value: string) => new Date(value);
const period = (startedAt: string, endedAt: string | null, kind: UdzurPeriod["kind"] = "haid"): UdzurPeriod =>
    ({ id: startedAt, kind, startedAt: at(startedAt).toISOString(), endedAt: endedAt ? at(endedAt).toISOString() : null });

const TIMES = { Fajr: "04:30", Sunrise: "05:45", Dhuhr: "11:50", Asr: "15:10", Maghrib: "17:55", Isha: "19:05" };

describe("udzur periods", () => {
    beforeEach(() => values.clear());

    it("drops malformed and very old periods and sorts the rest", () => {
        const now = at("2026-11-26T10:00:00");
        const parsed = parseUdzurPeriods([
            period("2026-11-20T08:00:00", null),
            { id: "x", kind: "other", startedAt: "2026-11-01", endedAt: null },
            period("2026-10-20T08:00:00", "2026-10-26T08:00:00"),
            period("2024-01-01T08:00:00", "2024-01-07T08:00:00"),
            "junk",
        ], now);
        expect(parsed.map((p) => p.startedAt)).toEqual([
            at("2026-10-20T08:00:00").toISOString(),
            at("2026-11-20T08:00:00").toISOString(),
        ]);
        expect(parseUdzurPeriods("not an array")).toEqual([]);
    });

    it("lists every local date a period touches, up to today", () => {
        const now = at("2026-11-26T10:00:00");
        expect(getExcusedDates([period("2026-11-23T19:30:00", null)], now)).toEqual(["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26"]);
        expect(getExcusedDates([period("2026-11-01T09:00:00", "2026-11-03T08:00:00")], now)).toEqual(["2026-11-01", "2026-11-02", "2026-11-03"]);
    });

    it("never lists more than the hard cap, even for a period left on", () => {
        const now = at("2026-11-26T10:00:00");
        const dates = getExcusedDates([period("2026-09-01T09:00:00", null)], now);
        expect(dates.length).toBe(UDZUR_HARD_CAP_DAYS + 1);
        expect(dates[0]).toBe("2026-09-01");
    });

    it("counts the day of the period from 1", () => {
        expect(periodDay(period("2026-11-20T23:00:00", null), at("2026-11-26T01:00:00"))).toBe(7);
    });

    it("uses the madhhab only for the longest-period prompt", () => {
        expect(udzurLimitDays("haid", "hanafi")).toBe(10);
        expect(udzurLimitDays("haid", null)).toBe(15);
        expect(udzurLimitDays("nifas", "syafii")).toBe(60);
        expect(udzurLimitDays("nifas", "hanbali")).toBe(40);
    });
});

describe("isPrayerExcused", () => {
    const windows = getPrayerWindows("2026-11-23", TIMES);

    it("excuses prayers that begin after haid started, not the one that was current", () => {
        const periods = [period("2026-11-23T16:00:00", null)];
        expect(isPrayerExcused(periods, windows.Asr!)).toBe(false);
        expect(isPrayerExcused(periods, windows.Maghrib!)).toBe(true);
        expect(isPrayerExcused(periods, windows.Isha!)).toBe(true);
        expect(isPrayerExcused(periods, windows.Dhuhr!)).toBe(false);
    });

    it("makes the prayer whose time is running when she becomes pure due again", () => {
        const periods = [period("2026-11-17T08:00:00", "2026-11-23T13:00:00")];
        expect(isPrayerExcused(periods, windows.Fajr!)).toBe(true);
        expect(isPrayerExcused(periods, windows.Dhuhr!)).toBe(false);
        expect(isPrayerExcused(periods, windows.Asr!)).toBe(false);
    });

    it("builds Isha's window up to the next Fajr", () => {
        expect(windows.Isha?.end?.getDate()).toBe(24);
        expect(getPrayerWindows("bad", TIMES)).toEqual({});
    });
});

describe("startUdzur / endUdzur", () => {
    beforeEach(() => values.clear());
    const now = at("2026-11-26T10:00:00");

    it("starts and ends one period at a time", () => {
        startUdzur("haid", at("2026-11-25T08:00:00"), now);
        expect(() => startUdzur("haid", now, now)).toThrow(UdzurInputError);
        expect(getActivePeriod(readUdzurPeriods(now), now)?.kind).toBe("haid");

        endUdzur(now, now);
        expect(getActivePeriod(readUdzurPeriods(now), now)).toBeNull();
        expect(() => endUdzur(now, now)).toThrow("not_active");
    });

    it("refuses a start in the future, more than 7 days back, or inside the last period", () => {
        expect(() => startUdzur("haid", at("2026-11-27T10:00:00"), now)).toThrow("in_future");
        expect(() => startUdzur("haid", at("2026-11-10T10:00:00"), now)).toThrow("too_far_back");
        values.set(STORAGE_KEYS.UDZUR_PERIODS, [period("2026-11-20T08:00:00", "2026-11-24T08:00:00")]);
        expect(() => startUdzur("nifas", at("2026-11-23T08:00:00"), now)).toThrow("overlaps");
    });

    it("refuses an end before the start", () => {
        startUdzur("haid", at("2026-11-25T08:00:00"), now);
        expect(() => endUdzur(at("2026-11-24T08:00:00"), now)).toThrow("before_start");
    });

    it("joins the server's excused dates for the same account only", () => {
        values.set(STORAGE_KEYS.UDZUR_PERIODS, [period("2026-11-25T08:00:00", null)]);
        values.set(STORAGE_KEYS.CANONICAL_PROGRESSION, { userId: "u1", streak: { excusedDays: ["2026-11-20", 5, "bad"] } });
        expect([...getExcusedDateSet("u1", now)]).toEqual(["2026-11-25", "2026-11-26", "2026-11-20"]);
        expect([...getExcusedDateSet("u2", now)]).toEqual(["2026-11-25", "2026-11-26"]);
    });
});
