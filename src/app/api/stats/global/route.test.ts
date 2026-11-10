import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock("@/db", () => ({ db: { execute: mockExecute } }));
// The global schema mock does not include userStreakDays.
vi.mock("@/db/schema", () => ({ userCompletedMissions: {}, userStreakDays: {}, users: {} }));

// next/server is mocked globally: the response is { body, status } and headers are the call's 2nd argument.
const lastInit = () => vi.mocked(NextResponse.json).mock.lastCall?.[1] as { headers?: Record<string, string> } | undefined;

describe("GET /api/stats/global", () => {
    beforeEach(() => vi.clearAllMocks());

    it("reads all three totals with a single query", async () => {
        mockExecute.mockResolvedValue([{ missions: "796", days: "47", users: "267" }]);
        const response = await GET() as unknown as { body: unknown; status: number };

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual({ missionsCompleted: 796, activeWorshipDays: 47, users: 267 });
        expect(lastInit()?.headers?.["Cache-Control"]).toContain("s-maxage=300");
    });

    it("falls back to zeros for an empty result", async () => {
        mockExecute.mockResolvedValue([]);
        const response = await GET() as unknown as { body: unknown };
        expect(response.body).toEqual({ missionsCompleted: 0, activeWorshipDays: 0, users: 0 });
    });

    it("answers 503 when the database fails", async () => {
        mockExecute.mockRejectedValue(new Error("db down"));
        const response = await GET() as unknown as { body: unknown; status: number };
        expect(response.status).toBe(503);
        expect(response.body).toEqual({ error: "Global stats unavailable" });
    });
});
