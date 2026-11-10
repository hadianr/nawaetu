// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JourneyCard from "./JourneyCard";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

const { mockGetOptional, mockSet, mockUpdateStreak } = vi.hoisted(() => ({
    mockGetOptional: vi.fn(),
    mockSet: vi.fn(),
    mockUpdateStreak: vi.fn(),
}));

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({ getOptional: mockGetOptional, set: mockSet }),
}));
vi.mock("@/components/ui/LottieMoment", () => ({ default: ({ fallback }: { fallback?: React.ReactNode }) => <>{fallback}</> }));
let mockActiveDates = new Set<string>();
let mockProtectedDates = new Set<string>();
let mockDisplay = { streak: 0, isActiveToday: false, isLost: false };
vi.mock("@/hooks/useStreakDates", () => ({
    useStreakDates: () => ({ activeDates: mockActiveDates, protectedDates: mockProtectedDates }),
}));
vi.mock("@/hooks/useStreak", () => ({
    useStreak: () => ({ streak: { longestStreak: mockActiveDates.size }, display: mockDisplay }),
}));
vi.mock("@/hooks/useFastingTracker", () => ({
    useFastingTracker: () => ({ allLogs: {}, defaultMadzhab: null, markQadhaDone: vi.fn(), getPendingQadha: () => [] }),
}));
vi.mock("@/components/StreakBadge", () => ({ default: () => <div role="dialog">streak details</div> }));
vi.mock("@/core/repositories/streak.repository", () => ({
    getStreakRepository: () => ({ updateStreak: mockUpdateStreak }),
}));

const expand = () => fireEvent.click(screen.getByRole("button", { name: "Show details" }));

