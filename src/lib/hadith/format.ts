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

export interface HadithSourceLike {
    collection: string;
    hadithNumber: string | number;
    authenticity: string;
    /** Book of the number after " / ". Muttafaq 'alaih entries filed under Bukhari need none: it is Muslim. */
    secondCollection?: string;
}

/**
 * "HR. Bukhari No. 321 & Muslim No. 335" for a hadith in two books. Stored as "321 / 335", which read as
 * two Bukhari numbers, or as "one or the other". A second number whose book is unknown is left as stored.
 */
export function formatHadithSource(item: HadithSourceLike, locale: string = "id"): string {
    const prefix = locale === "en" ? "" : "HR. ";
    const parts = String(item.hadithNumber).split("/").map((part) => part.trim());
    const second = item.secondCollection
        ?? (item.authenticity === "Muttafaq 'Alaih" && item.collection === "Bukhari" ? "Muslim" : undefined);
    if (parts.length === 2 && parts[0] && parts[1] && second) {
        return `${prefix}${item.collection} No. ${parts[0]} & ${second} No. ${parts[1]}`;
    }
    return `${prefix}${item.collection} No. ${item.hadithNumber}`;
}
