// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JourneyFasting from "./JourneyFasting";
import { BASE_SETTINGS_EN } from "@/data/translations/base";
import type { AllFastingLogs, Madzhab } from "@/data/fasting/types";

const { mockGetOptional, mockSet, mockUpdateStreak, mockMarkDone, features } = vi.hoisted(() => ({
    features: { ramadhanPage: true },
    mockGetOptional: vi.fn(),
    mockSet: vi.fn(),
    mockUpdateStreak: vi.fn(),
    mockMarkDone: vi.fn(),
}));
let mockLogs: AllFastingLogs = {};
let mockMadzhab: Madzhab | null = "syafii";

vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/core/infrastructure/storage", () => ({ getStorageService: () => ({ getOptional: mockGetOptional, set: mockSet }) }));
vi.mock("@/core/repositories/streak.repository", () => ({ getStreakRepository: () => ({ updateStreak: mockUpdateStreak }) }));
// The Ramadan page is switched off in production; the link only makes sense while it is on.
vi.mock("@/lib/features", () => ({ get RAMADHAN_PAGE_ENABLED() { return features.ramadhanPage; } }));
vi.mock("@/components/ui/LottieMoment", () => ({
    default: ({ src, fallback }: { src: string; fallback?: React.ReactNode }) => <span data-testid="lottie" data-src={src}>{fallback}</span>,
}));
vi.mock("@/hooks/useFastingTracker", () => ({
    useFastingTracker: () => ({
        allLogs: mockLogs,
        defaultMadzhab: mockMadzhab,
        markQadhaDone: mockMarkDone,
        getPendingQadha: () =>
            Object.entries(mockLogs).flatMap(([year, days]) =>
                Object.entries(days)
                    .filter(([, log]) => log.consequence !== "none" && !log.qadhaDone)
                    .map(([day, log]) => ({ hijriYear: Number(year), hijriDay: Number(day), log })),
            ),
    }),
}));

const owe = (days: number[], done: number[] = []): AllFastingLogs => ({
    "1447": Object.fromEntries(
        [...days, ...done].map(day => [String(day).padStart(2, "0"), { status: "not_fasting" as const, consequence: "qadha" as const, qadhaDone: done.includes(day) }]),
    ),
});

describe("JourneyFasting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        features.ramadhanPage = true;
        vi.useFakeTimers();
        mockGetOptional.mockReturnValue(null);
        mockLogs = {};
        mockMadzhab = "syafii";
    });
    afterEach(() => vi.useRealTimers());

    it("renders nothing on an ordinary day with nothing owed", () => {
        vi.setSystemTime(new Date("2027-01-26T10:00:00"));
        const { container } = render(<JourneyFasting adjustment={0} />);
        expect(container.firstChild).toBeNull();
    });

    it("shows owed fasts with progress and offers a make-up fast on a recommended day", () => {
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        mockLogs = owe([3, 4, 5], [1]);
        render(<JourneyFasting adjustment={0} />);
        expect(screen.getByText("Fasts to make up: 3")).toBeTruthy();
        expect(screen.getAllByText("1 of 4 made up").length).toBeGreaterThan(0);
        expect(screen.getByText("Today suits a make-up fast.")).toBeTruthy();
        expect(screen.getByText(/Days 13-15 of each Hijri month/)).toBeTruthy();
        expect(screen.getByRole("link", { name: "Open fasting tracker" }).getAttribute("href")).toBe("/ramadhan");
    });

    it("shows owed fasts but no link to the Ramadan page while that page is switched off", () => {
        features.ramadhanPage = false;
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        mockLogs = owe([3, 4, 5], [1]);
        render(<JourneyFasting adjustment={0} />);
        expect(screen.getByText("Fasts to make up: 3")).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Open fasting tracker" })).toBeNull();
        expect(document.querySelector('a[href="/ramadhan"]')).toBeNull();
    });

    it("tells the card when it has something to show, so the toggle can hint at it", () => {
        const onVisible = vi.fn();
        vi.setSystemTime(new Date("2027-01-26T10:00:00"));
        const { unmount } = render(<JourneyFasting adjustment={0} onVisible={onVisible} />);
        expect(onVisible).toHaveBeenLastCalledWith(false);
        unmount();

        mockLogs = owe([3]);
        render(<JourneyFasting adjustment={0} onVisible={onVisible} />);
        expect(onVisible).toHaveBeenLastCalledWith(true);
    });

    it("marks the oldest owed fast, counts it for the streak, and plays the stars", () => {
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        mockLogs = owe([3, 4]);
        render(<JourneyFasting adjustment={0} />);
        fireEvent.click(screen.getByRole("button", { name: "I made up one fast" }));
        expect(mockMarkDone).toHaveBeenCalledWith(1447, 3);
        expect(mockUpdateStreak).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("lottie").getAttribute("data-src")).toBe("/lottie/stars.lottie");
    });

    it("celebrates once when the last owed fast is made up", () => {
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        mockLogs = owe([3]);
        render(<JourneyFasting adjustment={0} />);
        fireEvent.click(screen.getByRole("button", { name: "I made up one fast" }));
        expect(screen.getByRole("status").textContent).toContain("All fasts made up");
        expect(screen.getByTestId("lottie").getAttribute("data-src")).toBe("/lottie/lights.lottie");
    });

    it("suggests a sunnah fast when nothing is owed, and 'Not today' hides it without touching the streak", () => {
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        render(<JourneyFasting adjustment={0} />);
        expect(screen.getByText(/Only if you are well and able/)).toBeTruthy();
        expect(screen.queryByRole("button", { name: "I made up one fast" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Not today" }));
        expect(mockSet).toHaveBeenCalledWith("journey_fast_skip", "2027-01-21");
        expect(mockUpdateStreak).not.toHaveBeenCalled();
        expect(screen.queryByText(/Only if you are well and able/)).toBeNull();
    });

    it("stays hidden on a day the user already chose 'Not today'", () => {
        vi.setSystemTime(new Date("2027-01-21T10:00:00"));
        mockGetOptional.mockImplementation((key: string) => (key === "journey_fast_skip" ? "2027-01-21" : null));
        const { container } = render(<JourneyFasting adjustment={0} />);
        expect(container.firstChild).toBeNull();
    });

    it("explains why no new voluntary fast is suggested after mid-Sha'ban for a Shafi'i user", () => {
        vi.setSystemTime(new Date("2027-01-25T10:00:00"));
        render(<JourneyFasting adjustment={0} />);
        expect(screen.getByText(/After mid-Sha'ban/)).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Not today" })).toBeNull();
    });
});
