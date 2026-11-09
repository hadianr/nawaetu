// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStreakCelebration } from "./useStreakCelebration";

const { mockToast, mockTrack, mockGetOptional } = vi.hoisted(() => ({
    mockToast: vi.fn(),
    mockTrack: vi.fn(),
    mockGetOptional: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: mockToast } }));
vi.mock("@/lib/analytics/analytics", () => ({ trackStreakEvent: mockTrack }));
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("@/core/infrastructure/storage", () => ({ getStorageService: () => ({ getOptional: mockGetOptional }) }));
// The real module drags in the whole progression stack; only the event name is needed here.
vi.mock("@/core/repositories/streak.repository", () => ({ STREAK_ACHIEVEMENT_EVENT: "streak_achievement" }));
vi.mock("@/components/ui/LottieMoment", () => ({ default: () => null }));
vi.mock("@/components/ui/AppIcon", () => ({ AppIcon: () => null }));
vi.mock("@/context/LocaleContext", () => ({
    getTranslationText: (_t: unknown, key: string) => key,
    useLocale: () => ({
        t: {
            streakCelebrationMilestone: "Milestone {milestone}",
            streakCelebrationExtended: "Streak {count}",
            streakCelebrationReward: "+{hasanah}",
            streakCelebrationKeepGoing: "Keep going",
            streakCelebrationView: "View",
        },
    }),
}));

const fire = (detail: object) =>
    act(() => { window.dispatchEvent(new CustomEvent("streak_achievement", { detail })); });

describe("useStreakCelebration", () => {
    beforeEach(() => vi.clearAllMocks());

    it("shows one toast per streak extension and tracks it", () => {
        renderHook(() => useStreakCelebration(vi.fn()));
        fire({ streak: { currentStreak: 5 }, milestone: null });
        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast.mock.calls[0][0]).toBe("Streak 5");
        expect(mockTrack).toHaveBeenCalledWith("streak_extended", expect.objectContaining({ streakDays: 5, userMode: "guest" }));
    });

    it("uses the milestone message and event for milestones", () => {
        renderHook(() => useStreakCelebration(vi.fn()));
        fire({ streak: { currentStreak: 3 }, milestone: { days: 3, xp: 50 } });
        expect(mockToast.mock.calls[0][0]).toBe("Milestone streakMilestone3");
        expect(mockTrack).toHaveBeenCalledWith("milestone_reached", expect.anything());
    });

    it("opens the details when the toast action is pressed", () => {
        const onView = vi.fn();
        renderHook(() => useStreakCelebration(onView));
        fire({ streak: { currentStreak: 5 }, milestone: null });
        mockToast.mock.calls[0][1].action.onClick();
        expect(onView).toHaveBeenCalledTimes(1);
    });

    it("stays silent when disabled, so a nested copy never doubles the toast", () => {
        renderHook(() => useStreakCelebration(vi.fn(), false));
        fire({ streak: { currentStreak: 5 }, milestone: null });
        expect(mockToast).not.toHaveBeenCalled();
    });

    it("stops listening after unmount", () => {
        const { unmount } = renderHook(() => useStreakCelebration(vi.fn()));
        unmount();
        fire({ streak: { currentStreak: 5 }, milestone: null });
        expect(mockToast).not.toHaveBeenCalled();
    });
});
