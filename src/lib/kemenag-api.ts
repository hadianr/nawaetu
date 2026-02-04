/**
 * Kemenag-based Quran API Adapter
 * Uses gadingnst/quran-api which sources data from Kemenag with proper waqof marks
 * API URL: https://quran-api-id.vercel.app (hosted by gadingnst)
 */

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
export async function getKemenagVerses(
  chapterId: string | number,
  page: number = 1,
  perPage: number = 20
) {
  try {
    // Fetch from both APIs in parallel for best quality data
    const [kemenagRes, quranComRes] = await Promise.all([
      fetch(`${KEMENAG_API_BASE_URL}/surah/${chapterId}`, { next: { revalidate: 86400 } }),
      fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=id&words=false&translations=33&fields=text_uthmani,text_uthmani_tajweed&page=${page}&per_page=${perPage}`,
        { next: { revalidate: 86400 } }
      ),
    ]);

    if (!kemenagRes.ok) throw new Error(`Failed to fetch verses for chapter ${chapterId}`);

    const response: GadingQuranResponse = await kemenagRes.json();
    const surah = response.data as GadingSurah;
    const allVerses = surah.verses || [];

    // Get quran.com data for better harakat (especially for muqaṭṭaʿāt letters)
    let quranComVerses: any[] = [];
    if (quranComRes.ok) {
      const quranComData = await quranComRes.json();
      quranComVerses = quranComData.verses || [];
    }

    // Apply pagination
    const startIdx = (page - 1) * perPage;
    const paginatedVerses = allVerses.slice(startIdx, startIdx + perPage);

    // Transform to match app structure, using quran.com text for better harakat
    return paginatedVerses.map((verse: GadingVerse) => {
      const quranComVerse = quranComVerses.find(
        (v: any) => v.verse_number === verse.number.inSurah
      );

      return {
        id: verse.number.inQuran,
        verse_number: verse.number.inSurah,
        verse_key: `${chapterId}:${verse.number.inSurah}`,
        // Use quran.com text_uthmani for complete harakat, fallback to Kemenag
        text_uthmani: quranComVerse?.text_uthmani || verse.text.arab,
        text_uthmani_tajweed: quranComVerse?.text_uthmani_tajweed || verse.text.arab,
        translations: [
          {
            id: 33, // Indonesian translation ID
            resource_id: 33,
            text: verse.translation.id,
          },
        ],
        transliteration: verse.text.transliteration.en,
        words: [], // API doesn't provide word-level data
        audio: {
          url: verse.audio.primary,
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
    });
  } catch (error) {
    console.error(`Error fetching verses for chapter ${chapterId}:`, error);
    throw error;
  }
}

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

