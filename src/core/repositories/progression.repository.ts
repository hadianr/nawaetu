import { transactionDb } from "@/db";
import { inSequence } from "@/lib/db-sequential";
import {
  hasanahLedger,
  userProgressState,
  userStreakDays,
  userStreakState,
} from "@/db/schema";
import {
  LEVEL_RULES_VERSION,
  ProgressionStreakState,
  calculatePlayerStats,
  advanceStreak,
  rebuildStreakDetailed,
} from "@/lib/habits/progression";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

export type ProgressionSource = "mission" | "prayer" | "quran" | "dhikr" | "intention" | "streak_milestone";

export interface ProgressionEvidence {
  source: ProgressionSource;
  sourceId: string;
  hasanah: number;
  localDate: string;
  occurredAt: Date;
  timezone: string;
  origin?: "server" | "guest_import" | "backfill";
  /** False for awards that are not a day of activity themselves, such as a streak milestone. */
  countsForStreak?: boolean;
}

type Tx = Parameters<Parameters<typeof transactionDb.transaction>[0]>[0];

/**
 * Makes the stored "frozen" days equal to the days the streak rules say a freeze protected. A frozen day
 * is a missed day with no evidence behind it, so it is derived from the qualified days and can change when
 * an older day arrives late or an award is undone.
 */
async function reconcileFrozenDays(tx: Tx, userId: string, frozenDates: string[], timezone: string) {
  const existing = await tx.query.userStreakDays.findMany({
    where: and(eq(userStreakDays.userId, userId), eq(userStreakDays.status, "frozen")),
    columns: { localDate: true },
  });
  const have = new Set(existing.map((row) => row.localDate));
  const want = new Set(frozenDates);

  const stale = [...have].filter((date) => !want.has(date));
  if (stale.length > 0) {
    await tx.delete(userStreakDays).where(and(
      eq(userStreakDays.userId, userId),
      eq(userStreakDays.status, "frozen"),
      inArray(userStreakDays.localDate, stale),
    ));
  }

  const missing = frozenDates.filter((date) => !have.has(date));
  if (missing.length > 0) {
    await tx.insert(userStreakDays).values(missing.map((date) => ({
      userId,
      localDate: date,
      status: "frozen" as const,
      source: "adjustment" as const,
      sourceId: `freeze:${date}`,
      occurredAt: new Date(`${date}T12:00:00Z`),
      timezone,
      origin: "server" as const,
    }))).onConflictDoNothing();
  }
}

/**
 * Records many pieces of evidence in one transaction: one lock, one bulk insert per table and at most
 * one streak update, however many items arrive. Syncing a week of offline activity used to cost about
 * seven round trips per item.
 */
