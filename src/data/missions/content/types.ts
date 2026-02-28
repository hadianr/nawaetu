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


export interface Reading {
    title?: string;
    arabic: string;
    latin: string;
    translation: string;
    count?: number; // Recommended count (e.g. 33x, 100x)
    note?: string; // Additional instruction e.g. "Dibaca 3x"
}

export interface MissionContent {
    id: string;
    intro?: string;
    niat?: {
        munfarid: Reading; // Sendiri
        makmum?: Reading;   // Berjamaah (optional)
    };
    readings?: Reading[];
    guides?: string[];
    fadhilah: string[];
    source?: string;
}

