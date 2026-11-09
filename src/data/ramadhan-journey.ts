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

// Each habit points at an existing library hadith. Any new or changed pairing needs religious review.
export const JOURNEY_HABITS: HabitDef[] = [
    { n: 1, phases: ["build", "sharpen"], hadithId: "hadith_istiqomah_sedikit" },
    { n: 2, phases: ["reset"], hadithId: "hadith_meninggalkan_hal_unuse" },
    { n: 3, phases: ["reset"], hadithId: "hadith_dzikir" },
    { n: 4, phases: ["build", "sharpen"], hadithId: "hadith_sholat_awal_waktu" },
    { n: 5, phases: ["reset"], hadithId: "hadith_syukur_nikmat_kecil" },
    { n: 6, phases: ["sharpen"], hadithId: "hadith_sahur" },
    { n: 7, phases: ["reset"], hadithId: "hadith_berkata_baik_atau_diam" },
    { n: 8, phases: ["build"], hadithId: "hadith_sedekah_subuh" },
    { n: 9, phases: ["build"], hadithId: "hadith_silaturrahim" },
    { n: 10, phases: ["sharpen"], hadithId: "hadith_menjaga_kesehatan_mental" },
    { n: 11, phases: ["reset", "sharpen"], hadithId: "hadith_intention" },
    { n: 12, phases: ["build", "sharpen"], hadithId: "hadith_surah_al_mulk" },
    { n: 13, phases: ["reset"], hadithId: "hadith_dua_nikmat_terperdaya" },
    { n: 14, phases: ["build"], hadithId: "hadith_mendoakan_saudara_gaib" },
];

/** Today's habit for the phase: the pool rotates by day number, so it is the same for everyone on the same day. */
export function getJourneyHabit(phase: JourneyPhase, dayNumber: number): { copyKey: string; evidence: EvidenceData | null } {
    const pool = JOURNEY_HABITS.filter(habit => habit.phases.includes(phase));
    const habit = pool[dayNumber % pool.length];
    return { copyKey: `journeyHabit${habit.n}`, evidence: hadith(habit.hadithId) };
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
