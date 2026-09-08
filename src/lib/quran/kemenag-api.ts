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
 * Kemenag-based Quran API Adapter
 * Uses gadingnst/quran-api which sources data from Kemenag with proper waqof marks
 * API URL: https://quran-api-id.vercel.app (hosted by gadingnst)
 */

import { cache } from "react";
import { logger } from "@/lib/logger";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import type { Chapter } from "@/components/quran/SurahList";
import { API_CONFIG } from "@/config/apis";

interface GadingQuranResponse {
  code: number;
  status: string;
  message: string;
  data: GadingSurah | GadingSurah[];
}

interface GadingSurah {
  number: number;
  sequence: number;
  numberOfVerses: number;
  name: {
    short: string;
    long: string;
    transliteration: {
      en: string;
      id: string;
    };
    translation: {
      en: string;
      id: string;
    };
  };
  revelation: {
    arab: string;
    en: string;
    id: string;
  };
  tafsir: {
    id: string;
  };
  preBismillah?: unknown;
  verses?: GadingVerse[];
}

interface GadingVerse {
  number: {
    inQuran: number;
    inSurah: number;
  };
  meta: {
    juz: number;
    page: number;
    manzil: number;
    ruku: number;
    hizbQuarter: number;
    sajda: {
      recommended: boolean;
      obligatory: boolean;
    };
  };
  text: {
    arab: string;
    transliteration: {
      en: string;
    };
  };
  translation: {
    en: string;
    id: string;
  };
  audio: {
    primary: string;
    secondary: string[];
  };
  tafsir: {
    id: {
      short: string;
      long: string;
    };
  };
}

interface QuranWord {
  char_type_name?: string;
  position?: number;
  text?: string;
  text_indopak?: string;
  text_uthmani?: string;
  transliteration?: {
    text?: string;
  };
  translation?: {
    text?: string;
  };
}

interface QuranTranslation {
  id?: number;
  resource_id?: number;
  text: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function isQuranWord(value: unknown): value is QuranWord {
  return isRecord(value);
}

function toQuranTranslation(value: unknown): QuranTranslation {
  if (!isRecord(value)) return { id: -1, resource_id: -1, text: "" };

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    resource_id: typeof value.resource_id === "number" ? value.resource_id : undefined,
    text: readString(value.text),
  };
}

function isGadingVerse(value: unknown): value is GadingVerse {
  if (!isRecord(value)) return false;

  const number = value.number;
  const text = value.text;
  const translation = value.translation;
  const audio = value.audio;
  const tafsir = value.tafsir;

  return isRecord(number)
    && typeof number.inQuran === "number"
    && typeof number.inSurah === "number"
    && isRecord(text)
    && typeof text.arab === "string"
    && isRecord(translation)
    && typeof translation.id === "string"
    && isRecord(audio)
    && typeof audio.primary === "string"
    && Array.isArray(audio.secondary)
    && audio.secondary.every((item) => typeof item === "string")
    && isRecord(tafsir)
    && isRecord(tafsir.id)
    && typeof tafsir.id.short === "string"
    && typeof tafsir.id.long === "string";
}

