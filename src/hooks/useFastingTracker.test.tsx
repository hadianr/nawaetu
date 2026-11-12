/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("next-auth/react", () => ({
    useSession: () => ({ status: "authenticated", data: { user: { id: "user-1" } } }),
}));
// The real storage layer is used on purpose: it parses JSON text when reading, which a hand-made mock hid.

import { useFastingTracker } from "./useFastingTracker";

const flush = async () => { await act(async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); }); };
const pending = () => { const raw = localStorage.getItem(STORAGE_KEYS.RAMADHAN_FASTING_PENDING); return raw ? (JSON.parse(raw) as string[]) : undefined; };

describe("useFastingTracker offline edits", () => {
    beforeEach(() => {
        localStorage.clear();
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
        localStorage.setItem(STORAGE_KEYS.RAMADHAN_FASTING_LOG, JSON.stringify({
            "1447": { "05": { status: "fasting", consequence: "none", qadhaDone: false } },
        }));
        localStorage.setItem(STORAGE_KEYS.RAMADHAN_FASTING_PENDING, JSON.stringify(["1447-5"]));
        mocks.fetch.mockResolvedValue({ ok: true, status: 200 } as Response);

        renderHook(() => useFastingTracker());
        await flush();

        expect(mocks.fetch).toHaveBeenCalledWith("/api/ramadhan/fasting", expect.objectContaining({ method: "POST" }));
        expect(pending()).toEqual([]);
    });
});

describe("useFastingTracker storage", () => {
    beforeEach(() => {
        localStorage.clear();
        mocks.fetch.mockReset();
        mocks.fetch.mockResolvedValue({ ok: true, status: 200 } as Response);
        vi.stubGlobal("fetch", mocks.fetch);
    });
    afterEach(() => vi.unstubAllGlobals());

    it("keeps earlier days when a new day is logged after a reload", async () => {
        localStorage.setItem(STORAGE_KEYS.RAMADHAN_FASTING_LOG, JSON.stringify({
            "1447": { "01": { status: "fasting", consequence: "none", qadhaDone: false } },
        }));
        const { result } = renderHook(() => useFastingTracker());
        await flush();

        // The history written before the reload is shown...
        expect(result.current.getDayLog(1447, 1)?.status).toBe("fasting");

        // ...and logging another day adds to it instead of replacing it.
        act(() => result.current.logDay(1447, 2, "sick"));
        await flush();
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.RAMADHAN_FASTING_LOG) as string);
        expect(Object.keys(stored["1447"]).sort()).toEqual(["01", "02"]);
    });

    it("sends an edit made while the previous one is on its way, instead of marking the day as sent", async () => {
        let release!: () => void;
        mocks.fetch.mockImplementationOnce(() => new Promise<Response>((resolve) => { release = () => resolve({ ok: true, status: 200 } as Response); }));
        mocks.fetch.mockResolvedValue({ ok: true, status: 200 } as Response);
        const { result } = renderHook(() => useFastingTracker());
        await flush();

        act(() => result.current.logDay(1447, 3, "fasting"));
        await flush();
        expect(mocks.fetch).toHaveBeenCalledTimes(1);

        act(() => result.current.logDay(1447, 3, "not_fasting")); // the user changes their mind while the first is in flight
        await flush();
        await act(async () => { release(); });
        await flush();

        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        expect(JSON.parse(mocks.fetch.mock.calls[1][1].body as string)).toMatchObject({ hijriDay: 3, status: "not_fasting" });
        expect(pending()).toEqual([]);
    });
});
