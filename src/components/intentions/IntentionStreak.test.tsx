// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import IntentionStreak from "./IntentionStreak";
import { BASE_SETTINGS_EN, BASE_SETTINGS_ID } from "@/data/translations/base";

let current: typeof BASE_SETTINGS_EN | typeof BASE_SETTINGS_ID = BASE_SETTINGS_EN;
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: current }) }));
// framer-motion's animation props are not DOM attributes; render a plain div without them.
const MOTION_PROPS = new Set(["initial", "animate", "transition"]);
vi.mock("framer-motion", () => ({
    motion: new Proxy({}, { get: () => ({ children, ...rest }: { children?: React.ReactNode }) => (
        <div {...Object.fromEntries(Object.entries(rest).filter(([key]) => !MOTION_PROPS.has(key)))}>{children}</div>
    ) }),
}));

afterEach(cleanup);

const labelsOf = (locale: "en" | "id") => {
    current = locale === "en" ? BASE_SETTINGS_EN : BASE_SETTINGS_ID;
    return current;
};

describe.each(["en", "id"] as const)("IntentionStreak (%s)", (locale) => {
    it("shows an encouraging empty state at 0, not an error or a raw key", () => {
        const t = labelsOf(locale);
        const { container } = render(<IntentionStreak currentStreak={0} longestStreak={0} />);
        const text = container.textContent ?? "";
        expect(text).toContain(t.intention_streak);
        expect(text).toContain(t.intention_start_journey);
        expect(text).toContain(`0/7`);
        expect(text).not.toMatch(/intention_|undefined|NaN/);
    });

    it("shows the current streak and the next milestone", () => {
        const t = labelsOf(locale);
        const { container } = render(<IntentionStreak currentStreak={5} longestStreak={5} />);
        const text = container.textContent ?? "";
        expect(text).toContain(t.intention_building_momentum);
        expect(text).toContain(`${t.intention_next_milestone}: ${t.intention_milestone_week}`);
        expect(text).toContain("5/7");
        expect(text).not.toContain(t.intention_best_streak);
    });

    it("shows the best streak only when it is longer than the current one", () => {
        const t = labelsOf(locale);
        const { container } = render(<IntentionStreak currentStreak={3} longestStreak={12} />);
        expect(container.textContent).toContain(`${t.intention_best_streak}: 12 ${t.intention_days}`);
    });

    it("drops the progress bar once the last milestone is reached", () => {
        const t = labelsOf(locale);
        const { container } = render(<IntentionStreak currentStreak={120} longestStreak={120} />);
        expect(container.textContent).toContain(t.intention_legendary);
        expect(container.textContent).not.toContain(t.intention_next_milestone);
    });
});
