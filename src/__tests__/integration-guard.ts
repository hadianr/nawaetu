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

export const integrationEnabled = process.env.INTEGRATION_DB === '1';

/**
 * Throws unless DATABASE_URL points to localhost or 127.0.0.1.
 * Integration tests must never touch Supabase or Vercel databases.
 */
export function assertLocalDatabase(url: string | undefined = process.env.DATABASE_URL): void {
    let host: string;
    try {
        host = new URL(url ?? '').hostname;
    } catch {
        throw new Error('Integration tests refuse to run: DATABASE_URL is missing or invalid.');
    }
    if (host !== 'localhost' && host !== '127.0.0.1') {
        throw new Error(`Integration tests refuse to run: DATABASE_URL host "${host}" is not localhost or 127.0.0.1.`);
    }
}
