"use client";

/**
 * Nawaetu - Sirah Nabawiyah Reader View Component
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect } from "react";
import {
    ArrowLeft,
    BookOpen,
    Bookmark,
    CheckCircle2,
    Volume2,
    VolumeX,
    Sparkles,
    Type,
    Share2,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { SirahSection, SirahQuranRef } from "@/data/sirah";
import { SirahQuranBridgeModal } from "./SirahQuranBridgeModal";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SirahInlineProse } from "./SirahInlineProse";

interface SirahReaderViewProps {
    section: SirahSection;
    prevSectionId?: string;
    nextSectionId?: string;
    chapterSlug: string;
}

export function SirahReaderView({
    section,
    prevSectionId,
    nextSectionId,
    chapterSlug,
}: SirahReaderViewProps) {
    const { currentTheme } = useTheme();
    const { locale } = useLocale();
    const isDaylight = currentTheme === "daylight";
    const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [selectedQuranRef, setSelectedQuranRef] = useState<SirahQuranRef | null>(null);
    const [copied, setCopied] = useState(false);
    const [enNoticeDismissed, setEnNoticeDismissed] = useState(false);
    const [readProgress, setReadProgress] = useState(0);

    // Sync localStorage state for guest/offline support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const bookmarks: string[] = JSON.parse(localStorage.getItem("nawaetu_sirah_bookmarks") || "[]");
            const completed: string[] = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
            setIsBookmarked(bookmarks.includes(section.id));
            setIsCompleted(completed.includes(section.id));
        }
    }, [section.id]);

    // Reading progress bar
    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const total = el.scrollHeight - el.clientHeight;
            setReadProgress(total > 0 ? Math.round((el.scrollTop / total) * 100) : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const toggleBookmark = () => {
        const bookmarks: string[] = JSON.parse(localStorage.getItem("nawaetu_sirah_bookmarks") || "[]");
        let updated: string[];
        if (isBookmarked) {
            updated = bookmarks.filter((id) => id !== section.id);
            toast.success("Dihapus dari Markah Sirah");
        } else {
            updated = [...bookmarks, section.id];
            toast.success("Disimpan ke Markah Sirah");
        }
        localStorage.setItem("nawaetu_sirah_bookmarks", JSON.stringify(updated));
        setIsBookmarked(!isBookmarked);
    };

    const toggleComplete = () => {
        const completed: string[] = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
        let updated: string[];
        if (isCompleted) {
            updated = completed.filter((id) => id !== section.id);
        } else {
            updated = [...completed, section.id];
            toast.success("Subbab selesai dibaca! (+15 Poin Hasanah)");
        }
        localStorage.setItem("nawaetu_sirah_completed", JSON.stringify(updated));
        setIsCompleted(!isCompleted);
    };

    const handleSetIntention = () => {
        const existingIntentions: string[] = JSON.parse(localStorage.getItem("nawaetu_user_intentions") || "[]");
        if (!existingIntentions.includes(section.suggestedIntention)) {
            existingIntentions.push(section.suggestedIntention);
            localStorage.setItem("nawaetu_user_intentions", JSON.stringify(existingIntentions));
        }
        toast.success("Niat berhasil ditambahkan ke Intention Journal!");
    };

    const toggleTTS = () => {
        if (!("speechSynthesis" in window)) {
            toast.error("Fitur Text-To-Speech tidak didukung di browser ini.");
            return;
        }

        if (isPlayingAudio) {
            window.speechSynthesis.cancel();
            setIsPlayingAudio(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(section.content.join(" "));
            utterance.lang = "id-ID";
            utterance.rate = 0.95;
            utterance.onend = () => setIsPlayingAudio(false);
            utterance.onerror = () => setIsPlayingAudio(false);
            window.speechSynthesis.speak(utterance);
            setIsPlayingAudio(true);
            toast.info("Mulai membacakan teks...");
        }
    };

    const handleCopy = () => {
        const text = `${section.chapterTitle} - ${section.subbab}\n\n${section.content.join("\n\n")}\n\n[Hikmah & Niat]: ${section.suggestedIntention}\n\n(Dibaca dari Nawaetu.com)`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Teks Sirah disalin ke clipboard!");
    };

    const fontSizeClasses = {
        sm:   "text-[15px] leading-[1.85] tracking-[0.01em]",
        base: "text-[16px] leading-[1.9]  tracking-[0.01em] sm:text-[17px]",
        lg:   "text-[17px] leading-[2.0]  tracking-[0.01em] sm:text-[19px]",
        xl:   "text-[19px] leading-[2.0]  tracking-[0.01em] sm:text-[21px]",
    };

    const toolBtnClass = isDaylight
        ? "border-slate-300 text-slate-700 hover:bg-slate-50"
        : "border-white/15 text-white hover:bg-[rgb(var(--color-primary))]/15 hover:border-[rgb(var(--color-primary))]/30";

    const wordCount = section.content.join(" ").split(" ").length;
    const readMinutes = Math.ceil(wordCount / 150);

    return (
        <>
        {/* Fixed reading progress bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
            <div
                className={cn("h-full transition-[width] duration-100", isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]")}
                style={{ width: `${readProgress}%` }}
            />
        </div>

        <div className={cn(
            "min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 transition-colors",
            isDaylight ? "text-slate-900" : "text-white"
        )}>
            {/* Header Controls */}
            <div className={cn(
                "flex items-center justify-between gap-2 border-b pb-4",
                isDaylight ? "border-slate-200" : "border-white/10"
            )}>
                <Link
                    href={`/sirah/${chapterSlug}`}
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity",
                        isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Daftar Subbab</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Font Size Selector */}
                    <button
                        onClick={() => {
                            const sizes: ("sm" | "base" | "lg" | "xl")[] = ["sm", "base", "lg", "xl"];
                            const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
                            setFontSize(next);
                        }}
                        className={cn("p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer", toolBtnClass)}
                        title="Ubah Ukuran Font"
                    >
                        <Type className="w-3.5 h-3.5" />
                        <span className="uppercase text-[10px]">{fontSize}</span>
                    </button>

                    {/* TTS Button */}
                    <button
                        onClick={toggleTTS}
                        className={cn(
                            "p-2 rounded-xl border transition-colors cursor-pointer",
                            isPlayingAudio
                                ? isDaylight
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]"
                                : toolBtnClass
                        )}
                        title="Dengarkan Audio"
                    >
                        {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Bookmark Button */}
                    <button
                        onClick={toggleBookmark}
                        className={cn(
                            "p-2 rounded-xl border transition-colors cursor-pointer",
                            isBookmarked ? "bg-amber-500 text-white border-amber-500" : toolBtnClass
                        )}
                        title="Simpan Markah"
                    >
                        <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className={cn("p-2 rounded-xl border transition-colors cursor-pointer", toolBtnClass)}
                        title="Salin Teks"
                    >
                        {copied ? <Check className={cn("w-4 h-4", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]")} /> : <Share2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2">
                <p className={cn(
                    "text-xs font-bold tracking-wider uppercase",
                    isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                )}>
                    {section.chapterTitle}
                </p>
                <h1 className={cn("text-xl sm:text-2xl font-extrabold tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>
                    {section.subbab}
                </h1>
                {section.pageStart && (
                    <p className={cn("text-xs", isDaylight ? "text-slate-500" : "text-slate-400")}>
                        📄 Halaman Referensi: {section.pageStart} {section.pageEnd ? `- ${section.pageEnd}` : ""}
                    </p>
                )}
                <p className={cn("text-xs", isDaylight ? "text-slate-500" : "text-slate-400")}>
                    ⏱️ ~{readMinutes} min baca
                </p>
            </div>

            {/* Related Quran Verses Chips */}
            {section.relatedQuranVerses && section.relatedQuranVerses.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={cn("text-xs font-medium flex items-center gap-1", isDaylight ? "text-slate-600" : "text-slate-300")}>
                        <BookOpen className={cn("w-3.5 h-3.5", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]")} />
                        Rujukan Quran:
                    </span>
                    {section.relatedQuranVerses.map((ref, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedQuranRef(ref)}
                            className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                                isDaylight
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/25 hover:bg-[rgb(var(--color-primary))]/25"
                            )}
                        >
                            {ref.label || `Surah ${ref.surah}:${ref.verses}`}
                        </button>
                    ))}
                </div>
            )}

            {/* EN language notice — shown only when locale is English */}
            {locale === "en" && !enNoticeDismissed && (
                <div className={cn(
                    "flex items-start justify-between gap-3 px-4 py-3 rounded-2xl border text-xs",
                    isDaylight
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                )}>
                    <p className="leading-relaxed">
                        <span className="font-bold">🇮🇩 Indonesian only.</span>{" "}
                        This Sirah content is currently available in Bahasa Indonesia.
                        English translation is coming soon.
                    </p>
                    <button
                        onClick={() => setEnNoticeDismissed(true)}
                        className="shrink-0 font-bold opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main Section Content */}
            <div
                className={cn(
                    "px-5 py-6 sm:px-8 sm:py-8 rounded-3xl border transition-all shadow-sm space-y-5 select-text font-[family-name:var(--font-lora)]",
                    fontSizeClasses[fontSize],
                    isDaylight ? "bg-white border-slate-200 text-slate-800" : "bg-white/[0.03] border-white/10 text-slate-100"
                )}
            >
                {(Array.isArray(section.content) ? section.content : [String(section.content)]).map((paragraph, idx) => (
                    <p
                        key={idx}
                        className={idx === 0 ? "sirah-dropcap" : "indent-6"}
                    >
                        <SirahInlineProse text={paragraph} />
                    </p>
                ))}
            </div>

            {/* Suggested Intention Card */}
            <div
                className={cn(
                    "p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all",
                    isDaylight
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200 text-slate-900"
                        : "bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/30 text-white"
                )}
            >
                <div className={cn("flex items-center gap-2 font-bold text-xs", isDaylight ? "text-emerald-800" : "text-[rgb(var(--color-primary-light))]")}>
                    <Sparkles className="w-4 h-4" />
                    <span>HIKMAH & NIAT HARIAN</span>
                </div>
                <p className="text-sm sm:text-base font-semibold leading-relaxed">
                    "{section.suggestedIntention}"
                </p>
                <div className="pt-1 flex items-center justify-end">
                    <button
                        onClick={handleSetIntention}
                        className={cn(
                            "px-4 py-2 text-xs font-bold rounded-xl text-white transition-all flex items-center gap-1.5 cursor-pointer",
                            isDaylight
                                ? "bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                                : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 shadow-md shadow-[rgb(var(--color-primary))]/20"
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Jadikan Niat Hari Ini</span>
                    </button>
                </div>
            </div>

            {/* Completion & Next/Prev Navigation */}
            <div className={cn(
                "pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t",
                isDaylight ? "border-slate-200" : "border-white/10"
            )}>
                <button
                    onClick={toggleComplete}
                    className={cn(
                        "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                        isCompleted
                            ? isDaylight
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30"
                            : isDaylight
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                                : "bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/90 text-white shadow-md shadow-[rgb(var(--color-primary))]/20"
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? "Telah Selesai Dibaca" : "Tandai Selesai Dibaca (+15 Poin)"}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {prevSectionId ? (
                        <Link
                            href={`/sirah/${chapterSlug}/${prevSectionId}`}
                            className={cn("px-4 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1", toolBtnClass)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Sebelumnya</span>
                        </Link>
                    ) : <div />}

                    {nextSectionId ? (
                        <Link
                            href={`/sirah/${chapterSlug}/${nextSectionId}`}
                            className={cn("px-4 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1", toolBtnClass)}
                        >
                            <span>Selanjutnya</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : <div />}
                </div>
            </div>

            {/* Quran Bridge Modal */}
            <SirahQuranBridgeModal
                refData={selectedQuranRef}
                onClose={() => setSelectedQuranRef(null)}
            />
        </div>
        </>
    );
}
