/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
