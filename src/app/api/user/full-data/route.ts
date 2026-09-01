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
import { getServerSession } from "@/lib/auth";
import { db } from "@/db";
import { logger } from "@/lib/logger";
import {
    bookmarks,
    intentions,
    userCompletedMissions,
    dailyActivities,
    users,
    userReadingState,
    userProgressState,
    userStreakDays,
    userStreakState,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculatePlayerStats } from "@/lib/habits/progression";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Parallel fetch for performance
        const [
            userProfile,
            userBookmarks,
            userMissions,
            userIntentions,
            userDailyActivities,
            readingState,
            progressState,
            streakState,
            streakDays,
        ] = await Promise.all([
            // 1. Profile & Settings
            db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    name: true,
                    gender: true,
                    settings: true,
                    isMuhsinin: true,
                    totalInfaq: true,
                }
            }),

            // 2. Bookmarks
            db.query.bookmarks.findMany({
                where: eq(bookmarks.userId, userId),
                orderBy: [desc(bookmarks.updatedAt)]
            }),

            // 3. Completed Missions
            db.query.userCompletedMissions.findMany({
                where: eq(userCompletedMissions.userId, userId),
            }),

            // 4. Intentions (Journal)
            db.query.intentions.findMany({
                where: eq(intentions.userId, userId),
                orderBy: [desc(intentions.intentionDate)]
            }),

            // 5. Daily Activities (Last 30 days maybe? Or just all for now)
            // For simple sync, let's fetch recent ones or all if volume is low.
            // Let's fetch all for now, assuming not massive history yet.
            db.query.dailyActivities.findMany({
                where: eq(dailyActivities.userId, userId),
                orderBy: [desc(dailyActivities.date)],
                limit: 365
            }),
            // 6. Reading State
            db.query.userReadingState.findFirst({
                where: eq(userReadingState.userId, userId),
            }),
            db.query.userProgressState.findFirst({
                where: eq(userProgressState.userId, userId),
            }),
            db.query.userStreakState.findFirst({
                where: eq(userStreakState.userId, userId),
            }),
            db.query.userStreakDays.findMany({
                where: eq(userStreakDays.userId, userId),
                orderBy: [desc(userStreakDays.localDate)],
                limit: 30,
            }),
        ]);

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const playerStats = calculatePlayerStats(progressState?.hasanahTotal ?? 0, progressState?.level ?? 1);

        return NextResponse.json({
            profile: {
                name: userProfile.name,
                gender: userProfile.gender,
                settings: userProfile.settings,
                guestSyncEligible: (userProfile.settings as Record<string, unknown> | null)?.guestSyncEligible === true,
                streaks: {
                    current: streakState?.currentDays ?? 0,
                    longest: streakState?.longestDays ?? 0,
                },
                isMuhsinin: userProfile.isMuhsinin,
                totalInfaq: userProfile.totalInfaq,
            },
            bookmarks: userBookmarks,
            completedMissions: userMissions,
            intentions: userIntentions,
            dailyActivities: userDailyActivities,
            progression: {
                ...playerStats,
                streak: {
                    currentDays: streakState?.currentDays ?? 0,
                    longestDays: streakState?.longestDays ?? 0,
                    lastStreakDate: streakState?.lastStreakDate ?? null,
                    freezesAvailable: streakState?.freezesAvailable ?? 0,
                    timezone: streakState?.timezone ?? "UTC",
                    days: streakDays,
                },
            },
            readingState: readingState ? {
                ...readingState,
                quranLastRead: {
                    surahId: readingState.surahId,
                    surahName: readingState.surahName,
                    verseId: readingState.verseId,
                    timestamp: readingState.lastReadAt?.getTime()
                }
            } : null,
        }, {
            headers: {
                // no-store: auth-dependent data; should never be stale at CDN or browser cache
                // (avoids 401 responses being cached and breaking GuestSyncManager after login)
                'Cache-Control': 'no-store',
            },
        });

    } catch (error) {
        logger.error('Error fetching full user data', error, { route: '/api/user/full-data' });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
