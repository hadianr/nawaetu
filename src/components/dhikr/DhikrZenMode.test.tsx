/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DhikrZenMode } from "./DhikrZenMode";
import type { TranslationTree } from "@/context/LocaleContext";

const t = { a11yZenCount: "Count one dhikr", a11yClose: "Close", tasbihCounterLabel: "Tasbih" } as unknown as TranslationTree;

function renderZen() {
    const handleIncrement = vi.fn();
    const setIsZenMode = vi.fn();
    render(
        <DhikrZenMode
            isZenMode
            setIsZenMode={setIsZenMode}
            activeDhikr={null}
            target={33}
            count={0}
            hasHydrated
            t={t}
            handleIncrement={handleIncrement}
            feedbackMode="sound"
            toggleFeedback={vi.fn()}
        />,
    );
    return { handleIncrement, setIsZenMode };
}

describe("DhikrZenMode keyboard access", () => {
    it("counts through a named full-screen button", () => {
        const { handleIncrement } = renderZen();
        // A keyboard activation is a click with detail 0.
        fireEvent.click(screen.getByRole("button", { name: "Count one dhikr" }), { detail: 0 });
        expect(handleIncrement).toHaveBeenCalledTimes(1);
    });

    it("closes with Escape and with the named close button", () => {
        const { setIsZenMode } = renderZen();
        fireEvent.keyDown(window, { key: "Escape" });
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(setIsZenMode).toHaveBeenCalledTimes(2);
        expect(setIsZenMode).toHaveBeenCalledWith(false);
    });
});