// Get all chapters from Kemenag API
export const getKemenagChapters = cache(async (): Promise<Chapter[]> => {
    const res = await fetchWithTimeout(
      `${API_CONFIG.QURAN_ID.BASE_URL}/surah`,
      { next: { revalidate: 86400 } },
      { timeoutMs: 8000 }
    );

    if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.status} ${res.statusText}`);

    const response: GadingQuranResponse = await res.json();
    const surahs = response.data as GadingSurah[];

    if (!surahs || surahs.length === 0) {
      throw new Error(`No chapters found in API response`);
    }


    // Transform to match SurahList.Chapter structure
    return surahs.map((surah: GadingSurah) => ({
      id: surah.number,
      revelation_place: surah.revelation.id === "Makkiyyah" ? "Makkah" : "Madinah",
      revelation_order: surah.sequence,
      bismillah_pre: surah.number !== 9, // Surah At-Taubah doesn't have Bismillah
      name_simple: surah.name.transliteration.id,
      name_complex: surah.name.long,
      name_arabic: surah.name.short,
      verses_count: surah.numberOfVerses,
      pages: [], // Not provided by this API
      translated_name: {
        language_name: "Indonesian",
        name: surah.name.translation.id,
      },
      translated_name_en: surah.name.translation.en,
    }));
});

// Get specific chapter from Kemenag API (returns Chapter from SurahList)
export async function getKemenagChapter(chapterId: string | number): Promise<Chapter> {
  const chapters = await getKemenagChapters();
  const chapter = chapters.find((ch) => ch.id === parseInt(String(chapterId)));

  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found in chapters list`);
  }

  return chapter;
}

