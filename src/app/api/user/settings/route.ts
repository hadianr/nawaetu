import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, bookmarks, intentions, pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch user settings
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { settings: true }
        });

        const settings = (user?.settings || {}) as Record<string, any>;

        // 2. Fetch user bookmarks
        const userBookmarks = await db.query.bookmarks.findMany({
            where: eq(bookmarks.userId, session.user.id)
        });

        // 3. Fetch user intentions (journal)
        const userIntentions = await db.query.intentions.findMany({
            where: eq(intentions.userId, session.user.id)
        });

        // 4. Fetch push subscriptions (for notification preferences check)
        const subscriptions = await db.query.pushSubscriptions.findMany({
            where: eq(pushSubscriptions.userId, session.user.id)
        });

        return NextResponse.json({
            status: "success",
            data: {
                settings,
                bookmarks: userBookmarks,
                intentions: userIntentions,
                hasNotificationSubscription: subscriptions.length > 0
            }
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { settings } = body;

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
        }

        // Ideally we fetch existing settings and merge, 
        // but for now we trust the client sends the relevant subset or full set
        // Let's first get existing to merge (safer)
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { settings: true }
        });

        const currentSettings = (user?.settings || {}) as Record<string, any>;

        const newSettings = {
            ...currentSettings,
            ...settings
        };

        await db.update(users)
            .set({ settings: newSettings })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            status: "success",
            message: "Settings updated successfully",
            data: newSettings
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
