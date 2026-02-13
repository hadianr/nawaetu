import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
    bookmarks,
    intentions,
    userCompletedMissions,
    dailyActivities,
    users,
    userReadingState
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

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
            readingState
        ] = await Promise.all([
            // 1. Profile & Settings
            db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    name: true,
                    gender: true,
                    archetype: true,
                    settings: true,
                    niatStreakCurrent: true,
                    niatStreakLongest: true,
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
                orderBy: [desc(intentions.niatDate)]
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
            })
        ]);

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            profile: {
                name: userProfile.name,
                gender: userProfile.gender,
                archetype: userProfile.archetype,
                settings: userProfile.settings,
                streaks: {
                    current: userProfile.niatStreakCurrent,
                    longest: userProfile.niatStreakLongest,
                }
            },
            bookmarks: userBookmarks,
            completedMissions: userMissions,
            intentions: userIntentions,
            dailyActivities: userDailyActivities,
            readingState: readingState ? {
                ...readingState,
                quranLastRead: {
                    surahId: readingState.surahId,
                    surahName: readingState.surahName,
                    verseId: readingState.verseId,
                    timestamp: readingState.lastReadAt?.getTime()
                }
            } : null,
        });

    } catch (error) {
        console.error("Error fetching full user data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