describe("JourneyCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-09T10:00:00"));
        // Welcomed already, so the one-time welcome dialog doesn't cover the card.
        mockGetOptional.mockImplementation((key: string) => (key === "journey_welcome_seen" ? true : null));
        mockActiveDates = new Set();
        mockProtectedDates = new Set();
        mockDisplay = { streak: 0, isActiveToday: false, isLost: false };
    });
    afterEach(() => vi.useRealTimers());

    it("shows the countdown and today's habit with real text", () => {
        render(<JourneyCard />);
        expect(screen.getByText("100 Days to Ramadan")).toBeTruthy();
        expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toMatch(/^Day \d+ of 100, \d+ days to Ramadan$/);
        expect(screen.queryByText(/undefined/)).toBeNull();
    });

    it("counts the habit as a streak day once and shows the done state at once", () => {
        render(<JourneyCard />);
        fireEvent.click(screen.getByRole("button", { name: "I did it" }));
        expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        expect(mockSet).not.toHaveBeenCalledWith("journey_done_dates", expect.anything());
        expect(screen.queryByRole("button", { name: "I did it" })).toBeNull();
        expect(screen.getByRole("status")).toBeTruthy();
    });

    it("says done only when the streak counts today (the stale 'Streak safe' bug)", () => {
        mockActiveDates = new Set(["2026-11-08"]);
        const { unmount } = render(<JourneyCard />);
        expect(screen.queryByRole("status")).toBeNull();
        expect(screen.getByRole("button", { name: "I did it" })).toBeTruthy();
        unmount();

        // A mission already counted today: done without pressing, and the card never asks again.
        mockActiveDates = new Set(["2026-11-08", "2026-11-09"]);
        render(<JourneyCard />);
        expect(screen.getByRole("status")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "I did it" })).toBeNull();
    });

    it("draws the week from the streak, with freeze days", () => {
        mockActiveDates = new Set(["2026-11-08", "2026-11-07"]);
        mockProtectedDates = new Set(["2026-11-06"]);
        render(<JourneyCard />);
        expand();
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(7);
        expect(items[3].textContent).toContain("Day protected by a Streak Freeze");
        expect(items[4].textContent).toContain("Completed");
        expect(items[5].textContent).toContain("Completed");
        expect(items[6].textContent).not.toContain("Completed");
    });

    it("shows the streak count and a calm status, then opens the streak details", async () => {
        mockDisplay = { streak: 5, isActiveToday: false, isLost: false };
        render(<JourneyCard />);
        expand();
        vi.useRealTimers(); // the details load through a dynamic import, which fake timers stall
        const row = screen.getByRole("button", { name: "Open streak details: 5 days" });
        expect(row.textContent).toContain("5 day streak");
        expect(row.textContent).toContain(String(BASE_SETTINGS_EN.streakAtRisk));
        fireEvent.click(row);
        expect(await screen.findByText("streak details")).toBeTruthy();
    });

    it("uses the restart copy after a lost streak, never a failure message", () => {
        mockDisplay = { streak: 0, isActiveToday: false, isLost: true };
        render(<JourneyCard />);
        expand();
        expect(screen.getByRole("button", { name: "Open streak details: 0 days" }).textContent)
            .toContain(String(BASE_SETTINGS_EN.streakLostRestart));
    });

    it("is compact by default: countdown, phase, habit and one action, with details behind a toggle", () => {
        render(<JourneyCard />);
        const toggle = screen.getByRole("button", { name: "Show details" });
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        expect(screen.getByRole("button", { name: "I did it" })).toBeTruthy();
        expect(screen.getByText("Phase 1 · Set Your Intention")).toBeTruthy();
        // Hidden until opened: the streak row, the dalil link and the phase goal.
        expect(screen.queryByRole("button", { name: /^Open streak details/ })).toBeNull();
        expect(screen.queryByRole("button", { name: /^Source: / })).toBeNull();
        fireEvent.click(toggle);
        expect(screen.getByRole("button", { name: "Hide details" }).getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByRole("button", { name: /^Open streak details/ })).toBeTruthy();
        expect(screen.getByText(/in this phase\. Goal: /)).toBeTruthy();
    });

    describe("habits Nawaetu can see", () => {
        // 10 Nov 2026 is the Quran habit and 11 Nov the Tasbih habit (habits rotate by day number).
        it("sends the user to Quran, and offers a manual 'I did it' only in the details", () => {
            vi.setSystemTime(new Date("2026-11-10T10:00:00"));
            render(<JourneyCard />);
            expect(screen.getByRole("link", { name: "Open Quran" }).getAttribute("href")).toBe("/quran");
            expect(screen.queryByRole("button", { name: "I did it" })).toBeNull();
            expand();
            fireEvent.click(screen.getByRole("button", { name: "I did it" }));
            expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        });

        it("ticks by itself after a minute of reading, and counts the day once", () => {
            vi.setSystemTime(new Date("2026-11-10T10:00:00"));
            localStorage.setItem("nawaetu_quran_daily_total_2026-11-10", "90");
            const { rerender } = render(<JourneyCard />);
            expect(screen.getByRole("status")).toBeTruthy();
            expect(screen.queryByRole("link", { name: "Open Quran" })).toBeNull();
            rerender(<JourneyCard />);
            expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        });

        it("does not count the day again when the streak already has it", () => {
            vi.setSystemTime(new Date("2026-11-10T10:00:00"));
            localStorage.setItem("nawaetu_quran_daily_total_2026-11-10", "90");
            mockActiveDates = new Set(["2026-11-10"]);
            render(<JourneyCard />);
            expect(mockUpdateStreak).not.toHaveBeenCalled();
        });

        it("points to Tasbih for the dhikr habit and ticks from today's count", () => {
            vi.setSystemTime(new Date("2026-11-11T10:00:00"));
            const { unmount } = render(<JourneyCard />);
            expect(screen.getByRole("link", { name: "Open Tasbih" }).getAttribute("href")).toBe("/dhikr");
            unmount();
            localStorage.setItem("nawaetu_dhikr_last_date", new Date().toISOString().split("T")[0]);
            localStorage.setItem("nawaetu_dhikr_daily_count", "40");
            render(<JourneyCard />);
            expect(screen.getByRole("status")).toBeTruthy();
        });
    });

    it("renders nothing outside the 100-day window", () => {
        vi.setSystemTime(new Date("2026-04-01T10:00:00"));
        const { container } = render(<JourneyCard />);
        expect(container.firstChild).toBeNull();
    });

    it("names the phase in plain words and never shows a bare 'Reset'", () => {
        render(<JourneyCard />);
        expect(screen.getByText("Phase 1 · Set Your Intention")).toBeTruthy();
        expect(screen.queryByText("Reset")).toBeNull();
    });

    it("shows today's habit with its source, opening the full dalil", () => {
        render(<JourneyCard />);
        expand();
        const link = screen.getByRole("button", { name: /^Source: / });
        expect(link.textContent).toMatch(/Source: (Bukhari|Muslim|Tirmidzi|Abu Dawud|Ahmad|Ibn Majah|Nasa'i) No\./);
        fireEvent.click(link);
        expect(screen.getByRole("dialog")).toBeTruthy();
    });

    it("explains the program, phases and sources from the info button", () => {
        render(<JourneyCard />);
        expand();
        fireEvent.click(screen.getByRole("button", { name: "About the 100-day program" }));
        expect(screen.getByText("About 100 Days to Ramadan")).toBeTruthy();
        expect(screen.getByText(/not an obligation/)).toBeTruthy();
        expect(screen.getByText(/no need to catch up/)).toBeTruthy();
        expect(screen.getByText("Phase 2 · Build Habits")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Source: Quran 2:183" })).toBeTruthy();
    });
});
