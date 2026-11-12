import { sql } from "drizzle-orm";
import { db } from "@/db";

/** A push row the sender marked inactive (FCM said the token is gone) is deleted after this many days. */
export const PUSH_INACTIVE_DAYS = 30;
/** A guest's hidden account is deleted when its journal has not been written to for this long. */
export const GUEST_INACTIVE_DAYS = 180;

const BATCH = 500;
const MAX_BATCHES = 20;
const BUDGET_MS = 20_000;
const DAY_MS = 86_400_000;

export interface CleanupResult {
    dryRun: boolean;
    /** Rows deleted, or in a dry run the rows that would be. */
    pushInactive: number;
    guestAccounts: number;
    /** True when the time or batch budget ran out before everything was removed; the next run continues. */
    more: boolean;
}

type Count = { n: number };
const rowsOf = (result: unknown) => result as unknown as Count[];

// A guest account is the hidden user named after a device token. It is only ever aged by its journal: an
// account with no journal row at all is left alone, because it may be one that is being created right now.
const guestCandidates = (cutoff: Date, limit?: number) => sql`
    SELECT u.id FROM "user" u
    WHERE u.email LIKE '%@nawaetu.local'
      AND (SELECT COALESCE(max(i.updated_at), max(i.created_at)) FROM intention i WHERE i."userId" = u.id) < ${cutoff.toISOString()}::timestamp
    ${limit ? sql`LIMIT ${limit}` : sql``}`;

const pushCandidates = (cutoff: Date, limit?: number) => sql`
    SELECT id FROM push_subscription WHERE active = 0 AND updated_at < ${cutoff.toISOString()}::timestamp
    ${limit ? sql`LIMIT ${limit}` : sql``}`;

async function count(candidates: ReturnType<typeof sql>): Promise<number> {
    return rowsOf(await db.execute(sql`SELECT count(*)::int AS n FROM (${candidates}) c`))[0]?.n ?? 0;
}

/** One batch: the rows go in a single statement, so a failure leaves nothing half-deleted. */
async function deleteBatch(table: "user" | "push_subscription", candidates: ReturnType<typeof sql>): Promise<number> {
    const target = table === "user" ? sql`"user"` : sql`push_subscription`;
    const rows = rowsOf(await db.execute(sql`
        WITH doomed AS (${candidates}), gone AS (DELETE FROM ${target} WHERE id IN (SELECT id FROM doomed) RETURNING 1)
        SELECT count(*)::int AS n FROM gone`));
    return rows[0]?.n ?? 0;
}

/**
 * Removes what only piles up as guests come and go: push rows FCM already gave up on, and the hidden accounts of
 * guests who stopped writing. Deleting an account removes its journal with it (cascade). Without `apply` it only
 * counts, so the effect of a change to the rules can be seen before anything is deleted.
 */
export async function cleanupGuestData({ apply, now = new Date() }: { apply: boolean; now?: Date }): Promise<CleanupResult> {
    const pushCutoff = new Date(now.getTime() - PUSH_INACTIVE_DAYS * DAY_MS);
    const guestCutoff = new Date(now.getTime() - GUEST_INACTIVE_DAYS * DAY_MS);

    if (!apply) {
        return { dryRun: true, pushInactive: await count(pushCandidates(pushCutoff)), guestAccounts: await count(guestCandidates(guestCutoff)), more: false };
    }

    const started = Date.now();
    const result: CleanupResult = { dryRun: false, pushInactive: 0, guestAccounts: 0, more: false };
    for (const [table, key, candidates] of [
        ["push_subscription", "pushInactive", pushCandidates(pushCutoff, BATCH)],
        ["user", "guestAccounts", guestCandidates(guestCutoff, BATCH)],
    ] as const) {
        for (let batch = 0; ; batch++) {
            if (batch >= MAX_BATCHES || Date.now() - started > BUDGET_MS) { result.more = true; break; }
            const removed = await deleteBatch(table, candidates);
            result[key] += removed;
            if (removed < BATCH) break;
        }
    }
    return result;
}
