"use client";

/**
 * Nawaetu - Sirah Nabawiyah Subchapter Reader Page
 * Copyright (C) 2026 Hadian Rahmat
 */

import { use } from "react";
import { getSirahSectionById, getSirahSectionsByChapterSlug } from "@/data/sirah";
import { SirahReaderView } from "@/components/sirah/SirahReaderView";
import { notFound } from "next/navigation";

export default function SirahSectionReaderPage({
    params,
}: {
    params: Promise<{ chapterSlug: string; sectionId: string }>;
}) {
    const { chapterSlug, sectionId } = use(params);

    const section = getSirahSectionById(sectionId);
    if (!section || section.chapterSlug !== chapterSlug) {
        notFound();
    }

    const chapterSections = getSirahSectionsByChapterSlug(chapterSlug);
    const currentIndex = chapterSections.findIndex((s) => s.id === sectionId);

    const prevSectionId = currentIndex > 0 ? chapterSections[currentIndex - 1].id : undefined;
    const nextSectionId = currentIndex < chapterSections.length - 1 ? chapterSections[currentIndex + 1].id : undefined;

    return (
        <SirahReaderView
            section={section}
            prevSectionId={prevSectionId}
            nextSectionId={nextSectionId}
            chapterSlug={chapterSlug}
        />
    );
}
