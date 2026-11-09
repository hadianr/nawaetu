// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JourneyMilestoneDialog from "./JourneyMilestoneDialog";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

const { mockGetOptional, mockSet } = vi.hoisted(() => ({ mockGetOptional: vi.fn(), mockSet: vi.fn() }));

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({ getOptional: mockGetOptional, set: mockSet }),
}));
vi.mock("@/components/ui/LottieMoment", () => ({ default: () => <span data-testid="lottie" /> }));

describe("JourneyMilestoneDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetOptional.mockReturnValue(null);
    });

    it("celebrates a milestone day with its message", () => {
        render(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(screen.getByText("Day 26 of 100")).toBeTruthy();
        expect(screen.getByText(/75 days left/)).toBeTruthy();
    });

    it("remembers it was seen when closed, so it never shows twice", () => {
        render(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        fireEvent.click(screen.getByRole("button", { name: "Keep going" }));
        expect(mockSet).toHaveBeenCalledWith("journey_milestones_seen", [75]);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("stays closed on ordinary days and on already-seen milestones", () => {
        const { rerender } = render(<JourneyMilestoneDialog daysLeft={74} dayNumber={27} />);
        expect(screen.queryByRole("dialog")).toBeNull();
        mockGetOptional.mockReturnValue([75]);
        rerender(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
