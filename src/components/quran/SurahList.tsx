"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bookmark, ChevronRight, Clock, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { cn } from "@/lib/utils";
import QuranSearchModal from "./QuranSearchModal";

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
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastRead, setLastRead] = useState<{ surahId: number; verseId: number; surahName: string; timestamp: number } | null>(null);
    const [bookmarkedSurahIds, setBookmarkedSurahIds] = useState<Set<number>>(new Set());
    const [bookmarkCount, setBookmarkCount] = useState(0);

    // Load data on mount
    useEffect(() => {
        queueMicrotask(() => setMounted(true));
        const storage = getStorageService();

        // Last Read
        const savedRead = storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ);
        if (savedRead) {
            try {
                queueMicrotask(() => setLastRead(typeof savedRead === 'string' ? JSON.parse(savedRead) : savedRead));
            } catch {
            }
        }

        // Bookmarks
        const savedBookmarks = storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS);
        if (savedBookmarks) {
            try {
                const parsed = typeof savedBookmarks === 'string' ? JSON.parse(savedBookmarks) : savedBookmarks;
                if (Array.isArray(parsed)) {
                    queueMicrotask(() => {
                        setBookmarkCount(parsed.length);
                        const ids = new Set(parsed.map((bookmark: { surahId: number }) => bookmark.surahId));
                        setBookmarkedSurahIds(ids);
                    });
                }
            } catch {
            }
        }
    }, []);

    const filteredChapters = chapters.filter((chapter) =>
        chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chapter.translated_name_en && chapter.translated_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const prefetchedRef = useRef<Set<number>>(new Set());
    const prefetchedRouteRef = useRef<Set<string>>(new Set());

    const prefetchSurah = useCallback((surahId: number) => {
        if (prefetchedRef.current.has(surahId)) return;
        router.prefetch(`/quran/${surahId}`);
        prefetchedRef.current.add(surahId);
    }, [router]);

    const prefetchRoute = useCallback((href: string) => {
        if (prefetchedRouteRef.current.has(href)) return;
        router.prefetch(href);
        prefetchedRouteRef.current.add(href);
    }, [router]);

    // Only prefetch on hover/focus (handled in return JSX)

    // Keep the server and first client render identical. Locale, theme, and
    // persisted Quran state are resolved after hydration.
    if (!mounted) return <div className="min-h-[520px]" aria-hidden="true" />;

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
                            href={`/quran/${safeLastRead.surahId}?page=${targetPage}#verse-${safeLastRead.verseId}`}
                            onMouseEnter={() => router.prefetch(`/quran/${safeLastRead.surahId}`)}
                            onFocus={() => router.prefetch(`/quran/${safeLastRead.surahId}`)}
                            className={cn(
                                "col-span-2 group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-0.5 shadow-lg",
                                "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] shadow-[var(--shadow-card)] hover:bg-[rgb(var(--color-primary))]/10 hover:border-[rgb(var(--color-primary))]/40"
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
                                            "bg-[rgb(var(--color-primary))]"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest",
                                            "text-[rgb(var(--color-primary-strong))]"
                                        )}>
                                            {t.quranLastRead}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "text-xl md:text-2xl font-bold transition-colors",
                                            "text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary-strong))]"
                                        )}>
                                            {safeLastRead.surahName}
                                        </h3>
                                        <p className={cn(
                                            "text-xs md:text-sm font-medium mt-0.5",
                                            "text-[rgb(var(--color-text-muted))]"
                                        )}>
                                            {t.quranVerse} {safeLastRead.verseId}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border transition-all",
                                    "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/25 group-hover:bg-[rgb(var(--color-primary))] group-hover:border-[rgb(var(--color-primary))]"
                                )}>
                                    <Clock className={cn(
                                        "h-5 w-5 md:h-6 md:w-6 transition-colors",
                                        "text-[rgb(var(--color-primary-strong))] group-hover:text-[rgb(var(--color-primary-foreground))]"
                                    )} />
                                </div>
                            </div>
                        </Link>
                    );
                })() : (
                    <div className={cn(
                        "col-span-2 rounded-3xl border p-5 flex flex-col justify-center gap-1",
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                    )}>
                        <h3 className={cn(
                            "text-base font-bold",
                            "text-[rgb(var(--color-text-muted))]"
                        )}>{t.quranNoHistory}</h3>
                        <p className={cn(
                            "text-xs font-medium uppercase tracking-widest",
                            "text-[rgb(var(--color-primary-strong))]/70"
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
                        bookmarkCount > 0
                            ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/35 shadow-[var(--shadow-card)] hover:bg-[rgb(var(--color-primary))]/20"
                            : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-subtle))]"
                    )}
                >
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                        "from-[rgb(var(--color-primary))]/12 to-transparent"
                    )} />

                    <div className="relative flex items-center md:flex-col md:items-start gap-4 md:gap-0 w-full">
                        <div className={cn(
                            "h-10 w-10 md:h-10 md:w-10 rounded-full flex items-center justify-center border transition-all md:mb-4",
                            bookmarkCount > 0
                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] border-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
                                : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] group-hover:bg-[rgb(var(--color-primary))]/10 group-hover:border-[rgb(var(--color-primary))]/30 group-hover:text-[rgb(var(--color-primary-strong))]"
                        )}>
                            <Bookmark className={cn(
                                "h-5 w-5 transition-colors",
                                bookmarkCount > 0 ? "fill-current" : "text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-primary))]"
                            )} />
                        </div>

                        <div className="flex-1">
                            <h3 className={cn(
                                "text-base md:text-lg font-bold mb-0.5",
                                "text-[rgb(var(--color-text-strong))]"
                            )}>{t.quranBookmarks}</h3>
                            <p className={cn(
                                "text-xs",
                                "text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-primary-strong))]"
                            )}>
                                {bookmarkCount} {t.quranVersesSaved}
                            </p>
                        </div>

                        <ChevronRight className={cn(
                            "h-5 w-5 md:hidden",
                            "text-[rgb(var(--color-text-muted))]"
                        )} />
                    </div>
                </Link>
            </div>

            {/* Search Input & Deep Search Button */}
            <div className="flex items-center gap-2 pt-1">
                <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
                    <div className={cn(
                        "relative border rounded-2xl flex items-center px-4 py-2.5 shadow-lg transition-all h-[44px]",
                        "bg-transparent border-[rgb(var(--color-border))] focus-within:border-[rgb(var(--color-primary))] focus-within:ring-1 focus-within:ring-[rgb(var(--color-primary))]/30"
                    )}>
                        <Search className={cn(
                            "w-4 h-4 transition-colors",
                            "text-[rgb(var(--color-text-muted))] group-focus-within:text-[rgb(var(--color-primary-strong))]"
                        )} />
                        <Input
                            placeholder={t.quranSearchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoCapitalize="none"
                            autoCorrect="off"
                            className={cn(
                                "!border-none !bg-transparent !shadow-none text-[16px] sm:text-sm focus-visible:ring-0 px-3 h-auto py-1",
                                "text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))]"
                            )}
                        />
                    </div>
                </div>
                <QuranSearchModal />
            </div>

            {/* Surah List Header */}
            <div className="flex items-center justify-between px-2 pt-1">
                <h2 className={cn(
                    "text-xl font-bold",
                    "text-[rgb(var(--color-text-strong))]"
                )}>{t.quranSurahList}</h2>
                <span className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    "text-[rgb(var(--color-text-muted))]"
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
                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/15 shadow-[var(--shadow-card)] hover:bg-[rgb(var(--color-primary))]/25"
                                    : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5 hover:shadow-[var(--shadow-card)]"
                            )}
                        >
                            {/* Bookmark Badge - Compact Icon Only */}
                            {isBookmarked && (
                                <div className="absolute top-0 right-0 z-10 pointer-events-none">
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-bl-xl border-b border-l backdrop-blur-sm",
                                        "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/25"
                                    )}>
                                        <Bookmark className={cn(
                                            "h-3 w-3 fill-current",
                                            "text-[rgb(var(--color-primary-strong))]"
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
                                            ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] ring-[rgb(var(--color-primary))]/30 group-hover:bg-[rgb(var(--color-primary-strong))]"
                                            : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] ring-[rgb(var(--color-border))] group-hover:bg-[rgb(var(--color-primary))]/10 group-hover:text-[rgb(var(--color-primary-strong))]"
                                    )}>
                                        {chapter.id}
                                    </div>
                                    <div className="flex flex-col min-w-0 relative z-0">
                                        <span className={cn(
                                            "font-bold text-sm truncate transition-colors",
                                            isLastRead
                                                ? "text-[rgb(var(--color-text-strong))]"
                                                : "text-[rgb(var(--color-text))]"
                                        )}>
                                            {chapter.name_simple}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] truncate transition-colors",
                                            isLastRead
                                                ? "text-[rgb(var(--color-primary-strong))]"
                                                : "text-[rgb(var(--color-text-muted))]"
                                        )}>
                                            {locale === 'en' && chapter.translated_name_en ? chapter.translated_name_en : chapter.translated_name.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between w-full pointer-events-none">
                                <p className={cn(
                                    "text-[9px] font-medium uppercase tracking-wider transition-colors",
                                    "text-[rgb(var(--color-text-muted))]"
                                )}>
                                    {chapter.verses_count} {t.quranVerseCount}, {chapter.revelation_place === "makkah" ? t.quranMakkah : t.quranMadinah}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "font-amiri text-lg transition-colors",
                                        "text-[rgb(var(--color-text-strong))]"
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
                                            "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/25 text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-foreground))] hover:border-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]"
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
