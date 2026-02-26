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
  StorageError,
  StorageQuotaExceededError,
  StorageNotAvailableError
} from './adapter';

/**
 * LocalStorage Implementation
 * Menangani semua operasi localStorage dengan proper error handling
 */
export class LocalStorageAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Try to parse as JSON first
      try {
        return JSON.parse(item) as T;
      } catch {
        // If parsing fails, return as-is (backward compatibility with plain strings)
        return item as T;
      }
    } catch (error) {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      throw new StorageNotAvailableError('localStorage is not available');
    }

    try {
      const serialized = JSON.stringify(value);

      // Safety Gate: Don't even try if the value is unreasonably large (> 1MB)
      // localStorage usually has a 5MB limit. 16MB (like in some bug reports) will always fail.
      const sizeBytes = serialized.length * 2; // approximation for UTF-16
      if (sizeBytes > 1024 * 1024) {
        console.error(`[Storage] Refused to save ${key}: Value is too large (${(sizeBytes / 1024 / 1024).toFixed(2)}MB). Limit is 1MB.`);
        return;
      }

      localStorage.setItem(key, serialized);
      // Dispatch custom event for same-tab synchronization
      window.dispatchEvent(new CustomEvent('nawaetu_storage_change', {
        detail: { key, action: 'set' }
      }));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && (
        error.code === 22 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 1014
      )) {
        try {
          console.warn(`[Storage] Quota exceeded while saving ${key}. Starting emergency cleanup...`);

          // Whitelist: absolute minimum needed for app to function
          const absoluteEssentials = ['settings_locale', 'onboarding_completed', 'user_name'];

          const whitelist = [
            ...absoluteEssentials,
            'user_gender',
            'user_avatar',
            'app_theme',
            'nawaetu_bookmarks',
            'user_total_infaq',
            'user_infaq_history',
            'user_streak',
            'user_xp',
            'user_level',
            'is_muhsinin',
            'app_version',
            'user_location'
          ];

          const purgeablePrefixes = ['quran_tafsir_', 'verse_', 'tafsir_'];
          const heavyCacheKeys = ['prayer_data'];
          const historyKeys = [
            'ai_chat_history_v2',
            'nawaetu_chat_history',
            'nawaetu_chat_sessions',
            'daily_activity_history'
          ];

          const serializedValue = JSON.stringify(value);

          // Helper to get total size
          const getStorageInfo = () => {
            const items = [];
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k) {
                const val = localStorage.getItem(k) || '';
                const size = val.length * 2; // approximation for UTF-16
                items.push({ key: k, size });
                total += size;
              }
            }
            return { total, items: items.sort((a, b) => b.size - a.size) };
          };

          // 1. First Pass: Delete only pure cache
          for (const k of Object.keys(localStorage)) {
            if (heavyCacheKeys.includes(k) || purgeablePrefixes.some(p => k.startsWith(p))) {
              localStorage.removeItem(k);
            }
          }

          // Try setting again
          try {
            localStorage.setItem(key, serializedValue);
            return;
          } catch (e1) {
            // 2. Second Pass: Delete history keys
            for (const k of historyKeys) {
              localStorage.removeItem(k);
            }

            try {
              localStorage.setItem(key, serializedValue);
              return;
            } catch (e2) {
              // 3. Third Pass: Final desperation - remove EVERYTHING not in absolute essentials
              const { items } = getStorageInfo();
              console.table(items.slice(0, 10)); // Log the top 10 offenders

              for (const item of items) {
                if (!absoluteEssentials.includes(item.key) && item.key !== key) {
                  localStorage.removeItem(item.key);
                }
              }
            }
          }

          // Final attempt setting item
          try {
            localStorage.setItem(key, serializedValue);
            return;
          } catch (retryError) {
            // Even clearing almost everything failed. 
            // Maybe the 'value' itself is too large? 
            console.error(`[Storage] CRITICAL: Even after clearing, failed to save ${key}. Value size: ${serializedValue.length * 2} bytes.`);
          }
        } catch (cleanupError) {
          console.error('[Storage] Cleanup process failed:', cleanupError);
        }

        throw new StorageQuotaExceededError(
          `Failed to store ${key}: Storage quota exceeded. Please clear some data.`
        );
      }
      throw new StorageError(`Failed to store ${key}: ${error}`);
    }
  }

  removeItem(key: string): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.removeItem(key);
      // Dispatch custom event for same-tab synchronization
      window.dispatchEvent(new CustomEvent('nawaetu_storage_change', {
        detail: { key, action: 'remove' }
      }));
    } catch (error) {
    }
  }

  clear(): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.clear();
    } catch (error) {
    }
  }
}
