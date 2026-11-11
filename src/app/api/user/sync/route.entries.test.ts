import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const h = vi.hoisted(() => ({
    tracker: { inFlight: 0, maxInFlight: 0, started: [] as string[], failIds: new Set<string>() },
    calls: [] as { method: string; args: unknown[] }[],
    failBatches: false,
    mockSession: vi.fn(),
    mockCheck: vi.fn(),
}));

vi.mock("@/db", () => ({ checkConnection: h.mockCheck }));
vi.mock("@/lib/auth", () => ({ getServerSession: h.mockSession }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
// Entries that carry data.invalid fail validation; everything else passes through unchanged.
vi.mock("@/lib/validations/sync", () => ({
    SyncEntrySchema: { safeParse: (entry: { data?: { invalid?: boolean } }) => (entry.data?.invalid ? { success: false } : { success: true, data: entry }) },
}));
vi.mock("@/core/repositories/db-sync.repository", () => {
    const record = (method: string) => async (...args: unknown[]) => {
        h.calls.push({ method, args });
        return `cloud-${method}`;
    };
    return {
        DbSyncRepository: class {
            async syncBookmarkAsync(data: { name: string }) {
                h.tracker.started.push(data.name);
                h.tracker.inFlight += 1;
                h.tracker.maxInFlight = Math.max(h.tracker.maxInFlight, h.tracker.inFlight);
                await new Promise(resolve => setTimeout(resolve, 2));
                h.tracker.inFlight -= 1;
                if (h.tracker.failIds.has(data.name)) throw new Error(`failed ${data.name}`);
                return `cloud-${data.name}`;
            }
            syncIntention = record("syncIntention");
            syncMission = record("syncMission");
            syncDailyActivity = record("syncDailyActivity");
            syncSetting = record("syncSetting");
            syncReadingState = record("syncReadingState");
            syncStreak = record("syncStreak");
            syncRamadhanFasting = record("syncRamadhanFasting");
            syncRamadhanTaraweh = record("syncRamadhanTaraweh");
            syncRamadhanDaily = record("syncRamadhanDaily");
            syncSirahProgress = record("syncSirahProgress");
            syncSirahBookmark = record("syncSirahBookmark");
            syncHasanahEvent = record("syncHasanahEvent");
            async syncMissionsBatch(...args: unknown[]) {
                h.calls.push({ method: "syncMissionsBatch", args });
                if (h.failBatches) throw new Error("mission batch failed");
            }
            async syncIntentionsBatch(...args: unknown[]) {
                h.calls.push({ method: "syncIntentionsBatch", args });
                if (h.failBatches) throw new Error("intention batch failed");
            }
        },
    };
});

type Body = { synced: { id: string; cloudId?: string }[]; failed: { id: string; error: string }[]; message?: string };
const entries = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `e${i}`, type: "bookmark", action: "create", data: { name: `e${i}` } }));
const send = (raw: string) => POST(new NextRequest("http://localhost/api/user/sync", { method: "POST", body: raw }));
// next/server is mocked globally: the response is { body, status }.
const result = async (body: unknown) => (await send(typeof body === "string" ? body : JSON.stringify(body))) as unknown as { body: Body; status: number };
const called = (method: string) => h.calls.filter(call => call.method === method);

