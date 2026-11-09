// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LottieMoment from "./LottieMoment";

vi.mock("@/components/ui/LottiePlayer", () => ({
    default: ({ onComplete }: { onComplete?: () => void }) => (
        <button data-testid="player" onClick={onComplete} />
    ),
}));

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

    it("keeps the last frame by default", async () => {
        mockMatchMedia(false);
        render(<LottieMoment src="/lottie/x.lottie" />);
        fireEvent.click(await screen.findByTestId("player"));
        expect(screen.getByTestId("player")).toBeTruthy();
    });

    it("removes the animation once it finishes when hideOnComplete is set", async () => {
        mockMatchMedia(false);
        render(<LottieMoment src="/lottie/x.lottie" hideOnComplete />);
        fireEvent.click(await screen.findByTestId("player"));
        expect(screen.queryByTestId("player")).toBeNull();
    });
});
