/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRamadhanCalendar } from "./useRamadhanCalendar";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { resetStorageService } from "@/core/infrastructure/storage";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock fetchWithTimeout
vi.mock("@/lib/utils/fetch", () => ({
    fetchWithTimeout: vi.fn(),
}));

describe("useRamadhanCalendar", () => {
    beforeEach(() => {
        resetStorageService();
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("fetches and processes calendar data correctly", async () => {
        const mockResponse = {
            data: [
                {
                    timings: {
                        Fajr: "04:30 (WIB)",
                        Sunrise: "05:45 (WIB)",
                        Dhuhr: "12:00 (WIB)",
                        Asr: "15:15 (WIB)",
                        Sunset: "18:00 (WIB)",
                        Maghrib: "18:05 (WIB)",
                        Isha: "19:15 (WIB)",
                        Imsak: "04:20 (WIB)",
                        Midnight: "00:00 (WIB)",
                    },
                    date: {
                        readable: "20 Feb 2026",
                        timestamp: "1771545600",
                        gregorian: {
                            date: "20-02-2026",
                            format: "DD-MM-YYYY",
                            day: "20",
                            weekday: { en: "Friday" },
                            month: { number: 2, en: "February" },
                            year: "2026",
                            designation: { abbreviated: "AD", expanded: "Anno Domini" },
                        },
                        hijri: {
                            date: "02-09-1447",
                            format: "DD-MM-YYYY",
                            day: "02",
                            weekday: { en: "Al-Jumu'ah", ar: "الجمعة" },
                            month: { number: 9, en: "Ramadan", ar: "رمضان" },
                            year: "1447",
                            designation: { abbreviated: "AH", expanded: "Anno Hegirae" },
                            holidays: [],
                        },
                    },
                },
            ],
        };

        (fetchWithTimeout as any).mockResolvedValue({
            json: async () => mockResponse,
        });

        const { result } = renderHook(() => useRamadhanCalendar());

        // Trigger fetch
        await act(async () => {
             await result.current.fetchCalendar();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            // Expect at least 1 day because fetch is called twice for 2 months, potentially duplicating if mock is static
            expect(result.current.calendarData.length).toBeGreaterThan(0);
        });

        const day = result.current.calendarData[0];
        // 2 Ramadan - 1 adjustment = 1 Ramadan
        expect(day.hijriDate).toContain("1 Ramadan 1447H");
        expect(day.timings.Subuh).toBe("04:30");
        expect(day.timings.Maghrib).toBe("18:05");
    });

    it("handles errors gracefully", async () => {
        (fetchWithTimeout as any).mockRejectedValue(new Error("Network Error"));

        const { result } = renderHook(() => useRamadhanCalendar());

        await act(async () => {
             await result.current.fetchCalendar();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe("Network Error");
            expect(result.current.calendarData).toEqual([]);
        });
    });
});
