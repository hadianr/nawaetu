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

export type SyncEntityType =
  | 'bookmark'
  | 'setting'
  | 'journal'
  | 'intention'
  | 'mission'
  | 'mission_progress'
  | 'daily_activity'
  | 'reading_state'
  | 'dhikr_stats'
  | 'ramadhan_fasting'
  | 'ramadhan_taraweh'
  | 'ramadhan_daily'
  | 'sirah_progress'
  | 'sirah_bookmark'
  | 'streak'
  | 'hasanah_event';

/**
 * Supported operation types
 */
export type SyncActionType = 'create' | 'update' | 'delete';

/**
 * Sync status states
 */
export type SyncStatus = 'pending' | 'synced' | 'failed';

/**
 * Single queue entry representing one pending change
 */
export interface SyncQueueEntry {
  /** Unique identifier for this entry */
  id: string;

  /** Type of entity being synced */
  type: SyncEntityType;

  /** Operation being performed */
  action: SyncActionType;

  /** Actual data to sync */
  data: Record<string, unknown>;

  /** Current status of this entry */
  status: SyncStatus;

  /** Number of sync attempts */
  retryCount: number;

  /** When this entry was created (Unix timestamp) */
  createdAt: number;

  /** Bumped each time a newer change is merged into this entry, so an acknowledgement of an older version can be told apart. */
  rev?: number;

  /** Last sync attempt timestamp (optional) */
  lastAttemptAt?: number;

  /** Error message if status is 'failed' (optional) */
  error?: string;

  /** The thing this entry changes. A newer entry for the same thing replaces an older unsent one. */
  key?: string;

  /** Account the change belongs to; an entry is never sent for a different account. */
  userId?: string;
}

/**
 * Sync outbox for the offline-first app: every change that still has to reach the server.
 *
 * - Changes to the same thing collapse into one entry, so the queue stays small however often something
 *   changes (a dhikr count tapped 500 times is one entry) and a request carries only what changed.
 * - It is saved to localStorage, so a closed tab or a reload cannot lose a change.
 * - Nothing is dropped silently: a full queue only discards entries that already failed for good.
 */

import { normalizeMissionId } from '@/lib/mission-resolver';
import { DateUtils } from '@/lib/utils/date';

const STORAGE_KEY = 'nawaetu_sync_queue';
const MAX_QUEUE_SIZE = 1000;
const MAX_RETRY_COUNT = 5;

/** What an entry changes, so a newer change can replace an older unsent one. */
export function entityKey(type: SyncEntityType, data: Record<string, unknown>): string {
  const str = (value: unknown) => (value === undefined || value === null ? '' : String(value));
  switch (type) {
    case 'mission':
    case 'mission_progress': {
      const date = typeof data.completedDate === 'string' && data.completedDate
        ? data.completedDate
        : data.completedAt ? DateUtils.toLocalDate(str(data.completedAt)) : '';
      return `m:${normalizeMissionId(str(data.id ?? data.missionId))}:${date}`;
    }
    case 'bookmark': return `b:${str(data.key) || `${str(data.surahId)}:${str(data.verseId)}`}`;
    case 'daily_activity': return `a:${str(data.date)}`;
    case 'dhikr_stats': return 'dhikr_stats';
    case 'setting': return 'setting';
    case 'reading_state': return 'reading';
    case 'hasanah_event': return `h:${str(data.kind)}:${str(data.key)}:${str(data.localDate)}`;
    case 'sirah_progress': return `sp:${str(data.sectionId ?? data.id)}`;
    case 'sirah_bookmark': return `sb:${str(data.sectionId ?? data.id)}`;
    case 'ramadhan_taraweh': return `rt:${str(data.hijriYear)}-${str(data.hijriDay)}`;
    case 'ramadhan_daily': return `rd:${str(data.hijriYear)}-${str(data.hijriDay)}`;
    case 'ramadhan_fasting': return `rf:${str(data.hijriYear)}-${str(data.hijriDay)}`;
    default: return `${type}:${crypto.randomUUID()}`;
  }
}

export class SyncQueueManager {
  private queue: SyncQueueEntry[] = [];

  constructor(private readonly storageKey: string = STORAGE_KEY) {
    this.load();
  }

