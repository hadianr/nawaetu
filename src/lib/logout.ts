import type { StorageService } from "@/core/infrastructure/storage";
import { clearAccountData } from "@/lib/account-data";

export interface LogoutDeps {
    /** Sends what is queued; resolves with whether everything reached the server. */
    sync: () => Promise<{ success: boolean }>;
    /** Shown when something could not be sent and the user must decide. */
    unsyncedMessage: string;
    storage: StorageService;
    resetInfaq: () => void;
    signOut: (options: { callbackUrl: string }) => Promise<unknown>;
    confirm?: (message: string) => boolean;
    fetchFn?: typeof fetch;
    caches?: CacheStorage;
    /** Retires the device's push token so the next account cannot inherit it. Loaded only when needed. */
    rotatePushToken?: () => Promise<unknown>;
}

/**
 * Logs out without losing unsent work and without leaving this account's data for the next person.
 *
 * Order matters:
 *  1. send what is queued, and ask before going on if some of it could not be sent;
 *  2. release the device's push subscription while the session still exists (the server checks it), then retire
 *     the token itself: the app registers a new one as a guest, so prayer alerts continue under a token that no
 *     account has ever held;
 *  3. clear everything that belongs to the account, then the cached API responses;
 *  4. sign out.
 * Declining the question stops at step 1 with nothing changed.
 */
export async function performLogout(deps: LogoutDeps): Promise<"cancelled" | "signed_out"> {
    const ask = deps.confirm ?? ((message: string) => window.confirm(message));
    const request = deps.fetchFn ?? fetch;
    const cacheStore = deps.caches ?? (typeof caches === "undefined" ? undefined : caches);

    const result = await deps.sync();
    if (!result.success && !ask(deps.unsyncedMessage)) return "cancelled";

    // The device keeps its prayer alerts as a guest, but no longer belongs to this account.
    const pushToken = localStorage.getItem("fcm_token");
    if (pushToken) {
        await request("/api/notifications/subscribe", { method: "DELETE", headers: { "x-device-token": pushToken } }).catch(() => undefined);
        // If this fails the device simply keeps its old token as a guest, as before.
        const rotate = deps.rotatePushToken ?? (() => import("@/lib/notifications/fcm-init").then((module) => module.rotatePushToken()));
        await rotate().catch(() => undefined);
    }

    clearAccountData(deps.storage);
    deps.resetInfaq();

    // Cached API responses (including the session) belong to this account.
    if (cacheStore) {
        await Promise.all(["apis", "next-data", "pages-rsc"].map((name) => cacheStore.delete(name).catch(() => false)));
    }

    await deps.signOut({ callbackUrl: "/" });
    return "signed_out";
}
