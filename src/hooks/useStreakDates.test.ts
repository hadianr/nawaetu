// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStreakDates } from "./useStreakDates";

const { mockSession, mockStreak, mockGetOptional } = vi.hoisted(() => ({
    mockSession: vi.fn(),
    mockStreak: vi.fn(),
    mockGetOptional: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ useSession: mockSession }));
vi.mock("@/hooks/useStreak", () => ({ useStreak: mockStreak }));
vi.mock("@/core/infrastructure/storage", () => ({ getStorageService: () => ({ getOptional: mockGetOptional }) }));

describe("useStreakDates", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
        mockStreak.mockReturnValue({ streak: { currentStreak: 3, lastActiveDate: "2026-11-10", protectedDates: ["2026-11-01"] } });
    });

    it("guest: the last N consecutive days ending on the last active day", () => {
        const { result } = renderHook(() => useStreakDates());
        expect([...result.current.activeDates].sort()).toEqual(["2026-11-08", "2026-11-09", "2026-11-10"]);
        expect([...result.current.protectedDates]).toEqual(["2026-11-01"]);
    });

    it("signed in: uses the server's day list, with frozen days kept apart", () => {
        mockSession.mockReturnValue({ data: { user: { id: "u1" } }, status: "authenticated" });
        mockGetOptional.mockReturnValue({
            userId: "u1",
            streak: { days: [
                { localDate: "2026-11-08T00:00:00", status: "qualified" },
                { localDate: "2026-11-09", status: "frozen" },
            ] },
        });
        const { result } = renderHook(() => useStreakDates());
        expect([...result.current.activeDates]).toEqual(["2026-11-08"]);
        expect([...result.current.protectedDates]).toEqual(["2026-11-09"]);
    });

    it("ignores cached data that belongs to another account", () => {
        mockSession.mockReturnValue({ data: { user: { id: "u2" } }, status: "authenticated" });
        mockGetOptional.mockReturnValue({ userId: "u1", streak: { days: [{ localDate: "2026-11-08" }] } });
        const { result } = renderHook(() => useStreakDates());
        expect(result.current.activeDates.has("2026-11-08")).toBe(true);
        expect(result.current.activeDates.size).toBe(3);
    });
});
