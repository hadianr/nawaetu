import { StorageAdapter } from './adapter';

/**
 * Storage Service
 * High-level API untuk storage operations dengan type safety
 */
export class StorageService {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Get item dengan default value fallback
   */
  get<T>(key: string, defaultValue: T): T {
    const value = this.adapter.getItem<T>(key);
    return value ?? defaultValue;
  }

  /**
   * Get item yang mungkin tidak exist
   */
  getOptional<T>(key: string): T | null {
    return this.adapter.getItem<T>(key);
  }

  /**
   * Set item
   */
  set<T>(key: string, value: T): void {
    this.adapter.setItem(key, value);
  }

  /**
   * Remove item
   */
  remove(key: string): void {
    this.adapter.removeItem(key);
  }

  /**
   * Clear all storage
   */
  clear(): void {
    this.adapter.clear();
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.adapter.getItem(key) !== null;
  }

  /**
   * Get multiple items at once
   */
  getMany<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach(key => {
      result.set(key, this.adapter.getItem<T>(key));
    });
    return result;
  }

  /**
   * Set multiple items at once
   */
  setMany<T>(items: Map<string, T>): void {
    items.forEach((value, key) => {
      this.adapter.setItem(key, value);
    });
  }
}
