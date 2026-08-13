/**
 * Nawaetu - Sirah Nabawiyah Feature Data Types
 * Copyright (C) 2026 Hadian Rahmat
 */

export type SirahEra = "makkah" | "madinah" | "ghazwah" | "diplomacy" | "legacy";

export interface SirahQuranRef {
    surah: number;
    verses: string;
    label?: string;
}

export interface SirahChapter {
    id: string;
    slug: string;
    orderIndex: number;
    title: string;
    era: SirahEra;
    summary: string;
    totalSections: number;
}

export interface SirahSection {
    id: string;
    chapterId: string;
    chapterSlug: string;
    chapterTitle: string;
    orderIndex: number;
    subbab: string;
    pageStart?: number;
    pageEnd?: number;
    content: string;
    highlights?: string;
    suggestedIntention: string;
    relatedQuranVerses?: SirahQuranRef[];
    relatedHadithIds?: string[];
}
