"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Bookmark } from "lucide-react";

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

export default function LastReadWidget() {
    const [lastRead, setLastRead] = useState<LastReadData | null>(null);
    const [verseContent, setVerseContent] = useState<VerseContent | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("quran_last_read");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setLastRead(data);

                const cacheKey = `verse_${data.surahId}_${data.verseId}`;
                const cached = localStorage.getItem(cacheKey);

                if (cached) {
                    setVerseContent(JSON.parse(cached));
                } else {
                    fetchVerseContent(data.surahId, data.verseId);
                }
            } catch (e) {
                console.error("Failed to load last read", e);
            }
        }
    }, []);

    const fetchVerseContent = async (surahId: number, verseId: number) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://api.quran.com/api/v4/verses/by_key/${surahId}:${verseId}?language=id&fields=text_uthmani&translations=33`
            );

            if (!res.ok) throw new Error("Failed to fetch verse");

            const data = await res.json();
            const verse = data.verse;

            const content: VerseContent = {
                arabic: verse.text_uthmani || "",
                translation: verse.translations?.[0]?.text || ""
            };

            setVerseContent(content);
            const cacheKey = `verse_${surahId}_${verseId}`;
            localStorage.setItem(cacheKey, JSON.stringify(content));
        } catch (error) {
            console.error("Error fetching verse:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    // === No Last Read - Prompt to Start ===
    if (!lastRead) {
        return (
            <div className="w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                <Link href="/quran" className="block group h-full">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-white/10 p-4 h-full flex items-center justify-between transition-all duration-300 hover:bg-slate-900/80 hover:border-emerald-500/30">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Mulai Tilawah</h3>
                                <p className="text-[10px] text-white/40">Baca Al-Quran hari ini</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                    </div>
                </Link>
            </div>
        );
    }

    // === Has Last Read - Show Preview ===
    return (
        <div className="w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            <Link href={`/quran/${lastRead.surahId}`} className="block group h-full">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-white/10 p-4 h-full flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30">

                    {/* Header: Badge + Surah Name */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-emerald-400 fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">
                                Lanjut Baca
                            </span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-white/30 group-hover:text-white transition-colors" />
                    </div>

                    {/* Content: Arabic Preview */}
                    {loading ? (
                        <div className="flex-1 flex items-center">
                            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                        </div>
                    ) : verseContent ? (
                        <div className="flex-1 flex items-center">
                            <p className="text-right text-base leading-relaxed text-white/80 line-clamp-1 font-arabic w-full">
                                {verseContent.arabic}
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {/* Footer: Surah Info */}
                    <h3 className="text-xs font-semibold text-emerald-400 mt-2">
                        QS. {lastRead.surahName} : {lastRead.verseId}
                    </h3>
                </div>
            </Link>
        </div>
    );
}
