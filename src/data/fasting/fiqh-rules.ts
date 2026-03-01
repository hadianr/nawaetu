/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Fiqh rules for Ramadan fasting consequences.
 * Based on consensus and ikhtilaf of the four major madzhabs.
 *
 * References:
 * - QS. Al-Baqarah: 183-185, 184 (rukhsah)
 * - Fiqh Al-Sunnah (Sayyid Sabiq)
 * - Al-Fiqh al-Islami wa Adillatuhu (Wahbah al-Zuhaili)
 */

import type { FastingConsequence, FastingStatus, Madzhab } from "./types";

// ─── Status Metadata ────────────────────────────────────────────────────────

export interface FastingStatusMeta {
    icon: string;
    color: string; // CSS class fragment
    // which madzhabs show this status as requiring madzhab selection
    requiresMadzhab: boolean;
    // female-only status?
    femaleOnly: boolean;
    dalil: string;
    dalilTranslation: string; // Indonesian/English meaning of the verse/hadith
}

export const FASTING_STATUS_META: Record<FastingStatus, FastingStatusMeta> = {
    fasting: {
        icon: "✅",
        color: "primary",
        requiresMadzhab: false,
        femaleOnly: false,
        dalil: "QS. Al-Baqarah: 183",
        dalilTranslation: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous.",
    },
    not_fasting: {
        icon: "❌",
        color: "destructive",
        requiresMadzhab: false,
        femaleOnly: false,
        dalil: "QS. Al-Baqarah: 183",
        dalilTranslation: "Fasting has been obligated upon every Muslim who is able. Deliberately breaking the fast without a valid excuse incurs sin and requires making it up (qadha).",
    },
    sick: {
        icon: "🤒",
        color: "amber",
        requiresMadzhab: false,
        femaleOnly: false,
        dalil: "QS. Al-Baqarah: 184",
        dalilTranslation: "And whoever is ill or on a journey — then an equal number of days [are to be made up]. Allah intends for you ease and does not intend for you hardship.",
    },
    traveling: {
        icon: "✈️",
        color: "blue",
        requiresMadzhab: false,
        femaleOnly: false,
        dalil: "QS. Al-Baqarah: 184",
        dalilTranslation: "And whoever is ill or on a journey — then an equal number of days [are to be made up]. Allah intends for you ease and does not intend for you hardship.",
    },
    menstruation: {
        icon: "🌸",
        color: "rose",
        requiresMadzhab: false,
        femaleOnly: true,
        dalil: "HR. Bukhari no. 304, Muslim no. 334",
        dalilTranslation: "Is it not the case that a woman, when she is menstruating, does not pray and does not fast? That is the deficiency in her religion. (The Prophet ﷺ said this explaining it as a dispensation, not a deficiency in her person.)",
    },
    postpartum: {
        icon: "🌺",
        color: "pink",
        requiresMadzhab: false,
        femaleOnly: true,
        dalil: "Ijma' ulama (HR. Bukhari & Muslim)",
        dalilTranslation: "Scholars are unanimous that a woman in postpartum bleeding (nifas) is treated the same as a menstruating woman: she does not fast during that period and must make up the days she missed.",
    },
    pregnant: {
        icon: "🤰",
        color: "purple",
        requiresMadzhab: true,
        femaleOnly: true,
        dalil: "QS. Al-Baqarah: 184 + HR. Abu Dawud no. 2408",
        dalilTranslation: "Allah has lifted from the traveller half the prayer, and from the pregnant woman and the nursing mother the fast. (This hadith provides the basis for the dispensation; scholars differ on whether qadha, fidyah, or both are required.)",
    },
    breastfeeding: {
        icon: "🤱",
        color: "violet",
        requiresMadzhab: true,
        femaleOnly: true,
        dalil: "QS. Al-Baqarah: 184 + HR. Abu Dawud no. 2408",
        dalilTranslation: "Allah has lifted from the traveller half the prayer, and from the pregnant woman and the nursing mother the fast. (This hadith provides the basis for the dispensation; scholars differ on whether qadha, fidyah, or both are required.)",
    },
    elderly: {
        icon: "👴",
        color: "slate",
        requiresMadzhab: false,
        femaleOnly: false,
        dalil: "QS. Al-Baqarah: 184",
        dalilTranslation: "And upon those who are able [to fast, but with hardship] — a ransom [as substitute] of feeding a poor person [each day]. Scholars apply this to the elderly and those with chronic illness who cannot fast.",
    },
};

