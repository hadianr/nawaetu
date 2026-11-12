import { describe, expect, it } from "vitest";
import { validateHasanahEvent } from "./hasanah-events";

const ok = (kind: string, key: string, amount: number) => validateHasanahEvent({ kind, key, amount, localDate: "2026-11-11" });

describe("validateHasanahEvent", () => {
    it("accepts the fixed awards with their exact amounts and ends the id with the date", () => {
        expect(ok("taraweh", "1447-5", 15)).toMatchObject({ source: "mission", sourceId: "taraweh:1447-5:2026-11-11", hasanah: 15, countsForStreak: true });
        expect(ok("fasting", "1447-12", 20)).not.toBeNull();
        expect(ok("lailatul", "1447-27", 50)).not.toBeNull();
        expect(ok("dhikr_completion", "3", 50)).not.toBeNull();
    });

    it("rejects an amount the client was not entitled to", () => {
        expect(ok("taraweh", "1447-5", 1500)).toBeNull();
        expect(ok("fasting", "1447-12", 21)).toBeNull();
        expect(ok("dhikr_completion", "3", 5000)).toBeNull();
        expect(ok("sirah_quiz", "daily", 5000)).toBeNull();
    });

    it("pays no more than the app can earn: a quiz of five questions, one juz at a time", () => {
        expect(ok("sirah_quiz", "daily", 50)).not.toBeNull();
        expect(ok("sirah_quiz", "daily", 60)).toBeNull();
        expect(ok("sirah_quiz", "daily", 200)).toBeNull();
        expect(ok("khatamah", "2026-12", 20)).not.toBeNull();
        expect(ok("khatamah", "2026-12", 600)).toBeNull();
        expect(ok("khatamah", "2026-12", 40)).toBeNull();
    });

    it("accepts a reflection only at the two amounts the app pays", () => {
        expect(ok("reflection", "daily", 50)).toMatchObject({ sourceId: "reflection:daily:2026-11-11", countsForStreak: true });
        expect(ok("reflection", "daily", 25)).not.toBeNull();
        expect(ok("reflection", "daily", 500)).toBeNull();
    });

    it("rejects unknown kinds, malformed keys, bad dates and fractions", () => {
        expect(ok("jackpot", "x", 100)).toBeNull();
        expect(ok("taraweh", "1447-31", 15)).toBeNull();
        expect(ok("taraweh", "x".repeat(60), 15)).toBeNull();
        expect(validateHasanahEvent({ kind: "taraweh", key: "1447-5", amount: 15, localDate: "yesterday" })).toBeNull();
        expect(ok("taraweh", "1447-5", 15.5)).toBeNull();
    });

    it("takes milestone amounts from the real tables and keeps them out of the streak", () => {
        expect(ok("streak_milestone", "7", 100)).toMatchObject({ source: "streak_milestone", sourceId: "streak_milestone:7", countsForStreak: false });
        expect(ok("streak_milestone", "7", 500)).toBeNull();
        expect(ok("dhikr_milestone", "1000", 200)).toMatchObject({ countsForStreak: false });
        expect(ok("dhikr_milestone", "1000", 999)).toBeNull();
    });

    it("lets reading time grow during the day, and pays at most ten hours instead of refusing more", () => {
        expect(ok("quran_time", "time", 12)).toMatchObject({ source: "quran", mode: "raise", hasanah: 12 });
        expect(ok("quran_time", "time", 601)).toMatchObject({ hasanah: 600 });
        expect(ok("quran_time", "time", 5000)).toMatchObject({ hasanah: 600 });
    });
});
