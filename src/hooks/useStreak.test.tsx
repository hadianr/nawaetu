/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DateUtils } from "@/lib/utils/date";

const mocks = vi.hoisted(() => ({
    values: new Map<string, unknown>(),
}));

vi.mock("next-auth/react", () => ({
    useSession: () => ({ status: "authenticated", data: { user: { id: "user-1" } } }),
}));
vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({
        get: (key: string, fallback: unknown) => mocks.values.get(key) ?? fallback,
        getOptional: (key: string) => mocks.values.get(key) ?? null,
        set: (key: string, value: unknown) => { mocks.values.set(key, value); },
        remove: (key: string) => { mocks.values.delete(key); },
    }),
}));

import { useStreak } from "./useStreak";

const lastThirtyDays = (endingOn: string) =>
    Array.from({ length: 30 }, (_, i) => {
        const d = new Date(`${endingOn}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - (29 - i));
        return { localDate: d.toISOString().slice(0, 10), status: "qualified" };
    });

describe("useStreak with a cached server state", () => {
    beforeEach(() => mocks.values.clear());

    it("shows the server's streak when it is longer than the 30 days the server sends", () => {
        const today = DateUtils.today();
        mocks.values.set(STORAGE_KEYS.CANONICAL_PROGRESSION, {
            userId: "user-1",
            streak: { currentDays: 45, longestDays: 45, lastStreakDate: today, freezesAvailable: 0, days: lastThirtyDays(today) },
        });

        const { result } = renderHook(() => useStreak());

        expect(result.current.streak.currentStreak).toBe(45);
        expect(result.current.display.streak).toBe(45);
    });

    it("keeps a local streak that is ahead of the cached server state", () => {
        const today = DateUtils.today();
        const yesterday = DateUtils.yesterday();
        mocks.values.set(STORAGE_KEYS.CANONICAL_PROGRESSION, {
            userId: "user-1",
            streak: { currentDays: 45, longestDays: 45, lastStreakDate: yesterday, freezesAvailable: 0, days: lastThirtyDays(yesterday) },
        });
        mocks.values.set(STORAGE_KEYS.USER_STREAK, {
            currentStreak: 46, longestStreak: 46, lastActiveDate: today, milestones: [], freezesAvailable: 0, protectedDates: [],
        });

        const { result } = renderHook(() => useStreak());

        expect(result.current.streak.currentStreak).toBe(46);
        expect(result.current.display.isActiveToday).toBe(true);
    });
});
