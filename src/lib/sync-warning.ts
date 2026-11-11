/** Sync accepts activity up to 30 days old, so warn a week before it would stop being accepted. */
export const SYNC_NOTICE_DAYS = 7;
export const SYNC_URGENT_DAYS = 23;
export const SYNC_LIMIT_DAYS = 30;

export type SyncWarning = { level: 0 | 1 | 2; ageDays: number; daysLeft: number };

/** 0 = nothing to say, 1 = unsynced for a week, 2 = close to the 30-day limit. */
export function getSyncWarning(unsyncedSince: unknown, now: number = Date.now()): SyncWarning {
    const since = Number(unsyncedSince);
    if (!Number.isFinite(since) || since <= 0 || since > now) return { level: 0, ageDays: 0, daysLeft: SYNC_LIMIT_DAYS };
    const ageDays = Math.floor((now - since) / 86_400_000);
    const level = ageDays >= SYNC_URGENT_DAYS ? 2 : ageDays >= SYNC_NOTICE_DAYS ? 1 : 0;
    return { level, ageDays, daysLeft: Math.max(0, SYNC_LIMIT_DAYS - ageDays) };
}
