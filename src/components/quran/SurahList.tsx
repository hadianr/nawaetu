"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bookmark, ChevronRight, Clock, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

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
    translated_name_en?: string;
}

interface SurahListProps {
    chapters: Chapter[];
}

export default function SurahList({ chapters }: SurahListProps) {
    const { t, locale } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [lastRead, setLastRead] = useState<{ surahId: number; verseId: number; surahName: string; timestamp: number } | null>(null);
    const [bookmarkedSurahIds, setBookmarkedSurahIds] = useState<Set<number>>(new Set());
    const [bookmarkCount, setBookmarkCount] = useState(0);

    // Load data on mount
    useEffect(() => {
        const storage = getStorageService();

        // Last Read
        const savedRead = storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ);
        if (savedRead) {
            try {
                setLastRead(typeof savedRead === 'string' ? JSON.parse(savedRead) : savedRead);
            } catch (e) {
            }
        }

        // Bookmarks
        const savedBookmarks = storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS);
        if (savedBookmarks) {
            try {
                const parsed = typeof savedBookmarks === 'string' ? JSON.parse(savedBookmarks) : savedBookmarks;
                if (Array.isArray(parsed)) {
                    setBookmarkCount(parsed.length);
                    const ids = new Set(parsed.map((b: any) => b.surahId));
                    setBookmarkedSurahIds(ids);
                }
            } catch (e) {
            }
        }
    }, []);

    const filteredChapters = chapters.filter((chapter) =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chapter.translated_name_en && chapter.translated_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollPrefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prefetchedRef = useRef<Set<number>>(new Set());
    const prefetchedRouteRef = useRef<Set<string>>(new Set());

    const prefetchSurah = useCallback((surahId: number) => {
        if (prefetchedRef.current.has(surahId)) return;
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
        }

        prefetchTimeoutRef.current = setTimeout(() => {
            router.prefetch(`/quran/${surahId}`);
            prefetchedRef.current.add(surahId);
        }, 120);
    }, [router]);

    const prefetchRoute = useCallback((href: string) => {
        if (prefetchedRouteRef.current.has(href)) return;
        router.prefetch(href);
        prefetchedRouteRef.current.add(href);
    }, [router]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollPrefetchTimeoutRef.current) {
                clearTimeout(scrollPrefetchTimeoutRef.current);
            }

            scrollPrefetchTimeoutRef.current = setTimeout(() => {
                const batch = filteredChapters.slice(0, 6).map((chapter) => chapter.id);
                batch.forEach(prefetchSurah);
            }, 240);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollPrefetchTimeoutRef.current) {
                clearTimeout(scrollPrefetchTimeoutRef.current);
            }
        };
    }, [filteredChapters, prefetchSurah]);

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
                            onMouseEnter={() => prefetchSurah(safeLastRead.surahId)}
                            onFocus={() => prefetchSurah(safeLastRead.surahId)}
                            className={cn(
                                "col-span-2 group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-0.5 shadow-lg",
                                isDaylight
                                    ? "bg-emerald-50 border-emerald-100 shadow-emerald-100 hover:bg-emerald-100/50 hover:shadow-emerald-200"
                                    : "bg-[#0f172a] border-[rgb(var(--color-primary))]/50 shadow-[rgb(var(--color-primary))]/5 hover:shadow-[rgb(var(--color-primary))]/20"
                            )}
                        >
                            {/* Dynamic Background Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary),0.15),transparent_50%)]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/10 via-transparent to-transparent opacity-50" />

                            <div className="relative p-5 md:p-6 flex items-center justify-between gap-4 h-full">
                                <div className="flex flex-col justify-center gap-1.5 h-full">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full animate-pulse",
                                            isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest",
                                            isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                                        )}>
                                            {t.quranLastRead}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "text-xl md:text-2xl font-bold transition-colors",
                                            isDaylight ? "text-slate-900 group-hover:text-emerald-600" : "text-white group-hover:text-[rgb(var(--color-primary-light))]"
                                        )}>
                                            {safeLastRead.surahName}
                                        </h3>
                                        <p className={cn(
                                            "text-xs md:text-sm font-medium mt-0.5",
                                            isDaylight ? "text-slate-500" : "text-white/70"
                                        )}>
                                            {t.quranVerse} {safeLastRead.verseId}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border transition-all",
                                    isDaylight
                                        ? "bg-emerald-500/10 border-emerald-200 group-hover:bg-emerald-500 group-hover:border-emerald-500"
                                        : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 group-hover:bg-[rgb(var(--color-primary))] group-hover:border-[rgb(var(--color-primary))]"
                                )}>
                                    <Clock className={cn(
                                        "h-5 w-5 md:h-6 md:w-6 transition-colors",
                                        isDaylight
                                            ? "text-emerald-600 group-hover:text-white"
                                            : "text-[rgb(var(--color-primary))] group-hover:text-white"
                                    )} />
                                </div>
                            </div>
                        </Link>
                    );
                })() : (
                    <div className={cn(
                        "col-span-2 rounded-3xl border p-5 flex flex-col justify-center gap-1",
                        isDaylight ? "bg-white border-slate-100 shadow-sm" : "border-white/5 bg-[#0f172a]/40"
                    )}>
                        <h3 className={cn(
                            "text-base font-bold",
                            isDaylight ? "text-slate-400" : "text-white/70"
                        )}>{t.quranNoHistory}</h3>
                        <p className={cn(
                            "text-xs font-medium uppercase tracking-widest",
                            isDaylight ? "text-emerald-500/50" : "text-white/50"
                        )}>{t.quranStartReading}</p>
                    </div>
                )}

                {/* Secondary Card: Bookmarks - Compact on Mobile */}
                <Link
                    href="/bookmarks"
                    onMouseEnter={() => prefetchRoute("/bookmarks")}
                    onFocus={() => prefetchRoute("/bookmarks")}
                    className={cn(
                        "col-span-2 md:col-span-1 group relative overflow-hidden rounded-3xl border backdrop-blur-sm p-5 md:p-6 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-3 transition-all duration-500 hover:shadow-lg",
                        isDaylight
                            ? bookmarkCount > 0
                                ? "bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100/50 hover:bg-emerald-100/50"
                                : "bg-white border-slate-100 hover:bg-slate-50"
                            : "bg-[#0f172a]/40 border-white/10 hover:bg-[#0f172a]/80 hover:border-[rgb(var(--color-primary))]/30"
                    )}
                >
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                        isDaylight ? "from-emerald-500/10 to-transparent" : "from-white/5 to-transparent"
                    )} />

                    <div className="relative flex items-center md:flex-col md:items-start gap-4 md:gap-0 w-full">
                        <div className={cn(
                            "h-10 w-10 md:h-10 md:w-10 rounded-full flex items-center justify-center border transition-all md:mb-4",
                            isDaylight
                                ? bookmarkCount > 0
                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-200"
                                    : "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-500"
                                : "bg-white/5 border-white/10 group-hover:bg-[rgb(var(--color-primary))]/20 group-hover:border-[rgb(var(--color-primary))]/30"
                        )}>
                            <Bookmark className={cn(
                                "h-5 w-5 transition-colors",
                                isDaylight
                                    ? bookmarkCount > 0 ? "fill-current" : ""
                                    : "text-white/70 group-hover:text-[rgb(var(--color-primary))]"
                            )} />
                        </div>

                        <div className="flex-1">
                            <h3 className={cn(
                                "text-base md:text-lg font-bold mb-0.5",
                                isDaylight ? "text-slate-900" : "text-white"
                            )}>{t.quranBookmarks}</h3>
                            <p className={cn(
                                "text-xs",
                                isDaylight ? "text-slate-500 group-hover:text-emerald-600" : "text-white/70 group-hover:text-white/90"
                            )}>
                                {bookmarkCount} {t.quranVersesSaved}
                            </p>
                        </div>

                        <ChevronRight className={cn(
                            "h-5 w-5 md:hidden",
                            isDaylight ? "text-slate-400" : "text-slate-500"
                        )} />
                    </div>
                </Link>
            </div>

            {/* Search Input */}
            <div className="relative group pt-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                <div className={cn(
                    "relative border rounded-2xl flex items-center px-4 py-2.5 shadow-lg transition-all",
                    isDaylight
                        ? "bg-white border-slate-200 focus-within:border-emerald-500 focus-within:ring-emerald-100"
                        : "bg-[#0f172a]/60 backdrop-blur-xl border-white/10 focus-within:border-[rgb(var(--color-primary))]/50 focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/30"
                )}>
                    <Search className={cn(
                        "w-4 h-4 transition-colors",
                        isDaylight ? "text-slate-400 group-focus-within:text-emerald-500" : "text-slate-400 group-focus-within:text-[rgb(var(--color-primary))]"
                    )} />
                    <Input
                        placeholder={t.quranSearchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "border-none bg-transparent text-sm focus-visible:ring-0 px-3 h-auto py-1",
                            isDaylight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-500"
                        )}
                    />
                </div>
            </div>

            {/* Surah List Header */}
            <div className="flex items-center justify-between px-2 pt-1">
                <h2 className={cn(
                    "text-xl font-bold",
                    isDaylight ? "text-slate-900" : "text-white"
                )}>{t.quranSurahList}</h2>
                <span className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    isDaylight ? "text-slate-500" : "text-white/70"
                )}>
                    {filteredChapters.length} {t.quranSurahCount}
                </span>
            </div>

            {/* Surah Grid */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                {filteredChapters.map((chapter) => {
                    const isBookmarked = bookmarkedSurahIds.has(chapter.id);
                    const isLastRead = lastRead?.surahId === chapter.id;
                    return (
                        <div
                            key={chapter.id}
                            role="link"
                            tabIndex={0}
                            aria-label={`Buka detail surah ${chapter.name_simple}`}
                            onClick={() => router.push(`/quran/${chapter.id}`)}
                            onMouseEnter={() => prefetchSurah(chapter.id)}
                            onFocus={() => prefetchSurah(chapter.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    router.push(`/quran/${chapter.id}`);
                                }
                            }}
                            className={cn(
                                "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 gap-3 cursor-pointer",
                                isLastRead
                                    ? isDaylight
                                        ? "border-emerald-400 bg-emerald-100/70 shadow-xl shadow-emerald-500/20 hover:bg-emerald-100"
                                        : "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/30 shadow-[0_0_30px_rgba(var(--color-primary),0.25)] hover:bg-[rgb(var(--color-primary))]/40"
                                    : isDaylight
                                        ? "border-slate-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md"
                                        : "border-white/10 bg-white/5 hover:border-[rgb(var(--color-primary))]/40 hover:bg-white/10"
                            )}
                        >
                            {/* Bookmark Badge - Compact Icon Only */}
                            {isBookmarked && (
                                <div className="absolute top-0 right-0 z-10 pointer-events-none">
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-bl-xl border-b border-l backdrop-blur-sm",
                                        isDaylight
                                            ? "bg-emerald-500/20 border-emerald-200"
                                            : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/30"
                                    )}>
                                        <Bookmark className={cn(
                                            "h-3 w-3 fill-current",
                                            isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary))]"
                                        )} />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {/* Surah Number Circle */}
                                    <div className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 transition-all",
                                        isLastRead
                                            ? isDaylight
                                                ? "bg-emerald-500 text-white ring-emerald-400 group-hover:bg-emerald-600"
                                                : "bg-[rgb(var(--color-primary))] text-white ring-[rgb(var(--color-primary))]/30"
                                            : isDaylight
                                                ? "bg-slate-50 text-slate-500 ring-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                                                : "bg-white/5 text-slate-400 ring-white/10 group-hover:text-[rgb(var(--color-primary-light))]"
                                    )}>
                                        {chapter.id}
                                    </div>
                                    <div className="flex flex-col min-w-0 relative z-0">
                                        <span className={cn(
                                            "font-bold text-sm truncate transition-colors",
                                            isLastRead
                                                ? isDaylight ? "text-slate-900" : "text-white"
                                                : isDaylight ? "text-slate-800" : "text-slate-300"
                                        )}>
                                            {chapter.name_simple}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] truncate transition-colors",
                                            isLastRead
                                                ? isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]"
                                                : isDaylight ? "text-slate-500" : "text-slate-500"
                                        )}>
                                            {locale === 'en' && chapter.translated_name_en ? chapter.translated_name_en : chapter.translated_name.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between w-full pointer-events-none">
                                <p className={cn(
                                    "text-[9px] font-medium uppercase tracking-wider transition-colors",
                                    isDaylight ? "text-slate-500" : "text-white/70"
                                )}>
                                    {chapter.verses_count} {t.quranVerseCount} • {chapter.revelation_place === "makkah" ? t.quranMakkah : t.quranMadinah}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "font-amiri text-lg transition-colors",
                                        isDaylight ? "text-slate-900" : "text-white/95"
                                    )}>
                                        {chapter.name_arabic}
                                    </span>
                                    {/* Quick Play Button - High Z-Index to stay above stretched link */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/quran/${chapter.id}?autoplay=true`);
                                        }}
                                        className={cn(
                                            "pointer-events-auto relative z-10 h-7 w-7 flex items-center justify-center rounded-full transition-all cursor-pointer border",
                                            isDaylight
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm shadow-emerald-100"
                                                : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))] hover:text-white"
                                        )}
                                    >
                                        <Play className="h-3 w-3 fill-current ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
