/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const store = vi.hoisted(() => ({ values: new Map<string, unknown>() }));

vi.mock("@/core/infrastructure/storage", () => {
    const service = {
        getOptional: (key: string) => store.values.get(key) ?? null,
        set: (key: string, value: unknown) => {
            store.values.set(key, value);
            window.dispatchEvent(new CustomEvent("nawaetu_storage_change", { detail: { key, action: "set", source: "local_tab" } }));
        },
        remove: (key: string) => { store.values.delete(key); },
    };
    return { getStorageService: () => service };
});
vi.mock("@/core/repositories/activity.repository", () => ({ resetActivityRepository: vi.fn() }));

import { syncQueue } from "@/lib/sync-queue";
import { drainSyncQueue } from "./drain";
import { startSyncTracker, withoutTracking, resetTrackerSnapshot } from "./tracker";
import { pullAndApply } from "./pull";
import { queueHasanahEvent } from "./award";
import { DateUtils } from "@/lib/utils/date";

const storage = () => (store.values);
const set = (key: string, value: unknown) => {
    store.values.set(key, value);
    window.dispatchEvent(new CustomEvent("nawaetu_storage_change", { detail: { key, action: "set", source: "local_tab" } }));
};
const json = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body }) as Response;

describe("sync engine", () => {
    const today = DateUtils.today();

    beforeEach(() => {
        store.values.clear();
        localStorage.clear();
        syncQueue.clearAll();
        vi.stubGlobal("fetch", vi.fn());
    });

    describe("tracker", () => {
        it("queues a completed and an undone mission from the storage change alone", () => {
            const stop = startSyncTracker("u1", vi.fn());
            set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: new Date().toISOString(), hasanahEarned: 75 }]);
            expect(syncQueue.getPendingEntries("u1").map((entry) => [entry.type, entry.action])).toEqual([["mission", "create"]]);
            expect(syncQueue.getPendingEntries("u1")[0].data).toMatchObject({ id: "fajr_prayer", completedDate: today });

            set(STORAGE_KEYS.COMPLETED_MISSIONS, []);
            // Done and undone before anything was sent: nothing reaches the server.
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(0);
            stop();
        });

        it("queues the undo of a mission that was already sent", () => {
            store.values.set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: today, hasanahEarned: 75 }]);
            const stop = startSyncTracker("u1", vi.fn());
            set(STORAGE_KEYS.COMPLETED_MISSIONS, []);
            expect(syncQueue.getPendingEntries("u1").map((entry) => entry.action)).toEqual(["delete"]);
            stop();
        });

        it("keeps one activity entry however many times the day's counters change", () => {
            const stop = startSyncTracker("u1", vi.fn());
            for (let count = 1; count <= 50; count++) set(STORAGE_KEYS.ACTIVITY_TRACKER, { date: today, tasbihCount: count, quranAyat: 0, prayersLogged: [] });
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(1);
            expect(syncQueue.getPendingEntries("u1")[0].data).toMatchObject({ tasbihCount: 50 });
            stop();
        });

        it("ignores writes made while applying server data, and another tab's changes", () => {
            const stop = startSyncTracker("u1", vi.fn());
            withoutTracking(() => set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: today, hasanahEarned: 75 }]));
            window.dispatchEvent(new CustomEvent("nawaetu_storage_change", { detail: { key: STORAGE_KEYS.QURAN_LAST_READ, source: "remote_tab" } }));
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(0);

            // After the server data is in, the next real edit is compared against it, not against the old state.
            resetTrackerSnapshot();
            set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: today, hasanahEarned: 75 }, { id: "asr_prayer", completedAt: today, hasanahEarned: 75 }]);
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(1);
            stop();
        });

        it("queues a bookmark added, edited and removed", () => {
            const stop = startSyncTracker("u1", vi.fn());
            const bookmark = { id: "2:255", surahId: 2, surahName: "Al-Baqarah", verseId: 255, verseText: "x" };
            set(STORAGE_KEYS.QURAN_BOOKMARKS, [bookmark]);
            set(STORAGE_KEYS.QURAN_BOOKMARKS, [{ ...bookmark, note: "hafalan" }]);
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(1);
            expect(syncQueue.getPendingEntries("u1")[0]).toMatchObject({ action: "create", data: { note: "hafalan" } });
            syncQueue.getQueue().forEach((entry) => syncQueue.acknowledge([entry.id]));

            set(STORAGE_KEYS.QURAN_BOOKMARKS, []);
            expect(syncQueue.getPendingEntries("u1")[0]).toMatchObject({ action: "delete", data: { surahId: 2, verseId: 255 } });
            stop();
        });

        it("tells the engine when something was queued, so it can schedule a send", () => {
            const onQueued = vi.fn();
            const stop = startSyncTracker("u1", onQueued);
            set(STORAGE_KEYS.SETTINGS_THEME, "midnight");
            expect(onQueued).toHaveBeenCalledTimes(1);
            expect(syncQueue.getPendingEntries("u1")[0]).toMatchObject({ type: "setting", data: { theme: "midnight" } });
            stop();
        });
    });

    describe("drain", () => {
        it("sends only the changes, removes what the server accepted and keeps what it refused", async () => {
            const a = syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
            const b = syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 2 }, "u1");
            vi.mocked(fetch).mockResolvedValueOnce(json({ synced: [{ id: a }], failed: [{ id: b, error: "bad" }] }));
            vi.mocked(fetch).mockResolvedValue(json({ synced: [], failed: [{ id: b, error: "bad" }] }));

            const result = await drainSyncQueue("u1");

            const sent = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
            expect(sent.entries.map((entry: { id: string }) => entry.id).sort()).toEqual([a, b].sort());
            expect(syncQueue.getQueue().map((entry) => entry.id)).toEqual([b]);
            expect(result.ok).toBe(false); // b is still waiting
        });

        it("leaves everything queued when the request does not get through", async () => {
            syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
            vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));

            const result = await drainSyncQueue("u1");

            expect(result.ok).toBe(false);
            expect(syncQueue.getPendingEntries("u1")).toHaveLength(1);
        });

        it("sends in batches of 50 and makes no request when the queue is empty", async () => {
            expect(await drainSyncQueue("u1")).toMatchObject({ ok: true, sent: 0 });
            expect(fetch).not.toHaveBeenCalled();

            for (let i = 1; i <= 120; i++) syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: i }, "u1");
            vi.mocked(fetch).mockImplementation(async (_url, init) => {
                const entries = JSON.parse(init?.body as string).entries as Array<{ id: string }>;
                return json({ synced: entries.map((entry) => ({ id: entry.id })), failed: [] });
            });

            const result = await drainSyncQueue("u1");

            expect(vi.mocked(fetch).mock.calls.map((call) => JSON.parse(call[1]?.body as string).entries.length)).toEqual([50, 50, 20]);
            expect(result).toMatchObject({ ok: true, sent: 120 });
        });

        it("runs one drain at a time", async () => {
            syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
            vi.mocked(fetch).mockImplementation(async (_url, init) => {
                const entries = JSON.parse(init?.body as string).entries as Array<{ id: string }>;
                return json({ synced: entries.map((entry) => ({ id: entry.id })), failed: [] });
            });

            await Promise.all([drainSyncQueue("u1"), drainSyncQueue("u1"), drainSyncQueue("u1")]);

            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it("does not claim everything is sent while an entry has failed for good", async () => {
            const id = syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
            for (let attempt = 0; attempt <= 5; attempt++) syncQueue.recordFailure(id, "refused");

            expect(await drainSyncQueue("u1")).toMatchObject({ ok: false, sent: 0 });
            expect(fetch).not.toHaveBeenCalled();
        });

        it("never sends another account's changes", async () => {
            syncQueue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "alice");
            await drainSyncQueue("bob");
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe("pull", () => {
        it("brings in a mission another device completed and removes one it undid", async () => {
            store.values.set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "asr_prayer", completedAt: today, hasanahEarned: 75 }]);
            vi.mocked(fetch).mockResolvedValue(json({ missions: [{ missionId: "fajr_prayer", completedDate: today, hasanahEarned: 75 }] }));

            await pullAndApply("u1", ["missions"]);

            expect(storage().get(STORAGE_KEYS.COMPLETED_MISSIONS)).toEqual([{ id: "fajr_prayer", completedAt: today, hasanahEarned: 75 }]);
        });

        it("does not overwrite points while changes are still waiting to be sent", async () => {
            store.values.set(STORAGE_KEYS.USER_HASANAH, "500");
            syncQueue.addToQueue("hasanah_event", "create", { kind: "taraweh", key: "1447-5", amount: 15, localDate: today }, "u1");
            vi.mocked(fetch).mockResolvedValue(json({ progression: { hasanah: 485, streak: { currentDays: 1 } } }));

            await pullAndApply("u1", ["progress"]);
            expect(storage().get(STORAGE_KEYS.USER_HASANAH)).toBe("500");

            syncQueue.clearAll();
            await pullAndApply("u1", ["progress"]);
            expect(storage().get(STORAGE_KEYS.USER_HASANAH)).toBe("485");
        });

        it("writes server data without queueing it as the user's own change", async () => {
            const stop = startSyncTracker("u1", vi.fn());
            vi.mocked(fetch).mockResolvedValue(json({ missions: [{ missionId: "fajr_prayer", completedDate: today, hasanahEarned: 75 }] }));

            await pullAndApply("u1", ["missions"]);

            expect(syncQueue.getPendingEntries("u1")).toHaveLength(0);
            stop();
        });

        it("reports false and changes nothing when the server cannot be reached", async () => {
            store.values.set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "asr_prayer", completedAt: today, hasanahEarned: 75 }]);
            vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));
            expect(await pullAndApply("u1", ["missions"])).toBe(false);
            expect(storage().get(STORAGE_KEYS.COMPLETED_MISSIONS)).toHaveLength(1);
        });
    });

    describe("award", () => {
        it("queues an event for a signed-in account and nothing for a guest", () => {
            queueHasanahEvent("taraweh", "1447-5", 15);
            expect(syncQueue.getQueue()).toHaveLength(0);

            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_USER_ID, "u1");
            queueHasanahEvent("taraweh", "1447-5", 15);
            expect(syncQueue.getPendingEntries("u1")[0]).toMatchObject({ type: "hasanah_event", data: { kind: "taraweh", key: "1447-5", amount: 15, localDate: today } });
        });
    });
});
