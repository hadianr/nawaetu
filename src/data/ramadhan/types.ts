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

export interface IntentionData {
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

export interface EvidenceData {
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
    dalil: EvidenceData;
}

export interface RamadhanPracticeData {
    id: string;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    icon: string;
    niat?: IntentionData;
    dalil: EvidenceData;
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
    dalil?: EvidenceData;
}

export interface FAQItem {
    id: string;
    question: string;
    question_en: string;
    answer: string;
    answer_en: string;
    dalil?: EvidenceData;
    tags?: string[]; // for future search functionality
}
