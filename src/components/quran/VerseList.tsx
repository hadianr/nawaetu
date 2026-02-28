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

import TajweedLegend from "./TajweedLegend";
import { useState, useRef, useEffect, useMemo, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, Pause, Share2, Bookmark, Check, ChevronLeft, ChevronRight, Settings, Type, Palette, Search, Volume2, X, BookOpen, ChevronDown, Copy, Lightbulb, Loader2, Square, CheckCircle, AlignJustify, MoreVertical, ArrowLeft, ArrowRight, RotateCw, Repeat, Infinity as InfinityIcon, CornerDownRight, Hash, Headphones } from 'lucide-react';
import { getVerseTafsir, type TafsirContent } from '@/lib/tafsir-api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";
import { Chapter } from "@/components/quran/SurahList";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

const VerseShareDialog = dynamic(() => import("./VerseShareDialog"), { ssr: false });
const BookmarkEditDialog = dynamic(() => import("./BookmarkEditDialog"), { ssr: false });
import { AyahMarker } from "./AyahMarker";
import VerseCard from "./VerseCard";
import TafsirModal from "./TafsirModal";
import AudioPlayerBar from "./AudioPlayerBar";
import QuranSettingsModal from "./QuranSettingsModal";
import { surahNames } from "@/lib/surahData";
import { QURAN_RECITER_OPTIONS, DEFAULT_SETTINGS } from "@/data/settings-data";
import { useBookmarks } from "@/hooks/useBookmarks";
import { type Bookmark as BookmarkType } from "@/lib/bookmark-storage";
import { cn } from "@/lib/utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";
import { cleanTajweedText } from "@/lib/sanitize";
import { incrementDailyActivity } from "@/lib/analytics-utils";
import { toast } from "sonner";
import { getBookmarkRepository } from '@/core/repositories/bookmark.repository';
import {
    toArabicNumber,
    cleanTranslation,
    cleanIndopakText,
    getVerseFontClass,
    formatFootnotes
} from "@/lib/quran-utils";


export interface Verse {
    id: number;
    verse_key: string;
    text_uthmani: string;
    text_uthmani_tajweed?: string;
    text_indopak?: string;
    audio: {
        url: string;
    };
    translations: {
        id: number;
        resource_id: number;
        text: string;
    }[];
    transliteration?: string;

}

interface VerseListProps {
    chapter: Chapter;
    verses: Verse[];
    audioUrl?: string; // Full Surah Audio
    currentPage: number;
    totalPages: number;
    currentReciterId?: number;
    currentLocale?: string;
}


