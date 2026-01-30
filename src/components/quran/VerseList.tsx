"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause, Eye, EyeOff, BookOpen, AlignJustify, Square, Copy, Check, CheckCircle, Palette, Bookmark, Share2, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VerseShareDialog from "./VerseShareDialog";
import { Chapter } from "@/components/quran/SurahList";
import { AyahMarker } from "./AyahMarker";
import { surahNames } from "@/lib/surahData";
import { QURAN_RECITER_OPTIONS, DEFAULT_SETTINGS } from "@/data/settings-data";

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
}

interface VerseListProps {
    chapter: Chapter;
    verses: Verse[];
    audioUrl?: string;
    currentPage: number;
    totalPages: number;
    currentReciterId?: number;
}

const toArabicNumber = (n: number) => {
    return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
};

const cleanTranslation = (text: string) => {
    return text.replace(/(\d+)$/gm, '').replace(/(\d+)(?=\s|$)/g, '');
};

const tajweedStyles = `
  /* Distinct High-Contrast Pastel Palette */
  
  /* Ghunnah (Green) - Vibrant Green */
  tajweed[class*="ghunnah"], .tajweed-text .hn, .tajweed-text .tajweed-hn { 
      color: #4ade80 !important; 
      font-weight: bold !important;
  }

  /* Qalqalah (Blue) - Sky Blue */
  tajweed[class*="qalqalah"], tajweed[class*="qalaqah"], .tajweed-text .ql, .tajweed-text .tajweed-ql { 
      color: #38bdf8 !important; 
      font-weight: bold !important;
  }

  /* Idgham (Purple) - Distinct Lavender/Purple */
  /* Includes: idgham_ghunnah, idgham_shafawi, idgham_wo_ghunnah, laam_shamsiyah */
  tajweed[class*="idgham"], tajweed[class*="laam_shamsiyah"], .tajweed-text .id, .tajweed-text .tajweed-id { 
      color: #c084fc !important; 
      font-weight: bold !important;
  }

  /* Ikhfa (Orange) - Bright Orange */
  /* Includes: ikhafa, ikhafa_shafawi */
  tajweed[class*="ikhfa"], tajweed[class*="ikhafa"], .tajweed-text .ik, .tajweed-text .tajweed-ik { 
      color: #fb923c !important; 
      font-weight: bold !important;
  }

  /* Iqlab (Cyan) - Bright Cyan */
  tajweed[class*="iqlab"], .tajweed-text .iqlab { 
      color: #22d3ee !important; 
      font-weight: bold !important;
  }

  /* Madd (Red) - Rose Red */
  /* Includes: madda_normal, madda_necessary, madda_obligatory, madda_permissible */
  tajweed[class*="madda"], .tajweed-text .m, .tajweed-text .tajweed-m { 
      color: #fb7185 !important; 
      font-weight: bold !important;
  }

  /* Hamzat Wasl / Silent - GOLD/AMBER */
  tajweed[class*="ham_wasl"], tajweed[class*="slnt"], .tajweed-text .slient { 
      color: #facc15 !important; 
      font-weight: bold !important;
  }
  
  /* Other rules */
  .tajweed-text .sl, .tajweed-text .tajweed-sl { color: #facc15 !important; font-weight: bold !important; } /* Silah - Yellow */
  .tajweed-text .pp, .tajweed-text .tajweed-pp { color: #fb923c !important; font-weight: bold !important; } /* Waqf - Orange */

  /* Highlight Animation */
  @keyframes highlight-pulse {
      0% { background-color: rgba(16, 185, 129, 0.4); }
      50% { background-color: rgba(16, 185, 129, 0.2); }
      100% { background-color: transparent; }
  }
  
  .highlight-verse {
      animation: highlight-pulse 2s ease-out;
      border-radius: 0.5rem;
      position: relative;
  }
  
  .highlight-verse::before {
      content: '';
      position: absolute;
      left: -4px; right: -4px; top: -4px; bottom: -4px;
      border: 2px solid rgba(16, 185, 129, 0.6);
      border-radius: 0.75rem;
      pointer-events: none;
      animation: fade-out-border 2s ease-out forwards;
  }

  @keyframes fade-out-border {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.02); }
  }
`;

