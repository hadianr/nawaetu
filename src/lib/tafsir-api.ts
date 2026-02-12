import { getStorageService } from "@/core/infrastructure/storage";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import { API_CONFIG } from "@/config/apis";

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
const TAFSIR_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TAFSIR_CACHE_VERSION = 1;

type TafsirCacheEntry = {
    data: TafsirContent;
    ts: number;
    v: number;
};

export async function getVerseTafsir(surahId: number, verseId: number, locale: string = "id"): Promise<TafsirContent | null> {
    const cacheKey = `${CACHE_KEY_PREFIX}${locale}_${surahId}:${verseId}`;
    const storage = getStorageService();

    try {
        // 1. Check storage cache
        const cached = storage.getOptional<string>(cacheKey as any);
        if (cached) {
            try {
                const parsed = JSON.parse(cached) as TafsirContent | TafsirCacheEntry;
                if (parsed && typeof parsed === "object" && "data" in parsed && "ts" in parsed) {
                    const entry = parsed as TafsirCacheEntry;
                    if (entry.v === TAFSIR_CACHE_VERSION && Date.now() - entry.ts <= TAFSIR_CACHE_TTL_MS) {
                        return entry.data;
                    }
                } else {
                    return parsed as TafsirContent;
                }
            } catch (e) {
            }
        }

        let content: TafsirContent | null = null;

        if (locale === "en") {
            // 2a. Fetch English tafsir from Quran.com (Tafsir ID 169 = Ibn Kathir English)
            // Verse ID format must match: surahId:verseId (same as Kemenag API)
            const verseKey = `${surahId}:${verseId}`;
            const res = await fetchWithTimeout(
                `${API_CONFIG.QURAN_COM.BASE_URL}/tafsirs/169/by_ayah/${verseKey}`,
                {},
                { timeoutMs: 8000 }
            );
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
            const res = await fetchWithTimeout(
                `${API_CONFIG.QURAN_GADING.BASE_URL}/surah/${surahId}/${verseId}`,
                {},
                { timeoutMs: 8000 }
            );
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

        // 3. Save to storage
        if (content) {
            try {
                const entry: TafsirCacheEntry = { data: content, ts: Date.now(), v: TAFSIR_CACHE_VERSION };
                storage.set(cacheKey as any, JSON.stringify(entry));
            } catch (e) {
                // Handle quota exceeded or other storage errors silently
            }
        }

        return content;
    } catch (error) {
        return null;
    }
}