export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages, currentReciterId, currentLocale = "id" }: VerseListProps) {
    const { t, locale: contextLocale } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    // --- State ---
    const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [autoplayExecuted, setAutoplayExecuted] = useState(false);

    // Settings State
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [showTransliteration, setShowTransliteration] = useState(true);
    const [scriptType, setScriptType] = useState<'tajweed' | 'indopak'>('indopak'); // Default to Indopak for clarity
    const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list');
    const [perPage, setPerPage] = useState<number>(DEFAULT_SETTINGS.versesPerPage);
    const locale = contextLocale;
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Ensure translation language matches active locale
    useEffect(() => {
        if (locale && currentLocale && locale !== currentLocale) {
            startTransition(() => {
                router.refresh();
            });
        }
    }, [locale, currentLocale, router]);

    const { data: session } = useSession();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const autoplay = searchParams.get('autoplay') === 'true';

    // --- Stats Tracking ---
    const readVersesRef = useRef<Set<string>>(new Set());
    const observerRef = useRef<IntersectionObserver | null>(null);
    const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined" || !('IntersectionObserver' in window)) return;

        // Clean up previous observer
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const verseKey = entry.target.getAttribute("data-verse-key");
                    if (!verseKey) return;

                    // Improved Logic: Center Focus Tracking
                    // Only count as read if it's in the middle of the screen (where eyes focus)
                    const rect = entry.boundingClientRect;
                    const windowHeight = window.innerHeight || 800;
                    const hotzoneTop = windowHeight * 0.3; // Top 30%
                    const hotzoneBottom = windowHeight * 0.7; // Bottom 30%

                    // Check if element is overlapping with the central 40% "hotzone"
                    const isInHotzone = rect.top < hotzoneBottom && rect.bottom > hotzoneTop;

                    if (entry.isIntersecting && isInHotzone) {
                        // If already read this session, skip
                        if (readVersesRef.current.has(verseKey)) return;

                        // Start timer: if stays in hotzone for 2 seconds, mark as read
                        if (!timersRef.current.has(verseKey)) {
                            const timer = setTimeout(() => {
                                if (!readVersesRef.current.has(verseKey)) {
                                    readVersesRef.current.add(verseKey);
                                    incrementDailyActivity("quranAyatRead", 1);
                                }
                            }, 2000);
                            timersRef.current.set(verseKey, timer);
                        }
                    } else {
                        // If scrolled away from hotzone before 2s, cancel timer
                        const timer = timersRef.current.get(verseKey);
                        if (timer) {
                            clearTimeout(timer);
                            timersRef.current.delete(verseKey);
                        }
                    }
                });
            },
            {
                threshold: [0, 0.25, 0.5, 0.75, 1], // More granular threshold for better hotzone detection
                rootMargin: '0px'
            }
        );

        // Observe all verses on the current page
        const elements = document.querySelectorAll("[data-verse-key]");
        elements.forEach((el) => observerRef.current?.observe(el));

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
            timersRef.current.forEach(clearTimeout);
            timersRef.current.clear();
        };
    }, [verses]); // Re-run when page changes or verses load

    useEffect(() => {
        if (!chapter?.id) return;
        if (chapter.id > 1) {
            router.prefetch(`/quran/${chapter.id - 1}`);
        }
        if (chapter.id < 114) {
            router.prefetch(`/quran/${chapter.id + 1}`);
        }
    }, [chapter?.id, router]);

    const prefetchShareDialog = useCallback(() => {
        void import("./VerseShareDialog");
    }, []);

    const handlePerPageChange = useCallback((value: number) => {
        setPerPage(value);
        document.cookie = `settings_verses_per_page=${value}; path=/; max-age=31536000`; // 1 year
        startTransition(() => router.refresh());
    }, [router]);

    // Interactive State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeVerseForShare, setActiveVerseForShare] = useState<Verse | null>(null);

    const handleReciterChange = useCallback((value: string) => {
        // Update cookie for server-side
        document.cookie = `settings_reciter=${value}; path=/; max-age=31536000`;
        // Update localStorage for client-side persistence (Settings page sync)
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.SETTINGS_RECITER as any, value);
        // Refresh to get new audio URLs from VerseBrowser
        startTransition(() => router.refresh());
    }, [router]);



    // Bookmarking
    const { isBookmarked: checkIsBookmarked, getBookmark } = useBookmarks();
    // const [bookmarkDialogVerse, setBookmarkDialogVerse] = useState<Verse | null>(null); // Unused
    const [editingBookmarkKey, setEditingBookmarkKey] = useState<string | null>(null); // Use verseKey (e.g., "1:1")
    const [editingBookmarkDraft, setEditingBookmarkDraft] = useState<BookmarkType | null>(null);

    // Tafsir
    const [expandedTafsir, setExpandedTafsir] = useState<Set<string>>(new Set());
    const [loadingTafsir, setLoadingTafsir] = useState<Set<string>>(new Set());
    const TAFSIR_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    type TafsirCacheEntry = { data: TafsirContent; ts: number };
    const [tafsirCache, setTafsirCache] = useState<Map<string, TafsirCacheEntry>>(new Map());
    const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);
    const [tafsirModalOpen, setTafsirModalOpen] = useState(false);
    const [tafsirModalContent, setTafsirModalContent] = useState<{ verseKey: string, tafsir: TafsirContent } | null>(null);

    // Load settings from Cookies on Mount
    useEffect(() => {
        const cookies = document.cookie.split(';');
        const perPageCookie = cookies.find(c => c.trim().startsWith('settings_verses_per_page='));
        if (perPageCookie) {
            setPerPage(parseInt(perPageCookie.split('=')[1]));
        }
    }, []);

    // Handle Autoplay from Surah List - Only on initial page load
    useEffect(() => {
        if (autoplay && verses.length > 0 && !playingVerseKey && !autoplayExecuted) {
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                handleSurahPlay();
                setAutoplayExecuted(true); // Prevent future auto-plays
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoplay]); // Only depend on autoplay, not verses

    // Scroll to verse handler
    const scrollToVerse = (verseNum: number) => {
        const element = document.getElementById(`verse-${verseNum}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-[rgb(var(--color-primary))]/20');
            setTimeout(() => {
                element.classList.remove('bg-[rgb(var(--color-primary))]/20');
            }, 2000);
        }
        setIsSearchOpen(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const verseNum = parseInt(searchQuery);
        // Validate against total verses in chapter, not just current page
        if (!isNaN(verseNum) && verseNum > 0 && verseNum <= (chapter.verses_count || 286)) {
            const targetPage = Math.ceil(verseNum / perPage);

            if (targetPage === currentPage) {
                scrollToVerse(verseNum);
            } else {
                router.push(`/quran/${chapter.id}?page=${targetPage}#verse-${verseNum}`);
                setIsSearchOpen(false);
            }
        }
    };

    // Handle hash scrolling on mount/update
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash;
            const verseId = hash.substring(1); // remove #
            // Small delay to ensure render
            setTimeout(() => {
                const element = document.getElementById(verseId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-[rgb(var(--color-primary))]/20');
                    setTimeout(() => {
                        element.classList.remove('bg-[rgb(var(--color-primary))]/20');
                    }, 2000);
                }
            }, 500);
        }
    }, [verses, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            router.push(`/quran/${chapter.id}?page=${newPage}`);
        }
    };

    // Audio State
    const [isContinuous, setIsContinuous] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loopMode, setLoopMode] = useState<'off' | '1' | '3' | 'infinity'>('off');
    const [repeatCount, setRepeatCount] = useState(0);

    // Audio Logic
    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingVerseKey(null);
        setCurrentAudioUrl(null);
        setIsContinuous(false);
        setIsPlaying(false);
        setRepeatCount(0); // Reset repeat on stop
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    const handleResume = () => {
        if (audioRef.current && currentAudioUrl) {
            setIsPlaying(true);
        }
    };

    const handleVersePlay = (verse: Verse, continuous = false) => {
        if (playingVerseKey === verse.verse_key) {
            if (isPlaying) {
                handlePause();
            } else {
                handleResume();
            }
        } else {
            setIsContinuous(continuous);
            setPlayingVerseKey(verse.verse_key);
            setCurrentAudioUrl(verse.audio.url);
            setIsPlaying(true);
            setRepeatCount(0); // Reset repeat on new play
        }
    };

    const handleSurahPlay = () => {
        if (playingVerseKey && isContinuous) {
            if (isPlaying) {
                handlePause();
            } else {
                handleResume();
            }
        } else {
            if (verses.length > 0) {
                handleVersePlay(verses[0], true);
                scrollToVerse(parseInt(verses[0].verse_key.split(':')[1]));
            }
        }
    };

    const handleNextVerse = () => {
        if (!playingVerseKey) return;
        const currentIndex = verses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex !== -1 && currentIndex < verses.length - 1) {
            const nextVerse = verses[currentIndex + 1];
            // Keep isContinuous state whatever it was
            setPlayingVerseKey(nextVerse.verse_key);
            setCurrentAudioUrl(nextVerse.audio.url);
            scrollToVerse(parseInt(nextVerse.verse_key.split(':')[1]));
            setIsPlaying(true);
            setRepeatCount(0); // Reset repeat on manual next
        } else {
            handleStop();
        }
    };

    const handlePrevVerse = () => {
        if (!playingVerseKey) return;
        const currentIndex = verses.findIndex(v => v.verse_key === playingVerseKey);
        if (currentIndex > 0) {
            const prevVerse = verses[currentIndex - 1];
            // Keep isContinuous state
            setPlayingVerseKey(prevVerse.verse_key);
            setCurrentAudioUrl(prevVerse.audio.url);
            scrollToVerse(parseInt(prevVerse.verse_key.split(':')[1]));
            setIsPlaying(true);
            setRepeatCount(0); // Reset repeat on manual prev
        }
    };

    const handleAudioEnded = () => {
        // Loop Logic
        if (loopMode === 'infinity') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        const limit = loopMode === '1' ? 1 : loopMode === '3' ? 3 : 0;
        if (limit > 0 && repeatCount < limit) {
            setRepeatCount(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        // If loop finished or off, continue or stop
        setRepeatCount(0);
        if (isContinuous) {
            handleNextVerse();
        } else {
            setIsPlaying(false);
            handleStop();
        }
    };

    useEffect(() => {
        if (!audioRef.current) return;

        if (currentAudioUrl) {
            // Update src only if it's different and not already playing the same url
            if (audioRef.current.src !== currentAudioUrl) {
                audioRef.current.src = currentAudioUrl;
            }

            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name === 'AbortError') {
                            // Silently catch AbortError as it's a common interruption
                        } else {
                        }
                    });
                }
            } else {
                audioRef.current.pause();
            }
        } else {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }, [currentAudioUrl, isPlaying]);

    // Stop audio on unmount or pathname change
    useEffect(() => {
        const audioInstance = audioRef.current;
        return () => {
            if (audioInstance) {
                audioInstance.pause();
                audioInstance.src = "";
                audioInstance.load();
            }
        };
    }, [pathname]); // Fires whenever pathname changes


    // Bookmarking Logic
    const handleBookmarkClick = (verse: Verse) => {
        const isSaved = checkIsBookmarked(verse.verse_key);

        if (isSaved) {
            setEditingBookmarkDraft(null);
            setEditingBookmarkKey(verse.verse_key);
            return;
        }

        const verseNum = parseInt(verse.verse_key.split(':')[1]);
        const draftBookmark: BookmarkType = {
            id: `${chapter.id}:${verseNum}`,
            surahId: chapter.id,
            surahName: chapter.name_simple,
            verseId: verseNum,
            verseText: verse.text_uthmani,
            translationText: cleanTranslation(verse.translations[0]?.text || ''),
            note: "",
            tags: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setEditingBookmarkDraft(draftBookmark);
        setEditingBookmarkKey(verse.verse_key);
    };

    // Tafsir Logic
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

        if (!tafsirCache.has(verseKey)) {
            setLoadingTafsir(prev => new Set(prev).add(verseKey));
            try {
                const [surahId, verseId] = verseKey.split(':').map(Number);
                const data = await getVerseTafsir(surahId, verseId, locale);
                if (data) {
                    setTafsirCache(prev => new Map(prev).set(verseKey, { data, ts: Date.now() }));
                }
            } catch (error) {
            } finally {
                setLoadingTafsir(prev => {
                    const next = new Set(prev);
                    next.delete(verseKey);
                    return next;
                });
            }
        }
    };

    const displayedVerses = useMemo(() => {
        const result = !searchQuery || !isNaN(parseInt(searchQuery)) ? verses : verses.filter(v =>
            v.text_uthmani.includes(searchQuery) ||
            v.translations[0]?.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return result;
    }, [verses, searchQuery]);

    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'small': return 'text-2xl leading-[2.5]';
            case 'large': return 'text-4xl leading-[3]';
            default: return 'text-3xl leading-[2.8]';
        }
    };

    // Prepare bookmark for dialog (draft takes precedence)
    const activeBookmark = editingBookmarkDraft ?? (editingBookmarkKey ? getBookmark(editingBookmarkKey) : null);

    const currentPlayingIndex = playingVerseKey ? verses.findIndex(v => v.verse_key === playingVerseKey) : -1;

    // Safety check: if no verses, show error
    if (!verses || verses.length === 0) {
        return (
            <div className="relative min-h-screen pb-16 w-full max-w-4xl mx-auto flex items-center justify-center">
                <div className="text-center space-y-4 px-4">
                    <h2 className="text-lg font-bold text-red-500">⚠️ No Verses Found</h2>
                    <p className="text-slate-400 text-sm">Verses data is empty. This might be a loading error.</p>
                    <Link href="/quran" className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                        Kembali ke Daftar Surah
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-16 w-full max-w-4xl mx-auto">

            {/* --- Sticky Header --- */}
            <div className="sticky top-0 z-30 -mx-4 md:mx-0">
                <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5" />
                <div className="relative px-4 h-16 flex items-center justify-between gap-4">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <Link href="/quran" className="flex items-center justify-center h-9 w-9 -ml-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white shrink-0 p-0">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-base md:text-lg font-bold text-white truncate leading-tight">
                                {chapter.name_simple}
                            </h1>
                            <p className="text-[9px] md:text-[10px] text-[rgb(var(--color-primary-light))] font-medium truncate uppercase tracking-wider">
                                {chapter.revelation_place === "Makkah" ? t.quranMakkah : t.quranMadinah} • {chapter.verses_count} {t.quranVerseCount}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Play Surah Button */}
                        {!playingVerseKey && (
                            <button
                                onClick={handleSurahPlay}
                                className="flex items-center justify-center gap-1.5 h-9 w-9 md:w-auto md:px-4 rounded-full bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] transition-colors border border-[rgb(var(--color-primary))]/20 shrink-0 p-0"
                            >
                                <Play className="h-3.5 w-3.5 fill-current flex-shrink-0" />
                                <span className="hidden md:inline text-xs font-bold leading-none">{t.quranPlaySurah}</span>
                            </button>
                        )}

                        {/* Jump to Verse Button */}
                        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <DialogTrigger asChild>
                                <button className="h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-colors shrink-0" aria-label={t.quranJumpToVerse}>
                                    <CornerDownRight className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs bg-[#0F172A] backdrop-blur-xl border-white/10 p-6 gap-6 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-center text-xl font-bold">{t.quranJumpToVerseTitle}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute left-4 text-slate-500">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <Input
                                            autoFocus
                                            type="tel"
                                            placeholder="1"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-16 text-center text-3xl font-bold tracking-widest bg-white/5 border-white/10 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:border-[rgb(var(--color-primary))] rounded-2xl placeholder:opacity-20"
                                        />
                                    </div>
                                    <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider">
                                        {chapter.name_simple} • 1 - {chapter.verses_count || 286}
                                    </p>
                                    <Button type="submit" className="w-full h-12 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all active:scale-95">
                                        {t.quranGoToVerse}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {!isSearchOpen && (
                            <QuranSettingsModal
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                scriptType={scriptType}
                                setScriptType={setScriptType}
                                showTransliteration={showTransliteration}
                                setShowTransliteration={setShowTransliteration}
                                fontSize={fontSize}
                                setFontSize={setFontSize}
                                perPage={perPage}
                                handlePerPageChange={handlePerPageChange}
                                currentReciterId={currentReciterId}
                                handleReciterChange={handleReciterChange}
                                isPending={isPending}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            {viewMode === 'mushaf' ? (
                // --- Mushaf Mode View ---

                <div className="px-4 py-6 md:px-8">
                    <div key="tajweed-legend-mushaf" className={scriptType === 'tajweed' ? '' : 'hidden'}>
                        <TajweedLegend />
                    </div>
                    <div className={`text-right ${getVerseFontClass(scriptType, fontSize)} text-slate-200`} dir="rtl">
                        {verses.map((verse) => (
                            <span key={`mushaf-${verse.verse_key}`} className="inline relative" id={`verse-${parseInt(verse.verse_key.split(':')[1])}`}>
                                <span className={cn(
                                    "hover:bg-[rgb(var(--color-primary))]/10 transition-colors rounded px-1 cursor-pointer",
                                    playingVerseKey === verse.verse_key && "bg-[rgb(var(--color-primary))]/20"
                                )}
                                    onClick={() => handleVersePlay(verse, false)}
                                >
                                    {scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                                        <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
                                    ) : (
                                        verse.text_indopak ? cleanIndopakText(verse.text_indopak) : verse.text_uthmani
                                    )}
                                </span>
                                <AyahMarker number={toArabicNumber(parseInt(verse.verse_key.split(':')[1]))} size={fontSize} />
                            </span>
                        ))}
                    </div>
                    {/* Pagination Controls (Mushaf Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-6 mt-4 border-t border-white/5" dir="ltr">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                            >
                                <ChevronLeft className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">{t.quranPrevious}</span>
                            </Button>
                            <span className="text-xs md:text-sm font-medium text-slate-400">
                                <span className="hidden md:inline">{t.quranPage} </span>{currentPage}{t.quranOf}{totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                            >
                                <span className="hidden md:inline">{t.quranNext}</span>
                                <ChevronRight className="h-4 w-4 md:ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Surah Navigation Cards (Mushaf Mode - Compact) */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-white/5 px-1 md:px-0">
                        {chapter.id > 1 ? (
                            <Link href={`/quran/${chapter.id - 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranPrevious}</span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                        <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowLeft className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id - 1]}</span>
                                    </div>
                                    <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                                        {chapter.id - 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}

                        {chapter.id < 114 ? (
                            <Link href={`/quran/${chapter.id + 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300 text-right">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranNext}</span>
                                <div className="flex items-center justify-between flex-row-reverse">
                                    <div className="flex items-center gap-1.5 flex-row-reverse min-w-0 pl-1">
                                        <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id + 1]}</span>
                                    </div>
                                    <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                                        {chapter.id + 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}
                    </div>


                </div>

            ) : (
                // --- List Mode View ---
                <div className="space-y-4 px-0 md:px-0">
                    <div key="tajweed-legend" className={`px-4 md:px-0 ${scriptType === 'tajweed' ? '' : 'hidden'}`}>
                        <TajweedLegend />
                    </div>
                    {displayedVerses.map((verse, index) => {
                        try {
                            const verseNum = parseInt(verse.verse_key.split(':')[1]);
                            return (
                                <VerseCard
                                    key={`verse-${verse.verse_key}`}
                                    verse={verse}
                                    verseNum={verseNum}
                                    isPlayingVerse={playingVerseKey === verse.verse_key}
                                    isPlaying={isPlaying}
                                    isBookmarked={checkIsBookmarked(verse.verse_key)}
                                    isDaylight={isDaylight}
                                    scriptType={scriptType}
                                    fontSize={fontSize}
                                    showTransliteration={showTransliteration}
                                    activeTafsirVerse={activeTafsirVerse}
                                    isLoadingTafsir={loadingTafsir.has(verse.verse_key)}
                                    tafsirData={tafsirCache.get(verse.verse_key)?.data}
                                    locale={locale}
                                    onPlay={handleVersePlay}
                                    onBookmarkToggle={handleBookmarkClick}
                                    onShareClick={setActiveVerseForShare}
                                    onTafsirToggle={toggleTafsir}
                                    onReadFullTafsir={(verseKey, tafsir) => {
                                        setTafsirModalContent({ verseKey, tafsir });
                                        setTafsirModalOpen(true);
                                    }}
                                    prefetchShareDialog={prefetchShareDialog}
                                />
                            );
                        } catch (error) {
                            return (
                                <div key={`verse-error-${verse.verse_key}`} className="px-4 md:px-6 py-6 border-b border-white/5 bg-red-900/10 rounded-lg border border-red-500/30">
                                    <p className="text-red-400 text-sm font-semibold">Error rendering verse {verse.verse_key}</p>
                                    <p className="text-red-300/70 text-xs mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
                                </div>
                            );
                        }
                    })}
                    {/* Pagination Controls (List Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-6 px-4 mt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                            >
                                <ChevronLeft className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">{t.quranPrevious}</span>
                            </Button>
                            <span className="text-xs md:text-sm font-medium text-slate-400">
                                <span className="hidden md:inline">{t.quranPage} </span>{currentPage}{t.quranOf}{totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2 md:px-4"
                            >
                                <span className="hidden md:inline">{t.quranNext}</span>
                                <ChevronRight className="h-4 w-4 md:ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Surah Navigation Cards (List Mode - Compact) */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-white/5 px-1 md:px-0">
                        {chapter.id > 1 ? (
                            <Link href={`/quran/${chapter.id - 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranPrevious}</span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                        <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowLeft className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id - 1]}</span>
                                    </div>
                                    <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                                        {chapter.id - 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}

                        {chapter.id < 114 ? (
                            <Link href={`/quran/${chapter.id + 1}`} className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300 text-right">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-[rgb(var(--color-primary))]">{t.quranNext}</span>
                                <div className="flex items-center justify-between flex-row-reverse">
                                    <div className="flex items-center gap-1.5 flex-row-reverse min-w-0 pl-1">
                                        <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xs font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors truncate">{surahNames[chapter.id + 1]}</span>
                                    </div>
                                    <span className="text-lg font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white flex-shrink-0">
                                        {chapter.id + 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}
                    </div>
                    {/* Old Surah Navigation Cards Removed */}
                </div>
            )}


            <AudioPlayerBar
                playingVerseKey={playingVerseKey}
                isPlaying={isPlaying}
                loopMode={loopMode}
                currentPlayingIndex={currentPlayingIndex}
                totalVerses={verses.length}
                isDaylight={isDaylight}
                onLoopModeChange={setLoopMode}
                onPrev={handlePrevVerse}
                onNext={handleNextVerse}
                onPlayPause={isPlaying ? handlePause : handleResume}
            />

            {/* Hidden Audio Element */}
            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />


            {/* Dialogs */}
            <VerseShareDialog
                open={!!activeVerseForShare}
                onOpenChange={(open) => !open && setActiveVerseForShare(null)}
                verse={activeVerseForShare}
                surahName={chapter.name_simple}
                surahNumber={chapter.id}
            />

            <BookmarkEditDialog
                open={!!editingBookmarkKey}
                isDraft={!!editingBookmarkDraft}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingBookmarkKey(null);
                        setEditingBookmarkDraft(null);
                    }
                }}
                bookmark={activeBookmark}
                onSave={(bookmark) => {
                    const action = editingBookmarkDraft ? 'create' : 'update';
                    setEditingBookmarkKey(null);
                    setEditingBookmarkDraft(null);
                    if (!bookmark) return;

                    try {
                        // Always save locally first
                        getBookmarkRepository().saveBookmark(bookmark);

                        // Only add to sync queue if logged in
                        if (session?.user?.id) {
                            syncQueue.addToQueue('bookmark', action, {
                                surahId: bookmark.surahId,
                                surahName: bookmark.surahName,
                                verseId: bookmark.verseId,
                                verseText: bookmark.verseText,
                                note: bookmark.note,
                                tags: bookmark.tags,
                            });
                        }
                        toast.success((t as any).bookmarksSaved || "Tanda baca berhasil disimpan ✨");
                    } catch (error) {
                    }
                }}
                onDelete={(bookmark) => {
                    setEditingBookmarkKey(null);
                    setEditingBookmarkDraft(null);
                    if (!bookmark) return;

                    try {
                        // Always remove locally first
                        getBookmarkRepository().removeBookmark(bookmark.id);

                        // Only add to sync queue if logged in
                        if (session?.user?.id && !editingBookmarkDraft) {
                            syncQueue.addToQueue('bookmark', 'delete', {
                                surahId: bookmark.surahId,
                                verseId: bookmark.verseId,
                            });
                        }
                        toast.success((t as any).bookmarksDeleted || "Tanda baca berhasil dihapus");
                    } catch (error) {
                    }
                }}
            />

            {/* Tafsir Modal */}
            <TafsirModal
                open={tafsirModalOpen}
                onOpenChange={setTafsirModalOpen}
                locale={locale}
                content={tafsirModalContent}
            />        </div>
    );
}