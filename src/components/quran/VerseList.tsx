"use client";

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

const VerseShareDialog = dynamic(() => import("./VerseShareDialog"), { ssr: false });
const BookmarkEditDialog = dynamic(() => import("./BookmarkEditDialog"), { ssr: false });
import { AyahMarker } from "./AyahMarker";
import { surahNames } from "@/lib/surahData";
import { QURAN_RECITER_OPTIONS, DEFAULT_SETTINGS } from "@/data/settings-data";
import { useBookmarks } from "@/hooks/useBookmarks";
import { type Bookmark as BookmarkType } from "@/lib/bookmark-storage";
import { cn } from "@/lib/utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";


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

// --- Utils ---
const toArabicNumber = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
const formatFootnotes = (htmlText: string) => {
    if (!htmlText) return '';
    let formatted = htmlText;
    // Convert inline footnote numbers to superscript (e.g., contracts.1 -> contracts.<sup>1</sup>)
    formatted = formatted
        .replace(/([\.,;:!?\]])\s*(\d{1,2})(?=\s|$)/g, '$1<sup>$2</sup>')
        .replace(/\s(\d{1,2})(?=\s|$)/g, ' <sup>$1</sup>');
    return formatted;
};
const cleanTranslation = (text: string) => {
    if (!text) return '';
    let cleaned = text;
    // Remove stray leading "0" or "O" from some translations
    cleaned = cleaned.replace(/^\s*[0O]\s+/, '').replace(/^\s*[0O]\./, '');
    // Remove trailing isolated verse numbers only
    cleaned = cleaned.replace(/\s*[\(\[]?\d{1,3}[\)\]]?\s*$/g, '');
    return formatFootnotes(cleaned.trim());
};

// --- Robust Tajweed CSS ---
const tajweedStyles = `
/* Distinct High-Contrast Pastel Palette */
tajweed[class*="ghunnah"], .tajweed-text.hn, .tajweed-text.tajweed-hn { color: #4ade80!important; font-weight: bold!important; }
tajweed[class*="qalqalah"], tajweed[class*="qalaqah"], .tajweed-text.ql, .tajweed-text.tajweed-ql { color: #38bdf8!important; font-weight: bold!important; }
tajweed[class*="idgham"], tajweed[class*="laam_shamsiyah"], .tajweed-text.id, .tajweed-text.tajweed-id { color: #c084fc!important; font-weight: bold!important; }
tajweed[class*="ikhfa"], tajweed[class*="ikhafa"], .tajweed-text.ik, .tajweed-text.tajweed-ik { color: #fb923c!important; font-weight: bold!important; }
tajweed[class*="iqlab"], .tajweed-text.iqlab { color: #22d3ee!important; font-weight: bold!important; }
tajweed[class*="madda"], .tajweed-text.m, .tajweed-text.tajweed-m { color: #fb7185!important; font-weight: bold!important; }
tajweed[class*="ham_wasl"], tajweed[class*="slnt"], .tajweed-text.slient { color: #facc15!important; font-weight: bold!important; }
.tajweed-text.sl, .tajweed-text.tajweed-sl { color: #facc15!important; font-weight: bold!important; }
.tajweed-text.pp, .tajweed-text.tajweed-pp { color: #fb923c!important; font-weight: bold!important; }
/* Waqof marks styling - Pause indicators */
[data-waqf], waqf, .waqf { color: #a78bfa!important; font-weight: bold!important; }
/* Arabic End of Ayah and pause marks */
[class*="waqf"], [class*="pause"], [class*="stop"] { display: inline!important; margin: 0 2px!important; }
`;

