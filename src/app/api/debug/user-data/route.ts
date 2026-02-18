
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, bookmarks, userCompletedMissions, dailyActivities, intentions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    // Prevent access in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({}, { status: 404 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userBookmarks = await db.query.bookmarks.findMany({
            where: eq(bookmarks.userId, user.id),
        });

        const userMissions = await db.query.userCompletedMissions.findMany({
            where: eq(userCompletedMissions.userId, user.id),
        });

        const userIntentions = await db.query.intentions.findMany({
            where: eq(intentions.userId, user.id),
        });

        const userActivity = await db.query.dailyActivities.findMany({
            where: eq(dailyActivities.userId, user.id),
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                settings: user.settings,
            },
            counts: {
                bookmarks: userBookmarks.length,
                missions: userMissions.length,
                intentions: userIntentions.length,
                activities: userActivity.length,
            },
            data: {
                bookmarks: userBookmarks,
                missions: userMissions,
                intentions: userIntentions,
                activity: userActivity,
            }
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
