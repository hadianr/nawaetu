import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { assertLocalDatabase, integrationEnabled } from "./integration-guard";

vi.unmock("@/db");
vi.unmock("@/db/schema");
vi.unmock("drizzle-orm");

describe.skipIf(!integrationEnabled)("prayer alert schedule (integration)", () => {
    const stamp = crypto.randomUUID().slice(0, 8);
    const token = (name: string) => `sched-${name}-${stamp}`;
    const minutes = (n: number) => new Date(Date.now() + n * 60_000);
    let db: typeof import("@/db").db;
    let s: typeof import("@/db/schema");
    let orm: typeof import("drizzle-orm");
    let send: typeof import("@/lib/notifications/prayer-send");

    const row = async (name: string) => (await db.select().from(s.pushSubscriptions).where(orm.eq(s.pushSubscriptions.token, token(name))))[0];
    const dueTokens = async () => (await send.dueSubscriptions(new Date(), 5000)).map((sub) => sub.token).filter((t) => t.endsWith(stamp));

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import("@/db"));
        s = await import("@/db/schema");
        orm = await import("drizzle-orm");
        send = await import("@/lib/notifications/prayer-send");
        await db.insert(s.pushSubscriptions).values([
            { token: token("never"), active: 1, nextAlertAt: null },            // never scheduled: must be looked at
            { token: token("past"), active: 1, nextAlertAt: minutes(-5) },      // its time has come
            { token: token("now"), active: 1, nextAlertAt: new Date() },        // due this very minute
            { token: token("future"), active: 1, nextAlertAt: minutes(120) },   // not yet
            { token: token("off-null"), active: 0, nextAlertAt: null },         // switched off
            { token: token("off-past"), active: 0, nextAlertAt: minutes(-5) },  // switched off
        ] as never);
    });
    afterAll(async () => {
        if (!integrationEnabled) return;
        await db.delete(s.pushSubscriptions).where(orm.like(s.pushSubscriptions.token, `sched-%-${stamp}`));
    });

    it("reads only what is due or never scheduled, and nothing that is switched off", async () => {
        expect((await dueTokens()).sort()).toEqual([token("never"), token("now"), token("past")].sort());
    });

    it("reads the oldest first, so a backlog is worked off in order", async () => {
        const ordered = (await send.dueSubscriptions(new Date(), 5000)).filter((sub) => sub.token.endsWith(stamp) && sub.nextAlertAt).map((sub) => sub.token);
        expect(ordered.indexOf(token("past"))).toBeLessThan(ordered.indexOf(token("now")));
    });

    it("never returns more than the limit", async () => {
        expect((await send.dueSubscriptions(new Date(), 1)).length).toBeLessThanOrEqual(1);
    });

    it("stores the next time for the ids it is given, in one statement, and touches nobody else", async () => {
        const at = minutes(300);
        const never = await row("never");
        const past = await row("past");
        await send.setNextAlerts([{ id: never.id, at }, { id: past.id, at: minutes(400) }]);

        expect((await row("never")).nextAlertAt?.toISOString()).toBe(at.toISOString());
        expect((await row("past")).nextAlertAt?.getTime()).toBeGreaterThan(minutes(399).getTime());
        expect((await row("future")).nextAlertAt?.getTime()).toBeLessThan(minutes(125).getTime()); // untouched
        expect(await dueTokens()).toEqual([token("now")]); // the two that were handled are no longer due
    });

    it("handles a list longer than one batch and an empty list", async () => {
        const many = Array.from({ length: 650 }, (_, i) => ({ token: `sched-bulk-${i}-${stamp}`, active: 1, nextAlertAt: null }));
        await db.insert(s.pushSubscriptions).values(many as never);
        const ids = (await db.select({ id: s.pushSubscriptions.id }).from(s.pushSubscriptions).where(orm.like(s.pushSubscriptions.token, `sched-bulk-%-${stamp}`))).map((r) => r.id);
        expect(ids).toHaveLength(650);

        const at = minutes(600);
        await send.setNextAlerts(ids.map((id) => ({ id, at })));
        const stored = await db.select({ at: s.pushSubscriptions.nextAlertAt }).from(s.pushSubscriptions).where(orm.like(s.pushSubscriptions.token, `sched-bulk-%-${stamp}`));
        expect(stored.every((r) => r.at?.toISOString() === at.toISOString())).toBe(true);

        await expect(send.setNextAlerts([])).resolves.toBeUndefined();
    });

    it("is served by the partial index, not a scan of the whole table", async () => {
        // With very few rows the planner would scan anyway; forbidding a sequential scan shows the query CAN use the index.
        const plan = await db.transaction(async (tx) => {
            await tx.execute(orm.sql`SET LOCAL enable_seqscan = off`);
            return tx.execute(orm.sql`EXPLAIN SELECT * FROM push_subscription WHERE active = 1 AND (next_alert_at IS NULL OR next_alert_at <= now()::timestamp) ORDER BY next_alert_at LIMIT 2000`);
        });
        expect(JSON.stringify(plan)).toContain("ps_next_alert_idx");
    });
});
