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
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { getHijriMonthName } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";
import {
    DATED_HISTORY_EVENTS,
    UNDATED_HISTORY_EVENTS,
    hadeethEncUrl,
    type HistoryEvent,
} from "@/data/history-events";

const surface = "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[var(--shadow-card)]";

function EventCard({ event }: { event: HistoryEvent }) {
    const { locale, t } = useLocale();
    const isEn = locale === "en";
    const { hadith } = event;

    return (
        <li id={event.id} className={cn("scroll-mt-4 rounded-2xl border p-4", surface)}>
            {event.hijriYear !== undefined && event.hijriMonth !== undefined && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-primary-strong))]">
                    {event.hijriDay ? `${event.hijriDay} ` : ""}{getHijriMonthName(event.hijriMonth, locale)} {event.hijriYear} {isEn ? "AH" : "H"}
                </p>
            )}
            <h3 className="mt-0.5 text-base font-bold text-[rgb(var(--color-text-strong))]">{isEn ? event.titleEn : event.titleId}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--color-text))]">{isEn ? event.lessonEn : event.lessonId}</p>
            <p className="mt-1 text-[10px] text-[rgb(var(--color-text-muted))]">{t.historyLessonNote}</p>

            <details className="group mt-3 rounded-xl bg-[rgb(var(--color-surface-subtle))] p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-[rgb(var(--color-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        HR. {hadith.collection} No. {hadith.hadithNumber} ({hadith.authenticity})
                    </span>
                    <span className="group-open:hidden">{t.historyReadHadith}</span>
                </summary>
                <div className="mt-3 space-y-3">
                    <p dir="rtl" className="text-right font-arabic text-lg leading-[2] text-[rgb(var(--color-text-strong))]">{hadith.arabic}</p>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-[rgb(var(--color-text))]">
                        {isEn ? hadith.translationEn : hadith.translation}
                    </p>
                    <a
                        href={hadeethEncUrl(hadith.hadeethEncId, locale)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-[rgb(var(--color-text-muted))] underline underline-offset-2 hover:text-[rgb(var(--color-primary-strong))]"
                    >
                        {t.hadithTranslationCredit || "Teks & terjemahan: HadeethEnc.com"}
                    </a>
                </div>
            </details>

            {event.sirah && (
                <Link
                    href={`/sirah/${event.sirah.chapterSlug}/${event.sirah.sectionId}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    {t.hijriHistoryReadSirah}
                </Link>
            )}
        </li>
    );
}

export default function SirahHistoryPage() {
    const { t } = useLocale();

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <main className="mx-auto w-full max-w-2xl space-y-6">
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

                <section>
                    <h2 className="mb-3 text-sm font-bold">{t.historyTimeline}</h2>
                    <ol className="space-y-3">
                        {DATED_HISTORY_EVENTS.map(event => <EventCard key={event.id} event={event} />)}
                    </ol>
                </section>

                <section>
                    <h2 className="text-sm font-bold">{t.historyMore}</h2>
                    <p className="mb-3 mt-0.5 text-xs text-[rgb(var(--color-text-muted))]">{t.historyMoreNote}</p>
                    <ul className="space-y-3">
                        {UNDATED_HISTORY_EVENTS.map(event => <EventCard key={event.id} event={event} />)}
                    </ul>
                </section>

                <p className="text-[11px] leading-relaxed text-[rgb(var(--color-text-muted))]">{t.historySources}</p>
            </main>
        </div>
    );
}
