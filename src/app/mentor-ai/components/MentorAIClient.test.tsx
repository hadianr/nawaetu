/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import MentorAIClient from "./MentorAIClient";
import { askMentor } from "../ai-action";
import { USER_MESSAGES } from "../mentor-messages";
import { MENTOR_DAILY_LIMIT } from "@/lib/constants/mentor-limit";

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
const credits = () => Number(screen.getByText(/Credit$/).textContent?.replace(/\D/g, ""));

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
});
