
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

export async function getVerseTafsir(surahId: number, verseId: number): Promise<TafsirContent | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}${surahId}:${verseId}`;

    try {
        // 1. Check localStorage cache
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            return JSON.parse(cached) as TafsirContent;
        }

        // 2. Fetch from API
        const res = await fetch(`https://api.quran.gading.dev/surah/${surahId}/${verseId}`);
        if (!res.ok) throw new Error('Failed to fetch tafsir');

        const json = await res.json() as TafsirResponse;
        const data = json.data?.tafsir?.id;

        if (!data) return null;

        const content: TafsirContent = {
            short: data.short,
            long: data.long
        };

        // 3. Save to localStorage
        try {
            localStorage.setItem(cacheKey, JSON.stringify(content));
        } catch (e) {
            // Handle quota exceeded or other storage errors silently
            console.warn('Failed to cache tafsir:', e);
        }

        return content;
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        return null;
    }
}