const cleanTajweedText = (htmlText: string) => {
    if (!htmlText) return '';
    let cleaned = htmlText;
    
    // Remove verse number spans at the end only
    // Do NOT remove waqof marks - preserve all Arabic characters and diacritics
    cleaned = cleaned.replace(/<span\s+class="end"[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    cleaned = cleaned.replace(/<span[^>]*class="end"[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    
    // Remove only trailing verse numbers (1-3 digits)
    cleaned = cleaned.replace(/[\u0660-\u0669]{1,3}\s*$/u, '');
    
    return cleaned.trim();
};

const cleanIndopakText = (text: string) => {
    if (!text) return '';
    return text
        .replace(/[\uE000-\uF8FF]/g, '') // Remove PUA characters
        .replace(/\u2002/g, ' ') // Replace EN SPACE with standard space
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
};

const getVerseFontClass = (script: string, size: string) => {
    if (script === 'indopak') {
        const base = 'font-lateef tracking-wide';
        // Lateef requires significantly larger sizes to match Amiri's visual weight
        if (size === 'large') return `${base} text-6xl leading-[2.6]`;
        if (size === 'small') return `${base} text-4xl leading-[2.3]`;
        return `${base} text-5xl leading-[2.4]`; // Medium
    }
    // Tajweed (Amiri)
    const base = 'font-amiri';
    if (size === 'large') return `${base} text-4xl leading-[2.5]`;
    if (size === 'small') return `${base} text-2xl leading-[2.2]`;
    return `${base} text-3xl leading-[2.3]`; // Medium
};

export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages, currentReciterId, currentLocale = "id" }: VerseListProps) {
    const { t } = useLocale();
    
    // --- Debug Logging ---
    useEffect(() => {
        if (!chapter || !verses || verses.length === 0) {
            console.warn(`[VerseList] Incomplete data:`, {
                hasChapter: !!chapter,
                versesCount: verses?.length || 0,
                currentPage
            });
            return;
        }
        
        console.log(`[VerseList] Rendered: ${verses.length} verses from ${chapter.name_simple} (page ${currentPage}/${totalPages})`);
    }, [chapter, verses, currentPage, totalPages]);
    
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
    const [locale, setLocale] = useState<string>(currentLocale);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { data: session } = useSession();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const autoplay = searchParams.get('autoplay') === 'true';

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

    const handleLocaleChange = useCallback((value: string) => {
        setLocale(value);
        // Update cookie for server-side
        document.cookie = `settings_locale=${value}; path=/; max-age=31536000`;
        // Update localStorage for client-side persistence
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.SETTINGS_LOCALE as any, value);
        // Refresh to get new translation
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
    const [tafsirModalContent, setTafsirModalContent] = useState<{verseKey: string, tafsir: TafsirContent} | null>(null);

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
            audioRef.current.play().catch(e => console.error("Play failed", e));
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
                            console.error("Playback failed:", error);
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
                console.error("Failed to fetch tafsir", error);
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
        console.error(`[VerseList] ERROR: Cannot render - no verses provided!`, { chapter: chapter?.name_simple, versesLength: verses?.length });
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
            <style>{tajweedStyles}</style>

            {/* --- Sticky Header --- */}
            <div className="sticky top-0 z-30 -mx-4 md:mx-0">
                <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5" />
                <div className="relative px-4 h-16 flex items-center justify-between gap-4">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Link href="/quran" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
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
                    <div className="flex items-center gap-2">
                        {/* Play Surah Button */}
                        {!playingVerseKey && (
                            <button
                                onClick={handleSurahPlay}
                                className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] text-[10px] md:text-xs font-bold transition-colors border border-[rgb(var(--color-primary))]/20"
                            >
                                <Play className="h-3 w-3 fill-current" />
                                <span className="hidden md:inline">{t.quranPlaySurah}</span>
                            </button>
                        )}

                        {/* Jump to Verse Button */}
                        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <DialogTrigger asChild>
                                <button className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors" aria-label={t.quranJumpToVerse}>
                                    <CornerDownRight className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs bg-[#0f172a]/95 backdrop-blur-xl border-white/10 text-white p-6 gap-6 shadow-2xl">
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
                                            className="h-16 text-center text-3xl font-bold tracking-widest bg-white/5 border-white/10 focus-visible:ring-[rgb(var(--color-primary))] focus-visible:border-[rgb(var(--color-primary))] rounded-2xl placeholder:text-slate-700"
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

                        {/* Settings Button */}
                        {!isSearchOpen && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all hover:border-[rgb(var(--color-primary))]/50">
                                        <Settings className="h-5 w-5" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="border-none bg-[#0f172a]/95 backdrop-blur-xl text-white max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>{t.quranSettingsTitle}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* View Mode */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranModeRead}</Label>
                                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                                    <AlignJustify className="h-4 w-4" /> {t.quranModeList}
                                                </button>
                                                <button onClick={() => setViewMode('mushaf')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'mushaf' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                                    <BookOpen className="h-4 w-4" /> {t.quranModeMushaf}
                                                </button>
                                            </div>
                                        </div>
                                        {/* Script Type Toggle */}
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranScriptType}</Label>
                                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setScriptType('indopak')}
                                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'indopak' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    <span className="font-bold text-lg mb-1 font-amiri">بِسْمِ</span>
                                                    <span className="text-[10px] md:text-xs">{t.quranScriptStandard}</span>
                                                </button>
                                                <button
                                                    onClick={() => setScriptType('tajweed')}
                                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'tajweed' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    <span className="font-bold text-lg mb-1 font-amiri"><span style={{ color: '#fb923c' }}>بِسْ</span><span style={{ color: '#4ade80' }}>مِ</span></span>
                                                    <span className="text-[10px] md:text-xs">{t.quranScriptTajweed}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranOtherDisplay}</Label>
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                                <div className="flex items-center gap-3"><Type className="h-5 w-5 text-indigo-400" /><span className="font-medium">{t.quranTransliteration}</span></div>
                                                <button onClick={() => setShowTransliteration(!showTransliteration)} className={`w-11 h-6 rounded-full transition-colors relative ${showTransliteration ? 'bg-[rgb(var(--color-primary))]' : 'bg-slate-700'}`}><span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showTransliteration ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                                            </div>
                                        </div>
                                        {/* Font Size */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranFontSize}</Label>
                                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                <button onClick={() => setFontSize('small')} className={`flex-1 h-8 rounded-lg text-sm font-bold ${fontSize === 'small' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A-</button>
                                                <button onClick={() => setFontSize('medium')} className={`flex-1 h-8 rounded-lg text-base font-bold ${fontSize === 'medium' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A</button>
                                                <button onClick={() => setFontSize('large')} className={`flex-1 h-8 rounded-lg text-lg font-bold ${fontSize === 'large' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A+</button>
                                            </div>
                                        </div>

                                        {/* Verses Per Page */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranVersesPerPage}</Label>
                                            <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                {[10, 20, 30, 50].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => handlePerPageChange(num)}
                                                        disabled={isPending}
                                                        className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${perPage === num ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-500 hover:text-slate-300'} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isPending && perPage === num ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Qari Selection */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">{t.quranSelectQari}</Label>
                                            <Select value={currentReciterId?.toString()} onValueChange={handleReciterChange} disabled={isPending}>
                                                <SelectTrigger className={`w-full bg-white/5 border-white/10 text-white rounded-xl h-12 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-sky-400" /> : <Headphones className="h-4 w-4 text-sky-400" />}
                                                        <SelectValue placeholder={t.quranSelectQari} />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    {QURAN_RECITER_OPTIONS.map((qari) => (
                                                        <SelectItem key={qari.id} value={qari.id.toString()} className="hover:bg-white/10 focus:bg-white/10 focus:text-white text-white cursor-pointer transition-colors">
                                                            {qari.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                            const isPlayingVerse = playingVerseKey === verse.verse_key;
                            const isBookmarked = checkIsBookmarked(verse.verse_key);

                        return (
                            <div
                                key={`verse-${verse.verse_key}`}
                                id={`verse-${verseNum}`}
                                className={`group relative py-8 px-4 md:px-6 border-b border-white/5 transition-colors duration-500 ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))]/5' : 'hover:bg-white/[0.02]'}`}
                            >
                                {/* Action Bar */}
                                <div className="flex items-center justify-between mb-6">
                                    <AyahMarker number={toArabicNumber(verseNum)} size={fontSize} />
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleVersePlay(verse, false)} 
                                            className={`h-8 w-8 rounded-full ${isPlayingVerse && isPlaying ? 'opacity-0 pointer-events-none' : ''} ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10'}`}
                                        >
                                            <Play className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleBookmarkClick(verse)} className={`h-8 w-8 rounded-full ${isBookmarked ? 'text-[rgb(var(--color-primary))]' : 'text-slate-400 hover:text-[rgb(var(--color-primary))]'}`}>
                                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onMouseEnter={prefetchShareDialog}
                                            onFocus={prefetchShareDialog}
                                            onClick={() => setActiveVerseForShare(verse)}
                                            className="h-8 w-8 rounded-full text-slate-400 hover:text-[rgb(var(--color-primary))]"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => toggleTafsir(verse.verse_key)} className={`h-8 w-8 rounded-full ${activeTafsirVerse === verse.verse_key ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}><Lightbulb className="h-4 w-4" /></Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div dir="rtl" className={`w-full ${getVerseFontClass(scriptType, fontSize)} text-right mb-6 text-slate-200`}>
                                    {scriptType === 'tajweed' && verse.text_uthmani_tajweed ? (
                                        <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
                                    ) : (
                                        <span>{verse.text_indopak ? cleanIndopakText(verse.text_indopak) : verse.text_uthmani}</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {showTransliteration && verse.transliteration && (
                                        <p className="text-[rgb(var(--color-primary-light))] text-sm md:text-base font-medium leading-relaxed">{verse.transliteration}</p>
                                    )}
                                    <p className="text-slate-400 text-sm md:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanTranslation(verse.translations[0]?.text || "") }} />
                                    <div className={activeTafsirVerse === verse.verse_key ? 'mt-6 p-5 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-slate-900 border border-[rgb(var(--color-primary))]/20 animate-in slide-in-from-top-2' : 'hidden'}>
                                        <div className="flex items-center gap-2 mb-3"><Lightbulb className="h-4 w-4 text-[rgb(var(--color-primary))]" /><h3 className="text-sm font-bold text-white">{locale === "en" ? "Brief Explanation" : "Tafsir Ringkas"}</h3></div>
                                        <div className={`flex items-center gap-2 text-slate-500 py-4 ${loadingTafsir.has(verse.verse_key) ? '' : 'hidden'}`}>
                                            <Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">{locale === "en" ? "Loading..." : "Memuat..."}</span>
                                        </div>
                                        <div className={loadingTafsir.has(verse.verse_key) ? 'hidden' : 'space-y-3'}>
                                            <div
                                                className="prose prose-invert prose-sm text-slate-300"
                                                dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsirCache.get(verse.verse_key)?.data.short || (locale === "en" ? "Tafsir not available." : "Tafsir tidak tersedia.")) }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const tafsir = tafsirCache.get(verse.verse_key)?.data;
                                                    if (tafsir) {
                                                        setTafsirModalContent({verseKey: verse.verse_key, tafsir});
                                                        setTafsirModalOpen(true);
                                                    }
                                                }}
                                                className={`text-xs font-semibold mt-2 transition-colors ${tafsirCache.get(verse.verse_key)?.data.long && tafsirCache.get(verse.verse_key)?.data.long !== tafsirCache.get(verse.verse_key)?.data.short ? 'text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80' : 'hidden'}`}
                                            >
                                                {locale === "en" ? "Read Full Explanation →" : "Baca Penjelasan Lengkap →"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        } catch (error) {
                            console.error(`[VerseList] Error rendering verse ${verse.verse_key}:`, error);
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


            {/* --- Navigation Footer & Player --- */}
            <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none flex flex-col items-center gap-3 px-4">

                {/* Playing Status / Controls */}
                {playingVerseKey && (
                    <div className="pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sedang Memutar</span>
                            <span className="text-xs font-bold text-white">Ayat {toArabicNumber(parseInt((playingVerseKey || '1:1').split(':')[1]))}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={handlePrevVerse} disabled={currentPlayingIndex <= 0} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            {/* Loop Button */}
                            <Button
                                onClick={() => {
                                    const modes: ('off' | '1' | '3' | 'infinity')[] = ['off', '1', '3', 'infinity'];
                                    const nextIndex = (modes.indexOf(loopMode) + 1) % modes.length;
                                    setLoopMode(modes[nextIndex]);
                                }}
                                size="icon"
                                variant="ghost"
                                className={`h-8 w-8 rounded-full hover:bg-white/10 ${loopMode !== 'off' ? 'text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10' : 'text-slate-400'}`}
                            >
                                {loopMode === 'infinity' ? <InfinityIcon className="h-4 w-4" /> :
                                    loopMode === 'off' ? <Repeat className="h-4 w-4" /> :
                                        <span className="text-[10px] font-bold border rounded px-0.5 border-current w-4 h-4 flex items-center justify-center">{loopMode}x</span>
                                }
                            </Button>

                            {/* Stop Button */}
                            <Button onClick={handleStop} size="icon" variant="ghost" className="h-10 w-10 rounded-full text-red-400 hover:text-red-300 hover:bg-white/10">
                                <Square className="h-4 w-4 fill-current" />
                            </Button>

                            {/* Play/Pause Button */}
                            <Button onClick={isPlaying ? handlePause : handleResume} size="icon" className="h-10 w-10 rounded-full bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] shadow-lg shadow-[rgb(var(--color-primary))]/20">
                                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleNextVerse} disabled={currentPlayingIndex >= verses.length - 1} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Surah Navigation Removed (Redundant with Cards) */}
            </div>

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
                    if (!session?.user?.id || !bookmark) return;

                    try {
                        syncQueue.addToQueue('bookmark', action, {
                            surahId: bookmark.surahId,
                            surahName: bookmark.surahName,
                            verseId: bookmark.verseId,
                            verseText: bookmark.verseText,
                            note: bookmark.note,
                            tags: bookmark.tags,
                        });
                    } catch (error) {
                        console.error('[Bookmark] Failed to add to sync queue:', error);
                    }
                }}
                onDelete={(bookmark) => {
                    if (!session?.user?.id || !bookmark || editingBookmarkDraft) return;

                    try {
                        syncQueue.addToQueue('bookmark', 'delete', {
                            surahId: bookmark.surahId,
                            verseId: bookmark.verseId,
                        });
                    } catch (error) {
                        console.error('[Bookmark] Failed to add delete to sync queue:', error);
                    }
                }}
            />

            {/* Tafsir Modal */}
            <Dialog open={tafsirModalOpen} onOpenChange={setTafsirModalOpen}>
                <DialogContent className="w-[98vw] max-w-lg sm:max-w-xl max-h-[80vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl border border-[rgb(var(--color-primary))]/20 bg-gradient-to-br from-slate-900/50 to-slate-950/40 backdrop-blur-3xl shadow-2xl shadow-black/60 p-0 overflow-hidden">
                    {/* Hidden DialogTitle for accessibility */}
                    <DialogTitle className="sr-only">
                        {locale === "en" ? "Tafsir Full Explanation" : "Penjelasan Lengkap Tafsir"}
                    </DialogTitle>
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800/50 border-b border-[rgb(var(--color-primary))]/20 px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[rgb(var(--color-primary))]/40 to-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/50 shadow-lg shadow-[rgb(var(--color-primary))]/20">
                                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-[rgb(var(--color-primary))]" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                                    {locale === "en" ? "Tafsir" : "Tafsir"}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                                    {locale === "en" ? "Full Explanation" : "Penjelasan Lengkap"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="max-h-[calc(80vh-100px)] sm:max-h-[calc(85vh-120px)]">
                        {tafsirModalContent && (
                            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 text-slate-200">
                                <div
                                    className="text-sm sm:text-base [&>p]:mb-4 sm:[&>p]:mb-5 [&>p]:leading-relaxed sm:[&>p]:leading-loose [&>p]:text-slate-300 [&>p:first-child]:text-base sm:[&>p:first-child]:text-lg [&>p:first-child]:font-medium [&>p:first-child]:text-white/95 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-5 sm:[&>h3]:mt-6 [&>h3]:mb-2 sm:[&>h3]:mb-3 [&>ul]:my-3 sm:[&>ul]:my-4 [&>ul]:ml-1 sm:[&>ul]:ml-2 [&>ul]:space-y-2 sm:[&>ul]:space-y-3 [&>ul]:pl-1 sm:[&>ul]:pl-2 [&>ol]:my-3 sm:[&>ol]:my-4 [&>ol]:ml-1 sm:[&>ol]:ml-2 [&>ol]:space-y-2 sm:[&>ol]:space-y-3 [&>ol]:pl-1 sm:[&>ol]:pl-2 [&>ol]:list-decimal [&>ol]:list-outside [&>ul]:list-disc [&>ul]:list-outside [&>li]:leading-relaxed sm:[&>li]:leading-loose [&>li]:pl-2 sm:[&>li]:pl-3 [&>li]:py-1 sm:[&>li]:py-2 [&>li]:px-2 sm:[&>li]:px-3 [&>li]:rounded-md [&>li]:bg-white/4 [&>li]:border [&>li]:border-white/10 [&>li>strong]:text-[rgb(var(--color-primary))]/95 [&>li>strong]:font-semibold [&>ol>li]:marker:text-[rgb(var(--color-primary))] [&>ol>li]:marker:font-bold [&>ul>li]:marker:text-[rgb(var(--color-primary))] [&_sup]:text-[rgb(var(--color-primary))]/85 [&_sup]:font-semibold [&>ol>li>ol]:my-2 sm:[&>ol>li>ol]:my-3 [&>ol>li>ol]:ml-2 sm:[&>ol>li>ol]:ml-3 [&>ol>li>ol]:space-y-1 sm:[&>ol>li>ol]:space-y-2 [&>ol>li>ol]:pl-0 [&>ol>li>ol]:list-lower-alpha [&>ol>li>ol]:list-outside [&>ol>li>ol>li]:bg-white/3 [&>ol>li>ol>li]:border-white/5 [&>ol>li>ol>li]:py-1 sm:[&>ol>li>ol>li]:py-1.5 [&>ol>li>ol>li]:px-2 sm:[&>ol>li>ol>li]:px-2.5 [&>ol>li>ol>li]:pl-1.5 sm:[&>ol>li>ol>li]:pl-2 [&>ol>li>ol>li]:rounded-sm [&>ol>li>ol>li]:marker:text-white/50 [&>ol>li>ol>li]:marker:font-semibold"
                                    dangerouslySetInnerHTML={{ __html: formatFootnotes(tafsirModalContent.tafsir.long) }}
                                />
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>        </div>
    );
}