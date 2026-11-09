// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LottieMoment from "./LottieMoment";

vi.mock("@/components/ui/LottiePlayer", () => ({ default: () => <span data-testid="player" /> }));

const mockMatchMedia = (reduced: boolean) =>
    vi.stubGlobal("matchMedia", () => ({
        matches: reduced,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));

describe("LottieMoment", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("shows the static fallback and never loads the player when motion is reduced", () => {
        mockMatchMedia(true);
        render(<LottieMoment src="/lottie/x.lottie" fallback={<span>still</span>} />);
        expect(screen.getByText("still")).toBeTruthy();
        expect(screen.queryByTestId("player")).toBeNull();
    });

    it("is hidden from assistive technology because it is decorative", () => {
        mockMatchMedia(true);
        const { container } = render(<LottieMoment src="/lottie/x.lottie" />);
        expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    });
});
