// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StreakWeek from "./StreakWeek";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

let mockActive = new Set<string>();
let mockProtected = new Set<string>();
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/hooks/useStreakDates", () => ({ useStreakDates: () => ({ activeDates: mockActive, protectedDates: mockProtected }) }));
vi.mock("@/components/ui/LottieMoment", () => ({ default: ({ fallback }: { fallback?: React.ReactNode }) => <>{fallback}</> }));

describe("StreakWeek", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-09T10:00:00"));
        mockActive = new Set(["2026-11-09", "2026-11-07"]);
        mockProtected = new Set(["2026-11-08"]);
    });
    afterEach(() => vi.useRealTimers());

    it("compact: seven days oldest first, with counted and frozen days named for screen readers", () => {
        render(<StreakWeek compact />);
        const items = screen.getAllByRole("listitem");
        expect(items).toHaveLength(7);
        expect(items[0].textContent).toBe("Tuesday");
        expect(items[4].textContent).toContain("Completed");
        expect(items[5].textContent).toContain("Day protected by a Streak Freeze");
        expect(items[6].textContent).toContain("Completed");
    });

    it("full: seven narrow day labels and the same states", () => {
        render(<StreakWeek />);
        expect(screen.getByLabelText("Last seven days").children).toHaveLength(7);
        expect(screen.getAllByRole("img", { name: "Completed" })).toHaveLength(2);
        expect(screen.getAllByLabelText("Day protected by a Streak Freeze")).toHaveLength(1);
    });
});
