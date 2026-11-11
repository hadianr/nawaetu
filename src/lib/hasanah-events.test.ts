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

    it("lets reading time grow during the day up to ten hours", () => {
        expect(ok("quran_time", "time", 12)).toMatchObject({ source: "quran", mode: "raise" });
        expect(ok("quran_time", "time", 601)).toBeNull();
    });
});
