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

export interface IslamicContentBase {
    id: string;
    category: string;
    title: string;
    titleEn?: string;
    arabic: string;
    latin: string;
    translation: string;
    translationEn?: string;
    searchTerms?: string[];        // Modern user language and synonyms; not part of the source text
}

export type DuaOccasion =
    | "morning"
    | "evening"
    | "after_prayer"
    | "fasting"
    | "sleeping"
    | "protection"
    | "gratitude"
    | "general"
    | "social";

export interface DuaSource {
    type: "quran" | "hadith" | "fiqh";
    referenceText: string;         // e.g., "QS. An-Naml [27]: 19" or "HR. Abu Dawud No. 2358"
    referenceTextEn?: string;       // e.g., "Quran 27:19" or "HR. Abu Dawud No. 2358"
    quranDetails?: { surahName: string; surahNumber: number; ayahNumber: number | string };
    hadithDetails?: { collection: string; hadithNumber: number | string };
}

export interface DuaItem extends IslamicContentBase {
    occasion: DuaOccasion;
    additionalOccasions?: DuaOccasion[]; // Secondary discovery tabs without changing the primary occasion
    isDhikr?: boolean;                   // Shows the counter only for countable dhikr items
    virtue?: string;               // Fadhilah / spiritual benefit (Indonesian)
    virtueEn?: string;             // Fadhilah / spiritual benefit (English)
    recommendedCount?: number;     // Target repetition, e.g. 1x or 3x
    source: DuaSource;
}

export interface DuaCategoryDefinition {
    key: DuaOccasion | "all";
    labelId: string;
    labelEn: string;
}
