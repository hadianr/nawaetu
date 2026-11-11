import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getServerSession } from "@/lib/auth";

const h = vi.hoisted(() => ({
    selects: [] as unknown[][],
    updates: [] as unknown[],
    deletes: 0,
    evidence: [] as unknown[],
    check: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/lib/rate-limit", () => ({ syncRateLimiter: { check: h.check } }));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), eq: vi.fn(), inArray: vi.fn() }));
vi.mock("@/db/schema", () => ({ intentions: { intentionDate: "d" }, users: {} }));
vi.mock("@/core/repositories/progression.repository", () => ({
    processProgressionEvidenceBatch: vi.fn(async (_u: string, evidence: unknown[]) => { h.evidence.push(...evidence); }),
}));
vi.mock("@/db", () => ({
    db: {
        select: () => {
            const next = () => h.selects.shift() ?? [];
            const chain: Record<string, unknown> = {};
            chain.from = () => chain;
            // The result is taken only when the query is awaited (directly, or through .limit()).
            chain.where = () => ({
                limit: async () => next(),
                then: (resolve: (rows: unknown[]) => unknown) => resolve(next()),
            });
            return chain;
        },
        update: () => ({ set: (values: unknown) => ({ where: async () => { h.updates.push(values); } }) }),
        delete: () => ({ where: async () => { h.deletes++; } }),
    },
}));

const request = (body: unknown) => POST({ json: async () => body } as never) as unknown as Promise<{ body: { moved?: number }; status: number }>;
const today = new Date().toISOString().slice(0, 10);

describe("POST /api/intentions/claim", () => {
    beforeEach(() => {
        Object.assign(h, { selects: [], updates: [], deletes: 0, evidence: [] });
        h.check.mockResolvedValue({ success: true });
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "me" } } as never);
    });

    it("refuses a caller who is not signed in", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        expect((await request({ tokens: ["abc"] })).status).toBe(401);
    });

    it("moves the guest's intentions for days the account does not have, then deletes the placeholder", async () => {
        h.selects.push(
            [{ date: new Date(`${today}T00:00:00Z`) }],            // the account already has today
            [{ id: "guest-user" }],                                // the hidden account for the token
            [{ id: "i1", date: new Date(`${today}T00:00:00Z`) },   // same day as the account: stays behind
             { id: "i2", date: new Date("2026-01-01T00:00:00Z") }], // old day outside the window
        );

        const { body } = await request({ tokens: ["device-token"] });

        expect(body.moved).toBe(1);
        expect(h.updates).toHaveLength(1);
        expect(h.deletes).toBe(1);
        expect(h.evidence).toHaveLength(0); // the moved day is outside the sync window, so no points are invented
    });

    it("gives the moved days in the window their points and streak day", async () => {
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        h.selects.push([], [{ id: "guest-user" }], [{ id: "i1", date: new Date(`${yesterday}T00:00:00Z`) }]);

        await request({ tokens: ["device-token"] });

        expect(h.evidence).toEqual([expect.objectContaining({ source: "intention", sourceId: `intention:${yesterday}`, hasanah: 5 })]);
    });

    it("does nothing for a token that has no placeholder account", async () => {
        h.selects.push([], []);
        const { body } = await request({ tokens: ["unknown"] });
        expect(body.moved).toBe(0);
        expect(h.deletes).toBe(0);
    });

    it("looks at no more than five tokens and ignores anything that is not a string", async () => {
        h.selects.push([]);
        await request({ tokens: [1, null, { a: 1 }, "", "x".repeat(300)] });
        expect(h.deletes).toBe(0);
    });
});
