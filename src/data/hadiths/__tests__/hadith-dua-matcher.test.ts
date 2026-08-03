import { describe, it, expect } from "vitest";
import { HADITH_LIBRARY, getHadithById, getHadithsByCategory } from "../index";
import { DUA_LIBRARY, getDuaById, getDuasByOccasion } from "../../duas/index";
import { resolveReferenceForMission, resolveReferenceByText } from "@/lib/hadith/reference-matcher";
import { createMission } from "../../missions/types";
import { UNIVERSAL_MISSIONS, FEMALE_MISSIONS, MALE_MISSIONS, SUNNAH_PRAYER_MISSIONS, RAMADHAN_MISSIONS, SYABAN_MISSIONS } from "../../missions/index";

describe("Hadith & Dua Modular Data Library Tests", () => {
    it("should have complete and authentic data for all Hadiths", () => {
        expect(HADITH_LIBRARY.length).toBe(100);

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

        const refDoa = resolveReferenceForMission(doaPagiMission);
        expect(refDoa).toBeDefined();
        expect(refDoa?.type).toBe("dua");
        expect(refDoa?.targetUrl).toBe("/dua?id=dua_perlindungan");
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

    it("should ensure ALL missions with Hadith/Dua dalil in the app resolve to valid ?id= targetUrl", () => {
        const allMissions = [
            ...UNIVERSAL_MISSIONS,
            ...SUNNAH_PRAYER_MISSIONS,
            ...FEMALE_MISSIONS,
            ...MALE_MISSIONS,
            ...RAMADHAN_MISSIONS,
            ...SYABAN_MISSIONS
        ];
        
        allMissions.forEach(mission => {
            if (mission.dalil && (mission.hadithId || mission.duaId || /^hr\./i.test(mission.dalil) || /doa/i.test(mission.dalil))) {
                const resolved = resolveReferenceForMission(mission);
                expect(resolved).toBeDefined();
                expect(resolved?.targetUrl).toContain("?id=");
            }
        });
    });
});
