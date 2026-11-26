import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const h = vi.hoisted(() => ({
    values: new Map<string, unknown>(),
    userId: "u1" as string | null,
    addMany: vi.fn(),
}));

vi.mock("@/core/infrastructure/storage", () => ({
    getStorageService: () => ({
        getOptional: (key: string) => h.values.get(key) ?? null,
        set: (key: string, value: unknown) => h.values.set(key, value),
    }),
}));
vi.mock("@/lib/sync-queue", () => ({ syncQueue: { addMany: h.addMany } }));
vi.mock("./award", () => ({ getSyncUserId: () => h.userId }));

import { reconcileExcusedDays } from "./excused";

const now = new Date("2026-11-26T10:00:00");
const setPeriod = (startedAt: string, endedAt: string | null) => h.values.set(STORAGE_KEYS.UDZUR_PERIODS, [{
    id: "p1", kind: "haid", startedAt: new Date(startedAt).toISOString(), endedAt: endedAt ? new Date(endedAt).toISOString() : null,
}]);
const queued = () => h.addMany.mock.calls.flatMap(([changes]) => changes as Array<{ action: string; data: { localDate: string } }>)
    .map((change) => `${change.action}:${change.data.localDate}`);

describe("reconcileExcusedDays", () => {
    beforeEach(() => {
        h.values.clear();
        h.userId = "u1";
        h.addMany.mockClear();
        vi.stubGlobal("window", new EventTarget());
    });

    it("queues each excused date once, and today's on a later day", () => {
        setPeriod("2026-11-24T08:00:00", null);
        reconcileExcusedDays(now);
        expect(queued()).toEqual(["create:2026-11-24", "create:2026-11-25", "create:2026-11-26"]);
        expect(h.addMany.mock.calls[0][1]).toBe("u1");

        h.addMany.mockClear();
        reconcileExcusedDays(now);
        expect(h.addMany).not.toHaveBeenCalled();

        reconcileExcusedDays(new Date("2026-11-27T09:00:00"));
        expect(queued()).toEqual(["create:2026-11-27"]);
    });

    it("removes only the dates this device queued, when a period is shortened", () => {
        setPeriod("2026-11-24T08:00:00", null);
        reconcileExcusedDays(now);
        h.addMany.mockClear();

        setPeriod("2026-11-25T08:00:00", null);
        reconcileExcusedDays(now);
        expect(queued()).toEqual(["delete:2026-11-24"]);
    });

    it("queues nothing for a guest, and everything again for another account", () => {
        setPeriod("2026-11-26T08:00:00", null);
        h.userId = null;
        reconcileExcusedDays(now);
        expect(h.addMany).not.toHaveBeenCalled();

        h.userId = "u1";
        reconcileExcusedDays(now);
        h.userId = "u2";
        reconcileExcusedDays(now);
        expect(h.addMany.mock.calls.map(([, userId]) => userId)).toEqual(["u1", "u2"]);
    });
});
