/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookmarks, dailyActivities, userCompletedMissions, userProgressState, userStreakDays, userStreakState, users } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import { inSequence } from "@/lib/db-sequential";
import { logger } from "@/lib/logger";
import { calculatePlayerStats } from "@/lib/habits/progression";
import { syncRateLimiter } from "@/lib/rate-limit";
import { addDays, localDateIn, SYNC_WINDOW_DAYS_BACK } from "@/lib/utils/timezone";

export const maxDuration = 30;

const PARTS = ["progress", "missions", "activity", "bookmarks", "profile"] as const;
type Part = (typeof PARTS)[number];

/**
 * What another device needs to catch up, and nothing more. The caller names the parts it wants, so a
 * refresh after a sync asks only for progress (three small reads) instead of the whole account that
 * /api/user/full-data returns. Missions and activity are limited to the sync window.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        if (!(await syncRateLimiter.check(`pull:${userId}`)).success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const params = new URL(req.url, "http://localhost").searchParams;
        const requested = (params.get("parts") ?? PARTS.join(",")).split(",").filter((part): part is Part => (PARTS as readonly string[]).includes(part));
        const wants = (part: Part) => requested.includes(part);

        const today = localDateIn(new Date(), params.get("tz"));
        const windowStart = addDays(today, -(SYNC_WINDOW_DAYS_BACK + 1));
        const body: Record<string, unknown> = {};

        if (wants("progress")) {
            const [progressState, streakState, streakDays] = await inSequence([
                db.query.userProgressState.findFirst({ where: eq(userProgressState.userId, userId) }),
                db.query.userStreakState.findFirst({ where: eq(userStreakState.userId, userId) }),
                db.query.userStreakDays.findMany({
                    where: eq(userStreakDays.userId, userId),
                    orderBy: [desc(userStreakDays.localDate)],
                    columns: { localDate: true, status: true },
                    limit: 30,
                }),
            ]);
            body.progression = {
                ...calculatePlayerStats(progressState?.hasanahTotal ?? 0, progressState?.level ?? 1),
                streak: {
                    currentDays: streakState?.currentDays ?? 0,
                    longestDays: streakState?.longestDays ?? 0,
                    lastStreakDate: streakState?.lastStreakDate ?? null,
                    freezesAvailable: streakState?.freezesAvailable ?? 0,
                    timezone: streakState?.timezone ?? "UTC",
                    days: streakDays,
                },
            };
        }

        if (wants("profile")) {
            // Premium status and donations: a donation made on another device shows up without logging in again.
            const profile = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { isMuhsinin: true, totalInfaq: true } });
            body.profile = { isMuhsinin: profile?.isMuhsinin === true, totalInfaq: profile?.totalInfaq ?? 0 };
        }

        if (wants("missions")) {
            body.missions = await db.query.userCompletedMissions.findMany({
                where: and(eq(userCompletedMissions.userId, userId), gte(userCompletedMissions.completedDate, windowStart)),
                columns: { missionId: true, completedDate: true, hasanahEarned: true },
            });
        }

        if (wants("activity")) {
            body.activity = await db.query.dailyActivities.findMany({
                where: and(eq(dailyActivities.userId, userId), gte(dailyActivities.date, addDays(today, -2))),
                columns: { date: true, quranAyat: true, quranReadingSeconds: true, tasbihCount: true, hasanahGained: true, prayersLogged: true },
            });
        }

        if (wants("bookmarks")) {
            // Bookmarks carry verse text, so a cheap fingerprint tells the client whether to fetch them at all.
            const fingerprintOnly = params.get("fingerprint") === "1";
            if (fingerprintOnly) {
                const [row] = await db
                    .select({ count: sql<number>`count(*)`, latest: sql<string | null>`max(${bookmarks.updatedAt})` })
                    .from(bookmarks)
                    .where(eq(bookmarks.userId, userId));
                body.bookmarkFingerprint = `${row?.count ?? 0}:${row?.latest ? new Date(row.latest).getTime() : 0}`;
            } else {
                body.bookmarks = await db.query.bookmarks.findMany({ where: eq(bookmarks.userId, userId) });
            }
        }

        return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        logger.error("Error pulling user data", error, { route: "/api/user/pull" });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
