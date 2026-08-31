/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NextPrayerWidget from "@/components/NextPrayerWidget";

const prayerState = vi.hoisted(() => ({ data: null, loading: true }));

vi.mock("@/context/PrayerTimesContext", () => ({
    usePrayerTimesContext: () => prayerState,
}));

vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({ t: { homeLocationRequiredTitle: "Location required" } }),
}));

describe("NextPrayerWidget terminal state", () => {
    beforeEach(() => {
        prayerState.data = null;
        prayerState.loading = true;
    });

    it("stops pulsing and explains missing location after loading ends", () => {
        const { container, rerender } = render(<NextPrayerWidget />);
        expect(container.querySelector(".animate-pulse")).toBeTruthy();

        prayerState.loading = false;
        rerender(<NextPrayerWidget />);

        expect(container.querySelector(".animate-pulse")).toBeNull();
        expect(screen.getByText("Location required")).toBeTruthy();
    });
});
