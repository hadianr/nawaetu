"use client";

/**
 * Nawaetu - Sirah Nabawiyah Chapter Detail Page
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Bookmark, Clock, Sparkles } from "lucide-react";
import { getSirahChapterBySlug, getSirahSectionsByChapterSlug } from "@/data/sirah";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function SirahChapterDetailPage({ params }: { params: Promise<{ chapterSlug: string }> }) {
    const { chapterSlug } = use(params);
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
    const [bookmarkedSectionIds, setBookmarkedSectionIds] = useState<string[]>([]);

    const chapter = getSirahChapterBySlug(chapterSlug);
    const sections = getSirahSectionsByChapterSlug(chapterSlug);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
            const bookmarks = JSON.parse(localStorage.getItem("nawaetu_sirah_bookmarks") || "[]");
            setCompletedSectionIds(completed);
            setBookmarkedSectionIds(bookmarks);
        }
    }, []);

    if (!chapter || sections.length === 0) {
        notFound();
    }

    const doneCount = sections.filter((s) => completedSectionIds.includes(s.id)).length;
    const progressPercent = Math.round((doneCount / sections.length) * 100);

    return (
        <div className={cn(
            "min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-3xl mx-auto space-y-6 transition-colors",
            isDaylight ? "text-slate-900" : "text-white"
        )}>
            {/* Header / Back Link */}
            <div className={cn(
                "flex items-center justify-between border-b pb-4",
                isDaylight ? "border-slate-200" : "border-emerald-500/10"
            )}>
                <Link
                    href="/sirah"
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity",
                        isDaylight ? "text-emerald-700" : "text-emerald-400"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Sirah Hub</span>
                </Link>

                <span className={cn(
                    "text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border",
                    isDaylight 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                    {chapter.era}
                </span>
            </div>

            {/* Chapter Hero Info */}
            <div
                className={cn(
                    "p-6 sm:p-8 rounded-3xl border space-y-3 shadow-sm",
                    isDaylight ? "bg-white border-slate-200" : "bg-white/[0.03] border-white/10"
                )}
            >
                <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isDaylight ? "text-emerald-700" : "text-emerald-400"
                )}>
                    Bab {chapter.orderIndex} dari 50
                </span>
                <h1 className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", isDaylight ? "text-slate-900" : "text-white")}>
                    {chapter.title}
                </h1>
                <p className={cn("text-xs sm:text-sm leading-relaxed", isDaylight ? "text-slate-600" : "text-slate-300")}>
                    {chapter.summary}
                </p>

                {/* Progress Bar */}
                <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isDaylight ? "text-slate-500" : "text-slate-400"}>Kemajuan Bab Ini</span>
                        <span className={isDaylight ? "text-emerald-700" : "text-emerald-400"}>
                            {doneCount} / {sections.length} Subbab ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Subchapters List */}
            <div className="space-y-3">
                <h2 className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isDaylight ? "text-slate-500" : "text-slate-400"
                )}>
                    Daftar Subbab ({sections.length})
                </h2>

                <div className="space-y-2.5">
                    {sections.map((sec, index) => {
                        const isDone = completedSectionIds.includes(sec.id);
                        const isSaved = bookmarkedSectionIds.includes(sec.id);

                        return (
                            <Link
                                key={sec.id}
                                href={`/sirah/${chapterSlug}/${sec.id}`}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all hover:scale-[1.005] active:scale-[0.995] flex items-center justify-between gap-3 group",
                                    isDone
                                        ? "bg-emerald-500/5 border-emerald-500/30"
                                        : isDaylight
                                            ? "bg-white border-slate-200 hover:border-emerald-300 shadow-xs text-slate-800"
                                            : "bg-white/[0.03] border-white/10 hover:border-emerald-500/30 text-white"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
                                            isDone
                                                ? "bg-emerald-500 text-white"
                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        )}
                                    >
                                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <h3 className={cn(
                                            "font-bold text-sm leading-snug truncate transition-colors",
                                            isDaylight ? "group-hover:text-emerald-700" : "group-hover:text-emerald-400"
                                        )}>
                                            {sec.subbab}
                                        </h3>
                                        <p className={cn("text-[11px]", isDaylight ? "text-slate-500" : "text-slate-400")}>
                                            ⏱️ ~{Math.ceil(sec.content.join(" ").split(" ").length / 150)} min baca
                                            {sec.pageStart ? ` • Hlm ${sec.pageStart}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {isSaved && <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />}
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
