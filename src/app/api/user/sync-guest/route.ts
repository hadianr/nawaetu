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
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

// Schema validation for request body
const syncSchema = z.object({
    profile: z.object({
        name: z.string().optional(),
        gender: z.enum(["male", "female"]).optional(),
        archetype: z.enum(["beginner", "striver", "dedicated"]).optional(),
    }).optional(),
    settings: z.record(z.string(), z.any()).optional(),
    bookmarks: z.array(z.object({
        surahId: z.number(),
        verseId: z.number(),
        surahName: z.string(),
        verseText: z.string(),
        note: z.string().optional(),
        tags: z.array(z.string()).optional(),
        createdAt: z.number().optional(),
    })).optional(),
    completedMissions: z.array(z.object({
        id: z.string(),
        xpEarned: z.number(),
        completedAt: z.string(),
    })).optional(),
    intentions: z.array(z.object({
        niatText: z.string(),
        niatType: z.string().optional(),
        niatDate: z.string(), // YYYY-MM-DD
        reflectionText: z.string().optional(),
        reflectionRating: z.number().optional(),
        reflectedAt: z.string().optional(),
    })).optional(),
    activity: z.object({
        date: z.string(),
        quranAyat: z.number(),
        tasbihCount: z.number(),
        prayersLogged: z.array(z.string()),
    }).optional(),
    readingState: z.object({
        quranLastRead: z.any()
    }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();

        // Validate request body
        const result = syncSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid data format", details: result.error }, { status: 400 });
        }

        const data = result.data;

        await db.transaction(async (tx) => {
            // 1. Sync Profile (Priority: Guest > Google Default)
            // We only update if the user wants to sync (implied by calling this endpoint)
            // and we typically only do this for "new" accounts or if explictly requested.
            // For this implementation, we simply update if provided.
            if (data.profile) {
                await tx.update(users)
                    .set({
                        name: data.profile.name || undefined,
                        gender: (data.profile.gender as any) || undefined,
                        archetype: (data.profile.archetype as any) || undefined,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            }

            // 2. Sync Settings
            if (data.settings) {
                // --- Server-Side Sanitization ---
                const allowedSettings = ['theme', 'muadzin', 'calculationMethod', 'locale', 'hijriAdjustment', 'adhanPreferences'];
                const sanitizedSettings: Record<string, any> = {};

                for (const key of allowedSettings) {
                    if (key in data.settings) {
                        const val = data.settings[key];
                        // Primitive validation
                        if (typeof val === 'string' || typeof val === 'number') {
                            if (val.toString().length < 500) {
                                sanitizedSettings[key] = val;
                            }
                        } else if (key === 'adhanPreferences' && typeof val === 'object' && val !== null) {
                            if (Object.keys(val).length < 20) {
                                sanitizedSettings[key] = val;
                            }
                        }
                    }
                }

                await tx.update(users)
                    .set({
                        settings: sanitizedSettings,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
            }

            // 3. Sync Bookmarks
            if (data.bookmarks && data.bookmarks.length > 0) {
                // We'll upsert based on (userId, key)
                // key is generated as surahId:verseId
                const values = data.bookmarks.map((b) => ({
                    userId,
                    surahId: b.surahId,
                    verseId: b.verseId,
                    surahName: b.surahName,
                    verseText: b.verseText,
                    key: `${b.surahId}:${b.verseId}`,
                    note: b.note,
                    tags: b.tags,
                    createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
                }));

                await tx.insert(bookmarks)
                    .values(values)
                    .onConflictDoUpdate({
                        target: [bookmarks.userId, bookmarks.key], // compound unique index
                        set: {
                            note: sql`excluded.note`,
                            tags: sql`excluded.tags`,
                            updatedAt: new Date(),
                        }
                    });
            }

            // 4. Sync Completed Missions
            if (data.completedMissions && data.completedMissions.length > 0) {
                for (const m of data.completedMissions) {
                    await tx.insert(userCompletedMissions)
                        .values({
                            userId,
                            missionId: m.id,
                            xpEarned: m.xpEarned,
                            completedAt: new Date(m.completedAt),
                        })
                        .onConflictDoNothing(); // If already completed, skip
                }
            }

            // 5. Sync Intentions (Journal)
            if (data.intentions && data.intentions.length > 0) {
                await tx.insert(intentions)
                    .values(data.intentions.map((i) => ({
                        userId,
                        niatText: i.niatText,
                        niatType: (i.niatType as any) || "daily",
                        niatDate: i.niatDate,
                        reflectionText: i.reflectionText,
                        reflectionRating: i.reflectionRating,
                        reflectedAt: i.reflectedAt ? new Date(i.reflectedAt) : null,
                    })))
                    .onConflictDoNothing();
            }

            // 6. Sync Daily Activity
            if (data.activity) {
                // Upsert daily activity
                await tx.insert(dailyActivities)
                    .values({
                        userId,
                        date: data.activity.date,
                        quranAyat: data.activity.quranAyat,
                        tasbihCount: data.activity.tasbihCount,
                        prayersLogged: data.activity.prayersLogged,
                    })
                    .onConflictDoUpdate({
                        target: [dailyActivities.userId, dailyActivities.date],
                        set: {
                            quranAyat: data.activity.quranAyat, // We could sum, but "sync" usually implies taking the guest state
                            tasbihCount: data.activity.tasbihCount,
                            prayersLogged: data.activity.prayersLogged,
                            lastUpdatedAt: new Date(),
                        }
                    });
            }

            // 7. Sync Reading State
            if (data.readingState && data.readingState.quranLastRead) {
                let qlr = data.readingState.quranLastRead;

                // Robustness: If the data came as a string, parse it
                if (typeof qlr === 'string' && qlr.startsWith('{')) {
                    try { qlr = JSON.parse(qlr); } catch (e) { }
                }
                await tx.insert(userReadingState)
                    .values({
                        userId,
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

        return NextResponse.json({ success: true, message: "Guest data synced successfully" });

    } catch (error) {
        console.error("Error syncing guest data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
