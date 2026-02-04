/**
 * Kemenag-based Quran API Adapter
 * Uses gadingnst/quran-api which sources data from Kemenag with proper waqof marks
 * API URL: https://quran-api-id.vercel.app (hosted by gadingnst)
 */

import { cache } from "react";
import type { Chapter } from "@/components/quran/SurahList";

const KEMENAG_API_BASE_URL = "https://quran-api-id.vercel.app";

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
  preBismillah?: any;
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

// Get all chapters from Kemenag API
export async function getKemenagChapters(): Promise<Chapter[]> {
  try {
    const res = await fetch(`${KEMENAG_API_BASE_URL}/surah`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.status}`);

    const response: GadingQuranResponse = await res.json();
    const surahs = response.data as GadingSurah[];

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
  } catch (error) {
    console.error("Error fetching chapters from Kemenag API:", error);
    throw error;
  }
}

// Get specific chapter from Kemenag API (returns Chapter from SurahList)
export async function getKemenagChapter(chapterId: string | number): Promise<Chapter> {
  const chapters = await getKemenagChapters();
  const chapter = chapters.find((ch) => ch.id === parseInt(String(chapterId)));

  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found`);
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
      const apiUrl = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=${locale}&words=true&translations=${translationId}&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`;
      
      const res = await fetch(apiUrl, { 
        next: { revalidate: 86400 }, // Cache for 24 hours
        signal: AbortSignal.timeout(8000) // 8s timeout to prevent hanging
      });

      if (!res.ok) throw new Error(`Failed to fetch verses: ${res.status}`);

      const data = await res.json();
      const verses = data.verses || [];

      // Transform to match app structure - simple, fast transformation
      return verses.map((verse: any) => {
        // Build transliteration from words
        const transliteration = verse.words?.map((w: any) => w.transliteration?.text || '').join(' ') || '';
        
        return {
          id: verse.id, // Global verse ID from quran.com
          verse_number: verse.verse_number,
          verse_key: verse.verse_key,
          text_uthmani: verse.text_uthmani,
          text_uthmani_tajweed: verse.text_uthmani_tajweed || verse.text_uthmani,
          translations: verse.translations || [],
          transliteration: transliteration,
          words: verse.words || [], // Now we have word-level data
          audio: {
            url: verse.audio?.url || "",
            primary: verse.audio?.url || "",
            secondary: [],
          },
          tafsir: locale === "id" ? {
            kemenag: {
              short: "",
              long: "",
            },
          } : undefined,
          meta: verse.meta,
        };
      });
    } catch (error) {
      console.error(`Error fetching verses for chapter ${chapterId}:`, error);
      throw error;
    }
  }
);

// Get single verse with details
export async function getKemenagVerse(chapterId: string | number, verseNumber: string | number) {
  try {
    const res = await fetch(
      `${KEMENAG_API_BASE_URL}/surah/${chapterId}/${verseNumber}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error(`Verse ${chapterId}:${verseNumber} not found`);

    const response: any = await res.json();
    const verse = response.data as GadingVerse;

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
  } catch (error) {
    console.error(`Error fetching verse ${chapterId}:${verseNumber}:`, error);
    throw error;
  }
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
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/ar.${reciter.name}/${verseId}.mp3`;
}

// Prefetch utility for popular surahs during idle time
// Call this on app startup to preload chapters 1-10 + frequently read surahs
export function prefetchPopularSurahs(locale: string = "id"): void {
  if (typeof window === "undefined") return; // Only in browser
  
  // Popular surahs: Al-Fatiha(1), Al-Baqarah(2), Ali-Imran(3), An-Nisa(4), Al-Ma'idah(5),
  // Al-An'am(6), Al-A'raf(7), Al-Anfal(8), At-Tawbah(9), Yunus(10), Ar-Rahman(55), Ya-Seen(36)
  const popularSurahs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 36, 55];
  
  // Use requestIdleCallback to prefetch without blocking user interaction
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      popularSurahs.forEach((surah) => {
        // Trigger fetch via cache() - this will cache the result
        getKemenagVerses(surah, 1, 20, locale).catch(() => {
          // Silently ignore prefetch errors
        });
      });
    });
  }
}

// Fallback for failed API calls - returns minimal verse structure
function createFallbackVerse(verseKey: string): any {
  const [chapter, verse] = verseKey.split(":");
  return {
    id: parseInt(verseKey.replace(":", "")),
    verse_number: parseInt(verse),
    verse_key: verseKey,
    text_uthmani: "",
    text_uthmani_tajweed: "",
    translations: [{ text: "Unable to load translation" }],
    transliteration: "",
    words: [],
    audio: { url: "", primary: "", secondary: [] },
    meta: null,
  };
}
