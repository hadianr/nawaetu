import { describe, it, expect } from "vitest";
import { HADITH_LIBRARY, HADITH_TOPIC_DEFINITIONS, getHadithById, getHadithsByCategory } from "../index";
import { DUA_LIBRARY, DUA_OCCASIONS, getDuasByOccasion } from "../../duas/index";
import { resolveReferenceForMission, resolveReferenceByText } from "@/lib/hadith/reference-matcher";
import { createMission } from "../../missions/types";
import { UNIVERSAL_MISSIONS, FEMALE_MISSIONS, MALE_MISSIONS, SUNNAH_PRAYER_MISSIONS, RAMADHAN_MISSIONS, SYABAN_MISSIONS } from "../../missions/index";

describe("Hadith & Dua Modular Data Library Tests", () => {
    it("should have complete and authentic data for all Hadiths", () => {
        expect(HADITH_LIBRARY.length).toBe(116);

        HADITH_LIBRARY.forEach(item => {
            expect(item.id).toBeTruthy();
            expect(item.collection).toBeTruthy();
            expect(item.hadithNumber).toBeDefined();
            expect(item.authenticity).toMatch(/Sahih|Hasan|Muttafaq 'Alaih/);
            expect(item.arabic).toBeTruthy();
            expect(item.translation).toBeTruthy();
        });
    });

    it("should have complete data for all Duas", () => {
        expect(DUA_LIBRARY.length).toBeGreaterThanOrEqual(8);

        DUA_LIBRARY.forEach(item => {
            expect(item.id).toBeTruthy();
            expect(item.occasion).toBeTruthy();
            expect(item.source.referenceText).toBeTruthy();
            expect(item.arabic).toBeTruthy();
            expect(item.translation).toBeTruthy();
        });
    });

    it("should keep library IDs, occasions, and discovery topics valid", () => {
        const ids = [...HADITH_LIBRARY, ...DUA_LIBRARY].map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);

        for (const item of DUA_LIBRARY) {
            expect(item.additionalOccasions || []).not.toContain(item.occasion);
            for (const occasion of item.additionalOccasions || []) {
                expect(DUA_OCCASIONS.some(tab => tab.key === occasion)).toBe(true);
            }
        }

        for (const topic of HADITH_TOPIC_DEFINITIONS) {
            expect(HADITH_LIBRARY.some(item => item.topics?.includes(topic.key))).toBe(true);
        }

        expect(getDuasByOccasion("protection").length).toBeGreaterThan(0);
        expect(getDuasByOccasion("gratitude").length).toBeGreaterThan(1);
    });

    it("should query Hadiths and Duas by category/occasion", () => {
        const hadith = getHadithById("hadith_patience");
        expect(hadith).toBeDefined();
        expect(hadith?.hadithNumber).toBe(223);

        const ramadhanHadiths = getHadithsByCategory("spiritualCategoryRamadhan");
        expect(ramadhanHadiths.length).toBeGreaterThan(0);

        const morningDuas = getDuasByOccasion("morning");
        expect(morningDuas.length).toBeGreaterThan(0);
    });

    it("should dynamically resolve mission dalils to Hadith and Dua references with valid ?id=", () => {
        const intentionMission = createMission({
            id: 'daily_intention',
            title: 'Luruskan Niat',
            description: 'Niat',
            category: 'worship',
            ruling: 'obligatory',
            hasanahReward: 50,
            icon: '🎯',
            dalil: 'HR. Bukhari no. 1',
            hadithId: 'hadith_intention'
        });

        const refIntention = resolveReferenceForMission(intentionMission);
        expect(refIntention).toBeDefined();
        expect(refIntention?.type).toBe("hadith");
        expect(refIntention?.targetUrl).toBe("/hadith?id=hadith_intention");

        const doaPagiMission = createMission({
            id: 'doa_pagi',
            title: 'Dzikir Pagi',
            description: 'Dzikir',
            category: 'dhikr',
            ruling: 'sunnah',
            hasanahReward: 20,
            icon: '🌅',
            dalil: 'HR. Abu Dawud no. 5074',
            duaId: 'dua_perlindungan'
        });

        // The pinned dua is Abu Dawud 5088, not the cited 5074: no link beats a link to a different text.
        expect(resolveReferenceForMission(doaPagiMission)).toBeUndefined();

        const matchingDua = resolveReferenceForMission({ ...doaPagiMission, dalil: 'HR. Abu Dawud no. 5088' });
        expect(matchingDua?.type).toBe("dua");
        expect(matchingDua?.targetUrl).toBe("/dua?id=dua_perlindungan");
    });

    it("does not link a dalil to a different hadith when the cited one is not in the library", () => {
        expect(resolveReferenceByText("HR. Muslim no. 804")).toBeUndefined();
        expect(resolveReferenceByText("QS. Al-Baqarah: 184")).toBeUndefined();
        expect(resolveReferenceByText("HR. Ibnu Majah no. 224")?.targetUrl).toBe("/hadith?id=hadith_ilmu");

        const khatam = createMission({
            id: 'khatam',
            title: 'Khatam',
            description: 'Khatam',
            category: 'quran',
            ruling: 'sunnah',
            hasanahReward: 10,
            icon: '📖',
            dalil: 'HR. Muslim no. 804',
            hadithId: 'hadith_ilmu'
        });
        expect(resolveReferenceForMission(khatam)).toBeUndefined();
    });

    it("should resolve HR. Bukhari no. 1166 specifically to hadith_istikharah", () => {
        const ref = resolveReferenceByText("HR. Bukhari no. 1166");
        expect(ref).toBeDefined();
        expect(ref?.type).toBe("hadith");
        expect(ref?.targetUrl).toBe("/hadith?id=hadith_istikharah");

        const istikharahMission = SUNNAH_PRAYER_MISSIONS.find(m => m.id === "sunnah_istikharah");
        expect(istikharahMission).toBeDefined();
        const missionRef = resolveReferenceForMission(istikharahMission!);
        expect(missionRef?.targetUrl).toBe("/hadith?id=hadith_istikharah");
    });

    it("links every mission dalil only to the hadith or dua it cites", () => {
        const allMissions = [
            ...UNIVERSAL_MISSIONS,
            ...SUNNAH_PRAYER_MISSIONS,
            ...FEMALE_MISSIONS,
            ...MALE_MISSIONS,
            ...RAMADHAN_MISSIONS,
            ...SYABAN_MISSIONS
        ];
        const numbers = (text: string): string[] => text.match(/\d+/g) || [];

        allMissions.forEach(mission => {
            const resolved = resolveReferenceForMission(mission);
            if (!resolved) return;
            const cited = numbers(mission.dalil!);
            const item = resolved.item as { hadithNumber?: string | number; source?: { referenceText: string } };
            const itemRef = resolved.type === "hadith" ? String(item.hadithNumber) : item.source!.referenceText;
            expect(resolved.targetUrl).toContain("?id=");
            expect(numbers(itemRef).some(n => cited.includes(n)), `${mission.id}: ${mission.dalil} -> ${itemRef}`).toBe(true);
        });
    });
});
