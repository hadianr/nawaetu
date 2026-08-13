/**
 * Nawaetu - Sirah Nabawiyah Data Provider
 * Copyright (C) 2026 Hadian Rahmat
 */

import chaptersData from "./chapters.json";
import sectionsData from "./sections.json";
import type { SirahChapter, SirahSection, SirahEra } from "./types";

export * from "./types";

export const SIRAH_CHAPTERS: SirahChapter[] = chaptersData as SirahChapter[];
export const SIRAH_SECTIONS: SirahSection[] = sectionsData as SirahSection[];

export function getSirahChapters(): SirahChapter[] {
    return SIRAH_CHAPTERS;
}

export function getSirahChaptersByEra(era: SirahEra): SirahChapter[] {
    return SIRAH_CHAPTERS.filter((c) => c.era === era);
}

export function getSirahChapterBySlug(slug: string): SirahChapter | undefined {
    return SIRAH_CHAPTERS.find((c) => c.slug === slug);
}

export function getSirahSectionsByChapterSlug(slug: string): SirahSection[] {
    return SIRAH_SECTIONS.filter((s) => s.chapterSlug === slug);
}

export function getSirahSectionById(id: string): SirahSection | undefined {
    return SIRAH_SECTIONS.find((s) => s.id === id);
}

export function searchSirah(query: string): SirahSection[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return SIRAH_SECTIONS.filter(
        (s) =>
            s.subbab.toLowerCase().includes(q) ||
            s.chapterTitle.toLowerCase().includes(q) ||
            (Array.isArray(s.content) ? s.content.join(" ") : String(s.content)).toLowerCase().includes(q)
    );
}

export function getDailySirahHighlight(): SirahSection {
    // Deterministic daily rotation based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % SIRAH_SECTIONS.length;
    return SIRAH_SECTIONS[index] || SIRAH_SECTIONS[0];
}
