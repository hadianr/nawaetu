"use client";

/**
 * Nawaetu - one chapter of the concise sirah, with Nawaetu's notes around the unchanged book text
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useSirahContentLang } from "@/hooks/useSirahContentLang";
import { cn } from "@/lib/utils";
import { hadeethEncUrl } from "@/data/history/chapters";
import { ContentLangToggle } from "@/components/sirah/ContentLangToggle";
import {
    CONCISE_READ_KEY,
    getConcisePage,
    getConcisePageLabel,
    getConcisePageNeighbors,
    getConcisePages,
    getConciseDisplayTopics,
    getConciseSectionLabel,
    getConciseSirah,
    isConciseListChapter,
    isConcisePageRead,
    pageReadingMinutes,
    type ConcisePageRef,
    type ConciseSirahChapter,
} from "@/data/sirah/concise";
import { getConciseNote, type ConciseNameOrigin, type ConciseNote, type ConciseNoteHadith } from "@/data/sirah/concise/notes";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]";
const NOTE_BOX = "space-y-2 rounded-2xl border border-dashed border-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/5 p-4";

function readIds(): string[] {
    try {
        const v = JSON.parse(localStorage.getItem(CONCISE_READ_KEY) || "[]");
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

function saveRead(id: string) {
    try {
        const ids = readIds();
        if (!ids.includes(id)) localStorage.setItem(CONCISE_READ_KEY, JSON.stringify([...ids, id]));
    } catch { /* storage blocked: progress just isn't kept */ }
}

const pageHref = (ref: Pick<ConcisePageRef, "section" | "number">) => `/sirah/concise/${ref.section.id}/${ref.number}`;

function NoteLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-primary-strong))]">
            {children}
        </p>
    );
}

