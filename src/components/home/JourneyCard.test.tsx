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
vi.mock("@/hooks/useStreakDates", () => ({
    useStreakDates: () => ({ activeDates: mockActiveDates, protectedDates: new Set<string>() }),
}));
vi.mock("@/core/repositories/streak.repository", () => ({
    getStreakRepository: () => ({ updateStreak: mockUpdateStreak }),
}));

describe("JourneyCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-09T10:00:00"));
        mockGetOptional.mockReturnValue(null);
        mockActiveDates = new Set();
    });
    afterEach(() => vi.useRealTimers());

    it("shows the countdown and today's habit with real text", () => {
        render(<JourneyCard />);
        expect(screen.getByText("100 Days to Ramadan")).toBeTruthy();
        expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toMatch(/^Day \d+ of 100, \d+ days to Ramadan$/);
        expect(screen.queryByText(/undefined/)).toBeNull();
    });

    it("counts the habit as a streak day once, then shows the done state", () => {
        render(<JourneyCard />);
        fireEvent.click(screen.getByRole("button", { name: "I did it" }));
        expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith("journey_done_dates", ["2026-11-09"]);
        expect(screen.queryByRole("button", { name: "I did it" })).toBeNull();
        expect(screen.getByRole("status")).toBeTruthy();
    });

    it("draws the strip from the streak, so days done in other features count too", () => {
        mockActiveDates = new Set(["2026-11-08", "2026-11-07"]);
        render(<JourneyCard />);
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(7);
        expect(items[4].textContent).toContain("done");
        expect(items[5].textContent).toContain("done");
        expect(items[6].textContent).toContain("today: not done");
        expect(screen.getByText("2 of last 7 days")).toBeTruthy();
        // The strip does not mark today's journey habit as done: the button is still there.
        expect(screen.getByRole("button", { name: "I did it" })).toBeTruthy();
    });

    it("renders nothing outside the 100-day window", () => {
        vi.setSystemTime(new Date("2026-04-01T10:00:00"));
        const { container } = render(<JourneyCard />);
        expect(container.firstChild).toBeNull();
    });
});
