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

export type HadithCollection =
    | "Bukhari"
    | "Muslim"
    | "Tirmidzi"
    | "Abu Dawud"
    | "Nasa'i"
    | "Ibn Majah"
    | "Ahmad";

export type HadithAuthenticity = "Sahih" | "Hasan" | "Muttafaq 'Alaih";

export type HadithTopic =
    | "emotional-wellbeing"
    | "digital-life"
    | "relationships"
    | "study-work"
    | "money-consumption"
    | "purpose"
    | "worship"
    | "gratitude"
    | "environment";

export const HADITH_TOPIC_DEFINITIONS: { key: HadithTopic; labelId: string; labelEn: string }[] = [
    { key: "emotional-wellbeing", labelId: "Ketenangan Diri", labelEn: "Emotional Wellbeing" },
    { key: "digital-life", labelId: "Dunia Digital", labelEn: "Digital Life" },
    { key: "relationships", labelId: "Relasi & Akhlak", labelEn: "Relationships" },
    { key: "study-work", labelId: "Belajar & Kerja", labelEn: "Study & Work" },
    { key: "money-consumption", labelId: "Uang & Konsumsi", labelEn: "Money & Consumption" },
    { key: "purpose", labelId: "Makna & Tujuan", labelEn: "Purpose & Meaning" },
    { key: "worship", labelId: "Ibadah", labelEn: "Worship" },
    { key: "gratitude", labelId: "Syukur", labelEn: "Gratitude" },
    { key: "environment", labelId: "Lingkungan", labelEn: "Environment" },
];

export interface HadithItem {
    id: string;
    collection: HadithCollection;
    hadithNumber: string | number;
    bookName?: string;             // Kitab title, e.g., "Kitab al-Iman"
    chapterName?: string;          // Bab title
    narrator?: string;             // e.g., "Abu Hurairah RA"
    authenticity: HadithAuthenticity;
    category: string;              // Character, Worship, Faith, Social, Knowledge, Lifestyle, Ramadhan
    title: string;
    titleEn?: string;
    arabic: string;
    latin: string;
    translation: string;           // Indonesian translation
    translationEn?: string;        // English translation
    explanation?: string;          // Comprehensive commentary / tadabbur (Indonesian)
    explanationEn?: string;        // Comprehensive commentary / tadabbur (English)
    searchTerms?: string[];        // Modern user language and synonyms; not part of the source text
    topics?: HadithTopic[];         // Daily-life discovery groups; not part of the source text
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
    "Bukhari",
    "Muslim",
    "Tirmidzi",
    "Abu Dawud",
    "Nasa'i",
    "Ibn Majah",
    "Ahmad"
];
