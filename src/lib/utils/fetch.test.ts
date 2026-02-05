import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { fetchWithTimeout } from "@/lib/utils/fetch";

describe("fetchWithTimeout", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        global.fetch = originalFetch;
    });

    it("returns response when fetch resolves", async () => {
        const response = new Response("ok", { status: 200 });
        global.fetch = vi.fn().mockResolvedValue(response);

        const result = await fetchWithTimeout("https://example.com");
        expect(result).toBe(response);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const init = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
        expect(init?.signal).toBeInstanceOf(AbortSignal);
    });

    it("aborts when timeout elapses", async () => {
        global.fetch = vi.fn().mockImplementation((_input, init) => {
            return new Promise((_, reject) => {
                const signal = init?.signal as AbortSignal | undefined;
                if (signal) {
                    signal.addEventListener("abort", () => {
                        const error = new Error("aborted") as Error & { name: string };
                        error.name = "AbortError";
                        reject(error);
                    });
                }
            });
        });

        const promise = fetchWithTimeout("https://example.com", {}, { timeoutMs: 50 });
        const assertion = expect(promise).rejects.toHaveProperty("name", "AbortError");
        await vi.advanceTimersByTimeAsync(60);
        await assertion;
    });
});
