"use client";

/**
 * Nawaetu - Sirah Nabawiyah (Ar-Rahiq) chapter list
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { SIRAH_CHAPTERS, SIRAH_SECTIONS, type SirahEra } from "@/data/sirah";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";
import { SirahSourceNote } from "@/components/sirah/SirahSourceNote";
import { useLocale } from "@/context/LocaleContext";
import type { AppIconName } from "@/lib/icon-names";
import { JsonLd } from "@/components/seo/JsonLd";
import { fullIndexJsonLd } from "@/data/sirah/seo";

const ERA_TABS: { id: SirahEra | "all"; labelKey: "sirahEraAll" | "sirahEraMakkah" | "sirahEraMadinah" | "sirahEraGhazwah" | "sirahEraDiplomacy" | "sirahEraLegacy"; icon: AppIconName }[] = [
    { id: "all", labelKey: "sirahEraAll", icon: "library" },
    { id: "makkah", labelKey: "sirahEraMakkah", icon: "kaaba" },
    { id: "madinah", labelKey: "sirahEraMadinah", icon: "landmark" },
    { id: "ghazwah", labelKey: "sirahEraGhazwah", icon: "shield-check" },
    { id: "diplomacy", labelKey: "sirahEraDiplomacy", icon: "scroll" },
    { id: "legacy", labelKey: "sirahEraLegacy", icon: "sparkles" },
];

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";

export default function SirahFullPage() {
    const { t, locale } = useLocale();
    const [selectedEra, setSelectedEra] = useState<SirahEra | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [completedSectionIds, setCompletedSectionIds] = useState<string[]>([]);

    useEffect(() => {
        let completed: string[] = [];
        try {
            completed = JSON.parse(localStorage.getItem("nawaetu_sirah_completed") || "[]");
        } catch { /* corrupt or blocked storage: show no progress */ }
        queueMicrotask(() => setCompletedSectionIds(completed));
    }, []);

    const filteredChapters = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return SIRAH_CHAPTERS.filter((chap) =>
            (selectedEra === "all" || chap.era === selectedEra) &&
            (!q || chap.title.toLowerCase().includes(q) || chap.summary.toLowerCase().includes(q))
        );
    }, [selectedEra, searchQuery]);

    const totalSections = SIRAH_SECTIONS.length;
    const progressPercent = Math.round((completedSectionIds.length / totalSections) * 100);

    return (
        <div className="min-h-screen w-full px-4 pt-4 pb-nav sm:px-6 text-[rgb(var(--color-text))]">
            <main className="mx-auto w-full max-w-4xl space-y-5">
                {fullIndexJsonLd().map((data, i) => <JsonLd key={i} data={data} />)}
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah"
                        aria-label={t.historyBack}
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10", FOCUS)}
                    >
                        <ArrowLeft className="h-5 w-5" aria-hidden />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-lg font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{t.sirahPathFullTitle}</h1>
                        <p className="mt-0.5 text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{t.sirahPathFullDesc}</p>
                        {locale === "en" && (
                            <p className="mt-1 text-xs font-semibold text-[rgb(var(--color-warning))]">{t.sirahIndonesianOnly}</p>
                        )}
                    </div>
                </header>

                <div className="space-y-1.5 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span id="sirah-full-progress" className="text-[rgb(var(--color-text-muted))]">{t.sirahReadingProgress}</span>
                        <span className="text-[rgb(var(--color-primary-strong))]">
                            {t.sirahSectionsProgress.replace("{done}", String(completedSectionIds.length)).replace("{total}", String(totalSections)).replace("{percent}", String(progressPercent))}
                        </span>
                    </div>
                    <div
                        role="progressbar"
                        aria-labelledby="sirah-full-progress"
                        aria-valuemin={0}
                        aria-valuemax={totalSections}
                        aria-valuenow={completedSectionIds.length}
                        className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]"
                    >
                        <div className="h-full rounded-full bg-[rgb(var(--color-primary))] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-muted))]" aria-hidden />
                        <input
                            type="search"
                            aria-label={t.sirahSearchPlaceholder}
                            placeholder={t.sirahSearchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoCapitalize="none"
                            autoCorrect="off"
                            className="min-h-11 w-full rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] py-2 pl-10 pr-4 text-[16px] text-[rgb(var(--color-text))] outline-hidden transition-all placeholder:text-[rgb(var(--color-text-muted))] focus:border-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20 sm:text-sm"
                        />
                    </div>

                    <div role="group" aria-label={t.sirahEraFilterLabel} className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto pb-1">
                        {ERA_TABS.map((tab) => {
                            const active = selectedEra === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setSelectedEra(tab.id)}
                                    className={cn(
                                        "flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold transition-all",
                                        FOCUS,
                                        active
                                            ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] shadow-[var(--shadow-card)]"
                                            : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10"
                                    )}
                                >
                                    <AppIcon name={tab.icon} size="sm" tone={active ? "default" : "muted"} />
                                    <span>{t[tab.labelKey]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <section aria-labelledby="sirah-full-list" className="space-y-2.5">
                    <h2 id="sirah-full-list" className="px-0.5 text-xs font-bold text-[rgb(var(--color-text-muted))]" aria-live="polite">
                        {t.sirahChapterListTitle.replace("{count}", String(filteredChapters.length))}
                    </h2>

                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                        {filteredChapters.map((chap) => {
                            const chapterSections = SIRAH_SECTIONS.filter((s) => s.chapterSlug === chap.slug);
                            const doneCount = chapterSections.filter((s) => completedSectionIds.includes(s.id)).length;
                            const isAllDone = doneCount > 0 && doneCount === chapterSections.length;
                            const formattedEra = chap.era.charAt(0).toUpperCase() + chap.era.slice(1);

                            return (
                                <li key={chap.id}>
                                    <Link
                                        href={`/sirah/${chap.slug}`}
                                        className={cn(
                                            "group flex h-full flex-col justify-between gap-2 rounded-2xl border p-4 transition-all",
                                            FOCUS,
                                            isAllDone
                                                ? "border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/10"
                                                : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5"
                                        )}
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="rounded-md border border-[rgb(var(--color-primary))]/25 bg-[rgb(var(--color-primary))]/10 px-2 py-0.5 text-xs font-extrabold uppercase text-[rgb(var(--color-primary-strong))]">
                                                    {t.sirahChapterBadge.replace("{order}", String(chap.orderIndex)).replace("{era}", formattedEra)}
                                                </span>
                                                {isAllDone && (
                                                    <span className="flex items-center gap-0.5 text-xs font-bold text-[rgb(var(--color-success))]">
                                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                                        {t.sirahDone}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-sm font-bold leading-snug text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary-strong))]">
                                                {chap.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[rgb(var(--color-border))] pt-2 text-xs">
                                            <span className="text-[rgb(var(--color-text-muted))]">{chap.totalSections === 1 ? t.sirahSectionCountOne : t.sirahSectionCount.replace("{count}", String(chap.totalSections))}</span>
                                            <ChevronRight className="h-4 w-4 text-[rgb(var(--color-primary-strong))] transition-transform group-hover:translate-x-0.5" aria-hidden />
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <SirahSourceNote className="pt-2" />
            </main>
        </div>
    );
}
