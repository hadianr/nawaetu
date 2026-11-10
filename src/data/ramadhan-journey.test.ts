import { describe, expect, it } from "vitest";
import { getHadithById } from "@/data/hadiths";
import { JOURNEY_GOAL_EVIDENCE, JOURNEY_HABITS, JOURNEY_PHASE_EVIDENCE, getJourneyHabit, hadithToEvidence } from "@/data/ramadhan-journey";
import { journeyEN } from "@/data/translations/en/journey";
import { journeyID } from "@/data/translations/id/journey";
import type { JourneyPhase } from "@/lib/ramadhan-journey";

const PHASES: JourneyPhase[] = ["reset", "build", "sharpen"];

describe("journey habits and their dalil", () => {
    it("points every habit at a hadith that exists in the library, with Arabic text and a reference", () => {
        for (const habit of JOURNEY_HABITS) {
            const item = getHadithById(habit.hadithId);
            expect(item, `missing hadith ${habit.hadithId}`).toBeDefined();
            expect(item?.arabic.length).toBeGreaterThan(0);
            expect(item?.hadithNumber).toBeTruthy();
        }
    });

    it("has copy for every habit in both languages", () => {
        for (const habit of JOURNEY_HABITS) {
            const key = `journeyHabit${habit.n}` as keyof typeof journeyEN;
            expect(journeyEN[key], `EN ${key}`).toBeTruthy();
            expect(journeyID[key as keyof typeof journeyID], `ID ${key}`).toBeTruthy();
        }
    });

    it("keeps English and Indonesian journey keys identical", () => {
        expect(Object.keys(journeyID).sort()).toEqual(Object.keys(journeyEN).sort());
    });

    it("gives every phase a real pool, and always returns a habit with its dalil", () => {
        for (const phase of PHASES) {
            expect(JOURNEY_HABITS.filter(habit => habit.phases.includes(phase)).length).toBeGreaterThanOrEqual(4);
            for (let day = 1; day <= 100; day++) {
                const { copyKey, evidence } = getJourneyHabit(phase, day);
                expect(copyKey).toMatch(/^journeyHabit\d+$/);
                expect(evidence?.shortRef).toMatch(/^HR\. /);
            }
        }
    });

    it("rotates: consecutive days in a phase differ, and the same day is the same for everyone", () => {
        expect(getJourneyHabit("build", 40).copyKey).not.toBe(getJourneyHabit("build", 41).copyKey);
        expect(getJourneyHabit("build", 40)).toEqual(getJourneyHabit("build", 40));
    });

    it("has sources for every phase, including the qadha verse in the first", () => {
        for (const phase of PHASES) expect(JOURNEY_PHASE_EVIDENCE[phase].length).toBeGreaterThan(0);
        expect(JOURNEY_PHASE_EVIDENCE.reset.some(item => item.shortRef.startsWith("QS. Al-Baqarah: 184"))).toBe(true);
        expect(JOURNEY_GOAL_EVIDENCE.shortRef).toBe("QS. Al-Baqarah: 183");
    });

    it("maps a hadith to the dalil dialog shape, English included", () => {
        const item = getHadithById("hadith_intention")!;
        const evidence = hadithToEvidence(item);
        expect(evidence.shortRef).toBe("HR. Bukhari No. 1");
        expect(evidence.shortRef_en).toBe("Bukhari No. 1");
        expect(evidence.translation_en).toBe(item.translationEn);
        expect(evidence.source).toContain("Muttafaq 'Alaih");
    });
});