export async function processProgressionEvidenceBatch(userId: string, evidences: ProgressionEvidence[]) {
  const unique = new Map<string, ProgressionEvidence>();
  for (const evidence of evidences) {
    if (!Number.isInteger(evidence.hasanah) || evidence.hasanah < 0) {
      throw new Error("Invalid canonical Hasanah award");
    }
    unique.set(`${evidence.source}\u0000${evidence.sourceId}`, evidence);
  }
  const items = [...unique.values()];
  if (items.length === 0) return { inserted: 0, duplicates: 0, progress: null, streak: null };

  return transactionDb.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const insertedAwards = await tx
      .insert(hasanahLedger)
      .values(items.map((item) => ({
        userId,
        source: item.source,
        sourceId: item.sourceId,
        amount: item.hasanah,
        occurredAt: item.occurredAt,
        origin: item.origin ?? "server",
      })))
      .onConflictDoNothing()
      .returning({ amount: hasanahLedger.amount });
    const added = insertedAwards.reduce((sum, row) => sum + row.amount, 0);

    const [currentProgress, currentStreak] = await inSequence([
      tx.query.userProgressState.findFirst({ where: eq(userProgressState.userId, userId) }),
      tx.query.userStreakState.findFirst({ where: eq(userStreakState.userId, userId) }),
    ]);

    // One streak day per calendar day, whichever evidence arrived first.
    const dayRows = new Map<string, ProgressionEvidence>();
    for (const item of items) {
      if (item.countsForStreak !== false && !dayRows.has(item.localDate)) dayRows.set(item.localDate, item);
    }
    const insertedDays = dayRows.size === 0 ? [] : await tx
      .insert(userStreakDays)
      .values([...dayRows.values()].map((item) => ({
        userId,
        localDate: item.localDate,
        source: item.source,
        sourceId: item.sourceId,
        occurredAt: item.occurredAt,
        timezone: item.timezone,
        origin: item.origin ?? "server",
      })))
      // A day a freeze protected can still turn out to have evidence (it arrived late): that day becomes
      // a real one. A day that is already qualified is left as it is.
      .onConflictDoUpdate({
        target: [userStreakDays.userId, userStreakDays.localDate],
        set: {
          status: "qualified",
          source: sql`excluded.source`,
          sourceId: sql`excluded.source_id`,
          occurredAt: sql`excluded.occurred_at`,
          timezone: sql`excluded.timezone`,
          origin: sql`excluded.origin`,
        },
        setWhere: eq(userStreakDays.status, "frozen"),
      })
      .returning({ localDate: userStreakDays.localDate });

    let progress = currentProgress ?? null;
    if (added > 0 || !currentProgress) {
      const nextHasanah = Math.max(0, (currentProgress?.hasanahTotal ?? 0) + added);
      const player = calculatePlayerStats(nextHasanah, currentProgress?.level ?? 1);
      [progress] = await tx
        .insert(userProgressState)
        .values({ userId, hasanahTotal: nextHasanah, level: player.level, levelRuleVersion: LEVEL_RULES_VERSION })
        .onConflictDoUpdate({
          target: userProgressState.userId,
          set: { hasanahTotal: nextHasanah, level: player.level, levelRuleVersion: LEVEL_RULES_VERSION, updatedAt: new Date() },
        })
        .returning();
    }

    let streak = currentStreak ?? null;
    // A second item on a day that already counts changes nothing, so the streak is only touched when a
    // new day arrived (or there is no streak row yet).
    if (insertedDays.length > 0 || !currentStreak) {
      const timezone = items[items.length - 1].timezone;
      const newDates = insertedDays.map((row) => row.localDate).sort();
      const inOrder = Boolean(currentStreak) && newDates.every((date) => date > (currentStreak?.lastStreakDate ?? ""));

      let next: ProgressionStreakState;
      if (currentStreak && inOrder) {
        // Normal case: the new days come after the last one, so continue from the stored state.
        const newlyFrozen: string[] = [];
        next = newDates.reduce<ProgressionStreakState>((state, date) => {
          const step = advanceStreak(state, date);
          if (step.frozenDate) newlyFrozen.push(step.frozenDate);
          return step.state;
        }, {
          currentDays: currentStreak.currentDays,
          longestDays: currentStreak.longestDays,
          lastStreakDate: currentStreak.lastStreakDate,
          freezesAvailable: currentStreak.freezesAvailable,
        });
        if (newlyFrozen.length > 0) {
          await tx.insert(userStreakDays).values(newlyFrozen.map((date) => ({
            userId,
            localDate: date,
            status: "frozen" as const,
            source: "adjustment" as const,
            sourceId: `freeze:${date}`,
            occurredAt: new Date(`${date}T12:00:00Z`),
            timezone,
            origin: "server" as const,
          }))).onConflictDoNothing();
        }
      } else {
        // Out-of-order sync (an older day arrived late): rebuild from the ordered history so it cannot reset.
        const qualifiedDays = await tx.query.userStreakDays.findMany({
          where: and(eq(userStreakDays.userId, userId), eq(userStreakDays.status, "qualified")),
          orderBy: [asc(userStreakDays.localDate)],
          columns: { localDate: true },
        });
        const rebuilt = rebuildStreakDetailed(qualifiedDays.map((day) => day.localDate));
        next = rebuilt.state;
        await reconcileFrozenDays(tx, userId, rebuilt.frozenDates, timezone);
      }

      [streak] = await tx
        .insert(userStreakState)
        .values({ userId, ...next, timezone })
        .onConflictDoUpdate({ target: userStreakState.userId, set: { ...next, timezone, updatedAt: new Date() } })
        .returning();
    }

    return { inserted: insertedAwards.length, duplicates: items.length - insertedAwards.length, progress, streak };
  });
}