// ─── Madzhab Options ─────────────────────────────────────────────────────────

export interface MadzhabOption {
    id: Madzhab;
    nameAr: string;
    nameEn: string;
    nameId: string;
    suggestion?: boolean; // is this the recommended default?
    pregnantBreastfeedingConsequence: FastingConsequence;
    pregnantBreastfeedingNote: string;
}

export const MADZHAB_OPTIONS: MadzhabOption[] = [
    {
        id: "syafii",
        nameAr: "الشافعي",
        nameEn: "Shafi'i",
        nameId: "Syafi'i",
        suggestion: true, // Most common in Southeast Asia
        pregnantBreastfeedingConsequence: "choice",
        pregnantBreastfeedingNote:
            "Wajib qadha + fidyah (keduanya). Namun sebagian ulama Syafi'i mengatakan cukup qadha jika tidak mampu fidyah.",
    },
    {
        id: "hanafi",
        nameAr: "الحنفي",
        nameEn: "Hanafi",
        nameId: "Hanafi",
        pregnantBreastfeedingConsequence: "qadha",
        pregnantBreastfeedingNote:
            "Wajib qadha saja, tidak ada kewajiban fidyah untuk hamil/menyusui.",
    },
    {
        id: "maliki",
        nameAr: "المالكي",
        nameEn: "Maliki",
        nameId: "Maliki",
        pregnantBreastfeedingConsequence: "choice",
        pregnantBreastfeedingNote:
            "Jika khawatir terhadap janin/bayi: wajib qadha + fidyah. Jika khawatir pada diri sendiri: qadha saja.",
    },
    {
        id: "hanbali",
        nameAr: "الحنبلي",
        nameEn: "Hanbali",
        nameId: "Hanbali",
        pregnantBreastfeedingConsequence: "qadha",
        pregnantBreastfeedingNote:
            "Wajib qadha saja. Fidyah tidak diwajibkan untuk hamil/menyusui menurut pendapat yang kuat.",
    },
];

// ─── Core Consequence Logic ───────────────────────────────────────────────────

/**
 * Determine the fiqh consequence for a given fasting status and optional madzhab.
 *
 * This is the single source of truth for all consequence calculations in the app.
 */
export function getConsequence(
    status: FastingStatus,
    madzhab?: Madzhab | null
): FastingConsequence {
    switch (status) {
        case "fasting":
            return "none";

        case "not_fasting":
            // Sengaja berbuka tanpa uzur: wajib qadha (ijma')
            // Note: some ulama add kaffarah for intercourse, but we track only qadha obligation
            return "qadha";

        case "sick":
        case "traveling":
            // Rukhsah: boleh berbuka, wajib qadha (QS. Al-Baqarah: 184)
            return "qadha";

        case "menstruation":
        case "postpartum":
            // Wajib berbuka, wajib qadha (ijma')
            return "qadha";

        case "pregnant":
        case "breastfeeding": {
            // Ikhtilaf madzhab — resolve by user's selected madzhab
            if (!madzhab) {
                // Default: show "choice" to prompt madzhab selection
                return "choice";
            }
            const madzhabDef = MADZHAB_OPTIONS.find((m) => m.id === madzhab);
            return madzhabDef?.pregnantBreastfeedingConsequence ?? "choice";
        }

        case "elderly":
            // Sakit permanen yang tidak bisa sembuh: fidyah saja, tanpa qadha
            return "fidyah";

        default:
            return "none";
    }
}

// ─── Fiqh Disclaimer ─────────────────────────────────────────────────────────

export const FIQH_DISCLAIMER = {
    en: "The rulings above are based on scholarly consensus (ijma') and notable scholarly opinions (ikhtilaf) from the four major schools of thought. For complex or personal situations, please consult a trusted scholar.",
    id: "Ketentuan di atas didasarkan pada ijma' ulama dan pendapat-pendapat terkemuka dari empat madzhab utama. Untuk situasi yang kompleks atau personal, konsultasikan dengan ulama yang terpercaya.",
};
