/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dynamic Reference Resolution Utility
 * Matches Mission dalil strings and reference text dynamically to Hadith & Dua records.
 */

import { HADITH_LIBRARY, HadithItem, HADITH_COLLECTIONS } from "@/data/hadiths";
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
export function resolveReferenceByText(text: string): ResolvedReference | undefined {
    if (!text) return undefined;

    const normalized = text.toLowerCase().trim();

    // 1. Check Hadith library exact matchers
    const matchedHadith = HADITH_LIBRARY.find(h => {
        const collection = h.collection.toLowerCase();
        const hNumStr = String(h.hadithNumber).toLowerCase();
        const matchesCollection = normalized.includes(collection);

        if (!matchesCollection) return false;

        const numbersInHNum: string[] = hNumStr.match(/\d+/g) || [];
        const numbersInText: string[] = normalized.match(/\d+/g) || [];

        return numbersInHNum.length > 0 && numbersInHNum.some(n => numbersInText.includes(n));
    });

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

    // 3. Collection-level fallback: Find first Hadith from that collection
    const matchedCollectionHadith = HADITH_LIBRARY.find(h => {
        return normalized.includes(h.collection.toLowerCase());
    });

    if (matchedCollectionHadith) {
        return {
            type: "hadith",
            item: matchedCollectionHadith,
            targetUrl: `/hadith?id=${matchedCollectionHadith.id}`
        };
    }

    // 4. Hadith general fallback (default to first Hadith in library so ?id= is always present)
    if (/^hr\./i.test(normalized) || HADITH_COLLECTIONS.some(col => normalized.includes(col.toLowerCase()))) {
        const defaultHadith = HADITH_LIBRARY[0];
        return {
            type: "hadith",
            item: defaultHadith,
            targetUrl: `/hadith?id=${defaultHadith.id}`
        };
    }

    // 5. Dua general fallback (default to first Dua in library)
    if (/^dua/i.test(normalized) || normalized.includes("doa") || normalized.includes("dzikir")) {
        const defaultDua = DUA_LIBRARY[0];
        return {
            type: "dua",
            item: defaultDua,
            targetUrl: `/dua?id=${defaultDua.id}`
        };
    }

    return undefined;
}

/**
 * Dynamically resolves a Hadith or Dua reference for a given Mission.
 */
export function resolveReferenceForMission(mission: Mission): ResolvedReference | undefined {
    // 1. Direct ID matching (takes absolute priority)
    if (mission.hadithId) {
        const hadith = HADITH_LIBRARY.find(h => h.id === mission.hadithId);
        if (hadith) {
            return {
                type: "hadith",
                item: hadith,
                targetUrl: `/hadith?id=${hadith.id}`
            };
        }
    }

    if (mission.duaId) {
        const dua = DUA_LIBRARY.find(d => d.id === mission.duaId);
        if (dua) {
            return {
                type: "dua",
                item: dua,
                targetUrl: `/dua?id=${dua.id}`
            };
        }
    }

    // 2. Dynamic Text/Dalil Matching fallback
    if (!mission.dalil) return undefined;

    return resolveReferenceByText(mission.dalil) || {
        type: "hadith",
        item: HADITH_LIBRARY[0],
        targetUrl: `/hadith?id=${HADITH_LIBRARY[0].id}`
    };
}