export async function processProgressionEvidence(userId: string, evidence: ProgressionEvidence) {
  const result = await processProgressionEvidenceBatch(userId, [evidence]);
  return { duplicate: result.inserted === 0, progress: result.progress, streak: result.streak };
}

/**
 * Takes back one award (an undone prayer or mission). The ledger row goes, the total drops by its amount
 * and the level never falls (earned-level floor). The streak day stays only if something else still
 * happened that day; every source id ends with ":<local date>" so that is one lookup.
 */
export async function reverseProgressionEvidence(
  userId: string,
  target: { source: ProgressionSource; sourceId: string; localDate: string },
) {
  return transactionDb.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const removed = await tx
      .delete(hasanahLedger)
      .where(and(
        eq(hasanahLedger.userId, userId),
        eq(hasanahLedger.source, target.source),
        eq(hasanahLedger.sourceId, target.sourceId),
      ))
      .returning({ amount: hasanahLedger.amount });
    if (removed.length === 0) return { reversed: false };

    const currentProgress = await tx.query.userProgressState.findFirst({ where: eq(userProgressState.userId, userId) });
    if (currentProgress && removed[0].amount > 0) {
      const next = Math.max(0, currentProgress.hasanahTotal - removed[0].amount);
      await tx
        .update(userProgressState)
        .set({
          hasanahTotal: next,
          level: calculatePlayerStats(next, currentProgress.level).level,
          updatedAt: new Date(),
        })
        .where(eq(userProgressState.userId, userId));
    }

    const [stillActive] = await tx
      .select({ id: hasanahLedger.id })
      .from(hasanahLedger)
      .where(and(eq(hasanahLedger.userId, userId), sql`${hasanahLedger.sourceId} like ${"%:" + target.localDate}`))
      .limit(1);

    if (!stillActive) {
      const deleted = await tx
        .delete(userStreakDays)
        .where(and(eq(userStreakDays.userId, userId), eq(userStreakDays.localDate, target.localDate)))
        .returning({ id: userStreakDays.id });
      if (deleted.length > 0) {
        const days = await tx.query.userStreakDays.findMany({
          where: and(eq(userStreakDays.userId, userId), eq(userStreakDays.status, "qualified")),
          orderBy: [asc(userStreakDays.localDate)],
          columns: { localDate: true },
        });
        const rebuilt = rebuildStreakDetailed(days.map((day) => day.localDate));
        await tx
          .update(userStreakState)
          .set({ ...rebuilt.state, updatedAt: new Date() })
          .where(eq(userStreakState.userId, userId));
        await reconcileFrozenDays(tx, userId, rebuilt.frozenDates, "UTC");
      }
    }

    return { reversed: true };
  });
}

/**
 * For awards that grow during the day (reading time): raise the stored amount and the total by the
 * difference. If nothing is recorded yet this is an ordinary first award.
 */
export async function raiseProgressionEvidence(userId: string, evidence: ProgressionEvidence) {
  const raised = await transactionDb.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
    const [existing] = await tx
      .select({ id: hasanahLedger.id, amount: hasanahLedger.amount })
      .from(hasanahLedger)
      .where(and(eq(hasanahLedger.userId, userId), eq(hasanahLedger.source, evidence.source), eq(hasanahLedger.sourceId, evidence.sourceId)))
      .limit(1);
    if (!existing) return null;
    const difference = evidence.hasanah - existing.amount;
    if (difference <= 0) return { changed: false };

    await tx.update(hasanahLedger).set({ amount: evidence.hasanah }).where(eq(hasanahLedger.id, existing.id));
    const progress = await tx.query.userProgressState.findFirst({ where: eq(userProgressState.userId, userId) });
    const next = (progress?.hasanahTotal ?? 0) + difference;
    await tx
      .insert(userProgressState)
      .values({ userId, hasanahTotal: next, level: calculatePlayerStats(next, progress?.level ?? 1).level, levelRuleVersion: LEVEL_RULES_VERSION })
      .onConflictDoUpdate({
        target: userProgressState.userId,
        set: { hasanahTotal: next, level: calculatePlayerStats(next, progress?.level ?? 1).level, updatedAt: new Date() },
      });
    return { changed: true };
  });

  if (raised === null) await processProgressionEvidenceBatch(userId, [evidence]);
  return raised ?? { changed: true };
}
