/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const mocks = vi.hoisted(() => ({ values: new Map<string, unknown>(), fetch: vi.fn() }));

vi.mock("next-auth/react", () => ({
    useSession: () => ({ status: "authenticated", data: { user: { id: "user-1" } } }),
}));
vi.mock("@/core/infrastructure/storage", () => {
    const service = {
        get: (key: string, fallback: unknown) => mocks.values.get(key) ?? fallback,
        getOptional: (key: string) => mocks.values.get(key) ?? null,
        set: (key: string, value: unknown) => { mocks.values.set(key, value); },
        remove: (key: string) => { mocks.values.delete(key); },
    };
    return { getStorageService: () => service };
});

import { useFastingTracker } from "./useFastingTracker";

const flush = async () => { await act(async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); }); };
const pending = () => mocks.values.get(STORAGE_KEYS.RAMADHAN_FASTING_PENDING) as string[] | undefined;

describe("useFastingTracker offline edits", () => {
    beforeEach(() => {
        mocks.values.clear();
        mocks.fetch.mockReset();
        vi.stubGlobal("fetch", mocks.fetch);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => vi.unstubAllGlobals());

    it("keeps an edit pending while the server is unreachable, then sends it when the connection returns", async () => {
        mocks.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
        const { result } = renderHook(() => useFastingTracker());
        await flush();

        act(() => result.current.logDay(1447, 3, "fasting"));
        await flush();
        expect(pending()).toEqual(["1447-3"]);

        mocks.fetch.mockResolvedValue({ ok: true, status: 200 } as Response);
        await act(async () => { window.dispatchEvent(new Event("online")); });
        await flush();

        expect(mocks.fetch).toHaveBeenLastCalledWith("/api/ramadhan/fasting", expect.objectContaining({ method: "POST" }));
        expect(pending()).toEqual([]);
    });

    it("treats a non-2xx answer as not delivered", async () => {
        mocks.fetch.mockResolvedValue({ ok: false, status: 500 } as Response);
        const { result } = renderHook(() => useFastingTracker());
        await flush();

        act(() => result.current.logDay(1447, 4, "sick"));
        await flush();

        expect(pending()).toEqual(["1447-4"]);
    });

    it("sends edits that were still pending when the app was reloaded", async () => {
        mocks.values.set(STORAGE_KEYS.RAMADHAN_FASTING_LOG, JSON.stringify({
            "1447": { "05": { status: "fasting", consequence: "none", qadhaDone: false } },
        }));
        mocks.values.set(STORAGE_KEYS.RAMADHAN_FASTING_PENDING, ["1447-5"]);
        mocks.fetch.mockResolvedValue({ ok: true, status: 200 } as Response);

        renderHook(() => useFastingTracker());
        await flush();

        expect(mocks.fetch).toHaveBeenCalledWith("/api/ramadhan/fasting", expect.objectContaining({ method: "POST" }));
        expect(pending()).toEqual([]);
    });
});
