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
        expect(missionIds).not.toContain("dhuhr_prayer_male");
        expect(missionIds).toContain("friday_prayer");

        vi.useRealTimers();
    });
});
