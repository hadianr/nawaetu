import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { db } from "@/db";
import { getMessaging } from "@/lib/notifications/firebase-admin";

vi.mock("@/lib/auth", () => ({
    getServerSession: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
}));

vi.mock("@/lib/notifications/firebase-admin", () => ({
    getMessaging: vi.fn(),
}));

vi.mock("@/db", () => ({
    db: {
        query: { pushSubscriptions: { findFirst: vi.fn() } },
        update: vi.fn(),
    },
}));

vi.mock("drizzle-orm", () => ({
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
}));

describe("POST /api/notifications/test", () => {
    beforeEach(() => vi.clearAllMocks());

    it("sends only to an active subscription owned by the signed-in user", async () => {
        const send = vi.fn().mockResolvedValue("message-id");
        vi.mocked(getMessaging).mockResolvedValue({ send } as never);
        vi.mocked(db.query.pushSubscriptions.findFirst).mockResolvedValue({ id: "subscription-1" } as never);
        const where = vi.fn().mockResolvedValue(undefined);
        vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where }) } as never);

        const request = new NextRequest("https://nawaetu.app/api/notifications/test", {
            method: "POST",
            body: JSON.stringify({ token: "owned-token" }),
        });
        Object.assign(request, { url: "https://nawaetu.app/api/notifications/test" });
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(send).toHaveBeenCalledWith(expect.objectContaining({
            token: "owned-token",
            data: expect.objectContaining({ type: "notification_test" }),
            notification: expect.objectContaining({ title: "Nawaetu" }),
        }));
    });

    it("rejects a token that is not an active subscription for the user", async () => {
        vi.mocked(db.query.pushSubscriptions.findFirst).mockResolvedValue(undefined);

        const response = await POST(new NextRequest("https://nawaetu.app/api/notifications/test", {
            method: "POST",
            body: JSON.stringify({ token: "someone-elses-token" }),
        }));

        expect(response.status).toBe(404);
        expect(getMessaging).not.toHaveBeenCalled();
    });
});
