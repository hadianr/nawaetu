/**
 * Nawaetu - Concise Sirah (Haytham Sarhan)
 * Copyright (C) 2026 Hadian Rahmat
 */

// Text is copied unchanged from the author's own editions; his permission (2026-11-14) requires no edits.
import en from "./en.json";
import id from "./id.json";

export interface ConciseSirahTopic {
    title: string | null;
    items: string[];
}

export interface ConciseSirahChapter {
    title: string | null;
    topics: ConciseSirahTopic[];
}

// A part title or page-top heading; part titles have no chapters of their own.
export interface ConciseSirahSection {
    id: string;
    title: string | null;
    chapters: ConciseSirahChapter[];
}

export interface ConciseSirahBook {
    title: string;
    author: string;
    translators: string[];
    sourceUrl: string;
    sections: ConciseSirahSection[];
}

const BOOKS: Record<"en" | "id", ConciseSirahBook> = { en, id };

export function getConciseSirah(locale: string): ConciseSirahBook {
    return locale === "en" ? BOOKS.en : BOOKS.id;
}

// Part titles have no chapters, so they group the list instead of being pages.
export function getConciseReadableSections(locale: string): ConciseSirahSection[] {
    return getConciseSirah(locale).sections.filter((s) => s.chapters.length > 0);
}

export function getConciseSection(locale: string, id: string): ConciseSirahSection | undefined {
    return getConciseReadableSections(locale).find((s) => s.id === id);
}

export function getConciseSectionLabel(section: ConciseSirahSection): string {
    return section.title ?? section.chapters[0]?.title ?? "";
}

function wordsIn(chapters: ConciseSirahChapter[]): number {
    return chapters
        .flatMap((c) => c.topics.flatMap((t) => t.items))
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
}

function minutesFor(chapters: ConciseSirahChapter[]): number {
    return Math.max(1, Math.round(wordsIn(chapters) / 200));
}

export function readingMinutes(section: ConciseSirahSection): number {
    return minutesFor(section.chapters);
}

export const CONCISE_READ_KEY = "nawaetu_concise_read";

/** One reading page: one long chapter, or several short consecutive ones. `number` is 1-based within its section. */
export interface ConcisePageRef {
    section: ConciseSirahSection;
    number: number;
    id: string;
    /** The chapters on this page with their 1-based number in the section, which notes are keyed by. */
    chapters: { chapter: ConciseSirahChapter; number: number }[];
}

export function concisePageId(sectionId: string, number: number): string {
    return `${sectionId}-${number}`;
}

// About one to two and a half minutes a page; very short chapters join a neighbour instead of standing alone.
const PAGE_MIN_WORDS = 200;
const PAGE_MAX_WORDS = 500;
const TINY_PAGE_WORDS = 100;
const MERGED_MAX_WORDS = 600;

function groupChapters(section: ConciseSirahSection): number[][] {
    const words = section.chapters.map((c) => wordsIn([c]));
    const groups: number[][] = [];
    let current: number[] = [];
    let total = 0;
    words.forEach((w, i) => {
        if (current.length && (total >= PAGE_MIN_WORDS || total + w > PAGE_MAX_WORDS)) {
            groups.push(current);
            current = [];
            total = 0;
        }
        current.push(i);
        total += w;
    });
    if (current.length) groups.push(current);

    const sum = (g: number[]) => g.reduce((n, i) => n + words[i], 0);
    for (let g = 0; g < groups.length; g++) {
        if (groups.length < 2 || sum(groups[g]) >= TINY_PAGE_WORDS) continue;
        if (g > 0 && sum(groups[g - 1]) + sum(groups[g]) <= MERGED_MAX_WORDS) {
            groups[g - 1].push(...groups.splice(g, 1)[0]);
            g--;
        } else if (g + 1 < groups.length && sum(groups[g]) + sum(groups[g + 1]) <= MERGED_MAX_WORDS) {
            groups[g + 1].unshift(...groups.splice(g, 1)[0]);
            g--;
        }
    }

    return groups;
}

