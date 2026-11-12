/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";
import { performLogout, type LogoutDeps } from "./logout";

// The real storage layer and the real queue are used on purpose: the point is what is left on the device.
const storage = getStorageService();

function setup(overrides: Partial<LogoutDeps> = {}) {
    const order: string[] = [];
    const deletedCaches: string[] = [];
    const deps: LogoutDeps = {
        sync: vi.fn(async () => { order.push("sync"); return { success: true }; }),
        unsyncedMessage: "Some activity has not synced. Log out anyway?",
        storage,
        resetInfaq: vi.fn(() => { order.push("resetInfaq"); }),
        signOut: vi.fn(async () => { order.push("signOut"); }),
        confirm: vi.fn(() => true),
        fetchFn: vi.fn(async (url: RequestInfo | URL) => { order.push(`fetch:${String(url).split("?")[0]}`); return { ok: true } as Response; }) as unknown as typeof fetch,
        rotatePushToken: vi.fn(async () => { order.push("rotate"); return true; }),
        caches: { delete: vi.fn(async (name: string) => { deletedCaches.push(name); order.push(`cache:${name}`); return true; }) } as unknown as CacheStorage,
        ...overrides,
    };
    return { deps, order, deletedCaches };
}

describe("performLogout", () => {
    beforeEach(() => {
        localStorage.clear();
        syncQueue.clearAll();
        storage.set(STORAGE_KEYS.USER_NAME, "Aisyah");
        storage.set(STORAGE_KEYS.USER_HASANAH, "1250");
        storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, [{ id: "fajr_prayer", completedAt: "2026-11-11", hasanahEarned: 75 }]);
        storage.set(STORAGE_KEYS.IS_MUHSININ, "true");
        storage.set(STORAGE_KEYS.RAMADHAN_FASTING_PENDING, ["1447-5"]);
        syncQueue.addToQueue("mission", "create", { id: "asr_prayer", completedDate: "2026-11-11" }, "u1");
        localStorage.setItem("fcm_token", "device-token");
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_USER_ID, "u1");
    });

    it("sends first, releases the push subscription while the session exists, clears the account, then signs out", async () => {
        const { deps, order } = setup();

        expect(await performLogout(deps)).toBe("signed_out");

        expect(order).toEqual([
            "sync",
            "fetch:/api/notifications/subscribe",
            "rotate",
            "resetInfaq",
            "cache:apis", "cache:next-data", "cache:pages-rsc",
            "signOut",
        ]);
        // The token travels in a header, never in the URL.
        expect(deps.fetchFn).toHaveBeenCalledWith("/api/notifications/subscribe", { method: "DELETE", headers: { "x-device-token": "device-token" } });
        expect(deps.signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    });

    it("leaves nothing of the account on the device, queue and premium status included", async () => {
        const { deps } = setup();
        await performLogout(deps);

        for (const key of [STORAGE_KEYS.USER_NAME, STORAGE_KEYS.USER_HASANAH, STORAGE_KEYS.COMPLETED_MISSIONS, STORAGE_KEYS.IS_MUHSININ, STORAGE_KEYS.RAMADHAN_FASTING_PENDING]) {
            expect(storage.getOptional(key), key).toBeNull();
        }
        expect(syncQueue.getQueue()).toHaveLength(0);
        // Retiring the token is the push layer's job (stubbed here), so only the device's own bookkeeping is checked.
        expect(deps.rotatePushToken).toHaveBeenCalledTimes(1);
    });

    it("does not ask anything when everything was sent", async () => {
        const { deps } = setup();
        await performLogout(deps);
        expect(deps.confirm).not.toHaveBeenCalled();
    });

    it("stops with NOTHING changed when something could not be sent and the user says no", async () => {
        const { deps } = setup({ sync: vi.fn(async () => ({ success: false })), confirm: vi.fn(() => false) });

        expect(await performLogout(deps)).toBe("cancelled");

        expect(deps.confirm).toHaveBeenCalledWith("Some activity has not synced. Log out anyway?");
        expect(deps.signOut).not.toHaveBeenCalled();
        expect(deps.fetchFn).not.toHaveBeenCalled();
        expect(deps.resetInfaq).not.toHaveBeenCalled();
        expect(Number(storage.getOptional(STORAGE_KEYS.USER_HASANAH))).toBe(1250);
        expect(syncQueue.getQueue()).toHaveLength(1); // the unsent change is still there
    });

    it("goes on when the user accepts losing what could not be sent", async () => {
        const { deps } = setup({ sync: vi.fn(async () => ({ success: false })), confirm: vi.fn(() => true) });

        expect(await performLogout(deps)).toBe("signed_out");
        expect(syncQueue.getQueue()).toHaveLength(0);
        expect(deps.signOut).toHaveBeenCalledTimes(1);
    });

    it("signs out even when releasing the subscription or clearing a cache fails", async () => {
        const { deps } = setup({
            fetchFn: vi.fn(async () => { throw new TypeError("offline"); }) as unknown as typeof fetch,
            caches: { delete: vi.fn(async () => { throw new Error("blocked"); }) } as unknown as CacheStorage,
        });

        expect(await performLogout(deps)).toBe("signed_out");
        expect(deps.signOut).toHaveBeenCalledTimes(1);
        expect(storage.getOptional(STORAGE_KEYS.USER_NAME)).toBeNull();
    });

    it("signs out even when retiring the push token fails", async () => {
        const { deps } = setup({ rotatePushToken: vi.fn(async () => { throw new Error("offline"); }) });
        expect(await performLogout(deps)).toBe("signed_out");
        expect(deps.signOut).toHaveBeenCalledTimes(1);
    });

    it("skips the subscription call when the device has no push token", async () => {
        localStorage.removeItem("fcm_token");
        const { deps } = setup();
        await performLogout(deps);
        expect(deps.fetchFn).not.toHaveBeenCalled();
        expect(deps.rotatePushToken).not.toHaveBeenCalled();
    });

    it("does not retire the token when the user backs out", async () => {
        const { deps } = setup({ sync: vi.fn(async () => ({ success: false })), confirm: vi.fn(() => false) });
        await performLogout(deps);
        expect(deps.rotatePushToken).not.toHaveBeenCalled();
    });
});
