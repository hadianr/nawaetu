/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Events from the sirah shown on the Hijri calendar. An event gets a day only when the
 * date is stated in the app's own sirah text (dateSourceSectionId); otherwise it stays month-level.
 * Titles and lessons are Nawaetu's own; each event links to a HadeethEnc hadith in the library.
 */

export interface HistoryEvent {
    id: string;
    hijriMonth: number;
    hijriDay?: number;
    hijriYear: number;
    titleId: string;
    titleEn: string;
    lessonId: string;
    lessonEn: string;
    hadithId: string;
    /** Sirah section whose text states the date (the dataset sometimes files it under an unrelated title). */
    dateSourceSectionId: string;
    /** Sirah section about the event itself, linked as further reading (Indonesian only). */
    sirah?: { chapterSlug: string; sectionId: string };
}

export const HISTORY_EVENTS: HistoryEvent[] = [
    {
        id: "badr",
        hijriMonth: 9,
        hijriDay: 17,
        hijriYear: 2,
        titleId: "Perang Badar",
        titleEn: "The Battle of Badr",
        lessonId: "Kalah jumlah tiga banding satu, Nabi ﷺ menyiapkan strategi lalu bersandar penuh kepada Allah.",
        lessonEn: "Outnumbered three to one, the Prophet ﷺ prepared a strategy and then relied fully on Allah.",
        hadithId: "hadith_civic_doa_badar",
        dateSourceSectionId: "sec-097",
        sirah: { chapterSlug: "perang-badr-kubra", sectionId: "sec-097" },
    },
    {
        id: "khandaq",
        hijriMonth: 10,
        hijriYear: 5,
        titleId: "Perang Khandaq (Parit)",
        titleEn: "The Battle of the Trench",
        lessonId: "Nabi ﷺ ikut menggali parit dan menahan lapar bersama para sahabat.",
        lessonEn: "The Prophet ﷺ dug the trench and went hungry alongside his companions.",
        hadithId: "hadith_civic_menggali_parit",
        dateSourceSectionId: "sec-166",
        sirah: { chapterSlug: "perang-ahzab-atau-khandaq", sectionId: "sec-158" },
    },
    {
        id: "hunayn",
        hijriMonth: 10,
        hijriYear: 8,
        titleId: "Perang Hunain",
        titleEn: "The Battle of Hunayn",
        lessonId: "Saat banyak pasukan mundur, Nabi ﷺ tetap maju dan memanggil mereka kembali.",
        lessonEn: "When many fell back, the Prophet ﷺ pressed forward and called them to return.",
        hadithId: "hadith_civic_teguh_di_hunain",
        dateSourceSectionId: "sec-301",
    },
];

export function getHistoryEventsForMonth(hijriMonth: number): HistoryEvent[] {
    return HISTORY_EVENTS.filter((event) => event.hijriMonth === hijriMonth);
}
