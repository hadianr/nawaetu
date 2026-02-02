"use client";

import TajweedLegend from "./TajweedLegend";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import VerseShareDialog from "./VerseShareDialog";
import { Chapter } from "@/components/quran/SurahList";
import { AyahMarker } from "./AyahMarker";
import { surahNames } from "@/lib/surahData";
import { QURAN_RECITER_OPTIONS, DEFAULT_SETTINGS } from "@/data/settings-data";
import { useBookmarks } from "@/hooks/useBookmarks";
import BookmarkEditDialog from "./BookmarkEditDialog";
import { saveBookmark, type Bookmark as BookmarkType } from "@/lib/bookmark-storage";
import { cn } from "@/lib/utils";

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
}

// --- Utils ---
const toArabicNumber = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
const cleanTranslation = (text: string) => text.replace(/(\d+)$/gm, '').replace(/(\d+)(?=\s|$)/g, '');

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
`;

const cleanTajweedText = (htmlText: string) => {
    if (!htmlText) return '';
    let cleaned = htmlText;
    cleaned = cleaned.replace(/<span\s+class=end>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    cleaned = cleaned.replace(/<span[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    cleaned = cleaned.replace(/[\u0660-\u0669\u06DD]+\s*$/u, '');
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

export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages, currentReciterId }: VerseListProps) {
    // --- State ---
    const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    // Settings State
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [showTransliteration, setShowTransliteration] = useState(true);
    const [scriptType, setScriptType] = useState<'tajweed' | 'indopak'>('indopak'); // Default to Indopak for clarity
    const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list');
    const [perPage, setPerPage] = useState<number>(DEFAULT_SETTINGS.versesPerPage);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const autoplay = searchParams.get('autoplay') === 'true';

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        document.cookie = `settings_verses_per_page=${value}; path=/; max-age=31536000`; // 1 year
        router.refresh();
    };

    // Interactive State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeVerseForShare, setActiveVerseForShare] = useState<Verse | null>(null);

    const handleReciterChange = (value: string) => {
        // Update cookie for server-side
        document.cookie = `settings_reciter=${value}; path=/; max-age=31536000`;
        // Update localStorage for client-side persistence (Settings page sync)
        localStorage.setItem("settings_reciter", value);
        // Refresh to get new audio URLs from VerseBrowser
        router.refresh();
    };

    // Bookmarking
    const { isBookmarked: checkIsBookmarked, getBookmark } = useBookmarks();
    // const [bookmarkDialogVerse, setBookmarkDialogVerse] = useState<Verse | null>(null); // Unused
    const [editingBookmarkKey, setEditingBookmarkKey] = useState<string | null>(null); // Use verseKey (e.g., "1:1")

    // Tafsir
    const [expandedTafsir, setExpandedTafsir] = useState<Set<string>>(new Set());
    const [loadingTafsir, setLoadingTafsir] = useState<Set<string>>(new Set());
    const [tafsirCache, setTafsirCache] = useState<Map<string, TafsirContent>>(new Map());
    const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);

    // Load settings from Cookies on Mount
    useEffect(() => {
        const cookies = document.cookie.split(';');
        const perPageCookie = cookies.find(c => c.trim().startsWith('settings_verses_per_page='));
        if (perPageCookie) {
            setPerPage(parseInt(perPageCookie.split('=')[1]));
        }
    }, []);

    // Handle Autoplay from Surah List
    useEffect(() => {
        if (autoplay && verses.length > 0 && !playingVerseKey) {
            // Small delay to ensure everything is ready
            const timer = setTimeout(() => {
                handleSurahPlay();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoplay, verses]); // Run when verses are loaded if autoplay is true

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
            setEditingBookmarkKey(verse.verse_key);
        } else {
            const verseNum = parseInt(verse.verse_key.split(':')[1]);
            saveBookmark({
                surahId: chapter.id,
                surahName: chapter.name_simple,
                verseId: verseNum,
                verseText: verse.text_uthmani,
            });
            // Immediately open dialog to edit/add note if desired, 
            // or just set state to allow editing. 
            // Here we just save. If user wants to edit, they click again.
            // Or we can open it:
            setEditingBookmarkKey(verse.verse_key);
        }
    };

    // Tafsir Logic
    const toggleTafsir = async (verseKey: string) => {
        if (activeTafsirVerse === verseKey) {
            setActiveTafsirVerse(null);
            return;
        }

        setActiveTafsirVerse(verseKey);

        if (!tafsirCache.has(verseKey)) {
            setLoadingTafsir(prev => new Set(prev).add(verseKey));
            try {
                const [surahId, verseId] = verseKey.split(':').map(Number);
                const data = await getVerseTafsir(surahId, verseId);
                if (data) {
                    setTafsirCache(prev => new Map(prev).set(verseKey, data));
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
        if (!searchQuery || !isNaN(parseInt(searchQuery))) return verses;
        return verses.filter(v =>
            v.text_uthmani.includes(searchQuery) ||
            v.translations[0]?.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [verses, searchQuery]);

    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'small': return 'text-2xl leading-[2.5]';
            case 'large': return 'text-4xl leading-[3]';
            default: return 'text-3xl leading-[2.8]';
        }
    };

    // Prepare bookmark for dialog
    const activeBookmark = editingBookmarkKey ? getBookmark(editingBookmarkKey) : null;

    // If activeBookmark is null but editingBookmarkKey is set (e.g. just saved but hook didn't update yet?), 
    // it might be tricky. But saveBookmark triggers event. useBookmarks listens to it. Should be fine.
    // Fallback: construct it from verses if not found? 
    // Actually, saveBookmark is synchronous in storage but hook update is async via event. 
    // But since we just saved, we might need to wait for update. 
    // For now, assume it works or we use a temporary object.

    const currentPlayingIndex = playingVerseKey ? verses.findIndex(v => v.verse_key === playingVerseKey) : -1;

    return (
        <div className="relative min-h-screen pb-32 w-full max-w-4xl mx-auto">
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
                            <h1 className="text-lg font-bold text-white truncate leading-tight">
                                {chapter.name_simple}
                            </h1>
                            <p className="text-[10px] text-[rgb(var(--color-primary-light))] font-medium truncate uppercase tracking-wider">
                                {chapter.revelation_place} • {chapter.verses_count} Ayat
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Play Surah Button */}
                        {!playingVerseKey && (
                            <button
                                onClick={handleSurahPlay}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] text-[10px] md:text-xs font-bold transition-colors border border-[rgb(var(--color-primary))]/20"
                            >
                                <Play className="h-3 w-3 fill-current" />
                                <span>Putar Surat</span>
                            </button>
                        )}

                        {/* Jump to Verse Button */}
                        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                            <DialogTrigger asChild>
                                <button className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors" aria-label="Loncat ke Ayat">
                                    <CornerDownRight className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs bg-[#0f172a]/95 backdrop-blur-xl border-white/10 text-white p-6 gap-6 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-center text-xl font-bold">Loncat ke Ayat</DialogTitle>
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
                                        Surat {chapter.name_simple} • 1 - {chapter.verses_count || 286}
                                    </p>
                                    <Button type="submit" className="w-full h-12 bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold rounded-xl shadow-lg shadow-[rgb(var(--color-primary))]/20 transition-all active:scale-95">
                                        Pergi ke Ayat
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
                                        <DialogTitle>Pengaturan Tampilan</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* View Mode */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Mode Baca</Label>
                                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                                <button onClick={() => setViewMode('list')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                                    <AlignJustify className="h-4 w-4" /> List
                                                </button>
                                                <button onClick={() => setViewMode('mushaf')} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${viewMode === 'mushaf' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                                    <BookOpen className="h-4 w-4" /> Mushaf
                                                </button>
                                            </div>
                                        </div>
                                        {/* Script Type Toggle */}
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Jenis Teks Arab</Label>
                                            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setScriptType('indopak')}
                                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'indopak' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    <span className="font-bold text-lg mb-1 font-amiri">بِسْمِ</span>
                                                    <span className="text-[10px] md:text-xs">Standar Indonesia</span>
                                                </button>
                                                <button
                                                    onClick={() => setScriptType('tajweed')}
                                                    className={`flex flex-col items-center justify-center h-14 rounded-lg text-sm font-medium transition-all ${scriptType === 'tajweed' ? 'bg-[rgb(var(--color-primary))] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    <span className="font-bold text-lg mb-1 font-amiri"><span style={{ color: '#fb923c' }}>بِسْ</span><span style={{ color: '#4ade80' }}>مِ</span></span>
                                                    <span className="text-[10px] md:text-xs">Tajweed Berwarna</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Tampilan Lainnya</Label>
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                                <div className="flex items-center gap-3"><Type className="h-5 w-5 text-indigo-400" /><span className="font-medium">Latin / Transliterasi</span></div>
                                                <button onClick={() => setShowTransliteration(!showTransliteration)} className={`w-11 h-6 rounded-full transition-colors relative ${showTransliteration ? 'bg-[rgb(var(--color-primary))]' : 'bg-slate-700'}`}><span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showTransliteration ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                                            </div>
                                        </div>
                                        {/* Font Size */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Ukuran Huruf Arab</Label>
                                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                <button onClick={() => setFontSize('small')} className={`flex-1 h-8 rounded-lg text-sm font-bold ${fontSize === 'small' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A-</button>
                                                <button onClick={() => setFontSize('medium')} className={`flex-1 h-8 rounded-lg text-base font-bold ${fontSize === 'medium' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A</button>
                                                <button onClick={() => setFontSize('large')} className={`flex-1 h-8 rounded-lg text-lg font-bold ${fontSize === 'large' ? 'bg-white/20 text-white' : 'text-slate-500'}`}>A+</button>
                                            </div>
                                        </div>

                                        {/* Verses Per Page */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Ayat per Halaman</Label>
                                            <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                                                {[10, 20, 30, 50].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => handlePerPageChange(num)}
                                                        className={`h-8 rounded-lg text-xs font-bold transition-all ${perPage === num ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Qari Selection */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Pilih Qari</Label>
                                            <Select value={currentReciterId?.toString()} onValueChange={handleReciterChange}>
                                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl h-12">
                                                    <div className="flex items-center gap-3">
                                                        <Headphones className="h-4 w-4 text-sky-400" />
                                                        <SelectValue placeholder="Pilih Qari" />
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
                    {scriptType === 'tajweed' && <TajweedLegend />}
                    <div className={`text-right ${getVerseFontClass(scriptType, fontSize)} text-slate-200`} dir="rtl">
                        {verses.map((verse) => (
                            <span key={verse.id} className="inline relative" id={`verse-${parseInt(verse.verse_key.split(':')[1])}`}>
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
                                <span className="mx-2 inline-flex items-center justify-center h-10 w-10 text-sm relative font-sans text-[rgb(var(--color-primary))] select-none">
                                    <span className="absolute inset-0 text-3xl">۝</span>
                                    <span className="relative z-10 pt-1 font-bold font-amiri text-lg text-[rgb(var(--color-primary-dark))]">{toArabicNumber(parseInt(verse.verse_key.split(':')[1]))}</span>
                                </span>
                            </span>
                        ))}
                    </div>
                    {/* Pagination Controls (Mushaf Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-8 mt-4 border-t border-white/5" dir="ltr">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Sebelumnya
                            </Button>
                            <span className="text-sm font-medium text-slate-400">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}


                </div>

            ) : (
                // --- List Mode View ---
                <div className="space-y-4 px-0 md:px-0">
                    {scriptType === 'tajweed' && (
                        <div className="px-4 md:px-0">
                            <TajweedLegend />
                        </div>
                    )}
                    {displayedVerses.map((verse) => {
                        const verseNum = parseInt(verse.verse_key.split(':')[1]);
                        const isPlayingVerse = playingVerseKey === verse.verse_key;
                        const isBookmarked = checkIsBookmarked(verse.verse_key);

                        return (
                            <div
                                key={verse.id}
                                id={`verse-${verseNum}`}
                                className={`group relative py-8 px-4 md:px-6 border-b border-white/5 transition-colors duration-500 ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))]/5' : 'hover:bg-white/[0.02]'}`}
                            >
                                {/* Action Bar */}
                                <div className="flex items-center justify-between mb-6">
                                    <AyahMarker number={toArabicNumber(verseNum)} />
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                                        {!(isPlayingVerse && isPlaying) && (
                                            <Button variant="ghost" size="icon" onClick={() => handleVersePlay(verse, false)} className={`h-8 w-8 rounded-full ${isPlayingVerse ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10'}`}>
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleBookmarkClick(verse)} className={`h-8 w-8 rounded-full ${isBookmarked ? 'text-[rgb(var(--color-primary))]' : 'text-slate-400 hover:text-[rgb(var(--color-primary))]'}`}>
                                            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setActiveVerseForShare(verse)} className="h-8 w-8 rounded-full text-slate-400 hover:text-[rgb(var(--color-primary))]"><Share2 className="h-4 w-4" /></Button>
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
                                    {activeTafsirVerse === verse.verse_key && (
                                        <div className="mt-6 p-5 rounded-2xl bg-[#0f172a] border border-white/5 animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2 mb-3"><Lightbulb className="h-4 w-4 text-amber-400" /><h3 className="text-sm font-bold text-white">Tafsir Ringkas</h3></div>
                                            {loadingTafsir.has(verse.verse_key) ? <div className="flex items-center gap-2 text-slate-500 py-4"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-xs">Memuat...</span></div> : (
                                                <div className="prose prose-invert prose-sm text-slate-300"><p>{tafsirCache.get(verse.verse_key)?.short || "Tafsir tidak tersedia."}</p></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {/* Pagination Controls (List Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between py-8 px-4 mt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Sebelumnya
                            </Button>
                            <span className="text-sm font-medium text-slate-400">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* Surah Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5 pb-24">
                        {chapter.id > 1 ? (
                            <Link href={`/quran/${chapter.id - 1}`} className="group flex flex-col p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-[rgb(var(--color-primary))]">Surat Sebelumnya</span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xl font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors">{surahNames[chapter.id - 1]}</span>
                                    </div>
                                    <span className="text-3xl font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white">
                                        {chapter.id - 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}

                        {chapter.id < 114 ? (
                            <Link href={`/quran/${chapter.id + 1}`} className="group flex flex-col p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[rgb(var(--color-primary))]/30 transition-all duration-300 text-right">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-[rgb(var(--color-primary))]">Surat Berikutnya</span>
                                <div className="flex items-center justify-between flex-row-reverse">
                                    <div className="flex items-center gap-3 flex-row-reverse">
                                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[rgb(var(--color-primary))]/20 transition-colors">
                                            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[rgb(var(--color-primary))]" />
                                        </div>
                                        <span className="text-xl font-bold text-white group-hover:text-[rgb(var(--color-primary))] transition-colors">{surahNames[chapter.id + 1]}</span>
                                    </div>
                                    <span className="text-3xl font-amiri opacity-20 group-hover:opacity-100 transition-opacity text-white">
                                        {chapter.id + 1}
                                    </span>
                                </div>
                            </Link>
                        ) : <div />}
                    </div>
                </div>
            )}


            {/* --- Navigation Footer & Player --- */}
            <div className="fixed bottom-6 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-3 px-4">

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

                {/* Surah Navigation */}
                <div className={`flex items-center gap-2 bg-[#0f172a]/90 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl pointer-events-auto transition-all duration-500 ${playingVerseKey ? 'scale-90 opacity-60 hover:opacity-100 hover:scale-100' : 'scale-100'}`}>
                    {chapter.id > 1 && (
                        <Link href={`/quran/${chapter.id - 1}`} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-xs font-bold hidden md:inline">Surat Sebelumnya</span>
                        </Link>
                    )}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    {chapter.id < 114 && (
                        <Link href={`/quran/${chapter.id + 1}`} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                            <span className="text-xs font-bold hidden md:inline">Surat Berikutnya</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
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
                onOpenChange={(open) => !open && setEditingBookmarkKey(null)}
                bookmark={activeBookmark}
                onSave={() => setEditingBookmarkKey(null)}
            />
        </div >
    );
}
