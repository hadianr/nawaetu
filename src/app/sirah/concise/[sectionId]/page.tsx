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

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useSirahContentLang } from "@/hooks/useSirahContentLang";
import { ContentLangToggle } from "@/components/sirah/ContentLangToggle";
import { cn } from "@/lib/utils";
import {
    CONCISE_READ_KEY,
    getConciseNeighbors,
    getConciseSection,
    getConciseSectionLabel,
    getConciseSirah,
    readingMinutes,
} from "@/data/sirah/concise";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";
// Long sections (e.g. the Madinah period) get a jump list so readers can skip ahead.
const JUMP_LIST_MIN_CHAPTERS = 6;

function readIds(): string[] {
    try {
        const v = JSON.parse(localStorage.getItem(CONCISE_READ_KEY) || "[]");
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

export default function ConciseSectionPage() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { t } = useLocale();
    const [lang] = useSirahContentLang();
    const book = getConciseSirah(lang);
    const section = getConciseSection(lang, sectionId);
    const { prev, next } = getConciseNeighbors(lang, sectionId);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const isDone = readIds().includes(sectionId);
        queueMicrotask(() => setDone(isDone));
    }, [sectionId]);

    if (!section) return null;

    const label = getConciseSectionLabel(section);
    const markDone = () => {
        try {
            const ids = readIds();
            if (!ids.includes(section.id)) localStorage.setItem(CONCISE_READ_KEY, JSON.stringify([...ids, section.id]));
        } catch { /* storage blocked: still show as done for this visit */ }
        setDone(true);
    };
    const anchor = (c: number) => `${section.id}-c${c + 1}`;

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <main className="mx-auto w-full max-w-2xl space-y-5">
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah/concise"
                        aria-label={t.conciseSirahContents}
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10", FOCUS)}
                    >
                        <ArrowLeft className="h-5 w-5" aria-hidden />
                    </Link>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-[rgb(var(--color-primary-strong))]">{t.sirahPathConciseTitle}</p>
                        <h1 lang={lang} className="text-lg font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{label}</h1>
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">
                        {t.sirahMinutes.replace("{count}", String(readingMinutes(section)))} · {section.chapters.length === 1 ? t.conciseSirahTopicCountOne : t.conciseSirahTopicCount.replace("{count}", String(section.chapters.length))}
                    </p>
                    <ContentLangToggle hideLabel />
                </div>

                {section.chapters.length >= JUMP_LIST_MIN_CHAPTERS && (
                    <details className="group rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                        <summary className={cn("flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-4 text-sm font-semibold text-[rgb(var(--color-text-strong))] [&::-webkit-details-marker]:hidden", FOCUS)}>
                            {t.conciseSirahInThisSection}
                            <ChevronDown className="h-4 w-4 text-[rgb(var(--color-text-muted))] transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <ol lang={lang} className="divide-y divide-[rgb(var(--color-border))] border-t border-[rgb(var(--color-border))] px-2 pb-1">
                            {section.chapters.map((chapter, c) => chapter.title && (
                                <li key={c}>
                                    <a href={`#${anchor(c)}`} className={cn("flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-primary))]/5", FOCUS)}>
                                        <span className="w-5 shrink-0 text-xs text-[rgb(var(--color-text-muted))]">{c + 1}.</span>
                                        <span className="min-w-0">{chapter.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </details>
                )}

                <div lang={lang} className="space-y-6">
                    {section.chapters.map((chapter, c) => (
                        <section key={c} id={anchor(c)} aria-labelledby={chapter.title ? `${anchor(c)}-h` : undefined} className="scroll-mt-4 space-y-2">
                            {chapter.title && (
                                <h2 id={`${anchor(c)}-h`} className="text-base font-extrabold text-[rgb(var(--color-text-strong))]">{chapter.title}</h2>
                            )}
                            <div className="divide-y divide-[rgb(var(--color-border))] rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                                {chapter.topics.map((topic, i) => (
                                    <article key={i} className="space-y-1.5 px-4 py-3">
                                        {topic.title && (
                                            <h3 className="text-sm font-bold text-[rgb(var(--color-primary-strong))]">{topic.title}</h3>
                                        )}
                                        {topic.items.map((item, j) => (
                                            <p key={j} className="text-[15px] leading-relaxed">{item}</p>
                                        ))}
                                    </article>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="space-y-3 border-t border-[rgb(var(--color-border))] pt-4">
                    {done ? (
                        <p className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--color-success))]/10 text-sm font-bold text-[rgb(var(--color-success))]" role="status">
                            <CheckCircle2 className="h-4 w-4" aria-hidden /> {t.sirahDone}
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={markDone}
                            className={cn("flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--color-primary))] text-sm font-bold text-[rgb(var(--color-primary-foreground))] transition-opacity hover:opacity-90", FOCUS)}
                        >
                            <CheckCircle2 className="h-4 w-4" aria-hidden /> {t.conciseSirahMarkDone}
                        </button>
                    )}

                    <nav aria-label={t.conciseSirahContents} className="grid grid-cols-2 gap-2">
                        {prev ? (
                            <Link href={`/sirah/concise/${prev.id}`} className={cn("flex min-h-11 items-center gap-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 text-sm hover:border-[rgb(var(--color-primary))]/40", FOCUS)}>
                                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="min-w-0">
                                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">{t.conciseSirahPrev}</span>
                                    <span className="block truncate font-semibold">{getConciseSectionLabel(prev)}</span>
                                </span>
                            </Link>
                        ) : <span />}
                        {next ? (
                            <Link href={`/sirah/concise/${next.id}`} onClick={markDone} className={cn("flex min-h-11 items-center justify-end gap-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 text-right text-sm hover:border-[rgb(var(--color-primary))]/40", FOCUS)}>
                                <span className="min-w-0">
                                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">{t.conciseSirahNext}</span>
                                    <span className="block truncate font-semibold">{getConciseSectionLabel(next)}</span>
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                        ) : (
                            <Link href="/sirah/concise" className={cn("flex min-h-11 items-center justify-end gap-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 text-sm font-semibold hover:border-[rgb(var(--color-primary))]/40", FOCUS)}>
                                {t.conciseSirahContents}
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                        )}
                    </nav>

                    <p className="text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">
                        {book.author} · {t.conciseSirahTranslatedBy.replace("{names}", book.translators.join(", "))}. {t.conciseSirahSource}{" "}
                        <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {new URL(book.sourceUrl).hostname}
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
