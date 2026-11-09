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
vi.mock("@/core/repositories/streak.repository", () => ({
    getStreakRepository: () => ({ updateStreak: mockUpdateStreak }),
}));

describe("JourneyCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-09T10:00:00"));
        mockGetOptional.mockReturnValue(null);
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
        expect(screen.getByText("1 of last 7 days")).toBeTruthy();
    });

    it("exposes each of the last 7 days to screen readers without relying on colour", () => {
        mockGetOptional.mockImplementation((key: string) => (key === "journey_done_dates" ? ["2026-11-08"] : null));
        render(<JourneyCard />);
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(7);
        expect(items[5].textContent).toContain("done");
        expect(items[6].textContent).toContain("today: not done");
    });

    it("renders nothing outside the 100-day window", () => {
        vi.setSystemTime(new Date("2026-04-01T10:00:00"));
        const { container } = render(<JourneyCard />);
        expect(container.firstChild).toBeNull();
    });
});
