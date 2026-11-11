import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
    steps: [] as string[],
    claimResult: [{ id: "tx-1" }] as Array<{ id: string }>,
    transactionCalls: 0,
    failCredit: false,
}));

vi.mock("@/db/schema", () => ({ transactions: { name: "transactions" }, users: { name: "users" } }));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), eq: vi.fn(), ne: vi.fn(), sql: vi.fn() }));
vi.mock("@/db", () => ({
    db: {
        transaction: async (run: (trx: unknown) => unknown) => {
            h.transactionCalls++;
            const trx = {
                update: (table: { name: string }) => ({
                    set: () => ({
                        where: () => {
                            h.steps.push(table.name);
                            if (table.name === "transactions") return { returning: async () => h.claimResult };
                            if (h.failCredit) return Promise.reject(new Error("credit failed"));
                            return Promise.resolve();
                        },
                    }),
                }),
            };
            return run(trx);
        },
    },
}));

import { isValidDonationAmount, normalizeMayarStatus, settleDonation } from "./payments";

describe("normalizeMayarStatus", () => {
    it.each([
        ["paid", "settlement"], ["SETTLED", "settlement"], ["success", "settlement"], [true, "settlement"],
        ["unpaid", "pending"], ["created", "pending"], ["pending", "pending"],
        ["expired", "expired"], ["cancelled", "failed"], [false, "failed"], [undefined, "failed"],
    ])("reads %s as %s", (input, expected) => {
        expect(normalizeMayarStatus(input)).toBe(expected);
    });
});

describe("isValidDonationAmount", () => {
    it("accepts whole amounts from 5,000 up to the cap", () => {
        expect(isValidDonationAmount(5000)).toBe(true);
        expect(isValidDonationAmount(100_000_000)).toBe(true);
    });
    it("rejects fractions, strings, too small and too large", () => {
        for (const bad of [4999, 5000.5, "10000", null, 100_000_001, NaN]) expect(isValidDonationAmount(bad)).toBe(false);
    });
});

describe("settleDonation", () => {
    beforeEach(() => {
        h.steps = [];
        h.claimResult = [{ id: "tx-1" }];
        h.transactionCalls = 0;
        h.failCredit = false;
    });

    it("marks the donation paid and credits the donor inside one database transaction", async () => {
        expect(await settleDonation({ id: "tx-1", userId: "u1", amount: 50000 }, "mayar-1")).toBe(true);
        expect(h.transactionCalls).toBe(1);
        expect(h.steps).toEqual(["transactions", "users"]);
    });

    it("credits nobody when the donation was already settled by the other route", async () => {
        h.claimResult = [];
        expect(await settleDonation({ id: "tx-1", userId: "u1", amount: 50000 })).toBe(false);
        expect(h.steps).toEqual(["transactions"]);
    });

    it("lets a failed credit surface so the whole transaction rolls back", async () => {
        h.failCredit = true;
        await expect(settleDonation({ id: "tx-1", userId: "u1", amount: 50000 })).rejects.toThrow("credit failed");
    });

    it("settles an anonymous donation without a user to credit", async () => {
        expect(await settleDonation({ id: "tx-1", userId: null, amount: 50000 })).toBe(true);
        expect(h.steps).toEqual(["transactions"]);
    });
});
