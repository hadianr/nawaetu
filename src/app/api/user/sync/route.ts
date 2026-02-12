import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { bookmarks, intentions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bookmarks: localBookmarks, intentions: localIntentions, settings: localSettings } = body;

        // 1. Sync Bookmarks
        if (Array.isArray(localBookmarks) && localBookmarks.length > 0) {
            for (const b of localBookmarks) {
                // Check dupes based on key (surah:verse)
                const existing = await db.query.bookmarks.findFirst({
                    where: (bookmarks, { eq, and }) => and(
                        eq(bookmarks.userId, session.user.id),
                        eq(bookmarks.key, b.key)
                    )
                });

                if (!existing) {
                    await db.insert(bookmarks).values({
                        userId: session.user.id,
                        surahId: b.surahId,
                        surahName: b.surahName,
                        verseId: b.verseId,
                        verseText: b.verseText,
                        key: b.key,
                        note: b.note,
                        tags: b.tags,
                        createdAt: new Date(b.createdAt) || new Date(),
                    });
                }
            }
        }

        // 2. Sync Intentions (Journal)
        if (Array.isArray(localIntentions) && localIntentions.length > 0) {
            for (const i of localIntentions) {
                // Check almost exact duplicate (same date & text)
                // Ideally we have an ID from local, but UUID might conflict if generated locally.
                // We'll rely on date + text for dedupe heuristic or just insert.
                // Let's assume we just insert if not exact match.

                await db.insert(intentions).values({
                    userId: session.user.id,
                    niatText: i.niatText,
                    niatType: i.niatType,
                    niatDate: i.niatDate, // Ensure string matches date format
                    reflectionText: i.reflectionText,
                    reflectionRating: i.reflectionRating,
                    isPrivate: i.isPrivate ?? true,
                    createdAt: new Date(i.createdAt) || new Date()
                });
            }
        }

        // 3. Sync Settings (merge with existing)
        if (localSettings && typeof localSettings === 'object') {
            const user = await db.query.users.findFirst({
                where: eq(users.id, session.user.id),
                columns: { settings: true }
            });

            const currentSettings = user?.settings && typeof user.settings === 'string'
                ? JSON.parse(user.settings)
                : (user?.settings || {});

            const newSettings = {
                ...currentSettings,
                theme: localSettings.theme || currentSettings.theme,
                muadzin: localSettings.muadzin || currentSettings.muadzin,
                calculationMethod: localSettings.calculationMethod || currentSettings.calculationMethod,
                locale: localSettings.locale || currentSettings.locale,
                notificationPreferences: localSettings.notificationPreferences || currentSettings.notificationPreferences,
                lastReadQuran: localSettings.lastReadQuran || currentSettings.lastReadQuran
            };

            await db.update(users)
                .set({ settings: JSON.stringify(newSettings) })
                .where(eq(users.id, session.user.id));
        }

        return NextResponse.json({ status: "synced", message: "Data synchronized successfully" });

    } catch (e) {
        console.error("Sync error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
