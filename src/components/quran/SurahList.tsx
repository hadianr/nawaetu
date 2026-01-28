"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bookmark, ChevronRight, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface DateType {
    hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
            en: string;
            ar: string;
        };
        month: {
            number: number;
            en: string;
            ar: string;
        };
        year: string;
        designation: {
            abbreviated: string;
            expanded: string;
        };
    };
    gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
            en: string;
        };
        month: {
            number: number;
            en: string;
        };
        year: string;
        designation: {
            abbreviated: string;
            expanded: string;
        };
    };
    readable: string;
    timestamp: string;
}

export interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

interface SurahListProps {
    chapters: Chapter[];
}

export default function SurahList({ chapters }: SurahListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [lastRead, setLastRead] = useState<{ surahId: number; verseId: number; surahName: string; timestamp: number } | null>(null);

    // Load bookmark on mount
    useEffect(() => {
        const saved = localStorage.getItem("quran_last_read");
        if (saved) {
            try {
                setLastRead(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to  parse bookmark", e);
            }
        }
    }, []);

    const filteredChapters = chapters.filter((chapter) =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Sticky Search Header */}
            <div className="sticky top-0 z-20 -mx-4 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:p-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                        placeholder="Cari Surat atau Arti..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:ring-[rgb(var(--color-primary))]/50"
                    />
                </div>
            </div>

            {/* Continue Reading Banner */}
            {lastRead && (() => {
                // Calculate which page the verse is on (20 verses per page)
                const targetPage = Math.ceil(lastRead.verseId / 20);
                return (
                    <Link
                        href={`/quran/${lastRead.surahId}?page=${targetPage}#${lastRead.surahId}:${lastRead.verseId}`}
                        className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] flex items-center justify-between"
                    >
                        {/* Glowing Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-start gap-4 flex-1">
                            {/* Bookmark Icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/30">
                                <Bookmark className="h-5 w-5 text-amber-400 fill-current" />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Terakhir Dibaca</span>
                                    <Clock className="h-3 w-3 text-amber-400/60" />
                                </div>
                                <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                                    {lastRead.surahName}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Ayat {lastRead.verseId} • Tap untuk melanjutkan
                                </p>
                            </div>
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight className="h-5 w-5 text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                );
            })()}

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                {filteredChapters.map((chapter) => {
                    const isBookmarked = lastRead?.surahId === chapter.id;
                    return (
                        <Link
                            key={chapter.id}
                            href={`/quran/${chapter.id}`}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 gap-3 ${isBookmarked
                                ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10 hover:shadow-[0_0_25px_rgba(251,146,60,0.15)]'
                                : 'border-white/10 bg-white/5 hover:border-[rgb(var(--color-primary))]/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.1)]'
                                }`}
                        >
                            {/* Bookmark Badge */}
                            {isBookmarked && (
                                <div className="absolute top-2 right-2 z-10">
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 ring-1 ring-amber-400/30 backdrop-blur-sm">
                                        <Bookmark className="h-2.5 w-2.5 text-amber-400 fill-current" />
                                        <span className="text-[8px] font-bold text-amber-400">Ditandai</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {/* Surah Number Circle */}
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 transition-all ${isBookmarked
                                        ? 'bg-amber-500/15 text-amber-400 ring-amber-400/30 group-hover:bg-amber-500/25'
                                        : 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))] ring-[rgb(var(--color-primary))]/20 group-hover:bg-[rgb(var(--color-primary))]/20 group-hover:text-[rgb(var(--color-primary))]'
                                        }`}>
                                        {chapter.id}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm truncate transition-colors ${isBookmarked
                                            ? 'text-amber-100 group-hover:text-amber-200'
                                            : 'text-white group-hover:text-[rgb(var(--color-primary-light))]'
                                            }`}>
                                            {chapter.name_simple}
                                        </span>
                                        <span className={`text-[10px] truncate ${isBookmarked
                                            ? 'text-amber-400/80'
                                            : 'text-[rgb(var(--color-primary-light))]/80'
                                            }`}>
                                            {chapter.translated_name.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between w-full">
                                <p className="text-[9px] text-white/40">
                                    {chapter.verses_count} Ayat • {chapter.revelation_place === "makkah" ? "Mekah" : "Madinah"}
                                </p>
                                <span className="font-amiri text-lg text-white/90 leading-none">
                                    {chapter.name_arabic}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div >
    );
}
