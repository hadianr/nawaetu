import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { assertLocalDatabase, integrationEnabled } from "./integration-guard";

vi.unmock("@/db");
vi.unmock("@/db/schema");
vi.unmock("drizzle-orm");

describe.skipIf(!integrationEnabled)("guest data cleanup (integration)", () => {
    const stamp = crypto.randomUUID().slice(0, 8);
    const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);
    let db: typeof import("@/db").db;
    let s: typeof import("@/db/schema");
    let orm: typeof import("drizzle-orm");
    let cleanupGuestData: typeof import("@/lib/maintenance/cleanup").cleanupGuestData;

    const ids = { oldGuest: `g-old-${stamp}`, freshGuest: `g-new-${stamp}`, emptyGuest: `g-empty-${stamp}`, realUser: `real-${stamp}` };
    const tokens = { inactiveOld: `t-in-old-${stamp}`, inactiveRecent: `t-in-new-${stamp}`, activeOld: `t-act-old-${stamp}`, owned: `t-owned-${stamp}` };

    const guestIntention = (userId: string, updatedAt: Date) =>
        db.insert(s.intentions).values({ userId, intentionText: "x", intentionDate: new Date(), updatedAt, createdAt: updatedAt } as never);
    const exists = async (table: typeof s.users | typeof s.pushSubscriptions, column: unknown, value: string) =>
        (await db.select().from(table as never).where(orm.eq(column as never, value))).length === 1;

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import("@/db"));
        s = await import("@/db/schema");
        orm = await import("drizzle-orm");
        ({ cleanupGuestData } = await import("@/lib/maintenance/cleanup"));

        await db.insert(s.users).values([
            { id: ids.oldGuest, email: `tok-old-${stamp}@nawaetu.local` },
            { id: ids.freshGuest, email: `tok-new-${stamp}@nawaetu.local` },
            { id: ids.emptyGuest, email: `tok-empty-${stamp}@nawaetu.local` },
            { id: ids.realUser, email: `real-${stamp}@example.com` },
        ] as never);
        await guestIntention(ids.oldGuest, daysAgo(400));
        await guestIntention(ids.oldGuest, daysAgo(300)); // the newest write is what counts
        await guestIntention(ids.freshGuest, daysAgo(2));
        await db.insert(s.pushSubscriptions).values([
            { token: tokens.inactiveOld, active: 0, updatedAt: daysAgo(90) },
            { token: tokens.inactiveRecent, active: 0, updatedAt: daysAgo(3) },
            { token: tokens.activeOld, active: 1, updatedAt: daysAgo(400) },
            { token: tokens.owned, active: 0, updatedAt: daysAgo(90), userId: ids.realUser },
        ] as never);
    });

    afterAll(async () => {
        if (!integrationEnabled) return;
        await db.delete(s.pushSubscriptions).where(orm.inArray(s.pushSubscriptions.token, Object.values(tokens)));
        await db.delete(s.users).where(orm.inArray(s.users.id, Object.values(ids)));
    });

    it("a dry run counts the candidates and deletes nothing", async () => {
        const result = await cleanupGuestData({ apply: false });
        expect(result.dryRun).toBe(true);
        expect(result.guestAccounts).toBeGreaterThanOrEqual(1);
        expect(result.pushInactive).toBeGreaterThanOrEqual(2);
        expect(await exists(s.users, s.users.id, ids.oldGuest)).toBe(true);
        expect(await exists(s.pushSubscriptions, s.pushSubscriptions.token, tokens.inactiveOld)).toBe(true);
    });

    it("deletes only what has gone stale, and a guest's journal goes with the account", async () => {
        const result = await cleanupGuestData({ apply: true });
        expect(result.dryRun).toBe(false);

        // Stale: an inactive push row, and a guest whose newest journal write is old.
        expect(await exists(s.pushSubscriptions, s.pushSubscriptions.token, tokens.inactiveOld)).toBe(false);
        expect(await exists(s.pushSubscriptions, s.pushSubscriptions.token, tokens.owned)).toBe(false);
        expect(await exists(s.users, s.users.id, ids.oldGuest)).toBe(false);
        expect((await db.select().from(s.intentions).where(orm.eq(s.intentions.userId, ids.oldGuest))).length).toBe(0);

        // Kept: recently inactive, still active (FCM decides when a token is dead), a recent guest, a guest that
        // has no journal row yet (it may be being created), and every real account.
        expect(await exists(s.pushSubscriptions, s.pushSubscriptions.token, tokens.inactiveRecent)).toBe(true);
        expect(await exists(s.pushSubscriptions, s.pushSubscriptions.token, tokens.activeOld)).toBe(true);
        expect(await exists(s.users, s.users.id, ids.freshGuest)).toBe(true);
        expect(await exists(s.users, s.users.id, ids.emptyGuest)).toBe(true);
        expect(await exists(s.users, s.users.id, ids.realUser)).toBe(true);
    });

    it("running it again changes nothing", async () => {
        const again = await cleanupGuestData({ apply: true });
        expect(again.more).toBe(false);
        expect(await exists(s.users, s.users.id, ids.freshGuest)).toBe(true);
    });
});
