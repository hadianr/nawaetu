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
