/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Backward-Compatibility Adapter over HADITH_LIBRARY and DUA_LIBRARY.
 */

import { HADITH_LIBRARY, HadithItem } from "./hadiths";
import { DUA_LIBRARY, DuaItem } from "./duas";

export interface Reading {
    title?: string;
    titleEn?: string;
    arabic: string;
    latin: string;
    translation: string;       // Indonesian
    translationEn?: string;    // English
    source: string;
}

export interface SpiritualItem {
    id: string;
    type: "dua" | "hadith";
    category: string;
    content: Reading;
}

const SPIRITUAL_CATEGORY_ALIASES: Record<string, string> = {
    spiritualCategoryCharacter: "spiritualCategoryAkhlak",
    spiritualCategoryWorship: "spiritualCategoryIbadah",
    spiritualCategorySocial: "spiritualCategorySosial",
    spiritualCategoryFaith: "spiritualCategoryIman",
    spiritualCategoryKnowledge: "spiritualCategoryIlmu",
    spiritualCategoryLifestyle: "spiritualCategoryGayaHidup",
    spiritualCategoryGratitude: "spiritualCategorySyukur",
    spiritualCategoryProtection: "spiritualCategoryPerlindungan",
};

export function normalizeSpiritualCategory(category: string): string {
    return SPIRITUAL_CATEGORY_ALIASES[category] ?? category;
}

/** Adapt HadithItem to SpiritualItem */
function adaptHadith(item: HadithItem): SpiritualItem {
    return {
        id: item.id,
        type: "hadith",
        category: normalizeSpiritualCategory(item.category),
        content: {
            title: item.title,
            titleEn: item.titleEn,
            arabic: item.arabic,
            latin: item.latin,
            translation: item.translation,
            translationEn: item.translationEn,
            source: `HR. ${item.collection} No. ${item.hadithNumber}`
        }
    };
}

/** Adapt DuaItem to SpiritualItem */
function adaptDua(item: DuaItem): SpiritualItem {
    return {
        id: item.id,
        type: "dua",
        category: normalizeSpiritualCategory(item.category),
        content: {
            title: item.title,
            titleEn: item.titleEn,
            arabic: item.arabic,
            latin: item.latin,
            translation: item.translation,
            translationEn: item.translationEn,
            source: item.source.referenceText
        }
    };
}

export const SPIRITUAL_CONTENT: SpiritualItem[] = [
    ...HADITH_LIBRARY.map(adaptHadith),
    ...DUA_LIBRARY.map(adaptDua)
];

export function getLocalizedContent(content: Reading, locale: string) {
    const isEn = locale === "en";
    return {
        title: (isEn && content.titleEn) ? content.titleEn : content.title,
        translation: (isEn && content.translationEn) ? content.translationEn : content.translation,
    };
}

export function getSpiritualItemOfDay(): SpiritualItem {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return SPIRITUAL_CONTENT[dayOfYear % SPIRITUAL_CONTENT.length];
}

export function getHadithOnly(): SpiritualItem[] {
    return HADITH_LIBRARY.map(adaptHadith);
}

export function getDuaOnly(): SpiritualItem[] {
    return DUA_LIBRARY.map(adaptDua);
}

export function getByCategory(category: string): SpiritualItem[] {
    return SPIRITUAL_CONTENT.filter(item => item.category === category);
}

export const SPIRITUAL_CATEGORIES = [
    { key: "all", labelId: "Semua", labelEn: "All" },
    { key: "spiritualCategoryRamadhan", labelId: "Ramadhan", labelEn: "Ramadhan" },
    { key: "spiritualCategoryAkhlak", labelId: "Akhlak", labelEn: "Character" },
    { key: "spiritualCategoryIbadah", labelId: "Ibadah", labelEn: "Worship" },
    { key: "spiritualCategorySosial", labelId: "Sosial", labelEn: "Social" },
    { key: "spiritualCategoryIman", labelId: "Iman", labelEn: "Faith" },
    { key: "spiritualCategoryIlmu", labelId: "Ilmu", labelEn: "Knowledge" },
    { key: "spiritualCategoryGayaHidup", labelId: "Gaya Hidup", labelEn: "Lifestyle" },
    { key: "spiritualCategorySyukur", labelId: "Syukur", labelEn: "Gratitude" },
    { key: "spiritualCategoryPerlindungan", labelId: "Doa", labelEn: "Duas" },
];
