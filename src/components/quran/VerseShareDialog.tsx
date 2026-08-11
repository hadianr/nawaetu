"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Verse Share Dialog Component
 * Refactored to use high-performance HTML5 Canvas StoryShareModal (9:16 Story Renderer)
 */

import { useMemo } from "react";
import { Verse } from "@/components/quran/VerseList";
import { useTheme } from "@/context/ThemeContext";
import { StoryShareModal } from "@/components/StoryShareModal";
import { mapQuranVerseToShareData } from "@/lib/share/share-mappers";

interface VerseShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    verse: Verse | null;
    surahName: string;
    surahNumber: number;
}

export default function VerseShareDialog({
    open,
    onOpenChange,
    verse,
    surahName,
    surahNumber,
}: VerseShareDialogProps) {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    const shareData = useMemo(() => {
        if (!verse) return null;
        return mapQuranVerseToShareData(verse, surahName, surahNumber);
    }, [verse, surahName, surahNumber]);

    if (!open || !verse || !shareData) return null;

    return (
        <StoryShareModal
            item={shareData}
            onClose={() => onOpenChange(false)}
            isDaylight={isDaylight}
        />
    );
}
