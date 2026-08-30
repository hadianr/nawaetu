// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HijriCalendarPageContent from "@/components/HijriCalendarPageContent";

const { state, fetchCalendar, calendarData } = vi.hoisted(() => ({
    state: { locale: "en", theme: "daylight" },
    fetchCalendar: vi.fn(),
    calendarData: [{
        gregorianDate: "28 August 2026",
        gregorianIso: "2026-08-28",
        gregorianDay: 28,
        gregorianWeekday: 5,
        hijriDate: "15 Rabi' al-Awwal 1448H",
        hijriDay: 15,
        hijriMonth: "Rabi' al-Awwal",
        hijriMonthNumber: 3,
        hijriYear: 1448,
        timings: { Imsak: "04:20", Subuh: "04:30", Maghrib: "18:00", Isya: "19:10" },
        holidays: [],
        isToday: true,
    }],
}));

vi.mock("@/context/LocaleContext", async () => {
    const { hijriCalendarEN } = await import("@/data/translations/en/hijri-calendar");
    const { hijriCalendarID } = await import("@/data/translations/id/hijri-calendar");
    return { useLocale: () => ({ locale: state.locale, t: state.locale === "id" ? hijriCalendarID : hijriCalendarEN }) };
});
vi.mock("@/context/ThemeContext", () => ({ useTheme: () => ({ currentTheme: state.theme }) }));
vi.mock("@/context/PrayerTimesContext", () => ({
    usePrayerTimesContext: () => ({ data: { locationName: "Jakarta", hijriMonthNumber: 3 } }),
}));
vi.mock("@/hooks/useHijriCalendar", () => ({
    useHijriCalendar: () => ({
        calendarData,
        loading: false,
        error: null,
        fetchCalendar,
        navigateMonth: vi.fn(),
        viewMode: "month",
        activeHijriMonth: 3,
        activeHijriYear: 1448,
    }),
}));

describe("HijriCalendarPageContent", () => {
    it("loads on mount and updates locale and theme without refetching", () => {
        fetchCalendar.mockClear();
        state.locale = "en";
        state.theme = "daylight";
        const { rerender } = render(<HijriCalendarPageContent />);

        expect(screen.getByRole("grid").closest("section")?.className).toContain("bg-white");
        expect(screen.getByText("Hijri Calendar")).not.toBeNull();
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(fetchCalendar).toHaveBeenCalledTimes(1);

        state.locale = "id";
        state.theme = "default";
        rerender(<HijriCalendarPageContent />);

        expect(screen.getByText("Kalender Hijriah")).not.toBeNull();
        expect(screen.getByRole("grid").closest("section")?.className).toContain("bg-white/5");
        expect(fetchCalendar).toHaveBeenCalledTimes(1);
    });
});
