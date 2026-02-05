import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useTasbihPersistence } from "@/hooks/useTasbihPersistence";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

type SetupOptions = {
    lastDate?: string;
};

const today = () => new Date().toISOString().split("T")[0];

const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
};

const setupStorage = (options: SetupOptions = {}) => {
    localStorage.setItem(STORAGE_KEYS.TASBIH_COUNT, "12");
    localStorage.setItem(STORAGE_KEYS.TASBIH_TARGET, "33");
    localStorage.setItem(STORAGE_KEYS.TASBIH_ACTIVE_PRESET, "tasbih");
    localStorage.setItem(STORAGE_KEYS.TASBIH_DAILY_COUNT, "5");
    localStorage.setItem(STORAGE_KEYS.TASBIH_STREAK, "2");
    localStorage.setItem(STORAGE_KEYS.TASBIH_LAST_DATE, options.lastDate || today());
};

describe("useTasbihPersistence", () => {
    it("hydrates state from localStorage", async () => {
        setupStorage();

        const { result } = renderHook(() =>
            useTasbihPersistence({
                defaultActiveId: "tasbih",
                validActiveIds: ["tasbih", "tahmid"],
                defaultTarget: 33
            })
        );

        await waitFor(() => {
            expect(result.current.hasHydrated).toBe(true);
        });

        expect(result.current.state.count).toBe(12);
        expect(result.current.state.target).toBe(33);
        expect(result.current.state.activeZikirId).toBe("tasbih");
        expect(result.current.state.dailyCount).toBe(5);
        expect(result.current.state.streak).toBe(2);
        expect(result.current.state.lastZikirDate).toBe(today());
    });

    it("resets daily count when day changes and preserves streak for 1-day gap", async () => {
        setupStorage({ lastDate: yesterday() });

        const { result } = renderHook(() =>
            useTasbihPersistence({
                defaultActiveId: "tasbih",
                validActiveIds: ["tasbih", "tahmid"],
                defaultTarget: 33
            })
        );

        await waitFor(() => {
            expect(result.current.hasHydrated).toBe(true);
        });

        expect(result.current.state.dailyCount).toBe(0);
        expect(result.current.state.streak).toBe(2);
        expect(result.current.state.lastZikirDate).toBe(today());
    });

    it("updateState persists to localStorage", async () => {
        setupStorage();

        const { result } = renderHook(() =>
            useTasbihPersistence({
                defaultActiveId: "tasbih",
                validActiveIds: ["tasbih"],
                defaultTarget: 33
            })
        );

        await waitFor(() => {
            expect(result.current.hasHydrated).toBe(true);
        });

        act(() => {
            result.current.updateState({ count: 7, streak: 4 });
        });

        expect(localStorage.getItem(STORAGE_KEYS.TASBIH_COUNT)).toBe("7");
        expect(localStorage.getItem(STORAGE_KEYS.TASBIH_STREAK)).toBe("4");
    });
});
