"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Bookmark } from "lucide-react";
import WidgetSkeleton from "@/components/skeleton/WidgetSkeleton";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { fetchWithTimeout } from "@/lib/utils/fetch";

interface LastReadData {
    surahId: number;
    surahName: string;
    verseId: number;
    timestamp: number;
}

interface VerseContent {
    arabic: string;
    translation: string;
}

const VERSE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VERSE_CACHE_VERSION = 1;

type VerseCacheEntry = {
    data: VerseContent;
    ts: number;
    v: number;
};

export default function LastReadWidget() {
    const { t } = useLocale();
    const [lastRead, setLastRead] = useState<LastReadData | null>(null);
    const [verseContent, setVerseContent] = useState<VerseContent | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storage = getStorageService();
        const saved = storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ);
        if (saved) {
            try {
                const data = typeof saved === 'string' ? JSON.parse(saved) : saved;
                setLastRead(data);

                const cacheKey = `verse_${data.surahId}_${data.verseId}`;
                const cached = storage.getOptional(cacheKey);

                if (cached) {
                    try {
                        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
                        if (parsed && typeof parsed === 'object' && 'data' in parsed && 'ts' in parsed) {
                            const entry = parsed as VerseCacheEntry;
                            if (entry.v === VERSE_CACHE_VERSION && Date.now() - entry.ts <= VERSE_CACHE_TTL_MS) {
                                setVerseContent(entry.data);
                            } else {
                                storage.remove(cacheKey as any);
                                fetchVerseContent(data.surahId, data.verseId);
                            }
                        } else {
                            setVerseContent(parsed as VerseContent);
                        }
                    } catch (e) {
                        storage.remove(cacheKey as any);
                        fetchVerseContent(data.surahId, data.verseId);
                    }
                } else {
                    fetchVerseContent(data.surahId, data.verseId);
                }
            } catch (e) {
                console.error("Failed to load last read", e);
            }
        }
    }, []);

    const fetchVerseContent = async (surahId: number, verseId: number) => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            return;
        }
        setLoading(true);
        try {
            const res = await fetchWithTimeout(
                `https://api.quran.com/api/v4/verses/by_key/${surahId}:${verseId}?language=id&fields=text_uthmani&translations=33`,
                {},
                { timeoutMs: 8000 }
            );

            if (!res.ok) throw new Error("Failed to fetch verse");

            const data = await res.json();
            const verse = data.verse;

            const content: VerseContent = {
                arabic: verse.text_uthmani || "",
                translation: verse.translations?.[0]?.text || ""
            };

            setVerseContent(content);
            const storage = getStorageService();
            const cacheKey = `verse_${surahId}_${verseId}`;
            const entry: VerseCacheEntry = { data: content, ts: Date.now(), v: VERSE_CACHE_VERSION };
            storage.set(cacheKey as any, JSON.stringify(entry));
        } catch (error) {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                return;
            }
            console.error("Error fetching verse:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return <WidgetSkeleton />;

    // === No Last Read - Prompt to Start ===
    if (!lastRead) {
        return (
            <div className="w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                <Link href="/quran" className="block group h-full">
                    <div className="relative overflow-hidden rounded-3xl bg-black/20 border border-white/5 p-4 h-full flex items-center justify-between transition-all duration-300 hover:bg-black/30 hover:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[rgb(var(--color-primary))]/10 flex items-center justify-center text-[rgb(var(--color-primary-light))]">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">{t.homeLastReadStartTitle}</h2>
                                <p className="text-[10px] text-white/70">{t.homeLastReadStartSubtitle}</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                    </div>
                </Link>
            </div>
        );
    }

    // === Has Last Read - Show Preview ===
    return (
        <div className="w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            <Link href={`/quran/${lastRead.surahId}#${lastRead.surahId}:${lastRead.verseId}`} className="block group h-full">
                <div className="relative overflow-hidden rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 p-4 h-full flex flex-col justify-between transition-all duration-300 hover:bg-black/30 hover:border-white/20">

                    {/* Header: Label */}
                    <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-70 transition-opacity">
                        <Bookmark className="h-3 w-3 text-[rgb(var(--color-primary-light))] fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                            {t.homeLastReadLabel}
                        </span>
                    </div>

                    {/* Content: Arabic Preview - Centered content feeling */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center py-2">
                            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                        </div>
                    ) : verseContent ? (
                        <div className="flex-1 flex flex-col justify-center items-center py-1 text-center scale-110">
                            <p className="text-xl leading-relaxed text-white/90 line-clamp-1 font-arabic w-full">
                                {verseContent.arabic}
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {/* Footer: Context */}
                    <div className="text-center group-hover:translate-x-1 transition-transform">
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-[10px] font-medium text-white/70">
                                QS. {lastRead.surahName} : {lastRead.verseId}
                            </span>
                            <ChevronRight className="h-3 w-3 text-white/30 group-hover:text-[rgb(var(--color-primary-light))] transition-colors" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
