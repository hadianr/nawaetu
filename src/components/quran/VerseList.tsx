"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Play, Pause, Share2, Bookmark, Check, ChevronLeft, ChevronRight, Settings, Type, Palette, Search, Volume2, X, BookOpen, ChevronDown, Copy, Lightbulb, Loader2, Square, CheckCircle, AlignJustify, MoreVertical, ArrowLeft, ArrowRight } from 'lucide-react';
import { getVerseTafsir, type TafsirContent } from '@/lib/tafsir-api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages, currentReciterId }: VerseListProps) {
    // --- State ---
    const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

    // Settings State
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [showTransliteration, setShowTransliteration] = useState(true);
    const [tajweedMode, setTajweedMode] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list');

    // Interactive State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeVerseForShare, setActiveVerseForShare] = useState<Verse | null>(null);

    // Bookmarking
    const { isBookmarked: checkIsBookmarked, getBookmark } = useBookmarks();
    // const [bookmarkDialogVerse, setBookmarkDialogVerse] = useState<Verse | null>(null); // Unused
    const [editingBookmarkKey, setEditingBookmarkKey] = useState<string | null>(null); // Use verseKey (e.g., "1:1")

    // Tafsir
    const [expandedTafsir, setExpandedTafsir] = useState<Set<string>>(new Set());
    const [loadingTafsir, setLoadingTafsir] = useState<Set<string>>(new Set());
    const [tafsirCache, setTafsirCache] = useState<Map<string, TafsirContent>>(new Map());
    const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);

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
        if (!isNaN(verseNum) && verseNum > 0 && verseNum <= verses.length) {
            scrollToVerse(verseNum);
        }
    };

    // Audio State
    const [isContinuous, setIsContinuous] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

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
        }
    };

    const handleAudioEnded = () => {
        if (isContinuous) {
            handleNextVerse();
        } else {
            setIsPlaying(false); // Just pause at end of single verse
            // Or stop? Usually single playback stops after verse.
            // Let's call handleStop to clear the player if it's single mode.
            handleStop();
        }
    };

    useEffect(() => {
        if (currentAudioUrl && audioRef.current) {
            audioRef.current.src = currentAudioUrl;
            // Only auto-play if we are in a 'playing' state intent
            // But usually setting URL implies we want to play (changed track)
            // unless we are just restoring state (not applicable here yet)
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play failed", e));
            }
        }
    }, [currentAudioUrl]); // Dependency on isPlaying logic handled inside handlers? 
    // Actually, when we change verses, currentAudioUrl changes. We want it to play.
    // So 'isPlaying' should be true. which we set in handleVersePlay/Next/Prev.


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
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] text-xs font-bold transition-colors border border-[rgb(var(--color-primary))]/20"
                            >
                                <Play className="h-3 w-3 fill-current" />
                                Putar Surat
                            </button>
                        )}

                        {/* Search / Jump */}
                        <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full absolute inset-0 bg-[#0f172a] px-4 z-40' : ''}`}>
                            {isSearchOpen ? (
                                <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-2">
                                    <Search className="h-5 w-5 text-[rgb(var(--color-primary))]" />
                                    <Input
                                        autoFocus
                                        placeholder="Cari kata atau loncat ke ayat (cth: 5)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-14"
                                    />
                                    <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-2 text-slate-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </button>
                                </form>
                            ) : (
                                <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors">
                                    <Search className="h-5 w-5" />
                                </button>
                            )}
                        </div>

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
                                        {/* Toggles */}
                                        <div className="space-y-4">
                                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Teks & Terjemahan</Label>
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                                <div className="flex items-center gap-3"><Palette className="h-5 w-5 text-emerald-400" /><span className="font-medium">Warna Tajwid</span></div>
                                                <button onClick={() => setTajweedMode(!tajweedMode)} className={`w-11 h-6 rounded-full transition-colors relative ${tajweedMode ? 'bg-[rgb(var(--color-primary))]' : 'bg-slate-700'}`}><span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${tajweedMode ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                                            </div>
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
                    <div className={`text-right leading-[3.5] ${fontSize === 'large' ? 'text-4xl' : fontSize === 'small' ? 'text-2xl' : 'text-3xl'} tracking-wide font-amiri text-slate-200 text-justify`} dir="rtl">
                        {verses.map((verse) => (
                            <span key={verse.id} className="inline relative" id={`verse-${parseInt(verse.verse_key.split(':')[1])}`}>
                                <span className={cn(
                                    "hover:bg-[rgb(var(--color-primary))]/10 transition-colors rounded px-1 cursor-pointer",
                                    playingVerseKey === verse.verse_key && "bg-[rgb(var(--color-primary))]/20"
                                )}
                                    onClick={() => handleVersePlay(verse, false)}
                                >
                                    {tajweedMode && verse.text_uthmani_tajweed ? (
                                        <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
                                    ) : (
                                        verse.text_uthmani
                                    )}
                                </span>
                                <span className="mx-2 inline-flex items-center justify-center h-10 w-10 text-sm relative font-sans text-[rgb(var(--color-primary))] select-none">
                                    <span className="absolute inset-0 text-3xl">۝</span>
                                    <span className="relative z-10 pt-1 font-bold font-amiri text-lg text-[rgb(var(--color-primary-dark))]">{toArabicNumber(parseInt(verse.verse_key.split(':')[1]))}</span>
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                // --- List Mode View ---
                <div className="space-y-4 px-0 md:px-0">
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
                                <div dir="rtl" className={`w-full font-amiri text-right mb-6 text-slate-200 ${getFontSizeClass()} leading-loose tracking-wide`}>
                                    {tajweedMode && verse.text_uthmani_tajweed ? (
                                        <span dangerouslySetInnerHTML={{ __html: cleanTajweedText(verse.text_uthmani_tajweed) }} />
                                    ) : (
                                        <span>{verse.text_uthmani}</span>
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
                </div>
            )}

            {/* --- Navigation Footer & Player --- */}
            <div className="fixed bottom-6 left-0 right-0 z-20 pointer-events-none flex flex-col items-center gap-3 px-4">

                {/* Playing Status / Controls */}
                {playingVerseKey && (
                    <div className="pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sedang Memutar</span>
                            <span className="text-xs font-bold text-white">Ayat {toArabicNumber(parseInt(playingVerseKey.split(':')[1]))}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={handlePrevVerse} disabled={currentPlayingIndex <= 0} className="h-8 w-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30">
                                <ChevronLeft className="h-5 w-5" />
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
        </div>
    );
}
