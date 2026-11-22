/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dynamic Reference Resolution Utility
 * Matches Mission dalil strings and reference text dynamically to Hadith & Dua records.
 */

import { HADITH_LIBRARY, HadithItem } from "@/data/hadiths";
import { DUA_LIBRARY, DuaItem } from "@/data/duas";
import { Mission } from "@/data/missions/types";

export interface ResolvedReference {
    type: "hadith" | "dua";
    item?: HadithItem | DuaItem;
    targetUrl: string;
}

/**
 * Dynamically resolves a Hadith or Dua reference for a given reference text token.
 */
function numbersIn(text: string): string[] {
    return text.match(/\d+/g) || [];
}

/** True when the text names this hadith's collection and one of its numbers. */
function citesHadith(normalized: string, hadith: HadithItem): boolean {
    // Indonesian dalil write "Ibnu Majah"; the library uses "Ibn Majah".
    if (!normalized.replace(/\bibnu\b/g, "ibn").includes(hadith.collection.toLowerCase())) return false;
    const textNumbers = numbersIn(normalized);
    return numbersIn(String(hadith.hadithNumber)).some(n => textNumbers.includes(n));
}

/** True when the text shares a reference number with this dua's source. */
function citesDua(normalized: string, dua: DuaItem): boolean {
    const textNumbers = numbersIn(normalized);
    return numbersIn(dua.source.referenceText).some(n => textNumbers.includes(n));
}

/**
 * Finds the library item that the text cites. Returns undefined when the cited hadith or dua
 * is not in the library, so the UI shows the reference without linking to a different text.
 */
export function resolveReferenceByText(text: string): ResolvedReference | undefined {
    if (!text) return undefined;

    const normalized = text.toLowerCase().trim();

    // 1. Check Hadith library exact matchers
    const matchedHadith = HADITH_LIBRARY.find(h => citesHadith(normalized, h));

    if (matchedHadith) {
        return {
            type: "hadith",
            item: matchedHadith,
            targetUrl: `/hadith?id=${matchedHadith.id}`
        };
    }

    // 2. Check Dua library matchers
    const matchedDua = DUA_LIBRARY.find(d => {
        const refText = d.source.referenceText.toLowerCase();
        return refText.includes(normalized) || normalized.includes(refText) || normalized.includes(d.id);
    });

    if (matchedDua) {
        return {
            type: "dua",
            item: matchedDua,
            targetUrl: `/dua?id=${matchedDua.id}`
        };
    }

    return undefined;
}

/**
 * Dynamically resolves a Hadith or Dua reference for a given Mission.
 */
export function resolveReferenceForMission(mission: Mission): ResolvedReference | undefined {
    if (!mission.dalil) return undefined;
    const normalized = mission.dalil.toLowerCase().trim();

    // 1. A pinned id wins, but only when it is the text the dalil cites.
    if (mission.hadithId) {
        const hadith = HADITH_LIBRARY.find(h => h.id === mission.hadithId);
        if (hadith && citesHadith(normalized, hadith)) {
            return { type: "hadith", item: hadith, targetUrl: `/hadith?id=${hadith.id}` };
        }
    }

    if (mission.duaId) {
        const dua = DUA_LIBRARY.find(d => d.id === mission.duaId);
        if (dua && citesDua(normalized, dua)) {
            return { type: "dua", item: dua, targetUrl: `/dua?id=${dua.id}` };
        }
    }

    // 2. Otherwise match the cited reference itself.
    return resolveReferenceByText(mission.dalil);
}
