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

import {
  StorageAdapter,
  StorageError
} from './adapter';

/**
 * Lightweight LocalStorage Implementation
 * Safe JSON parsing, quota handling, and event synchronization
 */
export class LocalStorageAdapter implements StorageAdapter {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('nawaetu_storage_sync');
        this.channel.onmessage = (event) => {
          if (event.data && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nawaetu_storage_change', {
              detail: { ...event.data, source: 'remote_tab' }
            }));
          }
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private notifyChange(key: string, action: 'set' | 'remove' | 'clear'): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('nawaetu_storage_change', {
      detail: { key, action, source: 'local_tab' }
    }));
    try {
      this.channel?.postMessage({ key, action });
    } catch {
      // Ignore broadcast errors
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isAvailable()) return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      this.notifyChange(key, 'set');
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
        console.warn(`[Storage] Quota exceeded on ${key}, clearing purgeable keys.`);
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('quran_tafsir_') || k.startsWith('prayer_data') || k.startsWith('verse_'))) {
              localStorage.removeItem(k);
            }
          }
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          this.notifyChange(key, 'set');
          return;
        } catch {
          // Quota still exceeded
        }
      }
      throw new StorageError(`Failed to store ${key}: ${error}`);
    }
  }

  removeItem(key: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(key);
      this.notifyChange(key, 'remove');
    } catch {
      // ignore
    }
  }

  clear(): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.clear();
      this.notifyChange('*', 'clear');
    } catch {
      // ignore
    }
  }
}
