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

export function getConciseNeighbors(locale: string, id: string): { prev?: ConciseSirahSection; next?: ConciseSirahSection } {
    const list = getConciseReadableSections(locale);
    const i = list.findIndex((s) => s.id === id);
    if (i < 0) return {};
    return { prev: list[i - 1], next: list[i + 1] };
}

export function readingMinutes(section: ConciseSirahSection): number {
    const words = section.chapters
        .flatMap((c) => c.topics.flatMap((t) => t.items))
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export const CONCISE_READ_KEY = "nawaetu_concise_read";