// The Indonesian edition sets the page breaks, and the English edition reuses them whenever a part has the same
// chapters, so a page shows the same story in both languages and a note fits both. Parts whose chapter count
// differs (EN s04 and s12) are split on their own.
function paginate(section: ConciseSirahSection): ConcisePageRef[] {
    const indonesian = BOOKS.id.sections.find((s) => s.id === section.id);
    const basis = indonesian && indonesian.chapters.length === section.chapters.length ? indonesian : section;
    return groupChapters(basis).map((g, p) => ({
        section,
        number: p + 1,
        id: concisePageId(section.id, p + 1),
        chapters: g.map((i) => ({ chapter: section.chapters[i], number: i + 1 })),
    }));
}

export function getConcisePages(section: ConciseSirahSection): ConcisePageRef[] {
    return paginate(section);
}

export function getConcisePageRefs(locale: string): ConcisePageRef[] {
    return getConciseReadableSections(locale).flatMap(paginate);
}

// Editions can split a part into a different number of pages, so a page number past the end shows that
// edition's last page instead of nothing.
export function getConcisePage(locale: string, sectionId: string, number: number): ConcisePageRef | undefined {
    const section = getConciseSection(locale, sectionId);
    if (!section || !Number.isInteger(number) || number < 1) return undefined;
    const pages = paginate(section);
    return pages[Math.min(number, pages.length) - 1];
}

export function getConcisePageNeighbors(locale: string, ref: ConcisePageRef): { prev?: ConcisePageRef; next?: ConcisePageRef } {
    const all = getConcisePageRefs(locale);
    const i = all.findIndex((r) => r.id === ref.id);
    if (i < 0) return {};
    return { prev: all[i - 1], next: all[i + 1] };
}

export function getConcisePageLabel(ref: ConcisePageRef): string {
    const titles = ref.chapters.map((c) => c.chapter.title).filter((t): t is string => Boolean(t));
    return titles.length ? titles.join(" · ") : getConciseSectionLabel(ref.section);
}

export function pageReadingMinutes(ref: ConcisePageRef): number {
    return minutesFor(ref.chapters.map((c) => c.chapter));
}

// Read ids are page ids ("s03-2"); a bare section id was saved before parts had pages and still counts.
export function isConciseSectionRead(section: ConciseSirahSection, readIds: readonly string[]): boolean {
    return readIds.includes(section.id) || paginate(section).every((r) => readIds.includes(r.id));
}

export function isConcisePageRead(ref: ConcisePageRef, readIds: readonly string[]): boolean {
    return readIds.includes(ref.id) || readIds.includes(ref.section.id);
}

/**
 * Chapters that are lists of named entries (names, traits, manners) read better as tap-to-open rows.
 * Untitled topics in them (an opening or closing paragraph) stay as plain text.
 */
export function isConciseListChapter(chapter: ConciseSirahChapter): boolean {
    const titled = chapter.topics.filter((t) => t.title).length;
    return titled >= 4 && titled / chapter.topics.length >= 0.75;
}

// The PDFs' box layout cut some passages across pages, leaving the rest as an untitled topic. A topic that
// ends mid-sentence (no closing punctuation) is joined with the untitled one after it; the words are unchanged.
const ENDS_SENTENCE = /[.!?"”’')\]]$/;

export function getConciseDisplayTopics(chapter: ConciseSirahChapter): ConciseSirahTopic[] {
    const out: ConciseSirahTopic[] = [];
    for (const topic of chapter.topics) {
        const prev = out[out.length - 1];
        const prevLast = prev?.items[prev.items.length - 1];
        if (prev && !topic.title && prevLast && !ENDS_SENTENCE.test(prevLast.trim())) {
            const [first, ...rest] = topic.items;
            out[out.length - 1] = { ...prev, items: [...prev.items.slice(0, -1), `${prevLast.trim()} ${first.trim()}`, ...rest] };
        } else {
            out.push(topic);
        }
    }
    return out;
}

