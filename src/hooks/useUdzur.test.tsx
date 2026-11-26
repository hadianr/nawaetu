// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const h = vi.hoisted(() => ({
    session: { data: { user: { id: "u1", gender: null as string | null } } },
    pause: vi.fn(async () => undefined),
    reconcile: vi.fn(),
    logFasting: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ useSession: () => h.session }));
vi.mock("@/lib/notifications/prayer-preferences", () => ({ setPrayerAlertPause: h.pause }));
vi.mock("@/lib/sync/excused", () => ({ reconcileExcusedDays: h.reconcile }));
vi.mock("@/hooks/useFastingTracker", () => ({ logUdzurFastingDays: h.logFasting }));

import { useUdzur } from "./useUdzur";

const TIMES = { Fajr: "04:30", Sunrise: "05:45", Dhuhr: "11:50", Asr: "15:10", Maghrib: "17:55", Isha: "19:05" };
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

describe("useUdzur", () => {
    beforeEach(() => {
        localStorage.clear();
        h.pause.mockClear();
        h.reconcile.mockClear();
        localStorage.setItem(STORAGE_KEYS.USER_GENDER, "female");
    });

    it("is offered only to a profile set to female", () => {
        localStorage.setItem(STORAGE_KEYS.USER_GENDER, "male");
        const { result } = renderHook(() => useUdzur());
        expect(result.current.available).toBe(false);
        expect(result.current.isDateExcused(localDate(new Date()))).toBe(false);
    });

    it("starts a period, excuses today's later prayers and pauses alerts", () => {
        const { result } = renderHook(() => useUdzur());
        const yesterday = new Date(Date.now() - 86_400_000);
        act(() => { result.current.start("haid", yesterday); });

        expect(result.current.active?.kind).toBe("haid");
        expect(result.current.excusedToday).toBe(true);
        expect(result.current.day).toBe(2);
        expect(result.current.isPrayerExcused(localDate(new Date()), "Isha", TIMES)).toBe(true);
        expect(h.pause).toHaveBeenCalledWith(expect.any(String));
        expect(h.reconcile).toHaveBeenCalled();
    });

    it("keeps alerts on when asked, and resumes them when the period ends", () => {
        const { result } = renderHook(() => useUdzur());
        act(() => { result.current.start("haid", new Date(Date.now() - 3_600_000), { keepAlerts: true }); });
        expect(h.pause).not.toHaveBeenCalled();
        act(() => { result.current.end(new Date()); });
        expect(h.pause).toHaveBeenCalledWith(null);
        expect(result.current.active).toBeNull();
    });

    it("treats a date known only from the server as excused all day", () => {
        const date = localDate(new Date(Date.now() - 2 * 86_400_000));
        localStorage.setItem(STORAGE_KEYS.CANONICAL_PROGRESSION, JSON.stringify({ userId: "u1", streak: { excusedDays: [date] } }));
        const { result } = renderHook(() => useUdzur());
        expect(result.current.isPrayerExcused(date, "Fajr", TIMES)).toBe(true);
        expect(result.current.active).toBeNull();
    });
});
