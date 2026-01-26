"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause, Eye, EyeOff, BookOpen, AlignJustify, Square, Copy, Check, CheckCircle, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chapter } from "@/components/quran/SurahList";
import { AyahMarker } from "./AyahMarker";
import { surahNames } from "@/lib/surahData";

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
            <Palette className="w-4 h-4 text-emerald-500" />
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
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
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

export default function VerseList({ chapter, verses, audioUrl, currentPage, totalPages }: VerseListProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'mushaf'>('list');
    const [tajweedMode, setTajweedMode] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Verse Audio State
    const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
    const verseAudioRef = useRef<HTMLAudioElement | null>(null);

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
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handlePlayVerse = (verseId: number, url: string) => {
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
            // Play new verse
            if (verseAudioRef.current) {
                verseAudioRef.current.src = url;
                verseAudioRef.current.play();
                setPlayingVerseId(verseId);
            } else {
                // Initialize audio element if not exists (should accept ref)
                const audio = new Audio(url);
                verseAudioRef.current = audio;
                audio.onended = () => setPlayingVerseId(null);
                audio.play();
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

    return (
        <div className="w-full max-w-4xl space-y-8 pb-0">
            <style>{tajweedStyles}</style>

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-4 backdrop-blur-xl md:static md:mx-0 md:rounded-xl md:border md:bg-white/5 md:px-6">
                {/* Left: Back Button */}
                <div className="shrink-0">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white" title="Kembali ke Daftar Surat">
                        <Link href="/quran">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                </div>

                {/* Center: Title Stack */}
                <div className="flex flex-1 flex-col items-center justify-center px-4">
                    <span className="inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 mb-1 text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                        SURAT KE-{chapter.id}
                    </span>
                    <h1 className="text-xl font-bold text-white leading-tight text-center tracking-tight">
                        {chapter.name_simple}
                    </h1>
                    <p className="mt-0.5 text-[10px] font-medium text-slate-400 text-center">
                        {chapter.translated_name.name} • {chapter.verses_count} Ayat • {chapter.revelation_place === "makkah" ? "Mekah" : "Madinah"}
                    </p>
                </div>

                {/* Right: Controls */}
                <div className="shrink-0 flex items-center gap-x-4">
                    {/* Group: Visual Settings */}
                    <div className="flex items-center gap-x-2 border-r border-white/10 pr-4">
                        {/* View Mode Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'mushaf' : 'list')}
                            className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
                            title={viewMode === 'list' ? "Ganti ke Tampilan Mushaf" : "Ganti ke Tampilan List"}
                        >
                            {viewMode === 'list' ? (
                                <BookOpen className="h-4 w-4" />
                            ) : (
                                <AlignJustify className="h-4 w-4" />
                            )}
                        </button>

                        {/* Tajweed Toggle */}
                        <button
                            onClick={() => setTajweedMode(!tajweedMode)}
                            className={`
                                h-10 px-4 rounded-full border text-xs font-medium transition-all
                                flex items-center gap-x-2
                                ${tajweedMode
                                    ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    : 'bg-slate-800/40 border-white/10 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}
                            `}
                            title="Aktifkan Mode Tajwid Berwarna"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 10-1.06-1.06l-1.47 1.47a.75.75 0 101.06 1.06l1.47-1.47zm.002-12.002a.75.75 0 10-1.06 1.06l1.47 1.47a.75.75 0 101.06-1.06l-1.47-1.47zm12 0a.75.75 0 10-1.06 1.06l1.47 1.47a.75.75 0 101.06-1.06l-1.47-1.47z" clipRule="evenodd" />
                            </svg>
                            <span>Tajwid</span>
                        </button>
                    </div>

                    {audioUrl ? (
                        <>
                            <Button
                                onClick={toggleAudio}
                                className="h-10 gap-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 px-6"
                                title={isPlaying ? "Jeda Audio Surat" : "Putar Audio Surat Full"}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                <span className="hidden sm:inline font-medium">{isPlaying ? "Jeda Audio" : "Putar Audio"}</span>
                            </Button>
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                        </>
                    ) : (
                        <div className="w-10" />
                    )}
                </div>
            </div>

            {/* Bismillah */}
            {chapter.id !== 1 && chapter.id !== 9 && currentPage === 1 && (
                <div className="flex justify-center py-6 text-2xl font-amiri text-white/80 md:text-3xl">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </div>
            )}

            {/* Tajweed Legend */}
            {tajweedMode && <TajweedLegend />}


            {/* Content Area */}
            {viewMode === 'mushaf' ? (
                // MUSHAF MODE: Continuous Text Block
                <div className="p-4 md:p-8 rounded-2xl bg-white/5 border border-white/5 shadow-2xl">
                    <div
                        className="text-right text-2xl leading-[3.5rem] md:text-3xl md:leading-[4.5rem] font-amiri text-justify text-slate-200"
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
                            className="flex flex-col gap-6 border-b border-white/5 pb-6 last:border-0"
                        >
                            {/* Arabic */}
                            <div className="text-right" dir="rtl">
                                <p className="font-amiri text-3xl leading-loose text-white md:text-4xl md:leading-[2.5] flex flex-row items-center flex-wrap gap-2">
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
                                        <button
                                            onClick={() => handlePlayVerse(verse.id, verse.audio.url)}
                                            className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center justify-center focus:outline-none"
                                            title={playingVerseId === verse.id ? "Jeda Ayat Ini" : "Dengarkan Ayat Ini"}
                                        >
                                            {playingVerseId === verse.id ? (
                                                <Square className="w-4 h-4 fill-current" />
                                            ) : (
                                                <Play className="w-4 h-4 fill-current" />
                                            )}
                                        </button>
                                    </span>
                                </p>
                            </div>

                            {/* Translation */}
                            <div className="flex items-start justify-between gap-x-4 group">
                                <p className="text-sm leading-relaxed text-slate-400 md:text-base">
                                    {
                                        cleanTranslation((verse.translations.find((t) => t.resource_id === 33) || verse.translations[0])?.text.replace(/<[^>]*>?/gm, ""))
                                    }
                                </p>
                                <button
                                    onClick={() => handleCopyVerse(verse)}
                                    className="p-1.5 rounded-md text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
            )}

            {/* Pagination & Navigation */}
            <div className="flex flex-col gap-2 mt-0 px-4 mb-0 pb-0">
                {/* Area A: Verse Pagination */}
                <div className="flex items-center justify-center gap-4">
                    {currentPage > 1 ? (
                        <Link
                            href={`?page=${currentPage - 1}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
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
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
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
                            className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="opacity-80">Ke {surahNames[chapter.id - 1]}</span>
                        </Link>
                    ) : <div />}

                    {chapter.id < 114 ? (
                        <Link
                            href={`/quran/${chapter.id + 1}`}
                            className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <span className="opacity-80">Ke {surahNames[chapter.id + 1]}</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : <div />}
                </div>
            </div>
            {/* Floating Copy Toast */}
            {copiedVerseId !== null && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-emerald-950/90 border border-emerald-500/20 text-emerald-100 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium">Terjemahan berhasil disalin</span>
                    </div>
                </div>
            )}
        </div>
    );
}