function ChapterBody({ chapter }: { chapter: ConciseSirahChapter }) {
    const { t } = useLocale();
    const topics = getConciseDisplayTopics(chapter);
    const asList = isConciseListChapter(chapter);
    const [open, setOpen] = useState<Set<number>>(new Set());
    const titled = topics.map((topic, i) => (topic.title ? i : -1)).filter((i) => i >= 0);
    const allOpen = titled.every((i) => open.has(i));

    if (!asList) {
        return (
            <div className="divide-y divide-[rgb(var(--color-border))] rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                {topics.map((topic, i) => (
                    <article key={i} className="space-y-1.5 px-4 py-3">
                        {topic.title && <h2 className="text-sm font-bold text-[rgb(var(--color-primary-strong))]">{topic.title}</h2>}
                        {topic.items.map((item, j) => <p key={j} className="text-[15px] leading-relaxed">{item}</p>)}
                    </article>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.conciseTapHint}</p>
                <button
                    type="button"
                    onClick={() => setOpen(allOpen ? new Set() : new Set(titled))}
                    className={cn("min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-semibold text-[rgb(var(--color-primary-strong))] hover:bg-[rgb(var(--color-primary))]/10", FOCUS)}
                >
                    {allOpen ? t.conciseCollapseAll : t.conciseExpandAll}
                </button>
            </div>
            <div className="divide-y divide-[rgb(var(--color-border))] rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                {topics.map((topic, i) =>
                    topic.title ? (
                        <details
                            key={i}
                            open={open.has(i)}
                            onToggle={(e) => {
                                const isOpen = e.currentTarget.open;
                                setOpen((prev) => {
                                    if (prev.has(i) === isOpen) return prev;
                                    const next = new Set(prev);
                                    if (isOpen) next.add(i); else next.delete(i);
                                    return next;
                                });
                            }}
                            className="group"
                        >
                            <summary className={cn("flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2 text-sm font-semibold text-[rgb(var(--color-text-strong))] [&::-webkit-details-marker]:hidden", FOCUS)}>
                                <span>{topic.title}</span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-open:rotate-180" aria-hidden />
                            </summary>
                            <div className="space-y-1.5 px-4 pb-3">
                                {topic.items.map((item, j) => <p key={j} className="text-[15px] leading-relaxed">{item}</p>)}
                            </div>
                        </details>
                    ) : (
                        <div key={i} className="space-y-1.5 px-4 py-3">
                            {topic.items.map((item, j) => <p key={j} className="text-[15px] leading-relaxed">{item}</p>)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function HadithSource({ hadith: h, lang }: { hadith: ConciseNoteHadith; lang: "id" | "en" }) {
    const { t } = useLocale();
    const isEn = lang === "en";
    return (
        <figure className="m-0 space-y-1.5">
            <blockquote lang={lang} className="m-0 text-sm leading-relaxed">{isEn ? h.translationEn : h.translation}</blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-3 text-xs text-[rgb(var(--color-text-muted))]">
                <span className="font-semibold">
                    {h.references?.length
                        ? t.conciseHadithRef.replace("{refs}", h.references.map((r) => `${r.collection} no. ${r.number}`).join(` ${t.conciseAnd} `))
                        : isEn ? h.attributionEn : h.attributionId}
                    {" · "}{isEn ? h.gradeEn : h.gradeId}
                </span>
                <a href={hadeethEncUrl(h.hadeethEncId, lang)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-2">
                    {t.hadithTranslationCredit}
                </a>
            </figcaption>
        </figure>
    );
}

function NameOrigins({ origins, lang }: { origins: ConciseNameOrigin[]; lang: "id" | "en" }) {
    const { t } = useLocale();
    const isEn = lang === "en";
    return (
        <div className="space-y-1.5 pt-1">
            <p className="text-xs font-bold text-[rgb(var(--color-text-strong))]">{t.conciseNameOrigins}</p>
            <ul className="divide-y divide-[rgb(var(--color-border))] rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                {origins.map((o) => (
                    <li key={o.fromEn}>
                        <details className="group">
                            <summary className={cn("flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden", FOCUS)}>
                                <span className="min-w-0 flex-1">
                                    <span lang={lang} className="block text-sm font-semibold text-[rgb(var(--color-text-strong))]">{isEn ? o.fromEn : o.fromId}</span>
                                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">{o.names.join(", ")}</span>
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform group-open:rotate-180" aria-hidden />
                            </summary>
                            <div className="flex flex-col gap-3 px-3 pb-3">
                                <p lang={lang} className="text-sm leading-relaxed">{isEn ? o.detailEn : o.detailId}</p>
                                {o.sources.map((src, i) => {
                                    if (src.kind === "hadith") return <HadithSource key={i} hadith={src.hadith} lang={lang} />;
                                    if (src.kind === "sirah") {
                                        return (
                                            <Link key={i} href={src.href} className={cn("inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[rgb(var(--color-primary-strong))] underline underline-offset-2", FOCUS)}>
                                                {t.conciseReadIn.replace("{label}", isEn ? src.labelEn : src.labelId)}
                                                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                                            </Link>
                                        );
                                    }
                                    return (
                                        <figure key={i} className="m-0 space-y-1.5">
                                            <blockquote lang={lang} className="m-0 text-sm leading-relaxed">{isEn ? src.textEn : src.textId}</blockquote>
                                            {isEn && src.footnotesEn?.map((f) => <p key={f} className="text-xs text-[rgb(var(--color-text-muted))]">{f}</p>)}
                                            <figcaption className="text-xs font-semibold text-[rgb(var(--color-text-muted))]">{isEn ? src.labelEn : src.labelId}</figcaption>
                                        </figure>
                                    );
                                })}
                            </div>
                        </details>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** "Memahami Lebih Dalam": Nawaetu's own context, name origins, a reflection and related sources, below the book text. */
function ChapterNote({ note, lang }: { note: ConciseNote; lang: "id" | "en" }) {
    const { t } = useLocale();
    const isEn = lang === "en";
    const h = note.hadith;

    return (
        <aside aria-label={t.conciseNoteLabel} className={NOTE_BOX}>
            <NoteLabel><Sparkles className="h-3.5 w-3.5" aria-hidden />{t.conciseNoteLabel}</NoteLabel>
            <p lang={lang} className="text-sm leading-relaxed">{isEn ? note.contextEn : note.contextId}</p>
            {note.origins && <NameOrigins origins={note.origins} lang={lang} />}

            <div className="space-y-1 border-t border-[rgb(var(--color-border))] pt-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--color-text-strong))]">
                    <Lightbulb className="h-3.5 w-3.5 text-[rgb(var(--color-primary-strong))]" aria-hidden />{t.conciseReflect}
                </p>
                <p lang={lang} className="text-sm font-medium italic leading-relaxed">{isEn ? note.reflectEn : note.reflectId}</p>
            </div>

            {h && (
                <div className="flex flex-col gap-2 border-t border-[rgb(var(--color-border))] pt-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--color-text-strong))]">
                        <ShieldCheck className="h-3.5 w-3.5 text-[rgb(var(--color-primary-strong))]" aria-hidden />{t.conciseRelatedHadith}
                    </p>
                    <HadithSource hadith={h} lang={lang} />
                </div>
            )}
        </aside>
    );
}

export function ConciseChapterReader({ sectionId, number }: { sectionId: string; number: number }) {
    const { t } = useLocale();
    const [lang] = useSirahContentLang();
    const book = getConciseSirah(lang);
    const ref = getConcisePage(lang, sectionId, number);
    const [read, setRead] = useState<string[]>([]);

    useEffect(() => {
        const ids = readIds();
        queueMicrotask(() => setRead(ids));
    }, [sectionId, number]);

    if (!ref) return null;

    const pages = getConcisePages(ref.section);
    const { prev, next } = getConcisePageNeighbors(lang, ref);
    const total = pages.length;
    const pageOf = t.conciseChapterOf.replace("{n}", String(ref.number)).replace("{total}", String(total));
    const note = getConciseNote(ref);
    const done = isConcisePageRead(ref, read);
    const markDone = () => {
        saveRead(ref.id);
        setRead((r) => (r.includes(ref.id) ? r : [...r, ref.id]));
    };
    const navCard = "flex min-h-11 items-center gap-1 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 text-sm hover:border-[rgb(var(--color-primary))]/40";

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans text-[rgb(var(--color-text))] sm:px-6 sm:py-6">
            <main className="mx-auto w-full max-w-2xl space-y-4">
                <header className="flex items-start gap-3">
                    <Link
                        href="/sirah/concise"
                        aria-label={t.conciseSirahContents}
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] transition-colors hover:bg-[rgb(var(--color-primary))]/10", FOCUS)}
                    >
                        <ArrowLeft className="h-5 w-5" aria-hidden />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p lang={lang} className="truncate text-xs font-semibold text-[rgb(var(--color-primary-strong))]">{getConciseSectionLabel(ref.section)}</p>
                        <h1 lang={lang} className="text-lg font-extrabold tracking-tight text-[rgb(var(--color-text-strong))] sm:text-2xl">{getConcisePageLabel(ref)}</h1>
                    </div>
                </header>

                <div className="space-y-2">
                    <div
                        role="progressbar"
                        aria-label={pageOf}
                        aria-valuemin={1}
                        aria-valuemax={total}
                        aria-valuenow={ref.number}
                        className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]"
                    >
                        <div className="h-full rounded-full bg-[rgb(var(--color-primary))]" style={{ width: `${(ref.number / total) * 100}%` }} />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">
                            {pageOf} · {t.sirahMinutes.replace("{count}", String(pageReadingMinutes(ref)))}
                        </p>
                        <ContentLangToggle hideLabel />
                    </div>
                </div>

                {total > 1 && (
                    <details className="group rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                        <summary className={cn("flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-4 text-sm font-semibold text-[rgb(var(--color-text-strong))] [&::-webkit-details-marker]:hidden", FOCUS)}>
                            {t.conciseSirahInThisSection}
                            <ChevronDown className="h-4 w-4 text-[rgb(var(--color-text-muted))] transition-transform group-open:rotate-180" aria-hidden />
                        </summary>
                        <ol lang={lang} className="divide-y divide-[rgb(var(--color-border))] border-t border-[rgb(var(--color-border))] px-2 pb-1">
                            {pages.map((page) => {
                                const current = page.number === ref.number;
                                return (
                                    <li key={page.id}>
                                        <Link
                                            href={pageHref(page)}
                                            aria-current={current ? "page" : undefined}
                                            className={cn("flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm hover:bg-[rgb(var(--color-primary))]/5", current ? "font-bold text-[rgb(var(--color-text-strong))]" : "text-[rgb(var(--color-primary-strong))]", FOCUS)}
                                        >
                                            <span className="w-5 shrink-0 text-xs text-[rgb(var(--color-text-muted))]">{page.number}.</span>
                                            <span className="min-w-0 flex-1">{getConcisePageLabel(page)}</span>
                                            {isConcisePageRead(page, read) && <CheckCircle2 className="h-4 w-4 shrink-0 text-[rgb(var(--color-success))]" aria-label={t.sirahDone} />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ol>
                    </details>
                )}

                {ref.chapters.map(({ chapter, number: chapterNumber }) => (
                    <section key={chapterNumber} aria-label={chapter.title ?? undefined} className="space-y-3">
                        {ref.chapters.length > 1 && chapter.title && (
                            <h2 lang={lang} className="pt-1 text-base font-extrabold text-[rgb(var(--color-text-strong))]">{chapter.title}</h2>
                        )}
                        <div lang={lang}>
                            <ChapterBody key={`${ref.id}-${chapterNumber}`} chapter={chapter} />
                        </div>
                    </section>
                ))}

                {note && <ChapterNote note={note} lang={lang} />}

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

                    <nav aria-label={t.conciseSirahInThisSection} className="grid grid-cols-2 gap-2">
                        {prev ? (
                            <Link href={pageHref(prev)} className={cn(navCard, FOCUS)}>
                                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="min-w-0">
                                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">{t.conciseSirahPrev}</span>
                                    <span lang={lang} className="block truncate font-semibold">{getConcisePageLabel(prev)}</span>
                                </span>
                            </Link>
                        ) : <span />}
                        {next ? (
                            <Link href={pageHref(next)} onClick={markDone} className={cn(navCard, "justify-end text-right", FOCUS)}>
                                <span className="min-w-0">
                                    <span className="block text-xs text-[rgb(var(--color-text-muted))]">
                                        {next.section.id === ref.section.id ? t.conciseNextChapter : t.conciseNextSection}
                                    </span>
                                    <span lang={lang} className="block truncate font-semibold">{getConcisePageLabel(next)}</span>
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                        ) : (
                            <Link href="/sirah/concise" onClick={markDone} className={cn(navCard, "justify-end font-semibold", FOCUS)}>
                                {t.conciseSirahContents}
                                <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                            </Link>
                        )}
                    </nav>

                    <p className="text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">
                        {note && <>{t.conciseNoteDisclaimer} </>}
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
