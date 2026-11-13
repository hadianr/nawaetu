"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { formatHistoryDate, hadeethEncUrl, type HistoryChapter } from "@/data/history/chapters";
import type { HistoryHadith } from "@/data/history/content";

interface Props {
    chapter: HistoryChapter;
    hadiths: HistoryHadith[];
    prev?: HistoryChapter;
    next?: HistoryChapter;
}

const navLink = "flex min-w-0 items-center gap-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2.5 text-xs font-semibold text-[rgb(var(--color-primary-strong))] transition-colors hover:border-[rgb(var(--color-primary))]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";

export function HistoryChapterView({ chapter, hadiths, prev, next }: Props) {
    const { locale, t } = useLocale();
    const isEn = locale === "en";
    const title = (c: HistoryChapter) => (isEn ? c.titleEn : c.titleId);

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <article className="mx-auto w-full max-w-2xl space-y-5">
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah/history"
                        aria-label={t.historyAllChapters}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-primary-strong))]">
                            {(t.historyChapterLabel || "Bab {order}").replace("{order}", String(chapter.order))}
                            {chapter.date && ` · ${formatHistoryDate(chapter.date, locale)}`}
                        </p>
                        <h1 className="text-xl font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{title(chapter)}</h1>
                    </div>
                </header>

                <p className="text-sm leading-relaxed">{isEn ? chapter.introEn : chapter.introId}</p>

                <ol className="space-y-5">
                    {hadiths.map(hadith => (
                        <li key={hadith.hadeethEncId} className="space-y-2">
                            <p className="text-sm font-medium leading-relaxed text-[rgb(var(--color-text-strong))]">{isEn ? hadith.bridgeEn : hadith.bridgeId}</p>
                            <figure className={cn("space-y-3 rounded-2xl border p-4", "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[var(--shadow-card)]")}>
                                <blockquote className="whitespace-pre-line border-l-2 border-[rgb(var(--color-primary))] pl-3 text-[13px] leading-relaxed">
                                    {isEn ? hadith.translationEn : hadith.translation}
                                </blockquote>
                                <details className="group">
                                    <summary className="cursor-pointer list-none text-xs font-semibold text-[rgb(var(--color-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                                        {t.historyShowArabic}
                                    </summary>
                                    <p dir="rtl" lang="ar" className="mt-2 text-right font-arabic text-lg leading-[2] text-[rgb(var(--color-text-strong))]">{hadith.arabic}</p>
                                </details>
                                <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[rgb(var(--color-text-muted))]">
                                    <span className="inline-flex items-center gap-1 font-semibold">
                                        <ShieldCheck className="h-3 w-3" />
                                        {isEn ? hadith.attributionEn : hadith.attributionId} · {isEn ? hadith.gradeEn : hadith.gradeId}
                                    </span>
                                    <a
                                        href={hadeethEncUrl(hadith.hadeethEncId, locale)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2 hover:text-[rgb(var(--color-primary-strong))]"
                                    >
                                        {t.hadithTranslationCredit || "Teks & terjemahan: HadeethEnc.com"}
                                    </a>
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ol>

                {chapter.sirahChapterSlug && (
                    <Link
                        href={`/sirah/${chapter.sirahChapterSlug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        {t.hijriHistoryReadSirah}
                    </Link>
                )}

                <p className="text-[11px] leading-relaxed text-[rgb(var(--color-text-muted))]">{t.historyNarrativeNote}</p>

                <nav className="grid grid-cols-2 gap-2" aria-label={t.historyAllChapters}>
                    {prev ? (
                        <Link href={`/sirah/history/${prev.slug}`} className={navLink}>
                            <ChevronLeft className="h-4 w-4 shrink-0" /><span className="truncate">{title(prev)}</span>
                        </Link>
                    ) : <span />}
                    {next && (
                        <Link href={`/sirah/history/${next.slug}`} className={cn(navLink, "justify-end text-right")}>
                            <span className="truncate">{title(next)}</span><ChevronRight className="h-4 w-4 shrink-0" />
                        </Link>
                    )}
                </nav>
            </article>
        </div>
    );
}
