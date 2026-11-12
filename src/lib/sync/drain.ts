import { syncQueue } from "@/lib/sync-queue";

/** Entries per request: small enough to finish well inside the server's time limit. */
const BATCH_SIZE = 50;

export interface DrainResult {
    /** True when nothing for this account is left waiting. */
    ok: boolean;
    sent: number;
    /** Records the server refused because they are outside the sync window; they stay on the device. */
    rejected: number;
}

interface SyncResponse {
    synced?: Array<{ id: string }>;
    failed?: Array<{ id: string; error: string }>;
    rejected?: number;
}

let inFlight: Promise<DrainResult> | null = null;

/**
 * Sends what is waiting in the queue, a batch at a time. Only one drain runs at a time: a second caller
 * gets the same promise, so a burst of changes cannot start overlapping uploads of the same entries.
 */
export function drainSyncQueue(userId: string): Promise<DrainResult> {
    if (!inFlight) {
        inFlight = run(userId).finally(() => { inFlight = null; });
    }
    return inFlight;
}

async function run(userId: string): Promise<DrainResult> {
    let sent = 0;
    let rejected = 0;

    for (;;) {
        const batch = syncQueue.nextBatch(BATCH_SIZE, userId);
        // Entries that failed for good are not retried, but they are not on the server either, so the
        // account is not "all sent": logout asks before discarding them and the unsynced warning stays.
        if (batch.length === 0) return { ok: syncQueue.getFailedEntries(userId).length === 0, sent, rejected };
        const ids = batch.map((entry) => entry.id);
        // The batch holds the queue's own objects, so remember which version of each one is being sent.
        const sentRevs = new Map(batch.map((entry) => [entry.id, entry.rev ?? 0]));
        // From here the server may have it: an undo made meanwhile must be sent, not cancelled against it.
        syncQueue.recordAttempt(ids);

        let body: SyncResponse | null = null;
        try {
            const response = await fetch("/api/user/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entries: batch.map(({ id, type, action, data }) => ({ id, type, action, data })) }),
            });
            if (response.ok) body = await response.json();
        } catch {
            // Offline or the request died: the entries stay queued and the next trigger retries them.
        }

        if (!body) {
            return { ok: false, sent, rejected };
        }

        const accepted = (body.synced ?? []).map((item) => item.id);
        syncQueue.acknowledge(accepted, sentRevs);
        for (const failure of body.failed ?? []) syncQueue.recordFailure(failure.id, failure.error);
        sent += accepted.length;
        rejected += body.rejected ?? 0;

        // Nothing got through: stop instead of resending the same refused entries in a tight loop.
        if (accepted.length === 0) return { ok: false, sent, rejected };
    }
}
