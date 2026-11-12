import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";
import { getSyncUserId } from "./award";
import { claimGuestIntentions } from "./claim";
import { pullAndApply, pullBookmarksIfChanged } from "./pull";
import { seedQueueFromLocal, startSyncTracker } from "./tracker";

/** Wait this long after the last change before sending, so a burst of taps is one request. */
const SEND_DELAY_MS = 2000;
/** But never wait longer than this while changes keep coming (continuous dhikr counting). */
const SEND_MAX_WAIT_MS = 15000;
/** Do not ask the server for other devices' changes more often than this. */
const PULL_INTERVAL_MS = 60000;
/** A forced pull (login, reconnect) still waits this long after the last one: a flapping connection fires many "online" events. */
const FORCED_PULL_GAP_MS = 5000;

interface EngineOptions {
    userId: string;
    /** Sends the queue and refreshes points. Provided by the caller so the engine does not depend on React. */
    sync: () => Promise<{ success: boolean }>;
}

/**
 * The sync engine: queue every change as it happens, send it soon after, and pick up other devices' changes
 * when the app comes back into view or the connection returns. Returns a function that stops it.
 *
 * It lives in its own module so it can be loaded after the first paint (see DataSyncer).
 */
export function startSyncEngine({ userId, sync }: EngineOptions): () => void {
    const storage = getStorageService();
    let stopTracker: (() => void) | null = null;
    let sendTimer: ReturnType<typeof setTimeout> | undefined;
    let firstQueuedAt = 0;
    let lastPullAt = 0;
    let pulling = false;
    let cancelled = false;

    const send = () => {
        clearTimeout(sendTimer);
        firstQueuedAt = 0;
        // Nothing queued means nothing to send: skip the work and the re-render.
        if (syncQueue.getPendingEntries(userId).length > 0) void sync();
    };

    const scheduleSend = () => {
        const now = Date.now();
        if (!firstQueuedAt) firstQueuedAt = now;
        clearTimeout(sendTimer);
        // Trailing debounce with a ceiling: the timer restarts on each change but never past the max wait.
        sendTimer = setTimeout(send, Math.max(0, Math.min(SEND_DELAY_MS, firstQueuedAt + SEND_MAX_WAIT_MS - now)));
    };

    const onQueued = () => {
        // Remember when unsynced work began, so the user can be warned before it ages out.
        if (!storage.getOptional(STORAGE_KEYS.UNSYNCED_SINCE)) storage.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now());
        scheduleSend();
    };

    const pullIfDue = async (force = false) => {
        if (pulling || document.visibilityState !== "visible" || !navigator.onLine) return;
        if (Date.now() - lastPullAt < (force ? FORCED_PULL_GAP_MS : PULL_INTERVAL_MS)) return;
        pulling = true;
        lastPullAt = Date.now();
        try {
            // Send our own changes first, so the server's answer already includes them.
            const sent = await sync();
            // An entry that failed for good keeps `success` false, but it cannot be sent again, and a pull never
            // overwrites it. Only something still waiting to be sent should hold the pull back.
            if (!sent.success && syncQueue.getPendingEntries(userId).length > 0) return;
            await pullAndApply(userId, ["progress", "missions", "activity", "profile", "fasting"]);
            await pullBookmarksIfChanged(userId);
        } finally {
            pulling = false;
        }
    };

    const start = () => {
        if (cancelled || stopTracker || getSyncUserId() !== userId) return;
        window.removeEventListener("sync_login_settled", start);
        // Entries saved for another account on this device are never sent for this one.
        syncQueue.discardOtherAccounts(userId);
        seedQueueFromLocal(userId);
        stopTracker = startSyncTracker(userId, onQueued);
        if (syncQueue.getPendingEntries(userId).length > 0) onQueued();
        void claimGuestIntentions(userId);
        void pullIfDue(true);
    };

    // GuestSyncManager decides hydrate-or-import at login; the engine starts once it has finished. It sets
    // the signed-in id before it announces that, so a late-loading engine still finds it already set.
    if (getSyncUserId() === userId) start();
    else window.addEventListener("sync_login_settled", start); // stays until it starts: a failed attempt announces too

    const onVisible = () => { if (document.visibilityState === "visible") { send(); void pullIfDue(); } };
    const onOnline = () => { send(); void pullIfDue(true); };
    window.addEventListener("sync_queue_changed", onQueued);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
        cancelled = true;
        clearTimeout(sendTimer);
        stopTracker?.();
        window.removeEventListener("sync_login_settled", start);
        window.removeEventListener("sync_queue_changed", onQueued);
        window.removeEventListener("online", onOnline);
        document.removeEventListener("visibilitychange", onVisible);
    };
}
