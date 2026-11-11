/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPendingIntention, readPendingIntention, savePendingIntention } from "./intention-pending";

const reply = (status: number, body: unknown) => ({ ok: status < 300, status, json: async () => body }) as Response;
const pending = { userToken: "t", text: "Niat hari ini", date: "2026-11-11" };

describe("intention written offline", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal("fetch", vi.fn());
    });

    it("does nothing when there is nothing waiting", async () => {
        expect(await flushPendingIntention()).toEqual({ sent: false, points: 0 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("is sent once the connection returns, with its own day, and then cleared", async () => {
        savePendingIntention(pending);
        vi.mocked(fetch).mockResolvedValue(reply(200, { success: true, data: { intention_points_earned: 10 } }));

        const result = await flushPendingIntention();

        expect(result).toEqual({ sent: true, points: 10, date: "2026-11-11" });
        expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)).toMatchObject({ intention_date: "2026-11-11", intention_text: "Niat hari ini" });
        expect(readPendingIntention()).toBeNull();
    });

    it("stays saved while offline or when the server is busy", async () => {
        savePendingIntention(pending);
        vi.mocked(fetch).mockRejectedValueOnce(new TypeError("offline"));
        await flushPendingIntention();
        vi.mocked(fetch).mockResolvedValueOnce(reply(503, {}));
        await flushPendingIntention();
        vi.mocked(fetch).mockResolvedValueOnce(reply(429, {}));
        await flushPendingIntention();

        expect(readPendingIntention()).toEqual(pending);
    });

    it("is dropped when the server refuses it for good", async () => {
        savePendingIntention(pending);
        vi.mocked(fetch).mockResolvedValue(reply(400, { success: false }));
        await flushPendingIntention();
        expect(readPendingIntention()).toBeNull();
    });
});
