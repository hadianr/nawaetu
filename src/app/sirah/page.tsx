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
    Award,
} from "lucide-react";
import { SIRAH_CHAPTERS, SIRAH_SECTIONS, getDailySirahHighlight, type SirahEra } from "@/data/sirah";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/lib/icon-names";

const ERA_TABS: { id: SirahEra | "all"; label: string; icon: AppIconName }[] = [
    { id: "all", label: "Semua Bab", icon: "library" },
    { id: "makkah", label: "Periode Makkah", icon: "kaaba" },
    { id: "madinah", label: "Periode Madinah", icon: "landmark" },
    { id: "ghazwah", label: "Peperangan (Ghazwah)", icon: "shield-check" },
    { id: "diplomacy", label: "Diplomasi & Surat Raja", icon: "scroll" },
    { id: "legacy", label: "Akhlak & Wafat", icon: "sparkles" },
];

export default function SirahDashboardPage() {
    const [selectedEra, setSelectedEra] = useState<SirahEra | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
    const [isQuizDoneToday, setIsQuizDoneToday] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
            const todayStr = new Date().toISOString().split("T")[0];
            const lastClaimed = localStorage.getItem("nawaetu_sirah_quiz_last_claimed");

            queueMicrotask(() => {
                setCompletedSectionIds(completed);
                setIsQuizDoneToday(lastClaimed === todayStr);
            });
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
            "sirah-page min-h-screen w-full max-w-none pb-24 pt-3 px-3.5 sm:px-6 mx-auto space-y-3.5 sm:space-y-5 transition-colors xl:max-w-4xl",
            "text-[rgb(var(--color-text))]"
        )}>
            {/* Header Banner */}
            <div
                className={cn(
                    "p-4 sm:p-6 rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-all shadow-xs",
                    "bg-gradient-to-br from-[rgb(var(--color-primary))]/10 via-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-border))]"
                )}
            >
                <div className="space-y-2 sm:space-y-3 relative z-10 max-w-2xl">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 cursor-default",
                                "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
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
                                    "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
                                )}
                            >
                                <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-[rgb(var(--color-success))]" />
                                <span>Kuis Hari Ini Selesai</span>
                            </Link>
                        ) : (
                            <Link
                                href="/sirah/quiz"
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all",
                                    "bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))]/25 hover:bg-[rgb(var(--color-warning))]/20"
                                )}
                            >
                                <Award className="w-2.5 h-2.5 shrink-0 text-[rgb(var(--color-warning))]" />
                                <span>Kuis Sirah Harian</span>
                            </Link>
                        )}
                    </div>
                    <h1
                        className={cn(
                            "text-lg sm:text-2xl font-extrabold tracking-tight",
                            "text-[rgb(var(--color-text-strong))]"
                        )}
                    >
                        <span className="inline-flex items-center gap-2"><AppIcon name="moon" size="sm" tone="primary" /> Sirah Nabawiyah</span>
                    </h1>
                    <p
                        className={cn(
                            "text-[11px] sm:text-xs sm:text-sm leading-relaxed font-normal",
                            "text-[rgb(var(--color-text-muted))]"
                        )}
                    >
                        Teladani perjalanan hidup Rasulullah SAW melalui 50 bab sejarah autentik, petikan Niat harian, dan rujukan ayat Al-Qur&apos;an.
                    </p>

                    {/* Overall Reading Progress */}
                    <div className="pt-1 space-y-1">
                        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
                            <span className="text-[rgb(var(--color-text-muted))]">Kemajuan Membaca</span>
                            <span className="text-[rgb(var(--color-primary-strong))] font-bold">
                                {completedSectionIds.length} / {totalSections} Subbab ({progressPercent}%)
                            </span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 rounded-full bg-[rgb(var(--color-surface-subtle))] overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 bg-[rgb(var(--color-primary))]"
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
                        "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div
                            className={cn(
                                "flex items-center gap-1.5 text-[10px] sm:text-xs font-bold",
                                "text-[rgb(var(--color-primary-strong))]"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>HIKMAH SIRAH HARI INI</span>
                        </div>
                    </div>
                    <p
                        className={cn(
                            "text-xs sm:text-sm font-semibold leading-relaxed",
                            "text-[rgb(var(--color-text))]"
                        )}
                    >
                        &quot;{dailyHighlight.suggestedIntention}&quot;
                    </p>
                    <div className="pt-0.5 flex items-center justify-between gap-2 text-xs">
                        <span
                            className={cn(
                                "font-medium text-[10px] sm:text-xs truncate min-w-0",
                                "text-[rgb(var(--color-text-muted))]"
                            )}
                        >
                            <span className="inline-flex items-center gap-1"><AppIcon name="landmark" size="xs" tone="muted" /> {dailyHighlight.chapterTitle}, {dailyHighlight.subbab}</span>
                        </span>
                        <Link
                            href={`/sirah/${dailyHighlight.chapterSlug}/${dailyHighlight.id}`}
                            className={cn(
                                "text-xs font-bold hover:underline flex items-center gap-0.5 shrink-0",
                                "text-[rgb(var(--color-primary-strong))]"
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
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-muted))]" />
                    <input
                        type="text"
                        placeholder="Cari bab atau peristiwa Sirah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        className={cn(
                            "w-full pl-10 pr-4 py-2 text-[16px] sm:text-sm rounded-xl sm:rounded-2xl border transition-all outline-hidden",
                            "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
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
                                    ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                    : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10"
                            )}
                        >
                            <AppIcon name={tab.icon} size="sm" tone={selectedEra === tab.id ? "default" : "muted"} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chapter List Grid */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold px-0.5">
                    <span className="text-[rgb(var(--color-text-muted))]">DAFTAR BAB UTAMA ({filteredChapters.length})</span>
                    <span className="text-[rgb(var(--color-primary-strong))]">
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
                                        ? "border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/10"
                                        : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5"
                                )}
                            >
                                <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={cn(
                                                "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md",
                                                "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border border-[rgb(var(--color-primary))]/25"
                                            )}
                                        >
                                            Bab {chap.orderIndex}, {formattedEra}
                                        </span>
                                        {isAllDone && (
                                            <span className="text-[10px] font-bold flex items-center gap-0.5 text-[rgb(var(--color-success))]">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Selesai
                                            </span>
                                        )}
                                    </div>
                                    <h3
                                        className={cn(
                                            "font-bold text-xs sm:text-sm leading-snug transition-colors",
                                            "text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary-strong))]"
                                        )}
                                    >
                                        {chap.title}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between text-[10px] sm:text-xs pt-2 border-t border-[rgb(var(--color-border))]">
                                    <span className="text-[rgb(var(--color-text-muted))]">{chap.totalSections} Subbab</span>
                                    <div className="flex items-center gap-0.5 font-semibold text-[rgb(var(--color-primary-strong))]">
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
