/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * DRY Islamic Content Share Mappers & Reusable Helpers
 */

import { ShareableCardData } from "./story-card-renderer";

export interface HadithLike {
    id: string;
    collection: string;
    hadithNumber: string | number;
    title: string;
    titleEn?: string;
    arabic: string;
    latin?: string;
    translation: string;
    translationEn?: string;
    explanation?: string;
    explanationEn?: string;
    authenticity: string;
}

export interface DuaLike {
    id: string;
    title: string;
    titleEn?: string;
    arabic: string;
    latin?: string;
    translation: string;
    translationEn?: string;
    virtue?: string;
    virtueEn?: string;
    source: {
        referenceText: string;
        referenceTextEn?: string;
    };
}

export interface QuranVerseLike {
    verse_key: string;
    text_uthmani?: string;
    text_indopak?: string;
    transliteration?: string;
    translations?: { resource_id?: number; text: string }[];
}

/**
 * Maps Hadith data structure to ShareableCardData
 */
export function mapHadithToShareData(item: HadithLike, locale: string = "id"): ShareableCardData {
    const isEn = locale === "en";
    return {
        id: item.id,
        title: isEn && item.titleEn ? item.titleEn : item.title,
        arabic: item.arabic,
        latin: item.latin,
        translation: isEn && item.translationEn ? item.translationEn : item.translation,
        explanation: isEn && item.explanationEn ? item.explanationEn : item.explanation,
        sourceText: `HR. ${item.collection} No. ${item.hadithNumber} (${item.authenticity})`,
    };
}

/**
 * Maps Dua data structure to ShareableCardData
 */
export function mapDuaToShareData(item: DuaLike, locale: string = "id"): ShareableCardData {
    const isEn = locale === "en";
    return {
        id: item.id,
        title: isEn && item.titleEn ? item.titleEn : item.title,
        arabic: item.arabic,
        latin: item.latin,
        translation: isEn && item.translationEn ? item.translationEn : item.translation,
        explanation: isEn && item.virtueEn ? item.virtueEn : item.virtue,
        sourceText: isEn && item.source.referenceTextEn ? item.source.referenceTextEn : item.source.referenceText,
    };
}

/**
 * Maps Quran Verse structure to ShareableCardData
 */
export function mapQuranVerseToShareData(
    verse: QuranVerseLike,
    surahName: string,
    surahNumber: number
): ShareableCardData {
    const verseNum = verse.verse_key ? verse.verse_key.split(":")[1] : "1";
    const translationObj =
        verse.translations?.find((t) => t.resource_id === 33) ||
        verse.translations?.[0];
    const rawTranslation = translationObj?.text || "";
    const cleanTranslation = rawTranslation
        .replace(/<[^>]*>?/gm, "")
        .replace(/(\d+)(?=\s|$|[.,;])/g, "")
        .replace(/(\w)(\d+)/g, "$1")
        .trim();

    const arabicText = verse.text_uthmani || verse.text_indopak || "";

    return {
        id: `qs-${surahNumber}-${verseNum}`,
        title: `QS. ${surahName}: ${verseNum}`,
        arabic: arabicText,
        latin: verse.transliteration || "",
        translation: cleanTranslation,
        sourceText: `QS. ${surahName} (${surahNumber}:${verseNum})`,
    };
}

export interface DailySpiritLike {
    id: string;
    content: {
        title?: string;
        arabic: string;
        latin?: string;
        translation: string;
        source: string;
    };
}

/**
 * Maps DailySpirit item to ShareableCardData
 */
export function mapDailySpiritToShareData(
    item: DailySpiritLike,
    title: string,
    translation: string
): ShareableCardData {
    return {
        id: item.id,
        title: title || item.content.title || "Nawaetu",
        arabic: item.content.arabic,
        latin: item.content.latin,
        translation: translation || item.content.translation,
        sourceText: item.content.source,
    };
}
