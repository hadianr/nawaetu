import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { db } from "@/db";
import { getServerSession } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/db", () => ({ db: { select: vi.fn(), update: vi.fn() } }));
vi.mock("@/db/schema", () => ({ pushSubscriptions: { token: "token" } }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));

const request = () =>
    new NextRequest("https://nawaetu.app/api/notifications/preferences", {
        method: "POST",
        body: JSON.stringify({ token: "device-token", prayerPreferences: { fajr: false } }),
    });

const written: Array<Record<string, unknown>> = [];

function stubSubscription(userId: string | null) {
    vi.mocked(db.select).mockReturnValue({ from: () => ({ where: () => ({ limit: async () => [{ id: "s1", userId }] }) }) } as never);
    const where = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.update).mockReturnValue({ set: (values: Record<string, unknown>) => { written.push(values); return { where }; } } as never);
    return where;
}

describe("POST /api/notifications/preferences", () => {
    beforeEach(() => { vi.clearAllMocks(); written.length = 0; });

    it("lets a guest change a guest subscription with its token", async () => {
        const where = stubSubscription(null);
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        const res = await POST(request());
        expect(res.status).toBe(200);
        expect(where).toHaveBeenCalled();
    });

    it("refuses a stranger changing an account's subscription", async () => {
        const where = stubSubscription("user-1");
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        expect((await POST(request())).status).toBe(401);

        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-2" } } as never);
        expect((await POST(request())).status).toBe(401);
        expect(where).not.toHaveBeenCalled();
    });

    it("lets the owner change it", async () => {
        const where = stubSubscription("user-1");
        vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);
        expect((await POST(request())).status).toBe(200);
        expect(where).toHaveBeenCalled();
    });

    it("makes the prayer-alert job work out the next alert again, since location, timezone and preferences decide it", async () => {
        stubSubscription(null);
        vi.mocked(getServerSession).mockResolvedValue(null as never);
        await POST(request());
        expect(written).toHaveLength(1);
        expect(written[0]).toHaveProperty("nextAlertAt", null);
    });
});
