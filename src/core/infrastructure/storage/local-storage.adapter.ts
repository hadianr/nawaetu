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
        // Attempt Cleanup: Remove non-essential items
        try {
          // Whitelist of essential data we should try NOT to delete
          const whitelist = [
            'user_name',
            'user_gender',
            'user_avatar',
            'app_theme',
            'settings_locale',
            'nawaetu_bookmarks',
            'user_total_infaq',
            'app_version',
            'onboarding_completed',
            'user_location'
          ];

          // Priority 1: Heavy but refetchable data
          const heavyKeys = [
            'prayer_data',
            'ai_chat_history_v2',
            'nawaetu_chat_history',
            'nawaetu_chat_sessions',
            'daily_activity_history'
          ];

          let freed = false;

          // Try removing heavy keys first
          for (const k of heavyKeys) {
            if (localStorage.getItem(k)) {
              localStorage.removeItem(k);
            }
          }

          // Try setting again after heavy keys removal
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return;
          } catch (e) {
            // Still failing, be more aggressive: remove EVERYTHING not in whitelist
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && !whitelist.includes(k) && k !== key) {
                localStorage.removeItem(k);
                i--; // Adjustment for length change
              }
            }
          }

          // Final attempt setting item
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return;
          } catch (retryError) {
            // Last resort: we failed even with minimal whitelist.
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
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
