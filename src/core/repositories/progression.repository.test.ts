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
    dayValues: [] as Array<Record<string, unknown>>,
    dayConflicts: [] as Array<Record<string, unknown>>,
    frozenExisting: [] as Array<{ localDate: string }>,
    findManyCalls: 0,
    deletes: [] as string[],
}));

vi.mock("@/db/schema", () => ({
    hasanahLedger: { table: "ledger" },
    userProgressState: { table: "progress" },
    userStreakDays: { table: "days" },
    userStreakState: { table: "state" },
}));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), asc: vi.fn(), eq: vi.fn(() => ({ op: "eq" })), inArray: vi.fn(), sql: vi.fn() }));

vi.mock("@/db", () => {
    const tx = {
        execute: vi.fn(async () => { state.calls.push("lock"); }),
        insert: (table: unknown) => {
            const chain: Record<string, unknown> = {};
            chain.values = (rows: unknown) => {
                if (table === hasanahLedger) state.ledgerValues.push(rows);
                if (table === userStreakState) state.streakUpserts.push(rows as Record<string, unknown>);
                if (table === userStreakDays) state.dayValues.push(...(rows as Array<Record<string, unknown>>));
                return chain;
            };
            chain.onConflictDoNothing = () => chain;
            chain.onConflictDoUpdate = (arg: Record<string, unknown>) => {
                if (table === userStreakDays) state.dayConflicts.push(arg);
                return chain;
            };
            chain.returning = async () => {
                if (table === hasanahLedger) return state.ledgerInserted;
                if (table === userStreakDays) return state.daysInserted;
                if (table === userProgressState) return [{ hasanahTotal: 1 }];
                return [{}];
            };
            return chain;
        },
        delete: (table: unknown) => ({
            where: async () => { state.deletes.push(table === userStreakDays ? "days" : "other"); },
        }),
        query: {
            userProgressState: { findFirst: vi.fn(async () => state.progress) },
            userStreakState: { findFirst: vi.fn(async () => state.streak) },
            // First read is the qualified history, a second one (if any) is the frozen days being reconciled.
            userStreakDays: { findMany: vi.fn(async () => {
                state.findManyCalls++;
                if (state.findManyCalls === 1) { state.calls.push("history"); return state.qualifiedDays; }
                return state.frozenExisting;
            }) },
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
            dayValues: [], dayConflicts: [], frozenExisting: [], findManyCalls: 0, deletes: [],
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

    describe("frozen days", () => {
        it("stores the missed day a freeze protected when the streak continues in order", async () => {
            state.streak = { currentDays: 8, longestDays: 8, lastStreakDate: "2026-11-08", freezesAvailable: 1 };
            state.ledgerInserted = [{ amount: 10 }];
            state.daysInserted = [{ localDate: "2026-11-10" }]; // 9 Nov was missed

            await processProgressionEvidenceBatch("u1", [evidence("a:2026-11-10", "2026-11-10")]);

            const frozen = state.dayValues.filter((row) => row.status === "frozen");
            expect(frozen).toEqual([expect.objectContaining({ localDate: "2026-11-09", source: "adjustment", sourceId: "freeze:2026-11-09" })]);
            expect(state.streakUpserts[0]).toMatchObject({ currentDays: 9, freezesAvailable: 0 });
        });

        it("stores nothing when there was no freeze to spend", async () => {
            state.streak = { currentDays: 3, longestDays: 3, lastStreakDate: "2026-11-08", freezesAvailable: 0 };
            state.ledgerInserted = [{ amount: 10 }];
            state.daysInserted = [{ localDate: "2026-11-10" }];

            await processProgressionEvidenceBatch("u1", [evidence("a:2026-11-10", "2026-11-10")]);

            expect(state.dayValues.filter((row) => row.status === "frozen")).toHaveLength(0);
        });

        it("turns a frozen day into a real one when its evidence arrives late", async () => {
            state.ledgerInserted = [{ amount: 10 }];
            state.daysInserted = [{ localDate: "2026-11-09" }];
            state.qualifiedDays = ["2026-11-01", "2026-11-09", "2026-11-10"].map((localDate) => ({ localDate }));

            await processProgressionEvidenceBatch("u1", [evidence("a:2026-11-09", "2026-11-09")]);

            // The qualified day is written as an upsert that may only replace a FROZEN row.
            const conflict = state.dayConflicts[0] as { set: { status: string }; setWhere: unknown };
            expect(conflict.set.status).toBe("qualified");
            expect(conflict.setWhere).toBeDefined();
            // The late day came before the last one, so the streak is rebuilt from the whole history.
            expect(state.calls).toContain("history");
        });

        it("reconciles stored frozen days with the rules after a late day: adds the new, removes the stale", async () => {
            // 1-7 Jan is a 7-day streak (earns a freeze); 8 Jan is missed; 9 Jan continues it, so 8 Jan is frozen.
            const days = [1, 2, 3, 4, 5, 6, 7, 9].map((n) => `2026-01-${String(n).padStart(2, "0")}`);
            state.streak = { currentDays: 9, longestDays: 9, lastStreakDate: "2026-01-09", freezesAvailable: 0 };
            state.ledgerInserted = [{ amount: 10 }];
            state.daysInserted = [{ localDate: "2026-01-04" }]; // older than the last day: forces a rebuild
            state.qualifiedDays = days.map((localDate) => ({ localDate }));
            state.frozenExisting = [{ localDate: "2026-01-20" }]; // no longer explained by any freeze

            await processProgressionEvidenceBatch("u1", [evidence("a:2026-01-04", "2026-01-04")]);

            expect(state.deletes).toContain("days");
            expect(state.dayValues.filter((row) => row.status === "frozen").map((row) => row.localDate)).toEqual(["2026-01-08"]);
        });
    });
});
