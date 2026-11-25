// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HijriCalendarPageContent from "@/components/HijriCalendarPageContent";

const { state, fetchCalendar, calendarData, ramadanData } = vi.hoisted(() => ({
    state: { locale: "en", theme: "daylight", ramadan: false },
    // 13-22 Ramadan 1448 (21 Feb - 2 Mar 2027); 15 Ramadan is a Monday.
    ramadanData: Array.from({ length: 10 }, (_, index) => {
        const date = new Date(2027, 1, 21 + index, 12);
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return {
            gregorianDate: iso,
            gregorianIso: iso,
            gregorianDay: date.getDate(),
            gregorianWeekday: date.getDay(),
            hijriDate: `${13 + index} Ramadan 1448H`,
            hijriDay: 13 + index,
            hijriMonth: "Ramadan",
            hijriMonthNumber: 9,
            hijriYear: 1448,
            timings: { Imsak: "04:20", Subuh: "04:30", Maghrib: "18:10", Isya: "19:20" },
            holidays: [],
            isToday: false,
        };
    }),
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
    const { getTranslationText } = await vi.importActual<typeof import("@/context/LocaleContext")>("@/context/LocaleContext");
    return { getTranslationText, useLocale: () => ({ locale: state.locale, t: state.locale === "id" ? hijriCalendarID : hijriCalendarEN }) };
});
vi.mock("@/context/ThemeContext", () => ({
    THEMES: {
        daylight: { mode: "light" },
        default: { mode: "dark" },
    },
    useTheme: () => ({ currentTheme: state.theme }),
}));
vi.mock("@/context/PrayerTimesContext", () => ({
    usePrayerTimesContext: () => ({ data: { locationName: "Jakarta", hijriMonthNumber: 3 } }),
}));
vi.mock("@/hooks/useHijriCalendar", () => ({
    useHijriCalendar: () => ({
        calendarData: state.ramadan ? ramadanData : calendarData,
        loading: false,
        error: null,
        fetchCalendar,
        navigateMonth: vi.fn(),
        viewMode: "month",
        activeHijriMonth: state.ramadan ? 9 : 3,
        activeHijriYear: 1448,
    }),
}));

describe("HijriCalendarPageContent", () => {
    it("loads on mount and updates locale and theme without refetching", () => {
        fetchCalendar.mockClear();
        state.locale = "en";
        state.theme = "daylight";
        const { rerender } = render(<HijriCalendarPageContent />);

        expect(screen.getByRole("grid").closest("section")?.className).toContain("bg-[rgb(var(--color-surface))]");
        expect(screen.getByText("Hijri Calendar")).not.toBeNull();
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(fetchCalendar).toHaveBeenCalledTimes(1);

        state.locale = "id";
        state.theme = "default";
        rerender(<HijriCalendarPageContent />);

        expect(screen.getByText("Kalender Hijriah")).not.toBeNull();
        expect(screen.getByRole("grid").closest("section")?.className).toContain("bg-[rgb(var(--color-surface))]");
        expect(fetchCalendar).toHaveBeenCalledTimes(1);
    });

    it("treats Ramadan as the obligatory fast, explains the month and its odd nights", async () => {
        state.locale = "en";
        state.ramadan = true;
        // The Ramadan lanterns already played this year, so no animation player mounts in jsdom.
        localStorage.setItem("hijri_ramadan_intro_seen", "1448");
        render(<HijriCalendarPageContent />);

        // Monday 15 Ramadan: obligatory only, no Mon/Thu or Ayyamul Bidh suggestion.
        const monday = screen.getByRole("gridcell", { name: /^15 Ramadan/ });
        expect(monday.getAttribute("aria-label")).toContain("Ramadan fast (obligatory)");
        expect(monday.getAttribute("aria-label")).not.toMatch(/Monday\/Thursday|Ayyamul Bidh/);

        // The legend lists only what this month shows.
        expect(screen.getByRole("button", { name: /Obligatory fast/ })).not.toBeNull();
        expect(screen.getByRole("button", { name: /Odd night/ })).not.toBeNull();
        expect(screen.queryByRole("button", { name: /Mon\/Thu/ })).toBeNull();

        // Month card and the Nuzulul Quran explanation.
        expect(screen.getByText("Obligatory fasting month")).not.toBeNull();
        expect(screen.getAllByText("Nuzulul Quran").length).toBeGreaterThan(0);

        // Highlighting a marker dims the other days.
        fireEvent.click(screen.getByRole("button", { name: /Odd night/ }));
        expect(screen.getByRole("gridcell", { name: /^21 Ramadan/ }).className).not.toContain("opacity-35");
        expect(screen.getByRole("gridcell", { name: /^22 Ramadan/ }).className).toContain("opacity-35");
        state.ramadan = false;
    });
});
