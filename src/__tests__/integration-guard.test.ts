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

import { describe, expect, it } from 'vitest';
import { assertLocalDatabase } from './integration-guard';

describe('assertLocalDatabase', () => {
    it('accepts localhost and 127.0.0.1', () => {
        expect(() => assertLocalDatabase('postgresql://u:p@localhost:5432/db')).not.toThrow();
        expect(() => assertLocalDatabase('postgresql://u:p@127.0.0.1:5432/db')).not.toThrow();
    });

    it('refuses remote hosts with a clear error', () => {
        expect(() => assertLocalDatabase('postgresql://u:p@db.supabase.co:5432/db')).toThrow(/not localhost/);
    });

    it('refuses missing or invalid URLs', () => {
        expect(() => assertLocalDatabase(undefined)).toThrow(/missing or invalid/);
    });
});
