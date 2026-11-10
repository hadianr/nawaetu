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

const store = (values: { seen?: number[]; welcomed?: boolean }) =>
    mockGetOptional.mockImplementation((key: string) => ({
        journey_milestones_seen: values.seen ?? null,
        journey_welcome_seen: values.welcomed ?? null,
    } as Record<string, unknown>)[key] ?? null);

describe("JourneyMilestoneDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        store({});
    });

    it("celebrates a milestone day with its message", () => {
        render(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(screen.getByText("Day 26 of 100")).toBeTruthy();
        expect(screen.getByText(/75 days left/)).toBeTruthy();
    });

    it("remembers a milestone was seen, so it never shows twice, and counts as welcomed", () => {
        render(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        fireEvent.click(screen.getByRole("button", { name: "Keep going" }));
        expect(mockSet).toHaveBeenCalledWith("journey_milestones_seen", [75]);
        expect(mockSet).toHaveBeenCalledWith("journey_welcome_seen", true);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("welcomes someone starting mid-way, once, with their real day number", () => {
        render(<JourneyMilestoneDialog daysLeft={61} dayNumber={40} />);
        expect(screen.getByText("You're starting on day 40")).toBeTruthy();
        expect(screen.getByText(/no need to catch up/)).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Start today" }));
        expect(mockSet).toHaveBeenCalledWith("journey_welcome_seen", true);
        expect(mockSet).not.toHaveBeenCalledWith("journey_milestones_seen", expect.anything());
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("stays closed for people who were already welcomed or already using the journey", () => {
        const cases = [{ values: { welcomed: true }, hadStreak: false }, { values: {}, hadStreak: true }, { values: { seen: [100] }, hadStreak: false }];
        for (const { values, hadStreak } of cases) {
            store(values);
            const { unmount } = render(<JourneyMilestoneDialog daysLeft={61} dayNumber={40} hadStreak={hadStreak} />);
            expect(screen.queryByRole("dialog"), JSON.stringify({ values, hadStreak })).toBeNull();
            unmount();
        }
    });

    it("stays closed on an already-seen milestone", () => {
        store({ seen: [75], welcomed: true });
        render(<JourneyMilestoneDialog daysLeft={75} dayNumber={26} />);
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
