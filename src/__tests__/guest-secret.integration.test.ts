import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { assertLocalDatabase, integrationEnabled } from "./integration-guard";

vi.unmock("@/db");
vi.unmock("@/db/schema");
vi.unmock("drizzle-orm");

describe.skipIf(!integrationEnabled)("guest secret (integration)", () => {
    const stamp = crypto.randomUUID().slice(0, 8);
    const ids = { bound: `gs-bound-${stamp}`, legacy: `gs-legacy-${stamp}`, race: `gs-race-${stamp}` };
    const mine = "a".repeat(40);
    const theirs = "b".repeat(40);
    let db: typeof import("@/db").db;
    let s: typeof import("@/db/schema");
    let orm: typeof import("drizzle-orm");
    let guest: typeof import("@/lib/guest-secret");

    const load = async (id: string) => (await db.select().from(s.users).where(orm.eq(s.users.id, id)))[0];

    beforeAll(async () => {
        assertLocalDatabase();
        ({ db } = await import("@/db"));
        s = await import("@/db/schema");
        orm = await import("drizzle-orm");
        guest = await import("@/lib/guest-secret");
        await db.insert(s.users).values([
            { id: ids.bound, email: `t-bound-${stamp}@nawaetu.local`, guestSecretHash: (await import("@/lib/guest-secret")).hashGuestSecret(mine) },
            { id: ids.legacy, email: `t-legacy-${stamp}@nawaetu.local` },
            { id: ids.race, email: `t-race-${stamp}@nawaetu.local` },
        ] as never);
    });
    afterAll(async () => {
        if (!integrationEnabled) return;
        await db.delete(s.users).where(orm.inArray(s.users.id, Object.values(ids)));
    });

    it("stores only a hash, never the secret", async () => {
        expect((await load(ids.bound)).guestSecretHash).toMatch(/^[0-9a-f]{64}$/);
        expect((await load(ids.bound)).guestSecretHash).not.toContain(mine);
    });

    it("lets the device that holds the secret act, and refuses everyone else, including a request with no secret", async () => {
        expect(await guest.guestMayAct(await load(ids.bound), mine)).toBe(true);
        expect(await guest.guestMayAct(await load(ids.bound), theirs)).toBe(false);
        expect(await guest.guestMayAct(await load(ids.bound), null)).toBe(false);
    });

    it("lets an app from before secrets through on an unbound account, and binds the first secret that arrives", async () => {
        expect(await guest.guestMayAct(await load(ids.legacy), null)).toBe(true);
        expect((await load(ids.legacy)).guestSecretHash).toBeNull();

        expect(await guest.guestMayAct(await load(ids.legacy), mine)).toBe(true);
        expect((await load(ids.legacy)).guestSecretHash).not.toBeNull();

        // From then on it is bound: someone with only the token is out.
        expect(await guest.guestMayAct(await load(ids.legacy), null)).toBe(false);
        expect(await guest.guestMayAct(await load(ids.legacy), theirs)).toBe(false);
        expect(await guest.guestMayAct(await load(ids.legacy), mine)).toBe(true);
    });

    it("lets exactly one of two simultaneous first requests bind, and the other is refused", async () => {
        const stale = await load(ids.race); // both read the account while it is still unbound
        const [a, b] = await Promise.all([guest.guestMayAct(stale, mine), guest.guestMayAct(stale, theirs)]);
        expect([a, b].filter(Boolean)).toHaveLength(1);
    });

    it("ignores a header that is not the shape a device generates", () => {
        const req = (value: string | null) => ({ headers: new Headers(value ? { "x-guest-secret": value } : {}) }) as unknown as Request;
        expect(guest.readGuestSecret(req(null))).toBeNull();
        expect(guest.readGuestSecret(req("short"))).toBeNull();
        expect(guest.readGuestSecret(req("x".repeat(201)))).toBeNull();
        expect(guest.readGuestSecret(req(mine))).toBe(mine);
    });
});
