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
      if (error instanceof DOMException && (error.code === 22 || error.name === 'QuotaExceededError')) {
        // Attempt Cleanup: Remove heavy non-essential items
        try {
          const keysToRemove = [
            'prayer_data', // Can be refetched
            'nawaetu_chat_history', // Old chat history
            'daily_activity_history' // Old history?
          ];

          let freed = false;
          for (const k of keysToRemove) {
            if (localStorage.getItem(k)) {
              localStorage.removeItem(k);
              freed = true;
            }
          }

          // Retry setting item if we freed space
          if (freed) {
            try {
              localStorage.setItem(key, JSON.stringify(value));
              return;
            } catch (retryError) {
              // Still failed
            }
          }

          // If still failed, try to clear EVERYTHING except essential user profile?
          // Maybe risky. Just throw error for now but with better message.
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
