// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import IntentionJournalWidget from "./IntentionJournalWidget";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

const { mockFetchWithTimeout, mockAddHasanah, mockToast } = vi.hoisted(() => ({
    mockFetchWithTimeout: vi.fn(),
    mockAddHasanah: vi.fn(),
    mockToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/utils/fetch", () => ({ fetchWithTimeout: mockFetchWithTimeout }));
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/lib/habits/leveling", () => ({ addHasanah: mockAddHasanah }));
vi.mock("sonner", () => ({ toast: mockToast }));
vi.mock("./IntentionPrompt", () => ({
    default: ({ onSubmit }: { onSubmit: (text: string) => void }) => (
        <button onClick={() => onSubmit("Be patient today")}>submit-intention</button>
    ),
}));
vi.mock("./ReflectionPrompt", () => ({
    default: ({ onSubmit }: { onSubmit: (rating: number, text?: string) => void }) => (
        <button onClick={() => onSubmit(5, "went well")}>submit-reflection</button>
    ),
}));

const skeleton = () => document.querySelector(".animate-pulse");

describe("IntentionJournalWidget loading", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
    });

    it("stops showing the skeleton, quietly, when the server stalls and the request times out", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mockFetchWithTimeout.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));
        render(<IntentionJournalWidget />);
        expect(skeleton()).not.toBeNull();

        await waitFor(() => expect(skeleton()).toBeNull());
        expect(screen.getByText("Daily Intention Journal")).toBeTruthy();
        expect(logged).not.toHaveBeenCalled();
        expect(mockFetchWithTimeout).toHaveBeenCalledWith(expect.stringContaining("/api/intentions/today"), expect.anything());
        logged.mockRestore();
    });

    it("still reports unexpected failures", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mockFetchWithTimeout.mockRejectedValue(new Error("boom"));
        render(<IntentionJournalWidget />);
        await waitFor(() => expect(skeleton()).toBeNull());
        expect(logged).toHaveBeenCalled();
        logged.mockRestore();
    });

    it("shows the content as soon as the server answers", async () => {
        mockFetchWithTimeout.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, data: { has_intention: false, has_reflection: false, streak: 0 } }),
        });
        render(<IntentionJournalWidget />);
        await waitFor(() => expect(skeleton()).toBeNull());
    });
});

describe("IntentionJournalWidget saving", () => {
    const answer = (data: object) =>
        mockFetchWithTimeout.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true, data }) });
    const post = (body: object) => vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) }));

    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
    });
    afterEach(() => vi.unstubAllGlobals());

    it("saves a new intention and awards Hasanah", async () => {
        answer({ has_intention: false, has_reflection: false, streak: 0 });
        post({ success: true, data: { id: "i1", intention_text: "Be patient today", intention_date: "2026-11-10", current_streak: 1, intention_points_earned: 10 } });
        render(<IntentionJournalWidget />);

        fireEvent.click(await screen.findByText(BASE_SETTINGS_EN.intention_set_btn));
        fireEvent.click(await screen.findByText("submit-intention"));

        await waitFor(() => expect(mockAddHasanah).toHaveBeenCalledWith(10, expect.any(String)));
        expect(mockToast.success).toHaveBeenCalled();
        // The "set intention" call to action is replaced by the saved intention.
        await waitFor(() => expect(screen.queryByText(BASE_SETTINGS_EN.intention_set_btn)).toBeNull());
    });

    it("explains a failed save and brings the form back", async () => {
        answer({ has_intention: false, has_reflection: false, streak: 0 });
        post({ success: false, error: "Could not save" });
        render(<IntentionJournalWidget />);

        fireEvent.click(await screen.findByText(BASE_SETTINGS_EN.intention_set_btn));
        fireEvent.click(await screen.findByText("submit-intention"));

        await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith("Could not save"));
        expect(await screen.findByText("submit-intention")).toBeTruthy();
        expect(mockAddHasanah).not.toHaveBeenCalled();
    });

    it("saves a reflection and awards Hasanah", async () => {
        answer({
            has_intention: true,
            has_reflection: false,
            streak: 2,
            intention: { id: "i1", intention_text: "Be patient today", intention_date: "2026-11-10" },
        });
        post({ success: true, data: { reflection_rating: 5, reflection_text: "went well", reflected_at: "2026-11-10T20:00:00Z" } });
        render(<IntentionJournalWidget />);

        fireEvent.click(await screen.findByText(BASE_SETTINGS_EN.intention_refleksi_btn));
        fireEvent.click(await screen.findByText("submit-reflection"));

        await waitFor(() => expect(mockAddHasanah).toHaveBeenCalledWith(50, expect.any(String)));
        expect(mockToast.success).toHaveBeenCalled();
    });
});
