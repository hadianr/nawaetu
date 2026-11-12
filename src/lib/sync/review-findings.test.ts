/** @vitest-environment jsdom */
// Regressions found by the independent review of the sync branch. Each test reproduces one finding with the
// real storage layer, queue and tracker; only the network and the pull are replaced.
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { clearAccountData } from "@/lib/account-data";
import { syncQueue } from "@/lib/sync-queue";
import { DateUtils } from "@/lib/utils/date";

vi.mock("./pull", () => ({ pullAndApply: vi.fn(async () => undefined), pullBookmarksIfChanged: vi.fn(async () => undefined) }));
vi.mock("./claim", () => ({ claimGuestIntentions: vi.fn(async () => undefined) }));

import { pullAndApply } from "./pull";
import { drainSyncQueue } from "./drain";
import { startSyncEngine } from "./engine";
import { startSyncTracker } from "./tracker";

const storage = getStorageService();
const today = DateUtils.today();
const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

beforeEach(() => {
    localStorage.clear();
    syncQueue.clearAll();
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(pullAndApply).mockClear();
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
});
afterEach(() => { vi.restoreAllMocks(); });

describe("logout while the tracker is listening", () => {
    it("clears the account without queueing an undo for every record it removes", () => {
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: new Date().toISOString(), hasanahEarned: 75 }]);
        storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, [{ id: "2:255", surahId: 2, surahName: "Al-Baqarah", verseId: 255, verseText: "x" }]);
        const stop = startSyncTracker("u1", vi.fn());
        try {
            clearAccountData(storage);
            expect(syncQueue.getQueue()).toHaveLength(0);
        } finally {
            stop();
        }
    });
});

describe("a change made while its entry is on the way", () => {
    function deferredFetch() {
        let release!: (entryIds: string[]) => void;
        vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>((resolve) => {
            release = (entryIds) => resolve(json({ synced: entryIds.map((id) => ({ id })), failed: [] }));
        }));
        return (entryIds: string[]) => release(entryIds);
    }

    it("is still sent: the acknowledgement of the older version does not remove the newer one", async () => {
        const id = syncQueue.addToQueue("daily_activity", "update", { date: today, tasbihCount: 100 }, "u1");
        const release = deferredFetch();
        vi.mocked(fetch).mockResolvedValue(json({ synced: [], failed: [] }));

        const draining = drainSyncQueue("u1");
        syncQueue.addToQueue("daily_activity", "update", { date: today, tasbihCount: 101 }, "u1");
        release([id]);
        await draining;

        const left = syncQueue.getPendingEntries("u1");
        expect(left).toHaveLength(1);
        expect(left[0].data).toMatchObject({ tasbihCount: 101 });
    });

    it("keeps the undo of a completion that was already on its way to the server", async () => {
        const mission = { id: "fajr_prayer", completedDate: today, completedAt: today };
        const id = syncQueue.addToQueue("mission", "create", mission, "u1");
        const release = deferredFetch();
        vi.mocked(fetch).mockResolvedValue(json({ synced: [], failed: [] }));

        const draining = drainSyncQueue("u1");
        syncQueue.addToQueue("mission", "delete", mission, "u1");
        release([id]);
        await draining;

        expect(syncQueue.getPendingEntries("u1").map((entry) => entry.action)).toEqual(["delete"]);
    });

    it("is removed once the server has the newest version", async () => {
        const id = syncQueue.addToQueue("daily_activity", "update", { date: today, tasbihCount: 5 }, "u1");
        vi.mocked(fetch).mockResolvedValueOnce(json({ synced: [{ id }], failed: [] }));
        await drainSyncQueue("u1");
        expect(syncQueue.getQueue()).toHaveLength(0);
    });
});

describe("the engine", () => {
    it("starts when login settles on a later attempt, even if the first one did not succeed", () => {
        const stop = startSyncEngine({ userId: "u1", sync: vi.fn(async () => ({ success: true })) });

        // First attempt ends without the account being marked as synced (server error).
        window.dispatchEvent(new Event("sync_login_settled"));
        // A later attempt succeeds.
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_USER_ID, "u1");
        window.dispatchEvent(new Event("sync_login_settled"));

        storage.set(STORAGE_KEYS.SETTINGS_THEME, "midnight");
        expect(syncQueue.getPendingEntries("u1")).toHaveLength(1);
        stop();
    });

    it("still pulls other devices' changes while an entry that failed for good is waiting", async () => {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_USER_ID, "u1");
        const stuck = syncQueue.addToQueue("hasanah_event", "create", { kind: "quran_time", key: "k", localDate: today, amount: 999 }, "u1");
        for (let attempt = 0; attempt <= 5; attempt++) syncQueue.recordFailure(stuck, "refused");
        // The same answer a real drain gives: nothing pending, but not "all sent".
        const sync = vi.fn(async () => ({ success: false }));

        const stop = startSyncEngine({ userId: "u1", sync });
        await vi.waitFor(() => expect(pullAndApply).toHaveBeenCalled());
        stop();
    });

    it("does not pull while something that can still be sent is waiting", async () => {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_USER_ID, "u1");
        syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
        const sync = vi.fn(async () => ({ success: false }));

        const stop = startSyncEngine({ userId: "u1", sync });
        await vi.waitFor(() => expect(sync).toHaveBeenCalled());
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(pullAndApply).not.toHaveBeenCalled();
        stop();
    });
});
