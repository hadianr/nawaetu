// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHijriCalendar } from "./useHijriCalendar";

const { mockGetOptional, mockSet, mockCaptureException, mockFetchWithTimeout } = vi.hoisted(() => ({
    mockGetOptional: vi.fn(),
    mockSet: vi.fn(),
    mockCaptureException: vi.fn(),
    mockFetchWithTimeout: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({ captureException: mockCaptureException }));
vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({ getOptional: mockGetOptional, set: mockSet }),
}));
vi.mock("@/config/apis", () => ({ API_CONFIG: { ALADHAN: { BASE_URL: "http://api.aladhan.com" } } }));
vi.mock("@/lib/utils/fetch", () => ({ fetchWithTimeout: mockFetchWithTimeout }));

const apiDay = {
    timings: { Imsak: "04:20", Fajr: "04:30", Sunrise: "05:45", Dhuhr: "12:00", Asr: "15:15", Sunset: "18:00", Maghrib: "18:00", Isha: "19:10", Midnight: "00:00" },
    date: {
        readable: "28 Aug 2026",
        timestamp: "0",
        gregorian: { date: "28-08-2026", format: "DD-MM-YYYY", day: "28", weekday: { en: "Friday" }, month: { number: 8, en: "August" }, year: "2026", designation: { abbreviated: "AD", expanded: "Anno Domini" } },
        hijri: { date: "15-03-1448", format: "DD-MM-YYYY", day: "15", weekday: { en: "Friday", ar: "" }, month: { number: 3, en: "Rabi al-Awwal", ar: "" }, year: "1448", designation: { abbreviated: "AH", expanded: "Anno Hegirae" }, holidays: [] },
    },
};

describe("useHijriCalendar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetOptional.mockImplementation((key: string) => {
            if (key === "user_location") return { lat: -6.2, lng: 106.8 };
            if (key === "settings_hijri_adjustment") return "0";
            return null;
        });
    });

    it("reports provider errors through state and Sentry", async () => {
        mockFetchWithTimeout.mockRejectedValue(new Error("Network error"));
        const { result } = renderHook(() => useHijriCalendar());

        await act(async () => { await result.current.fetchCalendar(); });

        await waitFor(() => expect(result.current.error).toBe("calendar_load_failed"));
        expect(result.current.loading).toBe(false);
        expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
    });

    it("coalesces concurrent monthly requests", async () => {
        mockFetchWithTimeout.mockResolvedValue({ ok: true, json: async () => ({ code: 200, status: "OK", data: [apiDay] }) });
        const first = renderHook(() => useHijriCalendar());
        const second = renderHook(() => useHijriCalendar());

        await act(async () => {
            await Promise.all([first.result.current.fetchCalendar(), second.result.current.fetchCalendar()]);
        });

        expect(mockFetchWithTimeout).toHaveBeenCalledTimes(3);
        expect(first.result.current.calendarData).toHaveLength(1);
        expect(second.result.current.calendarData).toHaveLength(1);
    });
});
