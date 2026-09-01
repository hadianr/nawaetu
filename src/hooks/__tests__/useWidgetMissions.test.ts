/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useWidgetMissions } from "../useWidgetMissions";

vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: { user: { gender: "male", archetype: "esensial" } } }),
}));

vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({ locale: "id" }),
}));

vi.mock("@/context/PrayerTimesContext", () => ({
    usePrayerTimesContext: () => ({
        data: {
            hijriDate: "15 Safar 1447H",
            hijriMonth: "Safar",
        },
    }),
}));

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({
        getOptional: () => "male",
    }),
}));

describe("useWidgetMissions Friday handling", () => {
    it("excludes dhuhr_prayer_male on Friday for male users to avoid duplicate with friday_prayer", () => {
        // Mock Friday
        const mockDate = new Date("2026-07-24T12:00:00Z"); // Friday
        vi.setSystemTime(mockDate);

        const { result } = renderHook(() => useWidgetMissions([]));

        const missionIds = result.current.missions.map((m) => m.id);
        expect(missionIds).not.toContain("dhuhr_prayer");
        expect(missionIds).toContain("friday_prayer");

        vi.useRealTimers();
    });

    it("syncs prayer completion correctly between prayer check-in and mission list", () => {
        const todayStr = new Date().toISOString().split("T")[0];
        const completedMissions = [
            { id: "fajr_prayer", completedAt: todayStr }
        ];

        const { result } = renderHook(() => useWidgetMissions(completedMissions));

        expect(result.current.isMissionCompleted("fajr_prayer", "daily")).toBe(true);
        expect(result.current.isMissionCompleted("fajr_prayer_male", "daily")).toBe(true);
        expect(result.current.isMissionCompleted("fajr_prayer_female", "daily")).toBe(true);
    });

    it("keeps prayer missions out of the home mission preview", () => {
        const { result } = renderHook(() => useWidgetMissions([]));

        expect(result.current.widgetMissions.every((mission) => mission.category !== "prayer")).toBe(true);
    });
});
