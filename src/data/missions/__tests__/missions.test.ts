/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { createMission } from "../types";
import { resolveRitualForGender, BASE_PRAYER_MISSIONS, UNIVERSAL_MISSIONS } from "../daily";
import { getMissionsForGender, getLocalizedMissionContent, getLocalizedMission } from "../index";

describe("Missions Architecture & Filtering Unit Tests", () => {

    describe("1. Standardized Factory Pattern (createMission)", () => {
        it("creates a complete mission object with defaults", () => {
            const mission = createMission({
                id: "test_mission",
                title: "Test Worship",
                description: "Test Description",
                category: "worship",
                ruling: "sunnah",
                hasanahReward: 50,
                icon: "✨"
            });

            expect(mission).toEqual({
                id: "test_mission",
                title: "Test Worship",
                description: "Test Description",
                category: "worship",
                ruling: "sunnah",
                hasanahReward: 50,
                icon: "✨",
                gender: null,
                dalil: undefined,
                type: "daily",
                validationType: "manual",
                validationConfig: undefined,
                phase: "all_year",
                completionOptions: undefined
            });
        });
    });

    describe("2. Polymorphic Ritual Decorator (resolveRitualForGender)", () => {
        it("decorates prayer missions for male users with congregation options and male dalil", () => {
            const baseFajr = BASE_PRAYER_MISSIONS.find(m => m.id === "fajr_prayer")!;
            const maleFajr = resolveRitualForGender(baseFajr, "male");

            expect(maleFajr.gender).toBe("male");
            expect(maleFajr.description).toContain("Berjamaah");
            expect(maleFajr.dalil).toContain("HR. Bukhari");
            expect(maleFajr.completionOptions).toHaveLength(2);
            expect(maleFajr.completionOptions![1].label).toBe("Congregation");
        });

        it("decorates prayer missions for female users with home prayer recommendations", () => {
            const femaleFajr = resolveRitualForGender(BASE_PRAYER_MISSIONS.find(m => m.id === "fajr_prayer")!, "female");

            expect(femaleFajr.gender).toBe("female");
            expect(femaleFajr.description).toContain("tepat waktu");
            expect(femaleFajr.dalil).toContain("HR. Abu Dawud");
            expect(femaleFajr.completionOptions).toBeUndefined();
        });

        it("returns non-prayer missions unchanged", () => {
            const baseDhikr = UNIVERSAL_MISSIONS.find(m => m.id === "tasbih_99")!;
            const decorated = resolveRitualForGender(baseDhikr, "male");

            expect(decorated).toEqual(baseDhikr);
        });
    });

    describe("3. Day of Week Filtering (allowedDays)", () => {
        it("excludes Friday prayer and includes Dhuhr on non-Friday (Tuesday = day 2)", () => {
            const tuesdayIndex = 2; // Tuesday
            const missions = getMissionsForGender("male", undefined, undefined, tuesdayIndex);
            const missionIds = missions.map(m => m.id);

            expect(missionIds).not.toContain("friday_prayer");
            expect(missionIds).toContain("dhuhr_prayer");
            expect(missionIds).not.toContain("sunnah_fasting"); // Monday/Thursday fasting
        });

        it("includes Monday/Thursday fasting on Monday (day 1)", () => {
            const mondayIndex = 1; // Monday
            const missions = getMissionsForGender("male", undefined, undefined, mondayIndex);
            const missionIds = missions.map(m => m.id);

            expect(missionIds).toContain("sunnah_fasting");
        });

        it("includes Friday prayer on Friday (day 5)", () => {
            const fridayIndex = 5; // Friday
            const missions = getMissionsForGender("male", undefined, undefined, fridayIndex);
            const missionIds = missions.map(m => m.id);

            expect(missionIds).toContain("friday_prayer");
        });
    });

    describe("4. Hijri Date Visibility Filtering", () => {
        it("excludes Eid Al-Fitr prayer on ordinary days", () => {
            const missions = getMissionsForGender("male", "Safar", 15, 2);
            const missionIds = missions.map(m => m.id);

            expect(missionIds).not.toContain("sunnah_eid_fitri");
            expect(missionIds).not.toContain("sunnah_eid_adha");
        });

        it("includes Eid Al-Fitr prayer on 1st Shawwal", () => {
            const missions = getMissionsForGender("male", "Shawwal", 1, 3);
            const missionIds = missions.map(m => m.id);

            expect(missionIds).toContain("sunnah_eid_fitri");
        });
    });

    describe("5. Qunut Supplication & Readings Localization", () => {
        it("localizes Doa Qunut title, translation, and note in English", () => {
            const content = getLocalizedMissionContent("fajr_prayer", "en");

            expect(content).not.toBeNull();
            expect(content!.readings).toBeDefined();
            expect(content!.readings![0].title).toBe("Qunut Supplication");
            expect(content!.readings![0].translation).toContain("O Allah, guide me among those You have guided");
            expect(content!.readings![0].note).toBe("Sunnah Mu'akkadah (Shafi'i)");
        });

        it("localizes Doa Qunut title, translation, and note in Indonesian", () => {
            const content = getLocalizedMissionContent("fajr_prayer", "id");

            expect(content).not.toBeNull();
            expect(content!.readings).toBeDefined();
            expect(content!.readings![0].title).toBe("Doa Qunut");
            expect(content!.readings![0].translation).toContain("Ya Allah, berilah aku petunjuk");
            expect(content!.readings![0].note).toBe("Sunnah Muakkad (Syafi'i)");
        });
    });

    describe("6. 5-Tab Categorization (Obligatory, Sunnah Prayer, Dhikr, Recommended)", () => {
        it("correctly filters missions into 5 distinct categories", () => {
            const allMissions = getMissionsForGender("male");

            const obligatory = allMissions.filter(m => m.ruling === 'obligatory');
            const sunnahPrayers = allMissions.filter(m => m.category === 'prayer' && m.ruling !== 'obligatory');
            const dhikr = allMissions.filter(m => m.category === 'dhikr');
            const recommended = allMissions.filter(m => m.ruling === 'sunnah' || m.ruling === 'permissible');

            expect(obligatory.length).toBeGreaterThan(0);
            expect(sunnahPrayers.length).toBeGreaterThan(0);
            expect(dhikr.length).toBeGreaterThan(0);
            expect(recommended.length).toBeGreaterThan(0);

            // Obligatory prayers should contain Fajr
            expect(obligatory.map(m => m.id)).toContain("fajr_prayer");

            // Sunnah prayers should contain Qobliyah Fajr
            expect(sunnahPrayers.map(m => m.id)).toContain("sunnah_qobliyah_fajr");

            // Dhikr should contain Tasbih 99
            expect(dhikr.map(m => m.id)).toContain("tasbih_99");
        });
    });

    describe("7. Sunnah Prayer Localization in English & Indonesian", () => {
        it("returns localized English content for Sunnah prayers", () => {
            const content = getLocalizedMissionContent("sunnah_qobliyah_fajr", "en");

            expect(content).not.toBeNull();
            expect(content!.intro).toContain("Two rakaat that are more valuable than the world");
            expect(content!.fadhilah![0]).toBe("Better than the world and everything in it");
            expect(content!.niat!.munfarid.title).toBe("Qobliyah Fajr Intention");
            expect(content!.niat!.munfarid.translation).toContain("Sunnah prayer before Fajr");
        });

        it("returns localized Indonesian content for Sunnah prayers", () => {
            const content = getLocalizedMissionContent("sunnah_qobliyah_fajr", "id");

            expect(content).not.toBeNull();
            expect(content!.intro).toContain("Dua rakaat yang lebih berharga dari dunia");
            expect(content!.fadhilah![0]).toBe("Lebih baik dari dunia dan seisinya");
            expect(content!.niat!.munfarid.title).toBe("Niat Qobliyah Subuh");
            expect(content!.niat!.munfarid.translation).toContain("shalat sunat sebelum subuh");
        });
    });

    describe("8. Dhikr Content Localization in English & Indonesian", () => {
        it("returns localized English content for Dhikr missions", () => {
            const content = getLocalizedMissionContent("tasbih_99", "en");

            expect(content).not.toBeNull();
            expect(content!.intro).toContain("Tasbih 99x is a post-prayer dhikr");
            expect(content!.fadhilah![0]).toContain("Forgiveness of sins");
            expect(content!.readings![0].title).toBe("Subhanallah (Tasbih)");
            expect(content!.readings![0].translation).toBe("Glory be to Allah");
        });

        it("returns localized Indonesian content for Dhikr missions", () => {
            const content = getLocalizedMissionContent("tasbih_99", "id");

            expect(content).not.toBeNull();
            expect(content!.intro).toContain("Tasbih 99x adalah dzikir ba'da sholat");
            expect(content!.fadhilah![0]).toContain("Diampuni dosanya");
            expect(content!.readings![0].title).toBe("Subhanallah (Tasbih)");
            expect(content!.readings![0].translation).toBe("Maha Suci Allah");
        });
    });

    describe("9. Fasting & Quran Content Localization in English & Indonesian", () => {
        it("returns localized English content for Fasting and Quran missions", () => {
            const fastingContent = getLocalizedMissionContent("sunnah_fasting", "en");
            expect(fastingContent).not.toBeNull();
            expect(fastingContent!.intro).toContain("Fasting on Mondays and Thursdays");
            expect(fastingContent!.fadhilah![0]).toContain("Ar-Rayyan");

            const quranContent = getLocalizedMissionContent("quran_10_ayat", "en");
            expect(quranContent).not.toBeNull();
            expect(quranContent!.intro).toContain("Reciting the Quran is a trade");
            expect(quranContent!.guides![0]).toContain("Perform ablution");
        });

        it("returns localized Indonesian content for Fasting and Quran missions", () => {
            const fastingContent = getLocalizedMissionContent("sunnah_fasting", "id");
            expect(fastingContent).not.toBeNull();
            expect(fastingContent!.intro).toContain("Puasa Senin dan Kamis");
            expect(fastingContent!.fadhilah![0]).toContain("Ar-Rayyan");

            const quranContent = getLocalizedMissionContent("quran_10_ayat", "id");
            expect(quranContent).not.toBeNull();
            expect(quranContent!.intro).toContain("Membaca Al-Quran adalah perdagangan");
            expect(quranContent!.guides![0]).toContain("Berwudhu sebelum membaca");
        });
    });

    describe("10. Specific Surah Quran Missions", () => {
        it("includes new Surah missions in quran category", () => {
            const universalMissions = UNIVERSAL_MISSIONS;
            const surahIds = ["read_surah_al_mulk", "read_surah_al_waqiah", "read_surah_ar_rahman", "read_surah_al_kahf", "read_surah_yasin"];

            surahIds.forEach(id => {
                const found = universalMissions.find(m => m.id === id);
                expect(found).toBeDefined();
                expect(found!.category).toBe("quran");
                expect(found!.ruling).toBe("sunnah");

                const contentEn = getLocalizedMissionContent(id, "en");
                expect(contentEn).not.toBeNull();
                expect(contentEn!.intro).toBeDefined();
                expect(contentEn!.fadhilah.length).toBeGreaterThan(0);

                const contentId = getLocalizedMissionContent(id, "id");
                expect(contentId).not.toBeNull();
                expect(contentId!.intro).toBeDefined();
                expect(contentId!.fadhilah.length).toBeGreaterThan(0);
            });
        });
    });

    describe("11. Mission Evidence Source Uniformity & Non-Redundancy", () => {
        it("asserts all missions across all genders and locales (EN & ID) follow standardized dalil tags (QS. or HR.)", () => {
            const genders: ('male' | 'female')[] = ['male', 'female'];
            const locales: ('en' | 'id')[] = ['en', 'id'];

            genders.forEach((gender) => {
                const missions = getMissionsForGender(gender);
                missions.forEach((mission) => {
                    locales.forEach((locale) => {
                        const localizedMission = getLocalizedMission(mission, locale);
                        const dalilToTest = localizedMission.dalil;

                        if (dalilToTest) {
                            const tokens = dalilToTest.split(/[\|\n;]/).map((s: string) => s.trim()).filter(Boolean);
                            expect(tokens.length).toBeGreaterThan(0);
                            tokens.forEach((token: string) => {
                                const isStandardized = /^(QS\.|HR\.)/i.test(token);
                                expect(isStandardized).toBe(true);
                                expect(token.length).toBeLessThan(70);

                                if (/^HR\./i.test(token)) {
                                    expect(token).toMatch(/no\.\s*\d+/i);
                                }
                            });
                        }
                    });
                });
            });
        });

        it("asserts dual evidence (Quran + Hadith) in a single dalil field parses into multiple distinct tokens", () => {
            const allMissions = getMissionsForGender("female");
            const sholawat = allMissions.find(m => m.id === "salawat_100x");

            expect(sholawat).toBeDefined();
            expect(sholawat!.dalil).toContain("QS.");
            expect(sholawat!.dalil).toContain("HR.");

            const tokens = sholawat!.dalil!.split(/[\|\n;]/).map(s => s.trim());
            expect(tokens.length).toBeGreaterThanOrEqual(2);
            expect(tokens[0]).toContain("QS.");
            expect(tokens[1]).toContain("HR.");
        });
    });
});
