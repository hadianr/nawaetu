"use client";

/**
 * Nawaetu - Sirah Nabawiyah hub: pick one of three ways to learn
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SIRAH_CHAPTERS, SIRAH_SECTIONS } from "@/data/sirah";
import { CONCISE_READ_KEY, getConciseReadableSections, isConciseSectionRead, readingMinutes } from "@/data/sirah/concise";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/AppIcon";
import { useLocale } from "@/context/LocaleContext";
import { sirahPathPrefix, useSirahContentLang } from "@/hooks/useSirahContentLang";
import type { AppIconName } from "@/lib/icon-names";
import { JsonLd } from "@/components/seo/JsonLd";
import { sirahHubJsonLd } from "@/data/sirah/seo";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";

function readList(key: string): string[] {
    try {
        const v = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

interface PathCardProps {
    href: string;
    icon: AppIconName;
    title: string;
    description: string;
    meta: string[];
    badge?: string;
    progress?: { done: number; total: number; label: string };
}

function PathCard({ href, icon, title, description, meta, badge, progress }: PathCardProps) {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "group flex gap-3 rounded-2xl border p-4 transition-colors",
                    FOCUS,
                    badge
                        ? "border-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/5 hover:bg-[rgb(var(--color-primary))]/10"
                        : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-primary))]/40"
                )}
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10">
                    <AppIcon name={icon} size="md" tone="primary" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                    {badge && (
                        <span className="inline-block rounded-full bg-[rgb(var(--color-primary))] px-2 py-0.5 text-xs font-bold text-[rgb(var(--color-primary-foreground))]">
                            {badge}
                        </span>
                    )}
                    <span className="block text-base font-bold text-[rgb(var(--color-text-strong))] group-hover:text-[rgb(var(--color-primary-strong))]">{title}</span>
                    <span className="block text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{description}</span>
                    <span className="flex flex-wrap gap-1.5 pt-1">
                        {meta.map((m) => (
                            <span key={m} className="rounded-md border border-[rgb(var(--color-border))] px-2 py-0.5 text-xs font-medium text-[rgb(var(--color-text-muted))]">{m}</span>
                        ))}
                    </span>
                    {progress && progress.done > 0 && (
                        <span className="block pt-1.5">
                            <span className="block text-xs font-semibold text-[rgb(var(--color-primary-strong))]">{progress.label}</span>
                            <span
                                role="progressbar"
                                aria-label={progress.label}
                                aria-valuemin={0}
                                aria-valuemax={progress.total}
                                aria-valuenow={progress.done}
                                className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]"
                            >
                                <span className="block h-full rounded-full bg-[rgb(var(--color-primary))]" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                            </span>
                        </span>
                    )}
                </span>
                <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
        </li>
    );
}

export default function SirahDashboardPage() {
    const { t, locale } = useLocale();
    const [contentLang] = useSirahContentLang();
    const [fullDone, setFullDone] = useState(0);
    const [conciseDone, setConciseDone] = useState(0);

    const conciseSections = useMemo(() => getConciseReadableSections(contentLang), [contentLang]);
    const conciseMinutes = useMemo(() => conciseSections.reduce((sum, s) => sum + readingMinutes(s), 0), [conciseSections]);

    useEffect(() => {
        const full = readList("nawaetu_sirah_completed").length;
        const readIds = readList(CONCISE_READ_KEY);
        const concise = conciseSections.filter((s) => isConciseSectionRead(s, readIds)).length;
        queueMicrotask(() => {
            setFullDone(full);
            setConciseDone(concise);
        });
    }, [conciseSections]);

    const fill = (s: string, vars: Record<string, string | number>) =>
        Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), s);

    return (
        <div className="sirah-page min-h-screen w-full px-4 pt-4 pb-nav sm:px-6 text-[rgb(var(--color-text))]">
            <main className="mx-auto w-full max-w-2xl space-y-5">
                {sirahHubJsonLd().map((data, i) => <JsonLd key={i} data={data} />)}
                <header className="space-y-1.5">
                    <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">
                        <AppIcon name="moon" size="sm" tone="primary" /> Sirah Nabawiyah
                    </h1>
                    <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{t.sirahHomeIntro}</p>
                </header>

                <section aria-labelledby="sirah-paths" className="space-y-2.5">
                    <h2 id="sirah-paths" className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{t.sirahPathsTitle}</h2>
                    <ul className="space-y-2.5">
                        <PathCard
                            href={`${sirahPathPrefix(contentLang)}/sirah/concise`}
                            icon="book"
                            badge={t.sirahPathStartHere}
                            title={t.sirahPathConciseTitle}
                            description={t.sirahPathConciseDesc}
                            meta={[
                                fill(t.sirahPathSections, { count: conciseSections.length }),
                                fill(t.sirahMinutes, { count: conciseMinutes }),
                                t.sirahLangIdEn,
                            ]}
                            progress={{ done: conciseDone, total: conciseSections.length, label: fill(t.sirahPathProgress, { done: conciseDone, total: conciseSections.length }) }}
                        />
                        <PathCard
                            href="/sirah/full"
                            icon="library"
                            title={t.sirahPathFullTitle}
                            description={t.sirahPathFullDesc}
                            meta={[
                                fill(t.sirahPathChapters, { count: SIRAH_CHAPTERS.length }),
                                fill(t.sirahPathSubsections, { count: SIRAH_SECTIONS.length }),
                                locale === "en" ? t.sirahIndonesianOnly : t.sirahLangId,
                            ]}
                            progress={{ done: fullDone, total: SIRAH_SECTIONS.length, label: fill(t.sirahPathProgress, { done: fullDone, total: SIRAH_SECTIONS.length }) }}
                        />
                        <PathCard
                            href={`${sirahPathPrefix(contentLang)}/sirah/history`}
                            icon="calendar"
                            title={t.historyPageTitle}
                            description={t.sirahPathHistoryDesc}
                            meta={[t.sirahPathHistoryMeta, t.sirahLangIdEn]}
                        />
                    </ul>
                </section>
            </main>
        </div>
    );
}