  private load(): void {
    try {
      if (typeof window === 'undefined') return;
      const stored = window.localStorage?.getItem(this.storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      this.queue = Array.isArray(parsed)
        ? parsed.filter((entry): entry is SyncQueueEntry => Boolean(entry && typeof entry.id === 'string' && entry.type && entry.data))
        : [];
      // Entries saved by an older version have no key; give them one so they can be replaced.
      for (const entry of this.queue) entry.key ??= entityKey(entry.type, entry.data);
    } catch {
      this.queue = [];
    }
  }

  private persist(): void {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage?.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch {
      // Storage full or blocked: the in-memory queue still works for this session.
    }
  }

  /** Adds a change. Returns the id of the entry that now represents it (empty when it cancelled out). */
  addToQueue(type: SyncEntityType, action: SyncActionType, data: Record<string, unknown>, userId?: string): string {
    if (!type || !action || !data) {
      throw new Error('[SyncQueue] Missing required parameters: type, action, data');
    }
    const id = this.apply(type, action, data, userId);
    this.persist();
    return id;
  }

  /** Adds several changes with one write to storage. */
  addMany(changes: Array<{ type: SyncEntityType; action: SyncActionType; data: Record<string, unknown> }>, userId?: string): void {
    for (const change of changes) this.apply(change.type, change.action, change.data, userId);
    this.persist();
  }

  private apply(type: SyncEntityType, action: SyncActionType, data: Record<string, unknown>, userId?: string): string {
    const key = entityKey(type, data);
    const index = this.queue.findIndex((entry) => entry.key === key && entry.status !== 'synced' && entry.userId === userId);

    if (index !== -1) {
      const older = this.queue[index];
      // Created and removed again before anything was sent: nothing ever reached the server.
      if (older.action === 'create' && action === 'delete' && older.lastAttemptAt === undefined) {
        this.queue.splice(index, 1);
        return '';
      }
      // Otherwise the newest change wins; "create" then "update" stays a create with the latest data.
      older.data = action === 'delete' ? data : { ...older.data, ...data };
      older.action = action === 'update' && older.action === 'create' ? 'create' : action;
      older.status = 'pending';
      older.retryCount = 0;
      older.error = undefined;
      older.createdAt = Date.now();
      older.rev = (older.rev ?? 0) + 1;
      return older.id;
    }

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Make room only by dropping what already failed for good, never unsent work.
      const failed = this.queue.findIndex((entry) => entry.status === 'failed');
      if (failed !== -1) this.queue.splice(failed, 1);
    }

    const entry: SyncQueueEntry = {
      id: crypto.randomUUID(),
      type,
      action,
      data,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
      key,
      userId,
    };
    this.queue.push(entry);
    return entry.id;
  }

  getQueue(): SyncQueueEntry[] {
    return [...this.queue];
  }

  getPendingEntries(userId?: string): SyncQueueEntry[] {
    // An entry without an owner was saved by an older version; it belongs to whoever is signed in.
    return this.queue.filter((entry) => entry.status === 'pending'
      && (userId === undefined || entry.userId === undefined || entry.userId === userId));
  }

  /** The next entries to send for this account, oldest first. */
  nextBatch(limit: number, userId?: string): SyncQueueEntry[] {
    return this.getPendingEntries(userId).slice(0, limit);
  }

  /** What is waiting, by entity key, so a pull from the server does not undo an unsent change. */
  pendingKeys(userId?: string): { upserts: Set<string>; deletes: Set<string> } {
    const upserts = new Set<string>();
    const deletes = new Set<string>();
    // An entry that failed for good is still a change the server does not have: a pull must not undo it.
    const unsent = this.queue.filter((entry) => entry.status !== 'synced'
      && (userId === undefined || entry.userId === undefined || entry.userId === userId));
    for (const entry of unsent) {
      (entry.action === 'delete' ? deletes : upserts).add(entry.key as string);
    }
    return { upserts, deletes };
  }

  /** Entries that were refused too many times and are no longer retried. They still hold unsent data. */
  getFailedEntries(userId?: string): SyncQueueEntry[] {
    return this.queue.filter((entry) => entry.status === 'failed'
      && (userId === undefined || entry.userId === undefined || entry.userId === userId));
  }

  /**
   * Entries the server accepted leave the queue. `sentRevs` is what was sent (id -> rev): an entry that
   * was changed again while the request was on its way stays, because the server has only the older version.
   */
  acknowledge(ids: string[], sentRevs?: Map<string, number>): void {
    if (ids.length === 0) return;
    const accepted = new Set(ids);
    this.queue = this.queue.filter((entry) => !accepted.has(entry.id) || (sentRevs !== undefined && (entry.rev ?? 0) !== (sentRevs.get(entry.id) ?? 0)));
    this.persist();
  }

  /** The server refused an entry: retry a few times, then keep it as failed for inspection. */
  recordFailure(id: string, error: string): void {
    const entry = this.queue.find((item) => item.id === id);
    if (!entry) return;
    entry.retryCount++;
    entry.lastAttemptAt = Date.now();
    entry.error = error;
    if (entry.retryCount > MAX_RETRY_COUNT) entry.status = 'failed';
    this.persist();
  }

  /** The request itself did not get through (offline): leave the entries pending. */
  recordAttempt(ids: string[]): void {
    const attempted = new Set(ids);
    for (const entry of this.queue) {
      if (attempted.has(entry.id)) entry.lastAttemptAt = Date.now();
    }
    this.persist();
  }

  /** Removes every entry that belongs to another account (called when the signed-in account changes). */
  discardOtherAccounts(userId: string): number {
    const before = this.queue.length;
    this.queue = this.queue.filter((entry) => entry.userId === undefined || entry.userId === userId);
    if (this.queue.length !== before) this.persist();
    return before - this.queue.length;
  }

  clearAll(): void {
    this.queue = [];
    this.persist();
  }
}

export const syncQueue = new SyncQueueManager();
