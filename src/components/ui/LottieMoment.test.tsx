// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LottieMoment from "./LottieMoment";

vi.mock("@/components/ui/LottiePlayer", () => ({
    default: ({ src, onPlay, onComplete, onError }: { src: string; onPlay?: () => void; onComplete?: () => void; onError?: () => void }) => {
        if (src === "/lottie/crash.lottie") throw new Error("wasm failed");
        return (
            <>
                <button data-testid="player" onClick={onComplete} />
                <button data-testid="play" onClick={onPlay} />
                <button data-testid="fail" onClick={onError} />
            </>
        );
    },
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

    it("shows the fallback while the player loads, then fades it out once the animation moves", async () => {
        mockMatchMedia(false);
        const onPlay = vi.fn();
        render(<LottieMoment src="/lottie/x.lottie" fallback={<span>still</span>} onPlay={onPlay} />);
        expect(screen.getByText("still").parentElement?.className).not.toContain("opacity-0");
        fireEvent.click(await screen.findByTestId("play"));
        fireEvent.click(screen.getByTestId("play"));
        expect(screen.getByText("still").parentElement?.className).toContain("opacity-0");
        expect(onPlay).toHaveBeenCalledTimes(1);
    });

    it("keeps the fallback when the animation file fails to load", async () => {
        mockMatchMedia(false);
        render(<LottieMoment src="/lottie/x.lottie" fallback={<span>still</span>} />);
        fireEvent.click(await screen.findByTestId("fail"));
        expect(screen.getByText("still")).toBeTruthy();
        expect(screen.queryByTestId("player")).toBeNull();
    });

    it("keeps the fallback instead of crashing when the player itself throws", async () => {
        mockMatchMedia(false);
        vi.spyOn(console, "error").mockImplementation(() => {});
        render(<LottieMoment src="/lottie/crash.lottie" fallback={<span>still</span>} />);
        await waitFor(() => expect(screen.getByText("still").parentElement?.className).not.toContain("absolute"));
        expect(screen.queryByTestId("player")).toBeNull();
    });

    it("quietLoad keeps the box empty while loading, then shows the animation without any icon flash", async () => {
        mockMatchMedia(false);
        render(<LottieMoment src="/lottie/x.lottie" quietLoad fallback={<span>still</span>} />);
        expect(screen.queryByText("still")).toBeNull();
        const player = await screen.findByTestId("player");
        expect(player.parentElement?.className).toContain("opacity-0");
        fireEvent.click(screen.getByTestId("play"));
        expect(player.parentElement?.className).not.toContain("opacity-0");
    });

    it("quietLoad still falls back to the icon when the animation fails", async () => {
        mockMatchMedia(false);
        render(<LottieMoment src="/lottie/x.lottie" quietLoad fallback={<span>still</span>} />);
        fireEvent.click(await screen.findByTestId("fail"));
        expect(screen.getByText("still")).toBeTruthy();
    });
});
