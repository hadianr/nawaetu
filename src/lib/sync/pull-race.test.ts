/** @vitest-environment jsdom */
// A pull and a send can overlap: the answer to the pull was computed before a change that was sent while it was on the way.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";
import { DateUtils } from "@/lib/utils/date";

vi.mock("@/core/repositories/activity.repository", () => ({ resetActivityRepository: vi.fn() }));

import { pullAndApply } from "./pull";

const storage = getStorageService();
const today = DateUtils.today();
const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response;

describe("a pull that overlaps a send", () => {
    beforeEach(() => {
        localStorage.clear();
        syncQueue.clearAll();
        vi.stubGlobal("fetch", vi.fn());
    });

    function deferredPull(answer: unknown) {
        let release!: () => void;
        vi.mocked(fetch).mockImplementationOnce(() => new Promise<Response>((resolve) => { release = () => resolve(json(answer)); }));
        return () => release();
    }

    it("does not drop a mission that was completed and sent while the pull was in flight", async () => {
        const release = deferredPull({ missions: [] }); // the server's answer, computed before the completion
        const pulling = pullAndApply("u1", ["missions"]);

        const mission = { id: "fajr_prayer", completedAt: new Date().toISOString(), hasanahEarned: 75 };
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, [mission]);
        const id = syncQueue.addToQueue("mission", "create", { id: "fajr_prayer", completedDate: today, completedAt: mission.completedAt }, "u1");
        syncQueue.acknowledge([id]); // sent and accepted before the pull answer arrives

        release();
        await pulling;

        const left = storage.getOptional<Array<{ id: string }>>(STORAGE_KEYS.COMPLETED_MISSIONS) ?? [];
        expect(left.map((item) => item.id)).toEqual(["fajr_prayer"]);
    });

    it("does not bring back a mission that was undone and sent while the pull was in flight", async () => {
        const mission = { id: "fajr_prayer", completedAt: new Date().toISOString(), hasanahEarned: 75 };
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, [mission]);
        const release = deferredPull({ missions: [{ missionId: "fajr_prayer", completedDate: today, hasanahEarned: 75 }] });
        const pulling = pullAndApply("u1", ["missions"]);

        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, []);
        const id = syncQueue.addToQueue("mission", "delete", { id: "fajr_prayer", completedDate: today, completedAt: mission.completedAt }, "u1");
        syncQueue.recordAttempt([id]);
        syncQueue.acknowledge([id]);

        release();
        await pulling;

        expect(storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS)).toEqual([]);
    });

    it("does not lower the points total with an answer that predates a change sent meanwhile", async () => {
        storage.set(STORAGE_KEYS.USER_HASANAH, "1000");
        const release = deferredPull({ progression: { hasanah: 900, level: 1, streak: { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable: 0, days: [] } } });
        const pulling = pullAndApply("u1", ["progress"]);

        const id = syncQueue.addToQueue("hasanah_event", "create", { kind: "dhikr_completion", key: "1", localDate: today, amount: 50 }, "u1");
        syncQueue.acknowledge([id]);

        release();
        await pulling;

        expect(Number(storage.getOptional(STORAGE_KEYS.USER_HASANAH))).toBe(1000);
    });

    it("still applies what the server says when nothing was sent during the pull", async () => {
        const release = deferredPull({ missions: [{ missionId: "asr_prayer", completedDate: today, hasanahEarned: 75 }] });
        const pulling = pullAndApply("u1", ["missions"]);
        release();
        await pulling;
        expect((storage.getOptional<Array<{ id: string }>>(STORAGE_KEYS.COMPLETED_MISSIONS) ?? []).map((item) => item.id)).toEqual(["asr_prayer"]);
    });
});