describe("POST /api/user/sync", () => {
    beforeEach(() => {
        h.tracker.inFlight = 0;
        h.tracker.maxInFlight = 0;
        h.tracker.started = [];
        h.tracker.failIds = new Set();
        h.calls.length = 0;
        h.failBatches = false;
        h.mockSession.mockResolvedValue({ user: { id: "user-1" } });
        h.mockCheck.mockResolvedValue({ success: true });
    });

    describe("one query at a time", () => {
        it("processes entries sequentially, in order", async () => {
            const { body } = await result({ entries: entries(12) });
            expect(h.tracker.maxInFlight).toBe(1);
            expect(h.tracker.started).toEqual(entries(12).map(entry => entry.id));
            expect(body.synced).toHaveLength(12);
            expect(body.synced[0]).toEqual({ id: "e0", cloudId: "cloud-e0" });
        });

        it("reports a failing entry without stopping the others", async () => {
            h.tracker.failIds = new Set(["e1"]);
            const { body } = await result({ entries: entries(3) });
            expect(body.synced.map(item => item.id)).toEqual(["e0", "e2"]);
            expect(body.failed).toEqual([{ id: "e1", error: "failed e1" }]);
        });

        it("caps one request at 200 entries and reports the rest as failed so the client retries them", async () => {
            const { body } = await result({ entries: entries(205) });
            expect(h.tracker.started).toHaveLength(200);
            expect(body.synced).toHaveLength(200);
            expect(body.failed).toHaveLength(5);
            expect(body.failed[0]).toEqual({ id: "e200", error: expect.stringContaining("Too many entries") });
        });
    });

    describe("request handling", () => {
        it("rejects anonymous callers", async () => {
            h.mockSession.mockResolvedValue(null);
            expect((await result({ entries: entries(1) })).status).toBe(401);
            expect(h.tracker.started).toHaveLength(0);
        });

        it("answers 503 when the database is offline", async () => {
            h.mockCheck.mockResolvedValue({ success: false });
            expect((await result({ entries: entries(1) })).status).toBe(503);
        });

        it("answers 400 for a body that is not JSON", async () => {
            expect((await result("{not json")).status).toBe(400);
        });

        it("says so when there is nothing to sync", async () => {
            const { body } = await result({});
            expect(body).toMatchObject({ synced: [], failed: [], message: "No entries to sync" });
        });

        it("ignores entries that are not well-formed", async () => {
            const { body } = await result({ entries: [{ id: "x" }, "nope", ...entries(1)] });
            expect(body.synced.map(item => item.id)).toEqual(["e0"]);
        });

        it("reports an entry that fails validation, and an unknown type", async () => {
            const { body } = await result({ entries: [
                { id: "bad", type: "bookmark", action: "create", data: { invalid: true } },
                { id: "odd", type: "mystery", action: "create", data: {} },
            ] });
            expect(body.failed).toEqual([
                { id: "bad", error: "Invalid sync entry format" },
                { id: "odd", error: "Unknown type: mystery" },
            ]);
        });
    });

    describe("entry types", () => {
        it("sends each type to its own repository method", async () => {
            const types: [string, string][] = [
                ["intention", "syncIntention"], ["journal", "syncIntention"],
                ["hasanah_event", "syncHasanahEvent"],
                ["daily_activity", "syncDailyActivity"], ["dhikr_stats", "syncDailyActivity"],
                ["setting", "syncSetting"], ["reading_state", "syncReadingState"], ["streak", "syncStreak"],
                ["ramadhan_fasting", "syncRamadhanFasting"], ["ramadhan_taraweh", "syncRamadhanTaraweh"], ["ramadhan_daily", "syncRamadhanDaily"],
                ["sirah_progress", "syncSirahProgress"], ["sirah_bookmark", "syncSirahBookmark"],
            ];
            const { body } = await result({ entries: types.map(([type], i) => ({ id: `t${i}`, type, action: "create", data: { n: i } })) });
            expect(body.failed).toEqual([]);
            expect(body.synced).toHaveLength(types.length);
            types.forEach(([, method], i) => {
                expect(h.calls.some(call => call.method === method && (call.args[0] as { n: number }).n === i), `${types[i][0]} -> ${method}`).toBe(true);
            });
        });
    });

    describe("mission entries", () => {
        it("writes completions as one batch and sends an undo on its own", async () => {
            const { body } = await result({ entries: [
                { id: "c1", type: "mission", action: "create", data: { id: "tasbih_99", completedDate: "2026-11-11" } },
                { id: "c2", type: "mission_progress", action: "update", data: { id: "tasbih_33", completedDate: "2026-11-11" } },
                { id: "u1", type: "mission", action: "delete", data: { id: "fajr_prayer", completedDate: "2026-11-11" } },
            ] });

            expect(called("syncMissionsBatch")).toHaveLength(1);
            expect(called("syncMissionsBatch")[0].args[0]).toHaveLength(2);
            expect(called("syncMission").map((call) => call.args[1])).toEqual(["delete"]);
            expect(body.synced.map((item) => item.id).sort()).toEqual(["c1", "c2", "u1"]);
            expect(body.failed).toEqual([]);
        });

        it("fails the whole batch together when the write fails, so the client retries it", async () => {
            h.failBatches = true;
            const { body } = await result({ entries: [
                { id: "c1", type: "mission", action: "create", data: { id: "tasbih_99" } },
                { id: "c2", type: "mission", action: "create", data: { id: "tasbih_33" } },
            ] });
            expect(body.failed.map((item) => item.id)).toEqual(["c1", "c2"]);
        });
    });

    describe("older payload shapes", () => {
        it("syncs legacy mission and intention lists as batches", async () => {
            const { body } = await result({ completedMissions: [{ id: "m1" }, { id: "m2" }], intentions: [{ intentionText: "be kind" }] });
            expect(called("syncMissionsBatch")).toHaveLength(1);
            expect(called("syncIntentionsBatch")).toHaveLength(1);
            expect(body.synced.map(item => item.id)).toEqual(["legacy-mission-0", "legacy-mission-1", "legacy-intention-0"]);
        });

        it("reports a failed legacy batch and keeps going", async () => {
            h.failBatches = true;
            const { body } = await result({ completedMissions: [{ id: "m1" }], intentions: [{ intentionText: "x" }] });
            expect(body.failed).toEqual([
                { id: "legacy-missions", error: "mission batch failed" },
                { id: "legacy-intentions", error: "intention batch failed" },
            ]);
        });

        it("turns legacy lists and objects into entries", async () => {
            const { body } = await result({
                bookmarks: [{ name: "b1" }],
                settings: { theme: "dark" },
                readingState: { surahId: 2 },
                streaks: { current: 3 },
                dailyActivity: { date: "2026-11-10" },
                extraEntries: [{ id: "x1", type: "sirah_progress", data: { chapter: 1 } }, { nope: true }],
            });
            expect(body.failed).toEqual([]);
            expect(body.synced.map(item => item.id).sort()).toEqual(["legacy-bookmark-0", "legacy-daily_activity", "legacy-reading_state", "legacy-setting", "legacy-streak", "x1"]);
            expect(called("syncSirahProgress")).toHaveLength(1);
        });

        it("reads the legacy taraweh log by year and day, skipping invalid choices", async () => {
            await result({ ramadhan: { tarawehLog: { "1447": { "1447-09-05": { choice: "8" }, "1447-09-06": { choice: "99" }, "1447-09-07": 20 } } } });
            const sent = called("syncRamadhanTaraweh").map(call => call.args[0]);
            expect(sent).toEqual([
                { hijriYear: 1447, hijriDay: 5, choice: "8" },
                { hijriYear: 1447, hijriDay: 7, choice: "20" },
            ]);
        });
    });
});
