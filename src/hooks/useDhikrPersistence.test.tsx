/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useDhikrPersistence } from "@/hooks/useDhikrPersistence";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

describe("useDhikrPersistence", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("initializes with defaults when storage is empty", () => {
        const { result } = renderHook(() =>
            useDhikrPersistence({
                defaultActiveId: "subhanallah",
                validActiveIds: ["subhanallah", "alhamdulillah"],
                defaultTarget: 33,
            })
        );

        expect(result.current.state.count).toBe(0);
        expect(result.current.state.target).toBe(33);
        expect(result.current.state.activeDhikrId).toBe("subhanallah");
    });

    it("hydrates from local storage correctly", () => {
        localStorage.setItem(STORAGE_KEYS.DHIKR_COUNT, "10");
        localStorage.setItem(STORAGE_KEYS.DHIKR_TARGET, "99");
        localStorage.setItem(STORAGE_KEYS.DHIKR_ACTIVE_PRESET, "alhamdulillah");

        const { result } = renderHook(() =>
            useDhikrPersistence({
                defaultActiveId: "subhanallah",
                validActiveIds: ["subhanallah", "alhamdulillah"],
                defaultTarget: 33,
            })
        );

        expect(result.current.state.count).toBe(10);
        expect(result.current.state.target).toBe(99);
        expect(result.current.state.activeDhikrId).toBe("alhamdulillah");
    });

    it("resets streak if date changed (more than 1 day)", () => {
        localStorage.setItem(STORAGE_KEYS.DHIKR_STREAK, "5");
        // Set date to 2 days ago
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 2);
        localStorage.setItem(STORAGE_KEYS.DHIKR_LAST_DATE, pastDate.toISOString().split("T")[0]);

        const { result } = renderHook(() =>
            useDhikrPersistence({
                defaultActiveId: "tasbih",
                validActiveIds: ["tasbih"],
            })
        );

        expect(result.current.state.streak).toBe(0);
        expect(result.current.state.dailyCount).toBe(0);
    });
});
