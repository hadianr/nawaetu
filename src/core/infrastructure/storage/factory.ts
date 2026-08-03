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
import { LocalStorageAdapter } from './local-storage.adapter';

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'api';

/**
 * Storage Factory
 * Memudahkan switching antara storage implementations
 */
// ponytail: single storage type active, return LocalStorageAdapter directly
export class StorageFactory {
  static create(_type: StorageType = 'localStorage'): StorageAdapter {
    return new LocalStorageAdapter();
  }
}
