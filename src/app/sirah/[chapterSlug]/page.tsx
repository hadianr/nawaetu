"use client";

/**
 * Nawaetu - Sirah Nabawiyah Chapter Detail Page
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Bookmark } from "lucide-react";
import { getSirahChapterBySlug, getSirahSectionsByChapterSlug } from "@/data/sirah";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function SirahChapterDetailPage({ params }: { params: Promise<{ chapterSlug: string }> }) {
    const { chapterSlug } = use(params);
    const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);
    const [bookmarkedSectionIds, setBookmarkedSectionIds] = useState<string[]>([]);

    const chapter = getSirahChapterBySlug(chapterSlug);
    const sections = getSirahSectionsByChapterSlug(chapterSlug);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
            const bookmarks = JSON.parse(localStorage.getItem("nawaetu_sirah_bookmarks") || "[]");
            queueMicrotask(() => {
                setCompletedSectionIds(completed);
                setBookmarkedSectionIds(bookmarks);
            });
        }
    }, []);

    if (!chapter || sections.length === 0) {
        notFound();
    }

    const doneCount = sections.filter((s) => completedSectionIds.includes(s.id)).length;
    const progressPercent = Math.round((doneCount / sections.length) * 100);

    return (
        <div className={cn(
            "sirah-detail-page min-h-screen pb-24 pt-4 px-4 sm:px-6 max-w-3xl mx-auto space-y-6 transition-colors",
            "text-[rgb(var(--color-text))]"
        )}>
            {/* Header / Back Link */}
            <div className={cn(
                "flex items-center justify-between border-b pb-4",
                "border-[rgb(var(--color-border))]"
            )}>
                <Link
                    href="/sirah"
                    className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity",
                        "text-[rgb(var(--color-primary-strong))]"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Sirah Hub</span>
                </Link>

                <span className={cn(
                    "text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border",
                    "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))] border-[rgb(var(--color-primary))]/25"
                )}>
                    {chapter.era}
                </span>
            </div>

            {/* Chapter Hero Info */}
            <div
                className={cn(
                    "p-6 sm:p-8 rounded-3xl border space-y-3 shadow-sm",
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                )}
            >
                <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    "text-[rgb(var(--color-primary-strong))]"
                )}>
                    Bab {chapter.orderIndex} dari 50
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--color-text-strong))]">
                    {chapter.title}
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">
                    {chapter.summary}
                </p>

                {/* Progress Bar */}
                <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[rgb(var(--color-text-muted))]">Kemajuan Bab Ini</span>
                        <span className="text-[rgb(var(--color-primary-strong))]">
                            {doneCount} / {sections.length} Subbab ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[rgb(var(--color-surface-subtle))] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 bg-[rgb(var(--color-primary))]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Subchapters List */}
            <div className="space-y-3">
                <h2 className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    "text-[rgb(var(--color-text-muted))]"
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
                                        ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-text))]"
                                        : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5 text-[rgb(var(--color-text))]"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
                                            isDone
                                                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]"
                                                : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))]"
                                        )}
                                    >
                                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                        <h3 className={cn(
                                            "font-bold text-sm leading-snug truncate transition-colors",
                                            "group-hover:text-[rgb(var(--color-primary-strong))]"
                                        )}>
                                            {sec.subbab}
                                        </h3>
                                        <p className="text-[11px] text-[rgb(var(--color-text-muted))]">
                                            ⏱️ ~{Math.ceil(sec.content.join(" ").split(" ").length / 150)} min baca
                                            {sec.pageStart ? `, Hlm ${sec.pageStart}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {isSaved && <Bookmark className="w-4 h-4 fill-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]" />}
                                    <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
