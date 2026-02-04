
export interface TafsirContent {
    short: string;
    long: string;
}

interface TafsirResponse {
    code: number;
    status: string;
    data: {
        tafsir: {
            id: {
                short: string;
                long: string;
            }
        }
    }
}

const CACHE_KEY_PREFIX = 'quran_tafsir_';

export async function getVerseTafsir(surahId: number, verseId: number, locale: string = "id"): Promise<TafsirContent | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}${locale}_${surahId}:${verseId}`;

    try {
        // 1. Check localStorage cache
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            return JSON.parse(cached) as TafsirContent;
        }

        let content: TafsirContent | null = null;

        if (locale === "en") {
            // 2a. Fetch English tafsir from Quran.com (Tafsir ID 169 = Ibn Kathir English)
            // Verse ID format must match: surahId:verseId (same as Kemenag API)
            const verseKey = `${surahId}:${verseId}`;
            const res = await fetch(`https://api.quran.com/api/v4/tafsirs/169/by_ayah/${verseKey}`);
            if (!res.ok) throw new Error('Failed to fetch English tafsir');

            const json = await res.json();
            let tafsirText = json.tafsir?.text || "";

            if (!tafsirText) return null;

            // Keep full text for display in modal
            // Extract first paragraph as summary/preview
            const firstPara = tafsirText.split('</p>')[0];
            const preview = firstPara.replace(/<[^>]*>/g, '').trim();

            content = {
                short: preview,
                long: tafsirText
            };
        } else {
            // 2b. Fetch Indonesian tafsir from Kemenag API
            // Verse ID format: surahId/verseId (Kemenag uses slash separator)
            const res = await fetch(`https://api.quran.gading.dev/surah/${surahId}/${verseId}`);
            if (!res.ok) throw new Error('Failed to fetch tafsir');

            const json = await res.json() as TafsirResponse;
            const data = json.data?.tafsir?.id;

            if (!data) return null;

            content = {
                // Use short version for cleaner display
                short: data.short,
                long: data.long
            };
        }

        // 3. Save to localStorage
        if (content) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(content));
            } catch (e) {
                // Handle quota exceeded or other storage errors silently
                console.warn('Failed to cache tafsir:', e);
            }
        }

        return content;
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        return null;
    }
}
