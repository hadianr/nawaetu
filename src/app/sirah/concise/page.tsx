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
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useSirahContentLang } from "@/hooks/useSirahContentLang";
import { ContentLangToggle } from "@/components/sirah/ContentLangToggle";
import { cn } from "@/lib/utils";
import {
    CONCISE_READ_KEY,
    getConcisePageLabel,
    getConcisePageRefs,
    getConcisePages,
    getConciseSectionLabel,
    getConciseSirah,
    isConcisePageRead,
    isConciseSectionRead,
    readingMinutes,
} from "@/data/sirah/concise";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";

export default function ConciseSirahPage() {
    const { t } = useLocale();
    const [lang] = useSirahContentLang();
    const book = getConciseSirah(lang);
    const [read, setRead] = useState<string[]>([]);

    useEffect(() => {
        let ids: string[] = [];
        try {
            const v = JSON.parse(localStorage.getItem(CONCISE_READ_KEY) || "[]");
            if (Array.isArray(v)) ids = v;
        } catch { /* storage blocked */ }
        queueMicrotask(() => setRead(ids));
    }, []);

    const readable = book.sections.filter((s) => s.chapters.length > 0);
    const totalMinutes = readable.reduce((sum, s) => sum + readingMinutes(s), 0);
    const allPages = getConcisePageRefs(lang);
    const nextUp = allPages.find((r) => !isConcisePageRead(r, read)) ?? allPages[0];
    const started = allPages.some((r) => isConcisePageRead(r, read));

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <main className="mx-auto w-full max-w-2xl space-y-5">
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah"
                        aria-label={t.historyBack}
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10", FOCUS)}
                    >
                        <ArrowLeft className="h-5 w-5" aria-hidden />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-lg font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{t.sirahPathConciseTitle}</h1>
                        <p className="mt-0.5 text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{t.sirahPathConciseDesc}</p>
                    </div>
                </header>

                <section aria-label={t.conciseSirahAbout} className="space-y-3 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
                    <ContentLangToggle />
                    <p lang={lang} className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{book.title}</p>
                    <p className="text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">
                        {book.author} · {t.conciseSirahTranslatedBy.replace("{names}", book.translators.join(", "))}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">
                        {t.sirahPathSections.replace("{count}", String(readable.length))} · {t.sirahMinutes.replace("{count}", String(totalMinutes))}
                    </p>
                    <Link
                        href={`/sirah/concise/${nextUp.section.id}/${nextUp.number}`}
                        className={cn("flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[rgb(var(--color-primary))] px-4 text-sm font-bold text-[rgb(var(--color-primary-foreground))] transition-opacity hover:opacity-90", FOCUS)}
                    >
                        {started ? t.conciseSirahContinue : t.conciseSirahStart}
                        <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                </section>

                <nav aria-labelledby="concise-contents" className="space-y-2">
                    <h2 id="concise-contents" className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{t.conciseSirahContents}</h2>
                    <ul className="space-y-2">
                        {book.sections.map((section) => {
                            const label = getConciseSectionLabel(section);
                            if (section.chapters.length === 0) {
                                return (
                                    <li key={section.id} className="pt-2 text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-text-muted))]">
                                        {label}
                                    </li>
                                );
                            }
                            const done = isConciseSectionRead(section, read);
                            const pages = getConcisePages(section);
                            const doneCount = pages.filter((pg) => isConcisePageRead(pg, read)).length;
                            return (
                                <li key={section.id}>
                                    <details
                                        className={cn(
                                            "group rounded-2xl border transition-colors",
                                            done
                                                ? "border-[rgb(var(--color-success))]/40 bg-[rgb(var(--color-success))]/10"
                                                : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]"
                                        )}
                                    >
                                        <summary className={cn("flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-2xl p-4 [&::-webkit-details-marker]:hidden", FOCUS)}>
                                            <span className="min-w-0 flex-1">
                                                <span lang={lang} className="block text-sm font-semibold text-[rgb(var(--color-text-strong))]">{label}</span>
                                                <span className="mt-0.5 block text-xs text-[rgb(var(--color-text-muted))]">
                                                    {section.chapters.length === 1 ? t.conciseSirahTopicCountOne : t.conciseSirahTopicCount.replace("{count}", String(section.chapters.length))} · {t.sirahMinutes.replace("{count}", String(readingMinutes(section)))}
                                                    {doneCount > 0 && !done && ` · ${doneCount}/${pages.length}`}
                                                </span>
                                            </span>
                                            {done && <CheckCircle2 className="h-5 w-5 shrink-0 text-[rgb(var(--color-success))]" aria-label={t.sirahDone} />}
                                            <ChevronDown className="h-5 w-5 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-open:rotate-180" aria-hidden />
                                        </summary>
                                        <ol lang={lang} className="divide-y divide-[rgb(var(--color-border))] border-t border-[rgb(var(--color-border))] px-2 pb-1">
                                            {pages.map((pg) => {
                                                const chapterDone = isConcisePageRead(pg, read);
                                                return (
                                                    <li key={pg.id}>
                                                        <Link
                                                            href={`/sirah/concise/${section.id}/${pg.number}`}
                                                            className={cn("flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-primary))]/5", FOCUS)}
                                                        >
                                                            <span className="w-5 shrink-0 text-xs text-[rgb(var(--color-text-muted))]">{pg.number}.</span>
                                                            <span className="min-w-0 flex-1">{getConcisePageLabel(pg)}</span>
                                                            {chapterDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-[rgb(var(--color-success))]" aria-label={t.sirahDone} />}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </details>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <p className="text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">
                    {t.conciseSirahSource}{" "}
                    <a href={book.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                        {new URL(book.sourceUrl).hostname}
                    </a>
                </p>
            </main>
        </div>
    );
}
