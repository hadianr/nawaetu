import { transactionDb } from "@/db";
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
  rebuildStreakState,
} from "@/lib/habits/progression";
import { and, asc, eq, sql } from "drizzle-orm";

export type ProgressionSource = "mission" | "prayer" | "quran" | "dhikr" | "intention";

export interface ProgressionEvidence {
  source: ProgressionSource;
  sourceId: string;
  hasanah: number;
  localDate: string;
  occurredAt: Date;
  timezone: string;
  origin?: "server" | "guest_import" | "backfill";
}

export async function processProgressionEvidence(userId: string, evidence: ProgressionEvidence) {
  if (!Number.isInteger(evidence.hasanah) || evidence.hasanah < 0) {
    throw new Error("Invalid canonical Hasanah award");
  }

  return transactionDb.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const insertedAward = await tx
      .insert(hasanahLedger)
      .values({
        userId,
        source: evidence.source,
        sourceId: evidence.sourceId,
        amount: evidence.hasanah,
        occurredAt: evidence.occurredAt,
        origin: evidence.origin ?? "server",
      })
      .onConflictDoNothing()
      .returning({ id: hasanahLedger.id });

    const [currentProgress, currentStreak] = await Promise.all([
      tx.query.userProgressState.findFirst({ where: eq(userProgressState.userId, userId) }),
      tx.query.userStreakState.findFirst({ where: eq(userStreakState.userId, userId) }),
    ]);

    const insertedDay = await tx
      .insert(userStreakDays)
      .values({
        userId,
        localDate: evidence.localDate,
        source: evidence.source,
        sourceId: evidence.sourceId,
        occurredAt: evidence.occurredAt,
        timezone: evidence.timezone,
        origin: evidence.origin ?? "server",
      })
      .onConflictDoNothing()
      .returning({ id: userStreakDays.id });

    const nextHasanah = Math.max(0, (currentProgress?.hasanahTotal ?? 0) + (insertedAward.length > 0 ? evidence.hasanah : 0));
    const player = calculatePlayerStats(nextHasanah, currentProgress?.level ?? 1);
    const [progress] = await tx
      .insert(userProgressState)
      .values({
        userId,
        hasanahTotal: nextHasanah,
        level: player.level,
        levelRuleVersion: LEVEL_RULES_VERSION,
      })
      .onConflictDoUpdate({
        target: userProgressState.userId,
        set: {
          hasanahTotal: nextHasanah,
          level: player.level,
          levelRuleVersion: LEVEL_RULES_VERSION,
          updatedAt: new Date(),
        },
      })
      .returning();

    let streak = currentStreak ?? null;
    // Rebuild from ordered canonical days so out-of-order sync cannot reset the streak.
    if (insertedDay.length > 0 || insertedAward.length > 0) {
      const qualifiedDays = await tx.query.userStreakDays.findMany({
        where: and(eq(userStreakDays.userId, userId), eq(userStreakDays.status, "qualified")),
        orderBy: [asc(userStreakDays.localDate)],
        columns: { localDate: true },
      });
      const rebuilt: ProgressionStreakState = rebuildStreakState(
        qualifiedDays.map((day) => day.localDate),
        currentStreak?.freezesAvailable ?? 0,
      );
      [streak] = await tx
        .insert(userStreakState)
        .values({ userId, ...rebuilt, timezone: evidence.timezone })
        .onConflictDoUpdate({
          target: userStreakState.userId,
          set: { ...rebuilt, timezone: evidence.timezone, updatedAt: new Date() },
        })
        .returning();
    }

    return { duplicate: insertedAward.length === 0, progress, streak };
  });
}
