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
    const [bookmarkCount, setBookmarkCount] = useState(0);

    // Load data on mount
    useEffect(() => {
        // Last Read
        const savedRead = localStorage.getItem("quran_last_read");
        if (savedRead) {
            try {
                setLastRead(JSON.parse(savedRead));
            } catch (e) {
                console.error("Failed to parse last read", e);
            }
        }

        // Bookmarks Count
        const savedBookmarks = localStorage.getItem("nawaetu_bookmarks");
        if (savedBookmarks) {
            try {
                const parsed = JSON.parse(savedBookmarks);
                if (Array.isArray(parsed)) {
                    setBookmarkCount(parsed.length);
                }
            } catch (e) {
                console.error("Failed to parse bookmarks", e);
            }
        }
    }, []);

    const filteredChapters = chapters.filter((chapter) =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Dashboard Grid - Grouping Last Read & Bookmarks */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {/* Main Card: Continue Reading (Full width on mobile, 2 cols on desktop) */}
                {lastRead ? (() => {
                    const targetPage = Math.ceil(lastRead.verseId / 20);
                    const safeLastRead = lastRead;
                    return (
                        <Link
                            href={`/quran/${safeLastRead.surahId}?page=${targetPage}#${safeLastRead.surahId}:${safeLastRead.verseId}`}
                            className="col-span-2 group relative overflow-hidden rounded-3xl border border-[rgb(var(--color-primary))]/50 bg-[#0f172a] shadow-lg shadow-[rgb(var(--color-primary))]/5 transition-all duration-500 hover:shadow-[rgb(var(--color-primary))]/20 hover:-translate-y-0.5"
                        >
                            {/* Dynamic Background Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary),0.15),transparent_50%)]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/10 via-transparent to-transparent opacity-50" />

                            <div className="relative p-5 md:p-6 flex items-center justify-between gap-4 h-full">
                                <div className="flex flex-col justify-center gap-1.5 h-full">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-primary))] animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-primary-light))]">
                                            Terakhir Dibaca
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[rgb(var(--color-primary-light))] transition-colors">
                                            {safeLastRead.surahName}
                                        </h3>
                                        <p className="text-xs md:text-sm text-slate-400 font-medium mt-0.5">
                                            Ayat {safeLastRead.verseId}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 group-hover:bg-[rgb(var(--color-primary))] group-hover:border-[rgb(var(--color-primary))] transition-all">
                                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-[rgb(var(--color-primary))] group-hover:text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })() : (
                    <div className="col-span-2 rounded-3xl border border-white/5 bg-[#0f172a]/40 p-5 flex flex-col justify-center gap-1">
                        <h3 className="text-base font-bold text-white/50">Belum ada riwayat</h3>
                        <p className="text-xs text-slate-500">Mulai membaca sekarang.</p>
                    </div>
                )}

                {/* Secondary Card: Bookmarks - Compact on Mobile */}
                <Link
                    href="/bookmarks"
                    className="col-span-2 md:col-span-1 group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/40 backdrop-blur-sm p-5 md:p-6 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-3 transition-all duration-500 hover:bg-[#0f172a]/80 hover:border-[rgb(var(--color-primary))]/30 hover:shadow-lg"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex items-center md:flex-col md:items-start gap-4 md:gap-0 w-full">
                        <div className="h-10 w-10 md:h-10 md:w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[rgb(var(--color-primary))]/20 group-hover:border-[rgb(var(--color-primary))]/30 transition-colors md:mb-4">
                            <Bookmark className="h-5 w-5 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-base md:text-lg font-bold text-white mb-0.5">Tanda Baca</h3>
                            <p className="text-xs text-slate-400 group-hover:text-slate-300">
                                {bookmarkCount} ayat tersimpan
                            </p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-500 md:hidden" />
                    </div>
                </Link>
            </div>

            {/* Search Input */}
            <div className="relative group pt-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                <div className="relative bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-4 py-2.5 shadow-lg focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/30 transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[rgb(var(--color-primary))] transition-colors" />
                    <Input
                        placeholder="Cari Surat (e.g. Al-Kahf) atau Arti..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none bg-transparent text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 px-3 h-auto py-1"
                    />
                </div>
            </div>

            {/* Surah List Header */}
            <div className="flex items-center justify-between px-2 pt-1">
                <h2 className="text-xl font-bold text-white">Surat-Surat</h2>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {filteredChapters.length} SURAT
                </span>
            </div>

            {/* Surah Grid */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                {filteredChapters.map((chapter) => {
                    const isBookmarked = lastRead?.surahId === chapter.id;
                    return (
                        <Link
                            key={chapter.id}
                            href={`/quran/${chapter.id}`}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 gap-3 ${isBookmarked
                                ? 'border-[rgb(var(--color-primary))]/70 bg-[rgb(var(--color-primary))]/15 hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/20 hover:shadow-[0_0_25px_rgba(var(--color-primary),0.25)] shadow-[0_0_10px_rgba(var(--color-primary),0.1)]'
                                : 'border-white/10 bg-white/5 hover:border-[rgb(var(--color-primary))]/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.2)]'
                                }`}
                        >
                            {/* Bookmark Badge - Compact Icon Only */}
                            {isBookmarked && (
                                <div className="absolute top-0 right-0 z-10">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-bl-xl bg-[rgb(var(--color-primary))]/20 backdrop-blur-sm border-b border-l border-[rgb(var(--color-primary))]/30">
                                        <Bookmark className="h-3 w-3 text-[rgb(var(--color-primary))] fill-current" />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {/* Surah Number Circle */}
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 transition-all ${isBookmarked
                                        ? 'bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary))] ring-[rgb(var(--color-primary))]/30 group-hover:bg-[rgb(var(--color-primary))]/25'
                                        : 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))] ring-[rgb(var(--color-primary))]/20 group-hover:bg-[rgb(var(--color-primary))]/20 group-hover:text-[rgb(var(--color-primary))]'
                                        }`}>
                                        {chapter.id}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`font-bold text-sm truncate transition-colors ${isBookmarked
                                            ? 'text-[rgb(var(--color-primary-light))] group-hover:text-[rgb(var(--color-primary))]'
                                            : 'text-white group-hover:text-[rgb(var(--color-primary-light))]'
                                            }`}>
                                            {chapter.name_simple}
                                        </span>
                                        <span className={`text-[10px] truncate ${isBookmarked
                                            ? 'text-[rgb(var(--color-primary))]/80'
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
        </div>
    );
}
