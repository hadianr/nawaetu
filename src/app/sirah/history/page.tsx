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

"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { HISTORY_CHAPTERS, formatHistoryDate } from "@/data/history/chapters";

export default function SirahHistoryPage() {
    const { locale, t } = useLocale();
    const isEn = locale === "en";

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <main className="mx-auto w-full max-w-2xl space-y-5">
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah"
                        aria-label={t.historyBack}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{t.historyPageTitle}</h1>
                        <p className="mt-0.5 text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">{t.historyPageSubtitle}</p>
                    </div>
                </header>

                <ol className="space-y-2.5">
                    {HISTORY_CHAPTERS.map(chapter => (
                        <li key={chapter.slug}>
                            <Link
                                href={`/sirah/history/${chapter.slug}`}
                                className={cn(
                                    "flex items-start gap-3 rounded-2xl border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                    "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[var(--shadow-card)] hover:border-[rgb(var(--color-primary))]/40",
                                )}
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))]/10 text-xs font-bold text-[rgb(var(--color-primary-strong))]">
                                    {chapter.order}
                                </span>
                                <span className="min-w-0 flex-1">
                                    {chapter.date && (
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-primary-strong))]">
                                            {formatHistoryDate(chapter.date, locale)}
                                        </span>
                                    )}
                                    <span className="block text-sm font-semibold text-[rgb(var(--color-text-strong))]">{isEn ? chapter.titleEn : chapter.titleId}</span>
                                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">{isEn ? chapter.introEn : chapter.introId}</span>
                                    <span className="mt-1 block text-[10px] text-[rgb(var(--color-text-muted))]">
                                        {(t.historyChapterCount || "{count} hadits").replace("{count}", String(chapter.hadithCount))}
                                    </span>
                                </span>
                                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[rgb(var(--color-text-muted))]" />
                            </Link>
                        </li>
                    ))}
                </ol>

                <p className="text-[11px] leading-relaxed text-[rgb(var(--color-text-muted))]">{t.historySources}</p>
            </main>
        </div>
    );
}