const cleanTajweedText = (htmlText: string) => {
    if (!htmlText) return '';
    let cleaned = htmlText;
    // 1. Remove <span class=end>١</span> (API often returns this specific format)
    cleaned = cleaned.replace(/<span\s+class=end>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    // 2. Remove standard <span ...>١</span>
    cleaned = cleaned.replace(/<span[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    // 3. Fallback: Remove raw Arabic digits or Ayah End Symbol at the end
    cleaned = cleaned.replace(/[\u0660-\u0669\u06DD]+\s*$/u, '');
    return cleaned.trim();
};

const tajweedRules = [
    { label: 'Ghunnah', color: '#4ade80', desc: 'Dengung ditahan 2 harakat', shadow: 'rgba(74,222,128,0.5)' },
    { label: 'Qalqalah', color: '#38bdf8', desc: 'Pantulan bunyi huruf mati', shadow: 'rgba(56,189,248,0.5)' },
    { label: 'Idgham', color: '#c084fc', desc: 'Melebur ke huruf berikutnya', shadow: 'rgba(192,132,252,0.5)' },
    { label: 'Ikhfa', color: '#fb923c', desc: 'Menyamarkan bunyi Nun/Tanwin', shadow: 'rgba(251,146,60,0.5)' },
    { label: 'Iqlab', color: '#22d3ee', desc: 'Mengganti bunyi Nun jadi Mim', shadow: 'rgba(34,211,238,0.5)' },
    { label: 'Mad', color: '#fb7185', desc: 'Panjang bacaan 2-6 harakat', shadow: 'rgba(251,113,133,0.5)' },
    { label: 'Hamzah Wasl / Silah', color: '#facc15', desc: 'Tidak dibaca saat washal / Panjang 2 harakat', shadow: 'rgba(250,204,21,0.5)' },
];

const TajweedLegend = () => (
    <div className="mb-8 p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Palette className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            Panduan Warna & Cara Baća
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tajweedRules.map((rule) => (
                <div key={rule.label} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <span
                        className="mt-1 w-3 h-3 shrink-0 rounded-full"
                        style={{
                            backgroundColor: rule.color,
                            boxShadow: rule.shadow !== 'none' ? `0 0 8px ${rule.shadow}` : 'none'
                        }}
                    ></span>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-[rgb(var(--color-primary-light))] transition-colors">
                            {rule.label}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {rule.desc}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages, currentReciterId }: VerseListProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list');
    const [tajweedMode, setTajweedMode] = useState(false);
    const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
    // State
    const [bookmarkedVerseKey, setBookmarkedVerseKey] = useState<string | null>(null);
    const [sharingVerse, setSharingVerse] = useState<Verse | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isJumpDialogOpen, setIsJumpDialogOpen] = useState(false);
    const [jumpTarget, setJumpTarget] = useState("");

    const handleJumpToVerse = (e: React.FormEvent) => {
        e.preventDefault();
        const verseNum = parseInt(jumpTarget);
        if (!verseNum || verseNum < 1 || verseNum > chapter.verses_count) return;

        setIsJumpDialogOpen(false);
        setJumpTarget("");

        const elementId = `${chapter.id}:${verseNum}`;
        const element = document.getElementById(elementId);

        const ITEMS_PER_PAGE = 20;
        const targetPage = Math.ceil(verseNum / ITEMS_PER_PAGE);

        if (targetPage !== currentPage) {
            // Navigate to different page with hash
            window.location.href = `?page=${targetPage}#${chapter.id}:${verseNum}`;
            return;
        }

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelectorAll('.highlight-verse').forEach(el => el.classList.remove('highlight-verse'));
            setTimeout(() => {
                element.classList.add('highlight-verse');
                setTimeout(() => element.classList.remove('highlight-verse'), 3000);
            }, 100);
        } else {
            window.location.reload();
        }
    };

    // Font size configurations
    const fontSizes = {
        small: {
            arabic: 'text-2xl md:text-3xl',
            arabicLeading: 'leading-loose md:leading-[2]',
            translation: 'text-xs md:text-sm',
            mushaf: 'text-xl md:text-2xl',
            mushafLeading: 'leading-[3rem] md:leading-[3.5rem]'
        },
        medium: {
            arabic: 'text-3xl md:text-4xl',
            arabicLeading: 'leading-loose md:leading-[2.5]',
            translation: 'text-sm md:text-base',
            mushaf: 'text-2xl md:text-3xl',
            mushafLeading: 'leading-[3.5rem] md:leading-[4.5rem]'
        },
        large: {
            arabic: 'text-4xl md:text-5xl',
            arabicLeading: 'leading-loose md:leading-[3]',
            translation: 'text-base md:text-lg',
            mushaf: 'text-3xl md:text-4xl',
            mushafLeading: 'leading-[4rem] md:leading-[5rem]'
        }
    };

    // Get current reciter name for display
    const currentReciterName = QURAN_RECITER_OPTIONS.find(r => r.id === currentReciterId)?.label || "Mishary Rashid Alafasy";

    // Verse Audio State
    const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
    const verseAudioRef = useRef<HTMLAudioElement | null>(null);

    // Bookmark State


    // Reciter Setting
    const [selectedReciter, setSelectedReciter] = useState(DEFAULT_SETTINGS.reciter);

    useEffect(() => {
        // Load reciter setting
        const savedReciter = localStorage.getItem("settings_reciter");
        if (savedReciter) {
            setSelectedReciter(parseInt(savedReciter));
        }

        // Load font size setting
        const savedFontSize = localStorage.getItem("quran_font_size");
        if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
            setFontSize(savedFontSize as 'small' | 'medium' | 'large');
        }
    }, []);

    const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
        setFontSize(size);
        localStorage.setItem("quran_font_size", size);
    };

    useEffect(() => {
        const saved = localStorage.getItem("quran_last_read");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Specifically check if it's THIS Surah
                if (parsed.surahId === chapter.id) {
                    setBookmarkedVerseKey(`${chapter.id}:${parsed.verseId}`);
                }
            } catch (e) {
                console.error("Failed to parse bookmark", e);
            }
        }
    }, [chapter.id]);

    // Auto-scroll to bookmarked verse
    useEffect(() => {
        // Check if URL has hash (e.g., #18:10)
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1); // Remove #
            // Wait for DOM to render, then scroll
            const timer = setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    // Optional: Add highlight effect
                    element.classList.add('highlight-verse');
                    setTimeout(() => element.classList.remove('highlight-verse'), 2000);
                }
            }, 300); // Small delay for rendering
            return () => clearTimeout(timer);
        }
    }, [verses]); // Re-run when verses change (page change)

    const toggleAudio = () => {
        // Pause verse audio if playing
        if (playingVerseId && verseAudioRef.current) {
            verseAudioRef.current.pause();
            setPlayingVerseId(null);
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(err => {
                    console.warn("Audio playback prevented by browser policy:", err);
                    setIsPlaying(false);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Build audio URL based on selected reciter
    // Note: For now, use the original URL from the API as it's more reliable
    // Custom reciter integration would require a mapping of verse numbers to audio files
    const handlePlayVerse = (verseId: number, originalUrl: string) => {
        // Pause Global Surah Audio if playing
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }

        if (playingVerseId === verseId) {
            // Pause current verse
            verseAudioRef.current?.pause();
            setPlayingVerseId(null);
        } else {
            // Play new verse using the original URL
            if (verseAudioRef.current) {
                verseAudioRef.current.src = originalUrl;
                verseAudioRef.current.play().catch(console.error);
                setPlayingVerseId(verseId);
            } else {
                // Initialize audio element if not exists
                const audio = new Audio(originalUrl);
                verseAudioRef.current = audio;
                audio.onended = () => setPlayingVerseId(null);
                audio.onerror = () => {
                    console.error("Failed to play audio");
                    setPlayingVerseId(null);
                };
                audio.play().catch(console.error);
                setPlayingVerseId(verseId);
            }
        }
    };

    const [copiedVerseId, setCopiedVerseId] = useState<number | null>(null);

    const handleCopyVerse = (verse: Verse) => {
        const rawTranslation = (verse.translations.find((t) => t.resource_id === 33) || verse.translations[0])?.text.replace(/<[^>]*>?/gm, "") || "";
        // Clean footnotes: remove digits at end of words/sentences
        const cleanText = rawTranslation.replace(/(\d+)(?=\s|$|[.,;])/g, '').replace(/(\w)(\d+)/g, '$1').trim();

        const text = `"${cleanText}" (QS. ${chapter.name_simple}: ${verse.verse_key.split(":")[1]})`;
        navigator.clipboard.writeText(text);
        setCopiedVerseId(verse.id);
        setTimeout(() => setCopiedVerseId(null), 2000);
    };

    const handleBookmark = (verse: Verse) => {
        const verseNum = parseInt(verse.verse_key.split(":")[1]);
        const bookmarkData = {
            surahId: chapter.id,
            surahName: chapter.name_simple,
            verseId: verseNum,
            timestamp: Date.now()
        };
        localStorage.setItem("quran_last_read", JSON.stringify(bookmarkData));
        setBookmarkedVerseKey(verse.verse_key);

        // Optional: Trigger a toast or effect 
        // For now simple state update is enough visual feedback
    };

    return (
        <div className="w-full max-w-4xl space-y-8 pb-0">
            <style>{tajweedStyles}</style>

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b border-white/10 bg-black/60 px-3 py-2 backdrop-blur-xl md:static md:mx-0 md:rounded-xl md:border md:bg-white/5 md:px-6 md:py-4 transition-all">
                {/* Left: Back Button */}
                <div className="shrink-0 mr-1">
                    <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 md:h-10 md:w-10 text-white/70 hover:bg-white/10 hover:text-white" title="Kembali">
                        <Link href="/quran">
                            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                        </Link>
                    </Button>
                </div>

                {/* Center: Title Stack (Compact on Mobile) */}
                <div className="flex flex-1 flex-col items-center justify-center px-1 min-w-0">
                    <span className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 px-2 py-0.5 mb-0.5 text-[9px] font-bold tracking-widest text-[rgb(var(--color-primary-light))] uppercase hidden md:inline-flex">
                        SURAT KE-{chapter.id}
                    </span>
                    <div className="flex items-baseline gap-2 w-full justify-center">
                        <h1 className="text-sm md:text-xl font-bold text-white leading-tight text-center tracking-tight truncate max-w-full">
                            {chapter.name_simple}
                        </h1>
                        <span className="text-[10px] md:hidden font-medium text-slate-500 shrink-0">
                            ({chapter.verses_count})
                        </span>
                    </div>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400 text-center hidden md:block">
                        {chapter.translated_name.name} • {chapter.verses_count} Ayat • {chapter.revelation_place === "makkah" ? "Mekah" : "Madinah"}
                    </p>
                </div>

                {/* Right: Controls */}
                <div className="shrink-0 flex items-center gap-x-1 md:gap-x-4">
                    {/* Search / Jump Verse (Always Visible) */}
                    <button
                        onClick={() => setIsJumpDialogOpen(true)}
                        className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
                        title="Cari Ayat"
                    >
                        <Search className="h-4 w-4" />
                    </button>

                    {/* Play Button (Always Visible - Compact) */}
                    {audioUrl && (
                        <div className="flex items-center gap-1">
                            <Button
                                onClick={toggleAudio}
                                size="icon"
                                className="h-8 w-8 md:h-10 md:w-auto md:px-6 rounded-full bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))]"
                                title={`${isPlaying ? "Jeda" : "Putar"}`}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                <span className="hidden md:inline ml-2 font-medium">{isPlaying ? "Jeda" : "Putar"}</span>
                            </Button>
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Desktop: Visual Settings Group */}
                    <div className="hidden md:flex items-center gap-x-2 border-l border-white/10 pl-4 ml-2">
                        {/* View Mode */}
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'mushaf' : 'list')}
                            className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
                            title={viewMode === 'list' ? "Ganti ke Tampilan Mushaf" : "Ganti ke Tampilan List"}
                        >
                            {viewMode === 'list' ? <BookOpen className="h-4 w-4" /> : <AlignJustify className="h-4 w-4" />}
                        </button>

                        {/* Tajweed Toggle */}
                        <button
                            onClick={() => setTajweedMode(!tajweedMode)}
                            className={`h-10 px-4 flex items-center gap-2 rounded-full border text-xs font-medium transition-all ${tajweedMode ? 'bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/50 text-[rgb(var(--color-primary-light))]' : 'bg-slate-800/40 border-white/10 text-slate-400'}`}
                        >
                            <Palette className="w-4 h-4" />
                            <span>Tajwid</span>
                        </button>

                        {/* Font Size */}
                        <div className="flex items-center gap-0.5 pl-2 bg-slate-800/40 rounded-full border border-white/10 p-1">
                            {([
                                { size: 'small' as const, label: 'A-', title: 'Kecil' },
                                { size: 'medium' as const, label: 'A', title: 'Sedang' },
                                { size: 'large' as const, label: 'A+', title: 'Besar' }
                            ]).map(({ size, label, title }) => (
                                <button
                                    key={size}
                                    onClick={() => handleFontSizeChange(size)}
                                    className={`h-8 w-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${fontSize === size ? 'bg-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary-light))]' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: Settings Toggle */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="md:hidden h-8 w-8 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all ml-1"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>


            {/* Bismillah */}
            {
                chapter.id !== 1 && chapter.id !== 9 && currentPage === 1 && (
                    <div className="flex justify-center py-6 text-2xl font-amiri text-white/80 md:text-3xl">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </div>
                )
            }

            {/* Tajweed Legend */}
            {tajweedMode && <TajweedLegend />}


            {/* Content Area */}
            {
                viewMode === 'mushaf' ? (
                    // MUSHAF MODE: Continuous Text Block
                    <div className="p-4 md:p-8 rounded-2xl bg-white/5 border border-white/5 shadow-2xl">
                        <div
                            className={`text-right ${fontSizes[fontSize].mushaf} ${fontSizes[fontSize].mushafLeading} font-amiri text-justify text-slate-200 transition-all duration-200`}
                            dir="rtl"
                        >
                            {verses.map((verse) => (
                                <span key={verse.id}>
                                    <span
                                        className={tajweedMode ? "tajweed-text" : ""}
                                        dangerouslySetInnerHTML={{
                                            __html: tajweedMode && verse.text_uthmani_tajweed
                                                ? cleanTajweedText(verse.text_uthmani_tajweed)
                                                : cleanTajweedText(verse.text_uthmani)
                                        }}
                                    />
                                    <span className="inline-block align-middle mx-1.5">
                                        <AyahMarker number={toArabicNumber(parseInt(verse.verse_key.split(":")[1]))} />
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    // LIST MODE: Vertical Stack
                    <div className="space-y-6 flex-1">
                        {verses.map((verse) => (
                            <div
                                key={verse.id}
                                id={verse.verse_key}
                                className="flex flex-col gap-6 border-b border-white/5 pb-6 last:border-0 scroll-mt-24"
                            >
                                {/* Arabic */}
                                <div className="text-right" dir="rtl">
                                    <p className={`font-amiri ${fontSizes[fontSize].arabic} ${fontSizes[fontSize].arabicLeading} text-white flex flex-row items-center flex-wrap gap-2 transition-all duration-200`}>
                                        <span
                                            className={tajweedMode ? "tajweed-text" : ""}
                                            dangerouslySetInnerHTML={{
                                                __html: tajweedMode && verse.text_uthmani_tajweed
                                                    ? cleanTajweedText(verse.text_uthmani_tajweed)
                                                    : cleanTajweedText(verse.text_uthmani)
                                            }}
                                        />
                                        <span className="inline-flex items-center gap-x-3 ms-2 align-middle">
                                            <AyahMarker number={toArabicNumber(parseInt(verse.verse_key.split(":")[1]))} />

                                            {/* Play Button */}
                                            <button
                                                onClick={() => handlePlayVerse(verse.id, verse.audio.url)}
                                                className="p-1.5 rounded-full text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 transition-colors flex items-center justify-center focus:outline-none"
                                                title={playingVerseId === verse.id ? "Jeda Ayat Ini" : "Dengarkan Ayat Ini"}
                                            >
                                                {playingVerseId === verse.id ? (
                                                    <Square className="w-4 h-4 fill-current" />
                                                ) : (
                                                    <Play className="w-4 h-4 fill-current" />
                                                )}
                                            </button>

                                            {/* Share Button */}
                                            <button
                                                onClick={() => setSharingVerse(verse)}
                                                className="p-1.5 rounded-full text-slate-500 hover:text-pink-400 transition-colors flex items-center justify-center focus:outline-none"
                                                title="Bagikan Ayat"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>

                                            {/* Bookmark Button */}
                                            <button
                                                onClick={() => handleBookmark(verse)}
                                                className={`p-1.5 rounded-full transition-colors flex items-center justify-center focus:outline-none ${bookmarkedVerseKey === verse.verse_key ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                                                title="Tandai Terakhir Dibaca"
                                            >
                                                <Bookmark className={`w-4 h-4 ${bookmarkedVerseKey === verse.verse_key ? 'fill-current' : ''}`} />
                                            </button>
                                        </span>
                                    </p>
                                </div>

                                {/* Translation */}
                                <div className="flex items-start justify-between gap-x-4 group">
                                    <p className={`${fontSizes[fontSize].translation} leading-relaxed text-slate-400 transition-all duration-200`}>
                                        {
                                            cleanTranslation((verse.translations.find((t) => t.resource_id === 33) || verse.translations[0])?.text.replace(/<[^>]*>?/gm, ""))
                                        }
                                    </p>
                                    <button
                                        onClick={() => handleCopyVerse(verse)}
                                        className="p-1.5 rounded-md text-slate-600 hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Salin Terjemahan"
                                    >
                                        {copiedVerseId === verse.id ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Pagination & Navigation */}
            <div className="flex flex-col gap-2 mt-0 px-4 mb-0 pb-0">
                {/* Area A: Verse Pagination */}
                <div className="flex items-center justify-center gap-4">
                    {currentPage > 1 ? (
                        <Link
                            href={`?page=${currentPage - 1}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary-dark))]/30 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--color-primary))]/20 transition-all text-sm font-medium"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Halaman Sebelumnya
                        </Link>
                    ) : (
                        <button disabled className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 text-slate-500 text-sm font-medium cursor-not-allowed opacity-50">
                            <ChevronLeft className="h-4 w-4" />
                            Halaman Sebelumnya
                        </button>
                    )}

                    <span className="text-xs font-medium text-slate-400">
                        Halaman {currentPage} dari {totalPages}
                    </span>

                    {currentPage < totalPages ? (
                        <Link
                            href={`?page=${currentPage + 1}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary-dark))]/30 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--color-primary))]/20 transition-all text-sm font-medium"
                        >
                            Halaman Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <button disabled className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 text-slate-500 text-sm font-medium cursor-not-allowed opacity-50">
                            Halaman Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Area B: Surah Navigation (Always Visible) */}
                <div className="flex justify-between items-center w-full pt-2 border-t border-white/5">
                    {chapter.id > 1 ? (
                        <Link
                            href={`/quran/${chapter.id - 1}`}
                            className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--color-primary-light))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="opacity-80">Ke {surahNames[chapter.id - 1]}</span>
                        </Link>
                    ) : <div />}

                    {chapter.id < 114 ? (
                        <Link
                            href={`/quran/${chapter.id + 1}`}
                            className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--color-primary-light))] hover:text-[rgb(var(--color-primary))] transition-colors"
                        >
                            <span className="opacity-80">Ke {surahNames[chapter.id + 1]}</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : <div />}
                </div>
            </div>
            {/* Floating Copy Toast */}
            {
                copiedVerseId !== null && (
                    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-[rgb(var(--color-primary-dark))]/90 border border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                            <span className="text-xs font-medium">Terjemahan berhasil disalin</span>
                        </div>
                    </div>
                )
            }
            {/* Mobile Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-xs w-[90%] bg-slate-950/95 border-white/10 text-white backdrop-blur-xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400">
                            <Settings className="w-4 h-4" />
                            Pengaturan Tampilan
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* 1. View Mode */}
                        <div className="flex items-center justify-between">
                            <Label className="text-white font-medium">Mode Baca</Label>
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-[rgb(var(--color-primary))] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                >
                                    List
                                </button>
                                <button
                                    onClick={() => setViewMode('mushaf')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'mushaf' ? 'bg-[rgb(var(--color-primary))] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Mushaf
                                </button>
                            </div>
                        </div>

                        {/* 2. Tajweed */}
                        <div className="flex items-center justify-between">
                            <Label className="text-white font-medium">Warna Tajwid</Label>
                            <button
                                onClick={() => setTajweedMode(!tajweedMode)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${tajweedMode ? 'bg-[rgb(var(--color-primary))]' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tajweedMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* 3. Font Size */}
                        <div className="space-y-3">
                            <Label className="text-white font-medium">Ukuran Teks Arab</Label>
                            <div className="flex justify-between items-center bg-slate-900/50 rounded-xl border border-white/10 p-2">
                                <button onClick={() => handleFontSizeChange('small')} className={`p-2 rounded-lg ${fontSize === 'small' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-slate-500'}`}>
                                    <span className="text-xs font-bold">Aa</span>
                                </button>
                                <div className="h-px flex-1 bg-white/10 mx-2" />
                                <button onClick={() => handleFontSizeChange('medium')} className={`p-2 rounded-lg ${fontSize === 'medium' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-slate-500'}`}>
                                    <span className="text-base font-bold">Aa</span>
                                </button>
                                <div className="h-px flex-1 bg-white/10 mx-2" />
                                <button onClick={() => handleFontSizeChange('large')} className={`p-2 rounded-lg ${fontSize === 'large' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-slate-500'}`}>
                                    <span className="text-xl font-bold">Aa</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white mt-2">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Jump To Verse Dialog */}
            <Dialog open={isJumpDialogOpen} onOpenChange={setIsJumpDialogOpen}>
                <DialogContent className="max-w-xs bg-slate-950 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Lompat ke Ayat</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleJumpToVerse} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="verse-num" className="text-slate-400">Nomor Ayat (1-{chapter.verses_count})</Label>
                            <Input
                                id="verse-num"
                                type="number"
                                min={1}
                                max={chapter.verses_count}
                                value={jumpTarget}
                                onChange={(e) => setJumpTarget(e.target.value)}
                                placeholder="Contoh: 10"
                                className="bg-slate-900 border-white/10 focus:ring-[rgb(var(--color-primary))]"
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))]">
                                Cari Ayat
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Verse Share Dialog */}
            <VerseShareDialog
                open={!!sharingVerse}
                onOpenChange={(open) => !open && setSharingVerse(null)}
                verse={sharingVerse}
                surahName={chapter.name_simple}
                surahNumber={chapter.id}
            />
        </div >
    );
}
