import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
    ledgerInserted: [] as Array<{ amount: number }>,
    daysInserted: [] as Array<{ localDate: string }>,
    progress: null as Record<string, unknown> | null,
    streak: null as Record<string, unknown> | null,
    qualifiedDays: [] as Array<{ localDate: string }>,
    calls: [] as string[],
    ledgerValues: [] as unknown[],
    streakUpserts: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/db/schema", () => ({
    hasanahLedger: { table: "ledger" },
    userProgressState: { table: "progress" },
    userStreakDays: { table: "days" },
    userStreakState: { table: "state" },
}));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), asc: vi.fn(), eq: vi.fn(), sql: vi.fn() }));

vi.mock("@/db", () => {
    const tx = {
        execute: vi.fn(async () => { state.calls.push("lock"); }),
        insert: (table: unknown) => {
            const chain: Record<string, unknown> = {};
            chain.values = (rows: unknown) => {
                if (table === hasanahLedger) state.ledgerValues.push(rows);
                if (table === userStreakState) state.streakUpserts.push(rows as Record<string, unknown>);
                return chain;
            };
            chain.onConflictDoNothing = () => chain;
            chain.onConflictDoUpdate = () => chain;
            chain.returning = async () => {
                if (table === hasanahLedger) return state.ledgerInserted;
                if (table === userStreakDays) return state.daysInserted;
                if (table === userProgressState) return [{ hasanahTotal: 1 }];
                return [{}];
            };
            return chain;
        },
        query: {
            userProgressState: { findFirst: vi.fn(async () => state.progress) },
            userStreakState: { findFirst: vi.fn(async () => state.streak) },
            userStreakDays: { findMany: vi.fn(async () => { state.calls.push("history"); return state.qualifiedDays; }) },
        },
    };
    return { transactionDb: { transaction: async (fn: (t: typeof tx) => unknown) => fn(tx) } };
});

import { hasanahLedger, userProgressState, userStreakDays, userStreakState } from "@/db/schema";
import { processProgressionEvidenceBatch } from "./progression.repository";

const evidence = (sourceId: string, localDate: string, hasanah = 10) => ({
    source: "mission" as const, sourceId, hasanah, localDate, occurredAt: new Date(`${localDate}T05:00:00Z`), timezone: "UTC",
});

describe("processProgressionEvidenceBatch", () => {
    beforeEach(() => {
        Object.assign(state, {
            ledgerInserted: [], daysInserted: [], progress: { hasanahTotal: 100, level: 2 },
            streak: { currentDays: 3, longestDays: 3, lastStreakDate: "2026-11-10", freezesAvailable: 0 },
            qualifiedDays: [], calls: [], ledgerValues: [], streakUpserts: [],
        });
    });

    it("writes any number of items with one ledger insert and one lock", async () => {
        state.ledgerInserted = [{ amount: 10 }, { amount: 10 }, { amount: 10 }];
        state.daysInserted = [{ localDate: "2026-11-11" }];

        const result = await processProgressionEvidenceBatch("u1", [
            evidence("a:2026-11-11", "2026-11-11"), evidence("b:2026-11-11", "2026-11-11"), evidence("c:2026-11-11", "2026-11-11"),
        ]);

        expect(state.ledgerValues).toHaveLength(1);
        expect(state.ledgerValues[0]).toHaveLength(3);
        expect(state.calls.filter((call) => call === "lock")).toHaveLength(1);
        expect(result.inserted).toBe(3);
    });

    it("continues the streak from the stored state without reading the whole history", async () => {
        state.ledgerInserted = [{ amount: 10 }];
        state.daysInserted = [{ localDate: "2026-11-11" }];

        await processProgressionEvidenceBatch("u1", [evidence("a:2026-11-11", "2026-11-11")]);

        expect(state.calls).not.toContain("history");
        expect(state.streakUpserts[0]).toMatchObject({ currentDays: 4, lastStreakDate: "2026-11-11" });
    });

    it("does not touch the streak for a second item on a day that already counts", async () => {
        state.ledgerInserted = [{ amount: 10 }];
        state.daysInserted = []; // the day row already existed

        await processProgressionEvidenceBatch("u1", [evidence("b:2026-11-10", "2026-11-10")]);

        expect(state.streakUpserts).toHaveLength(0);
        expect(state.calls).not.toContain("history");
    });

    it("rebuilds from history only when an older day arrives late", async () => {
        state.ledgerInserted = [{ amount: 10 }];
        state.daysInserted = [{ localDate: "2026-11-05" }];
        state.qualifiedDays = ["2026-11-05", "2026-11-09", "2026-11-10"].map((localDate) => ({ localDate }));

        await processProgressionEvidenceBatch("u1", [evidence("a:2026-11-05", "2026-11-05")]);

        expect(state.calls).toContain("history");
        expect(state.streakUpserts[0]).toMatchObject({ lastStreakDate: "2026-11-10" });
    });

    it("does not count a streak milestone as a day of activity", async () => {
        state.ledgerInserted = [{ amount: 50 }];

        await processProgressionEvidenceBatch("u1", [{ ...evidence("streak:7", "2026-11-11", 50), source: "streak_milestone", countsForStreak: false }]);

        expect(state.streakUpserts).toHaveLength(0);
    });

    it("rejects an invalid amount before touching the database", async () => {
        await expect(processProgressionEvidenceBatch("u1", [evidence("a:2026-11-11", "2026-11-11", -5)])).rejects.toThrow("Invalid canonical Hasanah award");
        expect(state.calls).toHaveLength(0);
    });
});
