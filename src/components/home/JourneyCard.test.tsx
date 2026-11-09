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

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN }) }));
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
        expect(screen.getByText(/days to go/)).toBeTruthy();
        expect(screen.queryByText(/undefined/)).toBeNull();
    });

    it("counts the habit as a streak day once, then shows the done state", () => {
        render(<JourneyCard />);
        fireEvent.click(screen.getByRole("button", { name: "I did it" }));
        expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        expect(mockSet).toHaveBeenCalledWith("journey_last_done", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
        expect(screen.queryByRole("button", { name: "I did it" })).toBeNull();
        expect(screen.getByRole("status")).toBeTruthy();
    });

    it("renders nothing outside the 100-day window", () => {
        vi.setSystemTime(new Date("2026-04-01T10:00:00"));
        const { container } = render(<JourneyCard />);
        expect(container.firstChild).toBeNull();
    });
});
