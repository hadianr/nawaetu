import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { assertLocalDatabase, integrationEnabled } from "./integration-guard";

vi.unmock("@/db");
vi.unmock("@/db/schema");
vi.unmock("drizzle-orm");

describe.skipIf(!integrationEnabled)("prayer alert bookkeeping (integration)", () => {
    const stamp = crypto.randomUUID().slice(0, 8);
    const token = (name: string) => `ps-${name}-${stamp}`;
    let db: typeof import("@/db").db;
    let s: typeof import("@/db/schema");
    let orm: typeof import("drizzle-orm");
    let send: typeof import("@/lib/notifications/prayer-send");

    const row = async (name: string) => (await db.select().from(s.pushSubscriptions).where(orm.eq(s.pushSubscriptions.token, token(name))))[0];

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import("@/db"));
        s = await import("@/db/schema");
        orm = await import("drizzle-orm");
        send = await import("@/lib/notifications/prayer-send");
        await db.insert(s.pushSubscriptions).values([
            { token: token("empty"), active: 1 },                                                         // never alerted
            { token: token("other"), active: 1, lastNotificationSent: { Isha: "2026-11-11" } },          // another prayer on record
            { token: token("same"), active: 1, lastNotificationSent: { Fajr: "2026-11-10" } },           // an older day for the same prayer
            { token: token("encoded"), active: 1, lastNotificationSent: JSON.stringify({ Isha: "2026-11-11" }) }, // an older row stored as a JSON string
            { token: token("untouched"), active: 1 },
        ] as never);
    });
    afterAll(async () => {
        if (!integrationEnabled) return;
        await db.delete(s.pushSubscriptions).where(orm.like(s.pushSubscriptions.token, `ps-%-${stamp}`));
    });

    it("records the prayer for every id in one statement, and keeps what was already there", async () => {
        const ids = await Promise.all(["empty", "other", "same", "encoded"].map(async (name) => (await row(name)).id));
        await send.markSent(ids, "Fajr", "2026-11-12");

        expect((await row("empty")).lastNotificationSent).toEqual({ Fajr: "2026-11-12" });
        expect((await row("other")).lastNotificationSent).toEqual({ Isha: "2026-11-11", Fajr: "2026-11-12" });
        expect((await row("same")).lastNotificationSent).toEqual({ Fajr: "2026-11-12" }); // the older day is replaced
        expect((await row("untouched")).lastNotificationSent).toBeNull();                      // nobody else is touched
        expect((await row("empty")).lastUsedAt).not.toBeNull();
    });

    it("heals a row that was stored as a JSON string instead of extending it into something unreadable", async () => {
        const value = (await row("encoded")).lastNotificationSent;
        expect(typeof value).toBe("object");
        expect(value).toMatchObject({ Fajr: "2026-11-12" });
    });

    it("treats a prayer sent today as sent: the deduplication reads back what it wrote", async () => {
        const map = (await row("other")).lastNotificationSent as Record<string, string>;
        expect(map.Fajr === "2026-11-12").toBe(true);
    });

    it("switches off only the ids it is given", async () => {
        await send.deactivate([(await row("empty")).id]);
        expect((await row("empty")).active).toBe(0);
        expect((await row("other")).active).toBe(1);
    });

    it("does nothing for an empty list", async () => {
        await expect(send.markSent([], "Fajr", "2026-11-12")).resolves.toBeUndefined();
        await expect(send.deactivate([])).resolves.toBeUndefined();
    });
});
