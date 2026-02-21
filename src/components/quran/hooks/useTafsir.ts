import { useState } from 'react';
import { getVerseTafsir, type TafsirContent } from '@/lib/tafsir-api';

const TAFSIR_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
type TafsirCacheEntry = { data: TafsirContent; ts: number };

export function useTafsir(locale: string = "id") {
    const [loadingTafsir, setLoadingTafsir] = useState<Set<string>>(new Set());
    const [tafsirCache, setTafsirCache] = useState<Map<string, TafsirCacheEntry>>(new Map());
    const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);
    const [tafsirModalOpen, setTafsirModalOpen] = useState(false);
    const [tafsirModalContent, setTafsirModalContent] = useState<{ verseKey: string, tafsir: TafsirContent } | null>(null);

    const toggleTafsir = async (verseKey: string) => {
        if (activeTafsirVerse === verseKey) {
            setActiveTafsirVerse(null);
            return;
        }

        setActiveTafsirVerse(verseKey);

        const cachedEntry = tafsirCache.get(verseKey);
        if (cachedEntry && Date.now() - cachedEntry.ts > TAFSIR_CACHE_TTL_MS) {
            setTafsirCache(prev => {
                const next = new Map(prev);
                next.delete(verseKey);
                return next;
            });
        }

        // Simplified check:
        if (!tafsirCache.has(verseKey)) {
            setLoadingTafsir(prev => new Set(prev).add(verseKey));
            try {
                const [surahId, verseId] = verseKey.split(':').map(Number);
                const data = await getVerseTafsir(surahId, verseId, locale);
                if (data) {
                    setTafsirCache(prev => new Map(prev).set(verseKey, { data, ts: Date.now() }));
                }
            } catch (error) {
                // Sentry capture or console error
                console.error("Failed to load tafsir", error);
            } finally {
                setLoadingTafsir(prev => {
                    const next = new Set(prev);
                    next.delete(verseKey);
                    return next;
                });
            }
        }
    };

    return {
        activeTafsirVerse,
        loadingTafsir,
        tafsirCache,
        tafsirModalOpen,
        setTafsirModalOpen,
        tafsirModalContent,
        setTafsirModalContent,
        toggleTafsir
    };
}
