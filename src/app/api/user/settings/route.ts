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

        const [
            user,
            readingState,
            userBookmarks,
            userIntentions,
            subscriptions
        ] = await Promise.all([
            // 1. Fetch user settings
            db.query.users.findFirst({
                where: eq(users.id, session.user.id),
                columns: { settings: true }
            }),
            // 2. Fetch reading state
            db.query.userReadingState.findFirst({
                where: eq(userReadingState.userId, session.user.id)
            }),
            // 3. Fetch user bookmarks
            db.query.bookmarks.findMany({
                where: eq(bookmarks.userId, session.user.id)
            }),
            // 4. Fetch user intentions (journal)
            db.query.intentions.findMany({
                where: eq(intentions.userId, session.user.id)
            }),
            // 5. Fetch push subscriptions (for notification preferences check)
            db.query.pushSubscriptions.findMany({
                where: eq(pushSubscriptions.userId, session.user.id)
            })
        ]);

        const currentSettings = (user?.settings || {}) as Record<string, any>;
        const allowedSettings = ['theme', 'muadzin', 'calculationMethod', 'locale', 'hijriAdjustment', 'adhanPreferences'];
        const sanitized: Record<string, any> = {};

        for (const key of allowedSettings) {
            if (key in currentSettings) {
                const val = currentSettings[key];
                if ((typeof val === 'string' || typeof val === 'number') && val.toString().length < 500) {
                    sanitized[key] = val;
                } else if (key === 'adhanPreferences' && typeof val === 'object' && val !== null && Object.keys(val).length < 20) {
                    sanitized[key] = val;
                }
            }
        }

        const settings = {
            ...sanitized,
            lastReadQuran: readingState ? {
                surahId: readingState.surahId,
                surahName: readingState.surahName,
                verseId: readingState.verseId,
                timestamp: readingState.lastReadAt?.getTime()
            } : null
        };

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
        const { settings: incomingSettings } = body;

        if (!incomingSettings || typeof incomingSettings !== 'object') {
            return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
        }

        // --- Server-Side Sanitization (Final Defense) ---
        const allowedSettings = ['theme', 'muadzin', 'calculationMethod', 'locale', 'hijriAdjustment', 'adhanPreferences'];
        const sanitizedIncoming: Record<string, any> = {};

        for (const key of allowedSettings) {
            if (key in incomingSettings) {
                const val = incomingSettings[key];
                // Primitive validation
                if (typeof val === 'string' || typeof val === 'number') {
                    if (val.toString().length < 500) {
                        sanitizedIncoming[key] = val;
                    }
                } else if (key === 'adhanPreferences' && typeof val === 'object' && val !== null) {
                    // Small object validation (count keys)
                    if (Object.keys(val).length < 20) {
                        sanitizedIncoming[key] = val;
                    }
                }
            }
        }

        // Ideally we fetch existing settings and merge, 
        // but for now we trust the client sends the relevant subset or full set
        // Let's first get existing to merge (safer)
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { settings: true }
        });

        const currentSettings = (user?.settings || {}) as Record<string, any>;

        // Clean current settings too (if they are already corrupted)
        const sanitizedCurrent: Record<string, any> = {};
        for (const key of allowedSettings) {
            if (key in currentSettings) {
                const val = currentSettings[key];
                if ((typeof val === 'string' || typeof val === 'number') && val.toString().length < 500) {
                    sanitizedCurrent[key] = val;
                } else if (key === 'adhanPreferences' && typeof val === 'object' && val !== null && Object.keys(val).length < 20) {
                    sanitizedCurrent[key] = val;
                }
            }
        }

        // Extract lastReadQuran if present (outside core settings)
        const lastReadQuran = incomingSettings.lastReadQuran;

        const newSettings = {
            ...sanitizedCurrent,
            ...sanitizedIncoming
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
