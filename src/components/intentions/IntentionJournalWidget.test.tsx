// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IntentionJournalWidget from "./IntentionJournalWidget";
import { BASE_SETTINGS_EN } from "@/data/translations/base";

const { mockFetchWithTimeout } = vi.hoisted(() => ({ mockFetchWithTimeout: vi.fn() }));

vi.mock("@/lib/utils/fetch", () => ({ fetchWithTimeout: mockFetchWithTimeout }));
vi.mock("@/context/LocaleContext", () => ({ useLocale: () => ({ t: BASE_SETTINGS_EN, locale: "en" }) }));
vi.mock("@/lib/habits/leveling", () => ({ addHasanah: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("./IntentionPrompt", () => ({ default: () => null }));
vi.mock("./ReflectionPrompt", () => ({ default: () => null }));

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
