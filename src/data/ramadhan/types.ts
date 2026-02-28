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

/**
 * Ramadhan Hub Data
 * Niat, dalil, and amalan content for the Ramadhan Hub feature
 * All content based on Al-Quran and authenticated Hadits
 */

export interface NiatData {
    id: string;
    title: string;
    title_en?: string;      // English title (optional for bilingual support)
    arabic: string;
    latin: string;
    translation: string;
    translation_en?: string; // English translation (optional for bilingual support)
    source?: string;
    source_en?: string;      // English source description (optional)
}

export interface DalilData {
    id: string;
    shortRef: string;        // e.g. "QS. Al-Baqarah: 187"
    shortRef_en?: string;    // English short reference (optional)
    arabic?: string;
    latin?: string;
    translation: string;
    translation_en?: string;  // English translation (optional for bilingual support)
    source: string;          // Full source description
    source_en?: string;      // English source description (optional)
}

export interface SunnahFood {
    id: string;
    name: string;
    name_en?: string;
    icon: string;
    description: string;
    description_en?: string;
    dalil: DalilData;
}

export interface RamadhanAmalanData {
    id: string;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    icon: string;
    niat?: NiatData;
    dalil: DalilData;
    tips?: string[];
    tips_en?: string[];
}

export type FiqhCategory = 'wajib' | 'sunnah' | 'mubah' | 'makruh' | 'haram';

export interface FiqhItem {
    id: string;
    title: string;
    title_en: string;
    description: string;
    description_en: string;
    category: FiqhCategory;
    dalil?: DalilData;
}

export interface FAQItem {
    id: string;
    question: string;
    question_en: string;
    answer: string;
    answer_en: string;
    dalil?: DalilData;
    tags?: string[]; // for future search functionality
}
