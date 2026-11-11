import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { getMessaging } from "@/lib/notifications/firebase-admin";

vi.mock("@/lib/notifications/firebase-admin", () => ({ getMessaging: vi.fn() }));

const request = (headers: Record<string, string> = {}) =>
    new NextRequest("https://nawaetu.app/api/notifications/test-push", {
        method: "POST",
        headers,
        body: JSON.stringify({ token: "device-token", title: "hi", body: "anything" }),
    });

describe("POST /api/notifications/test-push", () => {
    const send = vi.fn().mockResolvedValue("message-id");

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("CRON_SECRET", "cron-secret");
        vi.mocked(getMessaging).mockResolvedValue({ send } as never);
    });

    it("refuses callers without the secret, so nobody can push arbitrary text to a device", async () => {
        const res = await POST(request());
        expect(res.status).toBe(401);
        expect(send).not.toHaveBeenCalled();
    });

    it("is closed when no secret is configured", async () => {
        vi.stubEnv("CRON_SECRET", "");
        const res = await POST(request({ authorization: "Bearer " }));
        expect(res.status).toBe(503);
        expect(send).not.toHaveBeenCalled();
    });

    it("sends for the scheduler", async () => {
        const res = await POST(request({ authorization: "Bearer cron-secret" }));
        expect(res.status).toBe(200);
        expect(send).toHaveBeenCalledTimes(1);
    });
});
