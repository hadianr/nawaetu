/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import { SyncQueueManager, entityKey } from "./sync-queue";

const KEY = "test_queue";
const mission = (id: string, date: string, extra: Record<string, unknown> = {}) => ({ id, completedDate: date, completedAt: date, ...extra });

describe("SyncQueueManager", () => {
    let queue: SyncQueueManager;
    beforeEach(() => {
        localStorage.clear();
        queue = new SyncQueueManager(KEY);
    });

    it("keeps one entry per thing however often it changes", () => {
        for (let count = 1; count <= 500; count++) queue.addToQueue("daily_activity", "update", { date: "2026-11-11", tasbihCount: count }, "u1");

        const pending = queue.getPendingEntries("u1");
        expect(pending).toHaveLength(1);
        expect(pending[0].data).toMatchObject({ date: "2026-11-11", tasbihCount: 500 });
    });

    it("merges settings changed one by one into a single entry", () => {
        queue.addToQueue("setting", "update", { theme: "midnight" }, "u1");
        queue.addToQueue("setting", "update", { locale: "id" }, "u1");

        expect(queue.getPendingEntries("u1")).toHaveLength(1);
        expect(queue.getPendingEntries("u1")[0].data).toEqual({ theme: "midnight", locale: "id" });
    });

    it("cancels a mission that was done and undone before anything was sent", () => {
        queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-11"), "u1");
        const id = queue.addToQueue("mission", "delete", mission("fajr_prayer", "2026-11-11"), "u1");

        expect(id).toBe("");
        expect(queue.getPendingEntries("u1")).toHaveLength(0);
    });

    it("keeps the undo when the completion may already have reached the server", () => {
        const created = queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-11"), "u1");
        queue.recordAttempt([created]);
        queue.addToQueue("mission", "delete", mission("fajr_prayer", "2026-11-11"), "u1");

        const [entry] = queue.getPendingEntries("u1");
        expect(entry.action).toBe("delete");
    });

    it("turns an undo followed by a redo into a completion", () => {
        queue.addToQueue("mission", "delete", mission("fajr_prayer", "2026-11-11"), "u1");
        queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-11"), "u1");

        expect(queue.getPendingEntries("u1").map((entry) => entry.action)).toEqual(["create"]);
    });

    it("treats the same mission on different days as different things", () => {
        queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-10"), "u1");
        queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-11"), "u1");
        expect(queue.getPendingEntries("u1")).toHaveLength(2);
    });

    it("survives a reload", () => {
        queue.addToQueue("bookmark", "create", { surahId: 2, verseId: 255 }, "u1");
        const reloaded = new SyncQueueManager(KEY);
        expect(reloaded.getPendingEntries("u1")).toHaveLength(1);
    });

    it("sends nothing that belongs to another account, and can discard it", () => {
        queue.addToQueue("bookmark", "create", { surahId: 2, verseId: 255 }, "alice");
        queue.addToQueue("bookmark", "create", { surahId: 3, verseId: 1 }, "bob");

        expect(queue.nextBatch(50, "bob")).toHaveLength(1);
        expect(queue.discardOtherAccounts("bob")).toBe(1);
        expect(queue.getQueue()).toHaveLength(1);
    });

    it("never drops unsent work to make room, only entries that failed for good", () => {
        for (let i = 0; i < 1000; i++) queue.addToQueue("bookmark", "create", { surahId: 1, verseId: i + 1 }, "u1");
        const [first] = queue.getPendingEntries("u1");
        for (let attempt = 0; attempt <= 5; attempt++) queue.recordFailure(first.id, "boom");

        queue.addToQueue("bookmark", "create", { surahId: 2, verseId: 1 }, "u1");

        expect(queue.getQueue().some((entry) => entry.id === first.id)).toBe(false);
        expect(queue.getPendingEntries("u1")).toHaveLength(1000);
    });

    it("retries a refused entry a few times, then keeps it as failed", () => {
        const id = queue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
        for (let attempt = 0; attempt < 5; attempt++) queue.recordFailure(id, "nope");
        expect(queue.getPendingEntries("u1")).toHaveLength(1);
        queue.recordFailure(id, "nope");
        expect(queue.getPendingEntries("u1")).toHaveLength(0);
        expect(queue.getQueue()[0].status).toBe("failed");
    });

    it("reports what is waiting so a pull does not undo it", () => {
        queue.addToQueue("mission", "create", mission("fajr_prayer", "2026-11-11"), "u1");
        queue.addToQueue("mission", "delete", mission("asr_prayer", "2026-11-11"), "u1");
        const pending = queue.pendingKeys("u1");
        expect([...pending.upserts]).toEqual([entityKey("mission", mission("fajr_prayer", "2026-11-11"))]);
        expect(pending.deletes.size).toBe(1);
    });

    it("acknowledging removes only what the server accepted", () => {
        const a = queue.addToQueue("bookmark", "create", { surahId: 1, verseId: 1 }, "u1");
        queue.addToQueue("bookmark", "create", { surahId: 1, verseId: 2 }, "u1");
        queue.acknowledge([a]);
        expect(queue.getQueue()).toHaveLength(1);
    });
});
