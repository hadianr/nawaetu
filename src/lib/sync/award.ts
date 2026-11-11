import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DateUtils } from "@/lib/utils/date";
import { syncQueue, type SyncActionType, type SyncEntityType } from "@/lib/sync-queue";

/** The signed-in account this device syncs for, or null for a guest. Set once the login has been settled. */
export function getSyncUserId(): string | null {
    try {
        // Strings are stored as they are, so a direct read is the same value without the storage layer.
        return typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEYS.LAST_SYNC_USER_ID) || null;
    } catch {
        return null;
    }
}

/**
 * Queues a change for the signed-in account and asks the engine to send it soon. Unlike a fire-and-forget
 * request, it survives being offline or closing the tab. Guests have no account to send to.
 */
export function queueSyncEntry(type: SyncEntityType, action: SyncActionType, data: Record<string, unknown>): void {
    const userId = getSyncUserId();
    if (!userId) return;
    syncQueue.addToQueue(type, action, data, userId);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("sync_queue_changed"));
}

export type HasanahEventKind =
    | "taraweh" | "fasting" | "lailatul" | "khatamah" | "sirah_quiz"
    | "reflection" | "dhikr_completion" | "dhikr_milestone" | "quran_time" | "streak_milestone";

/**
 * Tells the server about points earned outside the missions list. The local total is already updated by
 * addHasanah; this makes the server count it too, so the next refresh does not take it away. Guests have
 * no server account, so nothing is queued for them.
 */
export function queueHasanahEvent(kind: HasanahEventKind, key: string, amount: number, localDate: string = DateUtils.today()): void {
    if (!(amount >= 0)) return;
    queueSyncEntry("hasanah_event", "create", { kind, key, amount, localDate, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
}

/** A dhikr set can be completed several times a day; each completion is its own award, counted per day. */
export function nextDhikrCompletionKey(date: string = DateUtils.today()): string {
    try {
        const key = `nawaetu_dhikr_completions_${date}`;
        const count = (parseInt(localStorage.getItem(key) || "0", 10) || 0) + 1;
        localStorage.setItem(key, String(count));
        return String(Math.min(count, 20));
    } catch {
        return "1";
    }
}
