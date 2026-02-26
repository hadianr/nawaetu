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

/**
 * Sync Queue Manager for Offline-First Architecture
 * Manages pending data changes that need to be synced to cloud
 * 
 * Best Practices Applied:
 * - Type-safe queue entries with strict validation
 * - localStorage persistence with error handling
 * - UUID-based tracking for reliability
 * - Retry count tracking for exponential backoff
 * - Status lifecycle: pending → synced/failed
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Supported entity types for syncing
 */
export type SyncEntityType = 'bookmark' | 'setting' | 'journal' | 'mission' | 'mission_progress' | 'daily_activity' | 'reading_state';

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
  data: Record<string, any>;

  /** Current status of this entry */
  status: SyncStatus;

  /** Number of sync attempts */
  retryCount: number;

  /** When this entry was created (Unix timestamp) */
  createdAt: number;

  /** Last sync attempt timestamp (optional) */
  lastAttemptAt?: number;

  /** Error message if status is 'failed' (optional) */
  error?: string;
}

/**
 * In-memory and persistent sync queue manager
 * Single instance pattern for app-wide use
 */
class SyncQueueManager {
  private static instance: SyncQueueManager;
  private readonly STORAGE_KEY = 'nawaetu_sync_queue';
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_RETRY_COUNT = 5;
  private queue: SyncQueueEntry[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SyncQueueManager {
    if (!SyncQueueManager.instance) {
      SyncQueueManager.instance = new SyncQueueManager();
    }
    return SyncQueueManager.instance;
  }

  /**
   * Load queue from localStorage on initialization
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      const stored = window.localStorage?.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      this.queue = [];
    }
  }

  /**
   * Persist queue to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      window.localStorage?.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
    }
  }

  /**
   * Add entry to sync queue
   * 
   * @param type - Entity type (bookmark, setting, etc.)
   * @param action - Operation type (create, update, delete)
   * @param data - Data to sync
   * @returns Queue entry ID
   */
  addToQueue(
    type: SyncEntityType,
    action: SyncActionType,
    data: Record<string, any>
  ): string {
    // Validation
    if (!type || !action || !data) {
      throw new Error('[SyncQueue] Missing required parameters: type, action, data');
    }

    // Check queue size limit
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    const entry: SyncQueueEntry = {
      id: uuidv4(),
      type,
      action,
      data,
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.queue.push(entry);
    this.saveToStorage();

    return entry.id;
  }

  /**
   * Get all entries from queue
   */
  getQueue(): SyncQueueEntry[] {
    return [...this.queue];
  }

  /**
   * Get all pending entries
   */
  getPendingEntries(): SyncQueueEntry[] {
    return this.queue.filter(entry => entry.status === 'pending');
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: SyncEntityType): SyncQueueEntry[] {
    return this.queue.filter(entry => entry.type === type);
  }

  /**
   * Get pending entries by type
   */
  getPendingByType(type: SyncEntityType): SyncQueueEntry[] {
    return this.queue.filter(
      entry => entry.status === 'pending' && entry.type === type
    );
  }

  /**
   * Get entry by ID
   */
  getEntryById(id: string): SyncQueueEntry | undefined {
    return this.queue.find(entry => entry.id === id);
  }

  /**
   * Mark entry as successfully synced
   */
  markAsSynced(id: string): void {
    const entry = this.queue.find(e => e.id === id);
    if (entry) {
      entry.status = 'synced';
      entry.lastAttemptAt = Date.now();
      this.saveToStorage();
    } else {
    }
  }

  /**
   * Mark entry as failed with error message
   */
  markAsFailed(id: string, error: string): void {
    const entry = this.queue.find(e => e.id === id);
    if (entry) {
      entry.status = 'failed';
      entry.error = error;
      entry.lastAttemptAt = Date.now();
      this.saveToStorage();
    }
  }

  /**
   * Increment retry count for entry
   */
  incrementRetry(id: string): boolean {
    const entry = this.queue.find(e => e.id === id);
    if (entry) {
      entry.retryCount++;
      entry.lastAttemptAt = Date.now();

      if (entry.retryCount > this.MAX_RETRY_COUNT) {
        entry.status = 'failed';
        entry.error = `Max retry count (${this.MAX_RETRY_COUNT}) exceeded`;
      }

      this.saveToStorage();
      return entry.status === 'pending';
    }
    return false;
  }

  /**
   * Remove entry from queue (call after successful sync confirmation)
   */
  removeFromQueue(id: string): void {
    const index = this.queue.findIndex(e => e.id === id);
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      this.saveToStorage();
    }
  }

  /**
   * Clear all synced entries
   */
  clearSyncedEntries(): number {
    const before = this.queue.length;
    this.queue = this.queue.filter(e => e.status !== 'synced');
    const removed = before - this.queue.length;

    if (removed > 0) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Clear all synced entries of specific type
   */
  clearSyncedByType(type: SyncEntityType): number {
    const before = this.queue.length;
    this.queue = this.queue.filter(
      e => !(e.status === 'synced' && e.type === type)
    );
    const removed = before - this.queue.length;

    if (removed > 0) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Get queue statistics for debugging
   */
  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(e => e.status === 'pending').length,
      synced: this.queue.filter(e => e.status === 'synced').length,
      failed: this.queue.filter(e => e.status === 'failed').length,
      byType: {
        bookmarks: this.queue.filter(e => e.type === 'bookmark').length,
        settings: this.queue.filter(e => e.type === 'setting').length,
        journals: this.queue.filter(e => e.type === 'journal').length,
        missions: this.queue.filter(e => e.type === 'mission').length,
      },
    };
  }

  /**
   * Clear entire queue (use with caution - usually only for testing/debugging)
   */
  clearAll(): void {
    const size = this.queue.length;
    this.queue = [];
    this.saveToStorage();
  }

  /**
   * Export queue for debugging
   */
  exportQueue(): string {
    return JSON.stringify(this.queue, null, 2);
  }
}

/**
 * Export singleton instance for use throughout app
 */
export const syncQueue = SyncQueueManager.getInstance();

export function isSyncEntityType(value: unknown): value is SyncEntityType {
  return ['bookmark', 'setting', 'journal', 'mission', 'mission_progress', 'daily_activity', 'reading_state'].includes(String(value));
}

/**
 * Type guard for SyncActionType
 */
export function isSyncActionType(value: unknown): value is SyncActionType {
  return ['create', 'update', 'delete'].includes(String(value));
}
