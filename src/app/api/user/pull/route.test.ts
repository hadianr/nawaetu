import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { getServerSession } from "@/lib/auth";

const h = vi.hoisted(() => ({
    reads: [] as string[],
    check: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ syncRateLimiter: { check: h.check } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/lib/db-sequential", () => ({ inSequence: async (queries: unknown[]) => Promise.all(queries) }));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), desc: vi.fn(), eq: vi.fn(), gte: vi.fn(), sql: vi.fn() }));
vi.mock("@/db/schema", () => ({
    bookmarks: {}, dailyActivities: {}, userCompletedMissions: {}, userProgressState: {}, userStreakDays: {}, userStreakState: {}, users: {},
}));
vi.mock("@/db", () => {
    const read = (name: string, value: unknown) => ({ findFirst: async () => { h.reads.push(name); return value; }, findMany: async () => { h.reads.push(name); return value; } });
    return {
        db: {
            query: {
                userProgressState: read("progress", { hasanahTotal: 120, level: 2 }),
                userStreakState: read("streak", { currentDays: 4, longestDays: 9, lastStreakDate: "2026-11-11", freezesAvailable: 1, timezone: "Asia/Jakarta" }),
                userStreakDays: read("days", [{ localDate: "2026-11-11", status: "qualified" }]),
                userCompletedMissions: read("missions", [{ missionId: "fajr_prayer", completedDate: "2026-11-11", hasanahEarned: 75 }]),
                dailyActivities: read("activity", []),
                bookmarks: read("bookmarks", [{ key: "2:255" }]),
                users: read("profile", { isMuhsinin: true, totalInfaq: 50000 }),
            },
            select: () => ({ from: () => ({ where: async () => { h.reads.push("fingerprint"); return [{ count: 3, latest: "2026-11-11T00:00:00Z" }]; } }) }),
        },
    };
});

const call = (query = "") => GET({ url: `http://localhost/api/user/pull${query}` } as never) as unknown as Promise<{ body: Record<string, unknown>; status: number }>;

describe("GET /api/user/pull", () => {
    beforeEach(() => {
        h.reads.length = 0;
        h.check.mockResolvedValue({ success: true });
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    });

    it("refuses a caller who is not signed in", async () => {
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        expect((await call()).status).toBe(401);
    });

    it("limits how often one account can pull", async () => {
        h.check.mockResolvedValue({ success: false });
        expect((await call()).status).toBe(429);
        expect(h.reads).toHaveLength(0);
    });

    it("reads only the parts that were asked for", async () => {
        const { body } = await call("?parts=progress");

        expect(h.reads.sort()).toEqual(["days", "progress", "streak"]);
        expect(body).toHaveProperty("progression");
        expect(body).not.toHaveProperty("missions");
        expect(body).not.toHaveProperty("bookmarks");
    });

    it("returns progression with the server's own streak count", async () => {
        const { body } = await call("?parts=progress");
        expect(body.progression).toMatchObject({ hasanah: 120, streak: { currentDays: 4, longestDays: 9, freezesAvailable: 1 } });
    });

    it("answers a bookmark check with a fingerprint instead of the verse text", async () => {
        const { body } = await call("?parts=bookmarks&fingerprint=1");

        expect(h.reads).toEqual(["fingerprint"]);
        expect(body.bookmarkFingerprint).toMatch(/^3:\d+$/);
        expect(body).not.toHaveProperty("bookmarks");
    });

    it("returns premium status alone for a cheap refresh after a donation", async () => {
        const { body } = await call("?parts=profile");
        expect(h.reads).toEqual(["profile"]);
        expect(body.profile).toEqual({ isMuhsinin: true, totalInfaq: 50000 });
    });

    it("ignores part names it does not know", async () => {
        await call("?parts=passwords,missions");
        expect(h.reads).toEqual(["missions"]);
    });
});
