"use client";

/**
 * Nawaetu - Sirah Nabawiyah Main Hub Dashboard
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Search,
    Sparkles,
    CheckCircle2,
    ChevronRight,
    Bookmark,
    Clock,
    Compass,
    Shield,
    Heart,
    Award,
    Trophy,
} from "lucide-react";
import { SIRAH_CHAPTERS, SIRAH_SECTIONS, getDailySirahHighlight, type SirahEra, type SirahChapter } from "@/data/sirah";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const ERA_TABS: { id: SirahEra | "all"; label: string; icon: string }[] = [
    { id: "all", label: "Semua Bab", icon: "📚" },
    { id: "makkah", label: "Periode Makkah", icon: "🕋" },
    { id: "madinah", label: "Periode Madinah", icon: "🕌" },
    { id: "ghazwah", label: "Peperangan (Ghazwah)", icon: "⚔️" },
    { id: "diplomacy", label: "Diplomasi & Surat Raja", icon: "📜" },
    { id: "legacy", label: "Akhlak & Wafat", icon: "✨" },
];

export default function SirahDashboardPage() {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [selectedEra, setSelectedEra] = useState<SirahEra | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
    const [bookmarkedSectionIds, setBookmarkedSectionIds] = useState<string[]>([]);
    const [isQuizDoneToday, setIsQuizDoneToday] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
            const bookmarks = JSON.parse(localStorage.getItem("nawaetu_sirah_bookmarks") || "[]");
            const todayStr = new Date().toISOString().split("T")[0];
            const lastClaimed = localStorage.getItem("nawaetu_sirah_quiz_last_claimed");

            setCompletedSectionIds(completed);
            setBookmarkedSectionIds(bookmarks);
            setIsQuizDoneToday(lastClaimed === todayStr);
        }
    }, []);

    const dailyHighlight = useMemo(() => getDailySirahHighlight(), []);

    const filteredChapters = useMemo(() => {
        return SIRAH_CHAPTERS.filter((chap) => {
            const matchesEra = selectedEra === "all" || chap.era === selectedEra;
            const matchesSearch =
                !searchQuery ||
                chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                chap.summary.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesEra && matchesSearch;
        });
    }, [selectedEra, searchQuery]);

    const totalSections = SIRAH_SECTIONS.length;
    const progressPercent = Math.round((completedSectionIds.length / totalSections) * 100);

    return (
        <div className={cn(
            "min-h-screen pb-24 pt-3 px-3.5 sm:px-6 max-w-4xl mx-auto space-y-3.5 sm:space-y-5 transition-colors",
            isDaylight ? "text-slate-900" : "text-white"
        )}>
            {/* Header Banner */}
            <div
                className={cn(
                    "p-4 sm:p-6 rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-all shadow-xs",
                    isDaylight
                        ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/5 border-emerald-200/80"
                        : "bg-gradient-to-br from-[rgb(var(--color-primary))]/20 via-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/30 text-white"
                )}
            >
                <div className="space-y-2 sm:space-y-3 relative z-10 max-w-2xl">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 cursor-default",
                                isDaylight
                                    ? "bg-emerald-100/80 text-emerald-800 border-emerald-300/60"
                                    : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/40"
                            )}
                        >
                            <BookOpen className="w-2.5 h-2.5 shrink-0" />
                            <span>Ar-Raheeq Al-Makhtum</span>
                        </Link>
                        {isQuizDoneToday ? (
                            <Link
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 cursor-default",
                                    isDaylight
                                        ? "bg-emerald-100/80 text-emerald-800 border-emerald-300/60"
                                        : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]/40"
                                )}
                            >
                                <CheckCircle2 className={cn("w-2.5 h-2.5 shrink-0", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]")} />
                                <span>Kuis Hari Ini Selesai</span>
                            </Link>
                        ) : (
                            <Link
                                href="/sirah/quiz"
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all",
                                    isDaylight
                                        ? "bg-amber-100/80 text-amber-900 border-amber-300/60 hover:bg-amber-200/80"
                                        : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                                )}
                            >
                                <Award className="w-2.5 h-2.5 shrink-0 text-amber-500 dark:text-amber-400" />
                                <span>Kuis Sirah Harian</span>
                            </Link>
                        )}
                    </div>
                    <h1
                        className={cn(
                            "text-lg sm:text-2xl font-extrabold tracking-tight",
                            isDaylight ? "text-slate-900" : "text-white"
                        )}
                    >
                        Sirah Nabawiyah 🌙
                    </h1>
                    <p
                        className={cn(
                            "text-[11px] sm:text-xs sm:text-sm leading-relaxed font-normal",
                            isDaylight ? "text-slate-600" : "text-slate-200"
                        )}
                    >
                        Teladani perjalanan hidup Rasulullah SAW melalui 50 bab sejarah autentik, petikan Niat harian, dan rujukan ayat Al-Qur'an.
                    </p>

                    {/* Overall Reading Progress */}
                    <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
                            <span className={isDaylight ? "text-slate-700" : "text-slate-200"}>Kemajuan Membaca</span>
                            <span className={isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))] font-bold"}>
                                {completedSectionIds.length} / {totalSections} Subbab ({progressPercent}%)
                            </span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500", isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]")}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Highlight Widget */}
            {dailyHighlight && (
                <div
                    className={cn(
                        "p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border space-y-1.5 relative overflow-hidden transition-all",
                        isDaylight
                            ? "bg-white border-emerald-200/80 shadow-xs"
                            : "bg-white/[0.04] border-[rgb(var(--color-primary))]/25 hover:border-[rgb(var(--color-primary))]/40 text-white"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div
                            className={cn(
                                "flex items-center gap-1.5 text-[10px] sm:text-xs font-bold",
                                isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>HIKMAH SIRAH HARI INI</span>
                        </div>
                    </div>
                    <p
                        className={cn(
                            "text-xs sm:text-sm font-semibold leading-relaxed",
                            isDaylight ? "text-slate-900" : "text-slate-100"
                        )}
                    >
                        "{dailyHighlight.suggestedIntention}"
                    </p>
                    <div className="pt-0.5 flex items-center justify-between gap-2 text-xs">
                        <span
                            className={cn(
                                "font-medium text-[10px] sm:text-xs truncate min-w-0",
                                isDaylight ? "text-slate-500" : "text-slate-300"
                            )}
                        >
                            📍 {dailyHighlight.chapterTitle} • {dailyHighlight.subbab}
                        </span>
                        <Link
                            href={`/sirah/${dailyHighlight.chapterSlug}/${dailyHighlight.id}`}
                            className={cn(
                                "text-xs font-bold hover:underline flex items-center gap-0.5 shrink-0",
                                isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                            )}
                        >
                            <span>Baca Subbab</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Search & Era Filter Controls */}
            <div className="space-y-2">
                {/* Search Input */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari bab atau peristiwa Sirah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl border transition-all outline-hidden",
                            isDaylight
                                ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                : "bg-white/[0.05] border-white/15 text-white placeholder:text-slate-400 focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
                        )}
                    />
                </div>

                {/* Era Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {ERA_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedEra(tab.id)}
                            className={cn(
                                "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                                selectedEra === tab.id
                                    ? isDaylight
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-[rgb(var(--color-primary))] text-white shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                                    : isDaylight
                                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        : "bg-white/10 text-slate-200 hover:bg-white/15"
                            )}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chapter List Grid */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold px-0.5">
                    <span className={isDaylight ? "text-slate-600" : "text-slate-300"}>DAFTAR BAB UTAMA ({filteredChapters.length})</span>
                    <span className={isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"}>
                        {completedSectionIds.length > 0 && `${completedSectionIds.length} Subbab Selesai`}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {filteredChapters.map((chap) => {
                        const chapterSections = SIRAH_SECTIONS.filter((s) => s.chapterSlug === chap.slug);
                        const doneCount = chapterSections.filter((s) => completedSectionIds.includes(s.id)).length;
                        const isAllDone = doneCount > 0 && doneCount === chapterSections.length;
                        const formattedEra = chap.era.charAt(0).toUpperCase() + chap.era.slice(1);

                        return (
                            <Link
                                key={chap.id}
                                href={`/sirah/${chap.slug}`}
                                className={cn(
                                    "p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all hover:scale-[1.005] active:scale-[0.99] flex flex-col justify-between gap-2 group",
                                    isAllDone
                                        ? isDaylight
                                            ? "border-emerald-500/40 bg-emerald-500/5"
                                            : "border-[rgb(var(--color-primary))]/50 bg-[rgb(var(--color-primary))]/10"
                                        : isDaylight
                                            ? "bg-white border-slate-200/80 hover:border-emerald-300 shadow-xs"
                                            : "bg-white/[0.03] border-white/10 hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5"
                                )}
                            >
                                <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={cn(
                                                "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md",
                                                isDaylight
                                                    ? "bg-emerald-100/80 text-emerald-800"
                                                    : "bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))]/30"
                                            )}
                                        >
                                            Bab {chap.orderIndex} • {formattedEra}
                                        </span>
                                        {isAllDone && (
                                            <span className={cn("text-[10px] font-bold flex items-center gap-0.5", isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]")}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                Selesai
                                            </span>
                                        )}
                                    </div>
                                    <h3
                                        className={cn(
                                            "font-bold text-xs sm:text-sm leading-snug transition-colors",
                                            isDaylight ? "text-slate-900 group-hover:text-emerald-700" : "text-white group-hover:text-[rgb(var(--color-primary-light))]"
                                        )}
                                    >
                                        {chap.title}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between text-[10px] sm:text-xs pt-2 border-t border-black/5 dark:border-white/5">
                                    <span className={isDaylight ? "text-slate-500" : "text-slate-300"}>{chap.totalSections} Subbab</span>
                                    <div className={cn("flex items-center gap-0.5 font-semibold", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]")}>
                                        <span>Buka Bab</span>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
