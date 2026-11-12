// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NUDGE_STORAGE_KEY } from "@/lib/login-nudge";

const mocks = vi.hoisted(() => ({
    status: "unauthenticated" as string,
    streak: 7,
    signIn: vi.fn(),
    track: vi.fn(),
}));

vi.mock("next-auth/react", () => ({ useSession: () => ({ status: mocks.status, data: null }) }));
vi.mock("@/hooks/useStreak", () => ({ useStreak: () => ({ streak: { currentStreak: mocks.streak } }) }));
vi.mock("@/lib/auth-client", () => ({ signInWithGoogle: mocks.signIn }));
vi.mock("@/lib/analytics/analytics", () => ({ sendGAEvent: mocks.track }));
vi.mock("@/components/ui/LottieMoment", () => ({ default: ({ src }: { src: string }) => <div data-testid="animation" data-src={src} /> }));
vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({
        t: {
            loginNudgeStreak7Title: "A whole week", loginNudgeStreak7Desc: "streak7 text",
            loginNudgeStreak14Title: "Two weeks", loginNudgeStreak14Desc: "streak14 text",
            loginNudgeStreak30Title: "A month", loginNudgeStreak30Desc: "streak30 text",
            loginNudgeCta: "Sign in with Google", loginNudgeLater: "Maybe later", loginNudgeNote: "Free.",
        },
    }),
    getTranslationText: (t: Record<string, string>, key: string) => t[key] ?? "",
}));

import LoginNudge from "./LoginNudge";

const wait = () => act(async () => { await vi.advanceTimersByTimeAsync(4100); });

describe("LoginNudge", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        localStorage.setItem("onboarding_completed", "v2");
        Object.assign(mocks, { status: "unauthenticated", streak: 7, level: 1 });
        vi.clearAllMocks();
    });
    afterEach(() => { cleanup(); vi.useRealTimers(); });

    it("invites a guest who has a streak, after a calm moment, with the flame", async () => {
        render(<LoginNudge />);
        expect(screen.queryByRole("dialog")).toBeNull();
        await wait();
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(screen.getByText("A whole week")).toBeTruthy();
        expect(screen.getByTestId("animation").getAttribute("data-src")).toBe("/lottie/flame.lottie");
        expect(mocks.track).toHaveBeenCalledWith("login_prompt_shown", { trigger: "streak7" });
    });

    it("never invites someone who is signed in, a guest with nothing to protect, or during onboarding", async () => {
        mocks.status = "authenticated";
        const { unmount } = render(<LoginNudge />);
        await wait();
        expect(screen.queryByRole("dialog")).toBeNull();
        unmount();

        Object.assign(mocks, { status: "unauthenticated", streak: 6 });
        const second = render(<LoginNudge />);
        await wait();
        expect(screen.queryByRole("dialog")).toBeNull();
        second.unmount();

        Object.assign(mocks, { streak: 9 });
        localStorage.removeItem("onboarding_completed");
        render(<LoginNudge />);
        await wait();
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("does not stack on top of another dialog", async () => {
        document.body.insertAdjacentHTML("beforeend", '<div role="dialog">other</div>');
        render(<LoginNudge />);
        await wait();
        expect(mocks.track).not.toHaveBeenCalled();
        document.querySelector('[role="dialog"]')?.remove();
    });

    it("tries again when another dialog was in the way, and shows once it is gone", async () => {
        document.body.insertAdjacentHTML("beforeend", '<div role="dialog" id="other">other</div>');
        render(<LoginNudge />);
        await wait(); // the first look finds the other dialog
        expect(mocks.track).not.toHaveBeenCalled();

        document.getElementById("other")?.remove();
        await act(async () => { await vi.advanceTimersByTimeAsync(5100); });
        expect(screen.getByRole("dialog")).toBeTruthy();
        expect(mocks.track).toHaveBeenCalledWith("login_prompt_shown", { trigger: "streak7" });
    });

    it("gives up after a few tries and leaves the invitation for the next visit", async () => {
        document.body.insertAdjacentHTML("beforeend", '<div role="dialog" id="other">other</div>');
        render(<LoginNudge />);
        await act(async () => { await vi.advanceTimersByTimeAsync(4000 + 5 * 5000); });

        document.getElementById("other")?.remove();
        await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(mocks.track).not.toHaveBeenCalled();
    });

    it("starts sign-in from the button and records the click", async () => {
        render(<LoginNudge />);
        await wait();
        fireEvent.click(screen.getByText("Sign in with Google"));
        expect(mocks.signIn).toHaveBeenCalledTimes(1);
        expect(mocks.track).toHaveBeenCalledWith("login_prompt_clicked", { trigger: "streak7" });
    });

    it("backs off when dismissed, and stays quiet on the next visit", async () => {
        const first = render(<LoginNudge />);
        await wait();
        fireEvent.click(screen.getByText("Maybe later"));
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(mocks.track).toHaveBeenCalledWith("login_prompt_dismissed", { trigger: "streak7" });
        expect(JSON.parse(localStorage.getItem(NUDGE_STORAGE_KEY) as string).dismissals).toBe(1);
        first.unmount();

        mocks.streak = 14; // even a bigger reason has to wait out the snooze
        render(<LoginNudge />);
        await wait();
        expect(screen.queryByRole("dialog")).toBeNull();
    });
});
