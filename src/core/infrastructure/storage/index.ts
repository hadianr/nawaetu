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

import { StorageService } from './service';
import { StorageFactory } from './factory';

/**
 * Singleton Storage Service Instance
 * Digunakan di seluruh aplikasi untuk consistency
 */
let storageService: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageService) {
    const adapter = StorageFactory.create('localStorage');
    storageService = new StorageService(adapter);
  }
  return storageService;
}

/**
 * Reset storage service (useful for testing)
 */
export function resetStorageService(): void {
  storageService = null;
}

// Re-export types and classes
export * from './adapter';
export * from './service';
export * from './factory';
export { LocalStorageAdapter } from './local-storage.adapter';
