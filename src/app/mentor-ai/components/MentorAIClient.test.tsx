/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import MentorAIClient from "./MentorAIClient";
import { askMentor } from "../ai-action";
import { USER_MESSAGES } from "../mentor-messages";
import { MENTOR_DAILY_LIMIT } from "@/lib/constants/mentor-limit";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

vi.mock("../ai-action", () => ({ askMentor: vi.fn() }));
vi.mock("next-auth/react", () => ({ useSession: () => ({ status: "authenticated", data: { user: { id: "u1" } } }) }));
vi.mock("@/context/LocaleContext", () => ({
    useLocale: () => ({ locale: "id", t: new Proxy({}, { get: (_t, key) => (key === "tanyaPlaceholder" ? "Tulis pertanyaan" : String(key)) }) }),
}));
vi.mock("@/lib/analytics/analytics", () => ({ trackAIQuery: vi.fn() }));
vi.mock("@/lib/auth-client", () => ({ signInWithGoogle: vi.fn() }));
vi.mock("@/core/repositories/activity.repository", () => ({
    getActivityRepository: () => ({ getActivity: () => ({ quranAyat: 0, tasbihCount: 0, prayersLogged: [] }) }),
}));
vi.mock("@/lib/habits/streak-utils", () => ({ getDisplayStreak: () => ({ streak: 0 }) }));

const ask = async (text: string) => {
    fireEvent.change(screen.getByPlaceholderText("Tulis pertanyaan"), { target: { value: text } });
    await act(async () => { fireEvent.submit(screen.getByPlaceholderText("Tulis pertanyaan").closest("form")!); });
};
const credits = () => Number(screen.getByText(/tanyaCredits$/).textContent?.replace(/\D/g, ""));

describe("MentorAIClient daily credits", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(askMentor).mockReset();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
        Element.prototype.scrollIntoView = vi.fn();
    });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it("starts with the shared limit and spends one credit per delivered answer", async () => {
        vi.mocked(askMentor).mockResolvedValue("Jawaban nyata");
        render(<MentorAIClient />);
        await waitFor(() => expect(credits()).toBe(MENTOR_DAILY_LIMIT));

        await ask("Apa itu sabar?");
        await waitFor(() => expect(credits()).toBe(MENTOR_DAILY_LIMIT - 1));
    });

    it("gives the credit back when the reply is a refusal or an error, in either language", async () => {
        render(<MentorAIClient />);
        await waitFor(() => expect(credits()).toBe(MENTOR_DAILY_LIMIT));

        for (const reply of [USER_MESSAGES.id.busy, USER_MESSAGES.en.technical, USER_MESSAGES.id.rateLimit]) {
            vi.mocked(askMentor).mockResolvedValueOnce(reply);
            await ask("Pertanyaan");
            await waitFor(() => expect(screen.getByText(reply)).toBeTruthy());
            expect(credits()).toBe(MENTOR_DAILY_LIMIT);
        }
    });

    it("catches up and stops offering credits when the server says the day is used", async () => {
        vi.mocked(askMentor).mockResolvedValueOnce(USER_MESSAGES.id.dailyLimit);
        render(<MentorAIClient />);
        await waitFor(() => expect(credits()).toBe(MENTOR_DAILY_LIMIT));

        await ask("Pertanyaan");
        await waitFor(() => expect(screen.queryByPlaceholderText("Tulis pertanyaan")).toBeNull());
        expect(credits()).toBe(0);
    });

    it("counts over a rolling 24 hours from storage, not over a clock day", async () => {
        const hour = 60 * 60 * 1000;
        // Ten answers 25 hours ago are gone; the same ten one hour ago still fill the limit.
        getStorageService().set(STORAGE_KEYS.AI_USAGE, JSON.stringify({ answers: Array.from({ length: MENTOR_DAILY_LIMIT }, () => Date.now() - 25 * hour) }));
        const old = render(<MentorAIClient />);
        // Let the stored list load first; the screen starts at the full limit before it does.
        await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
        expect(credits()).toBe(MENTOR_DAILY_LIMIT);
        old.unmount();

        getStorageService().set(STORAGE_KEYS.AI_USAGE, JSON.stringify({ answers: Array.from({ length: MENTOR_DAILY_LIMIT }, () => Date.now() - hour) }));
        render(<MentorAIClient />);
        await waitFor(() => expect(credits()).toBe(0));
    });
});

describe("MentorAIClient chat history", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
        Element.prototype.scrollIntoView = vi.fn();
    });
    afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

    it("opens as a named dialog with keyboard-reachable rows and closes on Escape", async () => {
        vi.mocked(askMentor).mockResolvedValue("Jawaban");
        render(<MentorAIClient />);
        await ask("Apa itu sabar?");
        await waitFor(() => expect(screen.getByText("Jawaban")).toBeTruthy());

        fireEvent.click(screen.getByRole("button", { name: "tanyaHistory" }));
        const dialog = await screen.findByRole("dialog", { name: "tanyaHistory" });
        expect(dialog.querySelector("button[aria-current='true']")).toBeTruthy();
        expect(screen.getByRole("button", { name: /^tanyaDeleteChat: / })).toBeTruthy();

        fireEvent.keyDown(dialog, { key: "Escape" });
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
});
