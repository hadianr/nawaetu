/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Shared base interface for Islamic content items (Hadith & Dua).
 * Both HadithItem and DuaItem extend this base for type consistency
 * and shared component compatibility.
 */

export interface IslamicContentBase {
    id: string;
    category: string;
    title: string;
    titleEn?: string;
    arabic: string;
    latin: string;
    translation: string;       // Indonesian
    translationEn?: string;    // English
}