// Get verses for a chapter from Kemenag API
// Wrapped with React's cache to deduplicate identical requests within same render
export const getKemenagVerses = cache(
  async (
    chapterId: string | number,
    page: number = 1,
    perPage: number = 20,
    locale: string = "id"
  ) => {
    try {
      // Determine translation ID based on locale
      // 20 = Saheeh International (English), 33 = Indonesian (Kemenag)
      const translationId = locale === "en" ? 20 : 33;

      // Single API call - use quran.com only (faster, no dual API bottleneck)
      // quran.com API has everything we need: Arabic text + translations + harakat + transliteration
      const apiUrl = `${API_CONFIG.QURAN_COM.BASE_URL}/verses/by_chapter/${chapterId}?language=${locale}&word_translation_language=${locale}&words=true&word_fields=text_uthmani,text_indopak&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`;

      const res = await fetchWithTimeout(
        apiUrl,
        { next: { revalidate: 86400 } },
        { timeoutMs: 15000 }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const data = await res.json() as unknown;
      if (!isRecord(data)) throw new Error(`Empty response from API`);

      const verses = Array.isArray(data.verses) ? data.verses.filter(isRecord) : [];
      if (verses.length === 0) throw new Error(`No verses in API response`);

      // Transform to match app structure - simple, fast transformation with safety checks
      return verses.map((verse) => {
        // Safely build transliteration from words
        const words = Array.isArray(verse.words) ? verse.words.filter(isQuranWord) : [];
        const transliteration = words
          .map((word) => word.transliteration?.text || '')
          .filter(Boolean)
          .join(' ');

        const translations = Array.isArray(verse.translations)
          ? verse.translations.map(toQuranTranslation)
          : [];

        const audio = isRecord(verse.audio) ? verse.audio : {};

        return {
          id: readNumber(verse.id, -1),
          verse_number: readNumber(verse.verse_number),
          verse_key: readString(verse.verse_key, "0:0"),
          text_uthmani: readString(verse.text_uthmani),
          text_uthmani_tajweed: readString(verse.text_uthmani_tajweed, readString(verse.text_uthmani)),
          translations: translations.length > 0 ? translations : [toQuranTranslation(null)],
          transliteration: transliteration,
          words,
          audio: {
            url: readString(audio.url),
          },
          meta: isRecord(verse.meta) ? verse.meta : {},
        };
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Re-throw with context
      throw new Error(`Surah ${chapterId} failed: ${errorMsg.slice(0, 50)}`);
    }
  }
);

// Get single verse with details
export async function getKemenagVerse(chapterId: string | number, verseNumber: string | number) {
  const res = await fetchWithTimeout(
    `${API_CONFIG.QURAN_ID.BASE_URL}/surah/${chapterId}/${verseNumber}`,
    { next: { revalidate: 86400 } },
    { timeoutMs: 8000 }
  );

  if (!res.ok) throw new Error(`Verse ${chapterId}:${verseNumber} not found`);

  const response = await res.json() as unknown;
  const verseData = isRecord(response) ? response.data : undefined;
  if (!isGadingVerse(verseData)) {
    throw new Error(`Invalid verse response for ${chapterId}:${verseNumber}`);
  }
  const verse = verseData;

  return {
    id: verse.number.inQuran,
    verse_number: verse.number.inSurah,
    verse_key: `${chapterId}:${verse.number.inSurah}`,
    text_uthmani: verse.text.arab,
    text_uthmani_tajweed: verse.text.arab,
    translation: {
      id: {
        text: verse.translation.id,
      },
    },
    audio: {
      primary: verse.audio.primary,
      secondary: verse.audio.secondary,
    },
    tafsir: {
      kemenag: {
        short: verse.tafsir.id.short,
        long: verse.tafsir.id.long,
      },
    },
    meta: verse.meta,
  };
}

// Get audio URL for a verse - uses the audio provided by Kemenag API
export function getVerseAudioUrl(verseId: number, reciterId: number): string {
  // Map reciter IDs to Islamic.Network CDN folder names with correct bitrates
  // IDs match quran.com API reciter identifiers
  const reciterMap: { [key: number]: { name: string; bitrate: number } } = {
    7: { name: "alafasy", bitrate: 128 },           // Mishary Rashid Alafasy
    2: { name: "abdurrahmaansudais", bitrate: 192 }, // Abdul Rahman Al-Sudais
    1: { name: "abdulbasitmurattal", bitrate: 192 }, // Abdul Basit (Murattal)
    5: { name: "mahermuaiqly", bitrate: 128 },       // Maher Al Muaiqly
    3: { name: "saoodshuraym", bitrate: 64 },        // Saud Al-Shuraim
  };

  const reciter = reciterMap[reciterId] || reciterMap[7];
  return `${API_CONFIG.AUDIO.ISLAMIC_NETWORK_CDN}/${reciter.bitrate}/ar.${reciter.name}/${verseId}.mp3`;
}

export interface SearchResultItem {
  verse_key: string;
  verse_id: number;
  text_uthmani: string;
  translation: string;
  words: unknown[];
}

export interface SearchResponse {
  query: string;
  total_results: number;
  current_page: number;
  total_pages: number;
  results: SearchResultItem[];
}

function toSearchResult(value: unknown): SearchResultItem | null {
  if (!isRecord(value)) return null;

  const translations = Array.isArray(value.translations) ? value.translations : [];
  const translation = translations.length > 0 ? toQuranTranslation(translations[0]).text : "";

  return {
    verse_key: readString(value.verse_key),
    verse_id: readNumber(value.verse_id),
    text_uthmani: readString(value.text),
    translation,
    words: Array.isArray(value.words) ? value.words : [],
  };
}

export const searchVerses = cache(async (query: string, page: number = 1, locale: string = "id", size: number = 20): Promise<SearchResponse> => {
  if (!query || query.trim() === '') {
    return { query, total_results: 0, current_page: 1, total_pages: 0, results: [] };
  }

  try {
    const res = await fetchWithTimeout(
      `${API_CONFIG.QURAN_COM.BASE_URL}/search?q=${encodeURIComponent(query)}&language=${locale}&word_translation_language=${locale}&size=${size}&page=${page}`,
      { next: { revalidate: 3600 } },
      { timeoutMs: 15000 }
    );

    if (!res.ok) throw new Error(`Search API failed: ${res.statusText}`);

    const data = await res.json() as unknown;
    const search = isRecord(data) ? data.search : undefined;
    if (!isRecord(search)) throw new Error("Invalid search response");

    const results = Array.isArray(search.results)
      ? search.results.map(toSearchResult).filter((result): result is SearchResultItem => result !== null)
      : [];

    return {
      query: readString(search.query, query),
      total_results: readNumber(search.total_results),
      current_page: readNumber(search.current_page, page),
      total_pages: readNumber(search.total_pages),
      results,
    };
  } catch (error) {
    logger.error("Quran search error", error, { action: 'quran-search' });
    throw error;
  }
});
