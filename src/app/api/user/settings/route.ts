import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, bookmarks, intentions, pushSubscriptions, userReadingState } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { settings: true }
        });

        const readingState = await db.query.userReadingState.findFirst({
            where: eq(userReadingState.userId, session.user.id)
        });

        const settings = {
            ...((user?.settings || {}) as Record<string, any>),
            lastReadQuran: readingState ? {
                surahId: readingState.surahId,
                surahName: readingState.surahName,
                verseId: readingState.verseId,
                timestamp: readingState.lastReadAt?.getTime()
            } : null
        };

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

        // Extract lastReadQuran if present
        const lastReadQuran = settings.lastReadQuran;
        const { lastReadQuran: _, ...restSettings } = settings;

        const newSettings = {
            ...currentSettings,
            ...restSettings
        };

        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ settings: newSettings })
                .where(eq(users.id, session.user.id));

            if (lastReadQuran) {
                let qlr = lastReadQuran;

                // Robustness: If the data came as a string, parse it
                if (typeof qlr === 'string' && qlr.startsWith('{')) {
                    try { qlr = JSON.parse(qlr); } catch (e) { }
                }
                await tx.insert(userReadingState)
                    .values({
                        userId: session.user.id,
                        surahId: qlr.surahId,
                        surahName: qlr.surahName,
                        verseId: qlr.verseId,
                        lastReadAt: new Date(qlr.timestamp || Date.now()),
                        updatedAt: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: [userReadingState.userId],
                        set: {
                            surahId: qlr.surahId,
                            surahName: qlr.surahName,
                            verseId: qlr.verseId,
                            lastReadAt: new Date(qlr.timestamp || Date.now()),
                            updatedAt: new Date(),
                        }
                    });
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Settings updated successfully",
            data: newSettings
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
