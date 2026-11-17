// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OrientationReflow from "./OrientationReflow";

describe("OrientationReflow", () => {
    afterEach(() => vi.useRealTimers());

    it("reflows <html> on rotation and again after it settles", () => {
        vi.useFakeTimers();
        const listeners: Array<() => void> = [];
        window.matchMedia = vi.fn().mockReturnValue({
            addEventListener: (_: string, cb: () => void) => listeners.push(cb),
            removeEventListener: vi.fn(),
        }) as unknown as typeof window.matchMedia;
        // Reading offsetHeight is what forces the reflow.
        const reads = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(0);

        render(<OrientationReflow />);
        expect(reads).not.toHaveBeenCalled();
        listeners[0]();
        expect(reads).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(400);
        expect(reads).toHaveBeenCalledTimes(2);
        expect(document.documentElement.style.display).toBe("");
    });
});
