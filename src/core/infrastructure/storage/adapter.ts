/**
 * Storage Adapter Interface
 * Abstraction layer untuk berbagai storage implementations
 * Memudahkan migrasi ke IndexedDB, API, atau database di masa depan
 */
export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Storage Errors
 */
export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor(message: string = 'Storage quota exceeded') {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'StorageQuotaExceededError';
  }
}

export class StorageNotAvailableError extends StorageError {
  constructor(message: string = 'Storage not available') {
    super(message, 'NOT_AVAILABLE');
    this.name = 'StorageNotAvailableError';
  }
}
