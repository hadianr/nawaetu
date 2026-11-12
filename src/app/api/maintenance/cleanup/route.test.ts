import { beforeEach, describe, expect, it, vi } from "vitest";

const cleanup = vi.hoisted(() => vi.fn());
vi.mock("@/lib/maintenance/cleanup", () => ({ cleanupGuestData: cleanup }));

import { POST } from "./route";

const call = (query = "", auth: string | null = "Bearer s3cret") =>
    POST(new Request(`http://localhost/api/maintenance/cleanup${query}`, { method: "POST", headers: auth ? { authorization: auth } : {} }));

describe("POST /api/maintenance/cleanup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = "s3cret";
        cleanup.mockResolvedValue({ dryRun: true, pushInactive: 3, guestAccounts: 2, more: false });
    });

    it("refuses a caller without the secret, and is off when no secret is configured", async () => {
        expect((await call("", null)).status).toBe(401);
        expect((await call("", "Bearer nope")).status).toBe(401);
        delete process.env.CRON_SECRET;
        expect((await call()).status).toBe(503);
        expect(cleanup).not.toHaveBeenCalled();
    });

    it("only counts unless apply=1 is passed", async () => {
        await call();
        expect(cleanup).toHaveBeenLastCalledWith({ apply: false });
        await call("?apply=1");
        expect(cleanup).toHaveBeenLastCalledWith({ apply: true });
    });

    it("reports what it found", async () => {
        const { body } = (await call()) as unknown as { body: unknown };
        expect(body).toMatchObject({ success: true, pushInactive: 3, guestAccounts: 2 });
    });
});
