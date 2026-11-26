/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue, type SyncActionType } from "@/lib/sync-queue";
import { getExcusedDates, readUdzurPeriods } from "@/lib/udzur";
import { getSyncUserId } from "./award";

interface SyncedExcused {
    userId: string;
    dates: string[];
}

/**
 * Queues the udzur dates the server is missing and removes the ones this device no longer has (a period
 * shortened or deleted). Only dates this device queued itself are ever removed, so a second device without
 * the period cannot wipe it. An ongoing period gains a date every day, so this runs whenever the mode is
 * shown, not only when it changes. Guests have no account: nothing is queued until they sign in.
 */
export function reconcileExcusedDays(now: Date = new Date()): void {
    const userId = getSyncUserId();
    if (!userId) return;
    const storage = getStorageService();

    const desired = new Set(getExcusedDates(readUdzurPeriods(now), now));
    const stored = storage.getOptional<SyncedExcused>(STORAGE_KEYS.UDZUR_SYNCED);
    const synced = new Set(stored?.userId === userId && Array.isArray(stored.dates) ? stored.dates : []);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const changes: Array<{ type: "excused_day"; action: SyncActionType; data: Record<string, unknown> }> = [];
    for (const localDate of desired) {
        if (!synced.has(localDate)) changes.push({ type: "excused_day", action: "create", data: { localDate, timezone } });
    }
    for (const localDate of synced) {
        if (!desired.has(localDate)) changes.push({ type: "excused_day", action: "delete", data: { localDate, timezone } });
    }
    if (changes.length === 0) return;

    // The queue is kept on the device and retried, so what is queued counts as sent.
    syncQueue.addMany(changes, userId);
    storage.set(STORAGE_KEYS.UDZUR_SYNCED, { userId, dates: [...desired].sort() } satisfies SyncedExcused);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("sync_queue_changed"));
}
