// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HijriCalendarDay } from "@/hooks/useHijriCalendar";
import HijriDayDetails from "./HijriDayDetails";
import HijriMonthCard from "./HijriMonthCard";

vi.mock("@/context/LocaleContext", async () => {
    const { hijriCalendarEN } = await import("@/data/translations/en/hijri-calendar");
    const { getTranslationText } = await vi.importActual<typeof import("@/context/LocaleContext")>("@/context/LocaleContext");
    return { getTranslationText, useLocale: () => ({ locale: "en", t: hijriCalendarEN }) };
});

const day = (hijriDay: number, month: number, iso: string, weekday: number, isToday = false): HijriCalendarDay => ({
    gregorianDate: iso,
    gregorianIso: iso,
    gregorianDay: Number(iso.slice(8)),
    gregorianWeekday: weekday,
    hijriDate: `${hijriDay}`,
    hijriDay,
    hijriMonth: "",
    hijriMonthNumber: month,
    hijriYear: 1448,
    timings: { Imsak: "04:20", Subuh: "04:30", Maghrib: "18:10", Isya: "19:20" },
    holidays: [],
    isToday,
});

// A 29-day Ramadan: 1 Ramadan = Tue 9 Feb 2027.
const ramadan = Array.from({ length: 29 }, (_, index) => {
    const date = new Date(2027, 1, 9 + index, 12);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return day(index + 1, 9, iso, date.getDay(), index === 18);
});

describe("HijriDayDetails", () => {
    const show = (target: HijriCalendarDay, monthDays = ramadan, madzhab: "syafii" | null = null) => {
        const onAction = vi.fn();
        render(<HijriDayDetails day={target} monthDays={monthDays} madzhab={madzhab} animate={false} onAction={onAction} />);
        return onAction;
    };

    it("explains an odd night from the Maghrib before it, and opens the guide", () => {
        const onAction = show(ramadan[20]);
        expect(screen.getByText("Ramadan fast (obligatory)")).not.toBeNull();
        expect(screen.getByText(/Day 21 of 29/)).not.toBeNull();
        expect(screen.getByText(/Night 21 begins at Maghrib on .*28.* \(18:10\)/)).not.toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Open guide" }));
        expect(onAction).toHaveBeenCalledWith("lailatulQadrGuide");
    });

    it("shows the first-day note", () => {
        show(ramadan[0]);
        expect(screen.getByText(/The first day of Ramadan/)).not.toBeNull();
    });

    it("shows Nuzulul Quran on 17 Ramadan with its explanation", () => {
        show(ramadan[16]);
        fireEvent.click(screen.getByRole("button", { name: "Why this date?" }));
        expect(screen.getByText(/What is disputed/)).not.toBeNull();
    });

    it("adds zakat timing by madhhab and the takbir note on the last day", () => {
        show(ramadan[28], ramadan, "syafii");
        expect(screen.getByText(/Shafi'i: may be paid from the start of Ramadan/)).not.toBeNull();
        expect(screen.getByText(/night of takbir/)).not.toBeNull();
    });

    it("shows a caution, not a ruling, after mid-Sha'ban", () => {
        const syaban = [day(17, 8, "2027-01-25", 1)];
        show(syaban[0], syaban, "syafii");
        expect(screen.getByText(/Scholars differ/)).not.toBeNull();
    });

    it("says so when a day has nothing to mark", () => {
        const plain = [day(5, 3, "2026-08-18", 2)];
        show(plain[0], plain);
        expect(screen.getByText("No highlighted worship events.")).not.toBeNull();
    });
});

describe("HijriMonthCard", () => {
    it("shows Ramadan progress and expands a practice to its dalil and tool", () => {
        const onAction = vi.fn();
        render(<HijriMonthCard month={9} days={ramadan} madzhab={null} moment={null} onAction={onAction} />);
        expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("19");
        expect(screen.getByText(/Next odd night: night 21|Night 21 is under way/)).not.toBeNull();

        fireEvent.click(screen.getByRole("button", { name: /See all \(10\)/ }));
        fireEvent.click(screen.getByRole("button", { name: "Zakat al-Fitr" }));
        expect(screen.getByText(/The earliest time to pay differs/)).not.toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Calculate zakat" }));
        expect(onAction).toHaveBeenCalledWith("zakatCalculator");

        fireEvent.click(screen.getByRole("button", { name: "The obligatory fast, all month" }));
        expect(screen.getByText("QS. Al-Baqarah: 183–185")).not.toBeNull();
    });

    it("shows identity and insight only for a month without specific practices", () => {
        render(<HijriMonthCard month={2} days={[]} madzhab={null} moment={null} onAction={vi.fn()} />);
        expect(screen.getByText(/no bad luck in Safar/)).not.toBeNull();
        expect(screen.queryByRole("list")).toBeNull();
    });
});
