/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ addHasanah: vi.fn() }));
vi.mock("next-auth/react", () => ({ useSession: () => ({ status: "unauthenticated" }) }));
vi.mock("@/lib/habits/leveling", () => ({ addHasanah: mocks.addHasanah }));

import { useQuranTimeTracker } from "./useQuranTimeTracker";

describe("useQuranTimeTracker", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        mocks.addHasanah.mockClear();
    });
    afterEach(() => vi.useRealTimers());

    it("writes storage every 10 seconds instead of every second, and loses nothing on stop", () => {
        const setItem = vi.spyOn(Storage.prototype, "setItem");
        const { result } = renderHook(() => useQuranTimeTracker());
        act(() => result.current.startTracking());
        setItem.mockClear();

        act(() => { vi.advanceTimersByTime(35_000); });
        // 35 ticks: three flushes of two keys each, not 70 writes.
        expect(setItem.mock.calls.length).toBeLessThanOrEqual(8);
        expect(result.current.dailyTotalSeconds).toBe(35);

        act(() => result.current.stopTracking());
        const buffer = Number(localStorage.getItem("nawaetu_quran_time_buffer"));
        expect(buffer).toBe(35);
        setItem.mockRestore();
    });

    it("awards one Hasanah per full minute, exactly once", () => {
        const { result } = renderHook(() => useQuranTimeTracker());
        act(() => result.current.startTracking());
        act(() => { vi.advanceTimersByTime(125_000); });
        expect(mocks.addHasanah).toHaveBeenCalledTimes(2);
    });
});
