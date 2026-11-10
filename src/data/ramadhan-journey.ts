import { getHadithById, type HadithItem } from "@/data/hadiths";
import { FAQ_DATA, FASTING_EVIDENCE, type EvidenceData } from "@/data/ramadhan";
import type { JourneyPhase } from "@/lib/ramadhan-journey";

/** Reuse the hadith library through the same shape the Ramadhan hub's dalil dialog already renders. */
export function hadithToEvidence(item: HadithItem): EvidenceData {
    const ref = `${item.collection} No. ${item.hadithNumber}`;
    const via = `${item.narrator ? ` — ${item.narrator}` : ""} (${item.authenticity})`;
    return {
        id: item.id,
        shortRef: `HR. ${ref}`,
        shortRef_en: ref,
        arabic: item.arabic,
        latin: item.latin,
        translation: item.translation,
        translation_en: item.translationEn,
        source: `HR. ${ref}${via}`,
        source_en: `${ref}${via}`,
    };
}

function hadith(id: string): EvidenceData | null {
    const item = getHadithById(id);
    return item ? hadithToEvidence(item) : null;
}

interface HabitDef {
    /** Matches the `journeyHabit{n}` copy keys. */
    n: number;
    phases: JourneyPhase[];
    hadithId: string;
}

// Each habit points at an existing library hadith. Prayers (Check-in Sholat) and niat (Jurnal Niat) are not habits here: those cards own them.
//  Any new or changed pairing needs religious review.
export const JOURNEY_HABITS: HabitDef[] = [
    { n: 1, phases: ["build", "sharpen"], hadithId: "hadith_istiqomah_sedikit" },
    { n: 2, phases: ["reset"], hadithId: "hadith_istiqomah_sedikit" },
    { n: 3, phases: ["reset"], hadithId: "hadith_dzikir" },
    { n: 5, phases: ["reset"], hadithId: "hadith_syukur_nikmat_kecil" },
    { n: 6, phases: ["sharpen"], hadithId: "hadith_sahur" },
    { n: 7, phases: ["reset"], hadithId: "hadith_berkata_baik_atau_diam" },
    { n: 8, phases: ["build"], hadithId: "hadith_sedekah_subuh" },
    { n: 9, phases: ["build"], hadithId: "hadith_silaturrahim" },
    { n: 10, phases: ["sharpen"], hadithId: "hadith_menjaga_kesehatan_mental" },
    { n: 12, phases: ["build", "sharpen"], hadithId: "hadith_surah_al_mulk" },
    { n: 13, phases: ["reset"], hadithId: "hadith_dua_nikmat_terperdaya" },
    { n: 14, phases: ["build"], hadithId: "hadith_mendoakan_saudara_gaib" },
];

/** A habit the app can tick by itself from what Quran and Tasbih already record. */
export type JourneyAuto =
    | { source: "quran"; minSeconds: number; href: string }
    | { source: "dhikr"; minCount: number; href: string };

// shortcut: Quran is recorded as reading time, not ayat, so "a page" and "a few ayat" both mean one minute of tilawah. Tune with the reviewer.
const QURAN_AUTO: JourneyAuto = { source: "quran", minSeconds: 60, href: "/quran" };
// One round of tasbih (33) stands for "one minute of dhikr"; Tasbih records counts, not time.
const DHIKR_AUTO: JourneyAuto = { source: "dhikr", minCount: 33, href: "/dhikr" };
const JOURNEY_AUTO: Record<number, JourneyAuto> = { 1: QURAN_AUTO, 2: QURAN_AUTO, 3: DHIKR_AUTO };

/** Today's habit for the phase: the pool rotates by day number, so it is the same for everyone on the same day. */
export function getJourneyHabit(phase: JourneyPhase, dayNumber: number): { copyKey: string; evidence: EvidenceData | null; auto: JourneyAuto | null } {
    const pool = JOURNEY_HABITS.filter(habit => habit.phases.includes(phase));
    const habit = pool[dayNumber % pool.length];
    return { copyKey: `journeyHabit${habit.n}`, evidence: hadith(habit.hadithId), auto: JOURNEY_AUTO[habit.n] ?? null };
}

const QADHA_VERSE = FAQ_DATA.find(item => item.id === "faq_traveling")?.dalil ?? null;

/** Sources behind each phase's meaning, shown in the "About" dialog. */
export const JOURNEY_PHASE_EVIDENCE: Record<JourneyPhase, EvidenceData[]> = {
    reset: [hadith("hadith_intention"), QADHA_VERSE].filter((item): item is EvidenceData => item !== null),
    build: [hadith("hadith_istiqomah_sedikit")].filter((item): item is EvidenceData => item !== null),
    sharpen: [hadith("hadith_syaban_puasa")].filter((item): item is EvidenceData => item !== null),
};

/** The goal of fasting itself (taqwa), shown at the top of the "About" dialog. */
export const JOURNEY_GOAL_EVIDENCE: EvidenceData = FASTING_EVIDENCE;

/** Short, localized reference for a dalil link, e.g. "HR. Bukhari No. 1". */
export function dalilRef(evidence: EvidenceData, locale: string): string {
    return locale === "en" && evidence.shortRef_en ? evidence.shortRef_en : evidence.shortRef;
}
