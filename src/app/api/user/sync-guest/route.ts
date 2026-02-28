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
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
    bookmarks,
    intentions,
    userCompletedMissions,
    dailyActivities,
    users,
    userReadingState,
    NewIntention
} from "@/db/schema";
import { eq, sql, gte, lt } from "drizzle-orm";
import { z } from "zod";

// Schema validation for request body
const quranLastReadSchema = z.object({
    surahId: z.number(),
    surahName: z.string(),
    verseId: z.number(),
    timestamp: z.union([z.number(), z.string()]).optional(),
});

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
    })).max(1000).optional(),
    completedMissions: z.array(z.object({
        id: z.string(),
        xpEarned: z.number(),
        completedAt: z.string(),
    })).max(1000).optional(),
    intentions: z.array(z.object({
        intentionText: z.string().optional(),
        niatText: z.string().optional(), // backward compatibility
        intentionType: z.string().optional(),
        niatType: z.string().optional(), // backward compatibility
        intentionDate: z.string().optional(),
        niatDate: z.string().optional(), // backward compatibility
        reflectionText: z.string().optional(),
        reflectionRating: z.number().optional(),
        reflectedAt: z.string().optional(),
    })).max(100).optional(),
    activity: z.object({
        date: z.string(),
        quranAyat: z.number(),
        tasbihCount: z.number(),
        prayersLogged: z.array(z.string()).max(50),
    }).optional(),
    readingState: z.object({
        quranLastRead: z.preprocess((val) => {
            if (typeof val === 'string' && val.startsWith('{')) {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            return val;
        }, quranLastReadSchema)
    }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
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
                await tx.insert(userCompletedMissions)
                    .values(data.completedMissions.map(m => ({
                        userId,
                        missionId: m.id,
                        xpEarned: m.xpEarned,
                        completedAt: new Date(m.completedAt),
                    })))
                    .onConflictDoNothing(); // If already completed, skip
            }

            // 5. Sync Intentions (Journal) - Optimized with Batch lookup
            if (data.intentions && data.intentions.length > 0) {
                // Fetch existing intentions for this user to deduplicate once $O(1)$ in-memory
                const cloudIntentions = await tx.query.intentions.findMany({
                    where: eq(intentions.userId, userId),
                    columns: { id: true, intentionDate: true, reflectionText: true }
                });

                const cloudDateMap = new Map(cloudIntentions.map(i => [
                    new Date(i.intentionDate).toISOString().split('T')[0],
                    i
                ]));

                const intentionsToInsert: NewIntention[] = [];
                const intentionsToUpdate: { id: string, data: Partial<NewIntention> }[] = [];

                for (const i of data.intentions) {
                    const dateStr = i.intentionDate || i.niatDate;
                    if (!dateStr) continue;

                    const intentionDateValue = new Date(dateStr);
                    const localDayStr = intentionDateValue.toISOString().split('T')[0];

                    const existingIntention = cloudDateMap.get(localDayStr);

                    if (!existingIntention) {
                        intentionsToInsert.push({
                            userId,
                            intentionText: i.intentionText || i.niatText || "",
                            intentionType: (i.intentionType as any) || (i.niatType as any) || "daily",
                            intentionDate: intentionDateValue,
                            reflectionText: i.reflectionText || null,
                            reflectionRating: i.reflectionRating || null,
                            reflectedAt: i.reflectedAt ? new Date(i.reflectedAt) : null,
                        });
                        // Prevent duplicates in same batch
                        cloudDateMap.set(localDayStr, { id: 'new', intentionDate: intentionDateValue, reflectionText: i.reflectionText || null });
                    } else if (existingIntention && !existingIntention.reflectionText && i.reflectionText && existingIntention.id !== 'new') {
                        intentionsToUpdate.push({
                            id: existingIntention.id,
                            data: {
                                reflectionText: i.reflectionText,
                                reflectionRating: i.reflectionRating,
                                reflectedAt: i.reflectedAt ? new Date(i.reflectedAt) : null,
                                updatedAt: new Date()
                            }
                        });
                    }
                }

                if (intentionsToInsert.length > 0) {
                    await tx.insert(intentions).values(intentionsToInsert);
                }

                for (const u of intentionsToUpdate) {
                    await tx.update(intentions)
                        .set(u.data)
                        .where(eq(intentions.id, u.id));
                }
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
                            quranAyat: data.activity.quranAyat,
                            tasbihCount: data.activity.tasbihCount,
                            prayersLogged: data.activity.prayersLogged,
                            lastUpdatedAt: new Date(),
                        }
                    });
            }

            // 7. Sync Reading State
            if (data.readingState && data.readingState.quranLastRead) {
                const qlr = data.readingState.quranLastRead;

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
