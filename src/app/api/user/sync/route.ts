import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
    bookmarks,
    intentions,
    users,
    userCompletedMissions,
    dailyActivities,
    userReadingState
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { type SyncQueueEntry } from "@/lib/sync-queue";

/**
 * Sync response format
 */
interface SyncResponse {
    success: boolean;
    synced: Array<{ id: string; cloudId?: string }>;
    failed: Array<{ id: string; error: string }>;
    message: string;
}

/**
 * Handle bookmark sync (create/update)
 */
async function handleBookmarkSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update' | 'delete'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (!data.surahId || !data.verseId) {
            throw new Error('Missing surahId or verseId');
        }

        const key = `${data.surahId}:${data.verseId}`;

        if (action === 'create' || action === 'update') {
            // Check if bookmark already exists
            const existing = await db.query.bookmarks.findFirst({
                where: (bookmarks, { eq, and }) =>
                    and(eq(bookmarks.userId, userId), eq(bookmarks.key, key)),
            });

            if (existing) {
                // Update existing
                await db
                    .update(bookmarks)
                    .set({
                        note: data.note,
                        tags: data.tags,
                        updatedAt: new Date(),
                    })
                    .where(eq(bookmarks.id, existing.id));

                return { id: entry.id, cloudId: existing.id };
            } else {
                // Create new
                const result = await db
                    .insert(bookmarks)
                    .values({
                        userId,
                        surahId: data.surahId,
                        surahName: data.surahName,
                        verseId: data.verseId,
                        verseText: data.verseText,
                        key,
                        note: data.note,
                        tags: data.tags,
                        createdAt: new Date(),
                    })
                    .returning({ id: bookmarks.id });

                return { id: entry.id, cloudId: result[0]?.id };
            }
        } else if (action === 'delete') {
            // Delete bookmark
            await db
                .delete(bookmarks)
                .where(and(eq(bookmarks.key, key), eq(bookmarks.userId, userId)));

            return { id: entry.id };
        }

        throw new Error(`Unknown action: ${action}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

/**
 * Handle intention (journal) sync
 */
async function handleIntentionSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update' | 'delete'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(intentions)
                .values({
                    userId,
                    niatText: data.niatText,
                    niatType: data.niatType,
                    niatDate: data.niatDate,
                    reflectionText: data.reflectionText,
                    reflectionRating: data.reflectionRating,
                    isPrivate: data.isPrivate ?? true,
                    createdAt: new Date(data.createdAt || Date.now()),
                })
                .returning({ id: intentions.id });

            return { id: entry.id, cloudId: result[0]?.id };
        } else if (action === 'delete') {
            // Delete by matching criteria (if cloudId provided)
            if (data.cloudId) {
                await db.delete(intentions).where(eq(intentions.id, data.cloudId));
            }
            return { id: entry.id };
        }

        throw new Error(`Unknown action: ${action}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

/**
 * Handle mission sync
 */
async function handleMissionSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (action === 'create' || action === 'update') {
            // Check if mission already completed
            const existing = await db.query.userCompletedMissions.findFirst({
                where: (ucm, { eq, and }) =>
                    and(eq(ucm.userId, userId), eq(ucm.missionId, data.id)),
            });

            if (!existing) {
                const result = await db
                    .insert(userCompletedMissions)
                    .values({
                        userId,
                        missionId: data.id,
                        xpEarned: data.xpEarned,
                        completedAt: new Date(data.completedAt),
                    })
                    .returning({ id: userCompletedMissions.id });
                return { id: entry.id, cloudId: result[0]?.id };
            }
            return { id: entry.id, cloudId: existing.id };
        }
        return { id: entry.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

/**
 * Handle daily activity sync
 */
async function handleDailyActivitySync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (action === 'create' || action === 'update') {
            // Upsert daily activity
            await db
                .insert(dailyActivities)
                .values({
                    userId,
                    date: data.date,
                    quranAyat: data.quranAyat,
                    tasbihCount: data.tasbihCount,
                    prayersLogged: data.prayersLogged,
                })
                .onConflictDoUpdate({
                    target: [dailyActivities.userId, dailyActivities.date],
                    set: {
                        quranAyat: data.quranAyat,
                        tasbihCount: data.tasbihCount,
                        prayersLogged: data.prayersLogged,
                        lastUpdatedAt: new Date(),
                    },
                });

            return { id: entry.id };
        }
        return { id: entry.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

/**
 * Handle setting sync
 */
async function handleSettingSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { settings: true },
        });

        const currentSettings = (user?.settings || {}) as Record<string, any>;

        const newSettings = {
            ...currentSettings,
            ...data,
        };

        await db
            .update(users)
            .set({ settings: newSettings })
            .where(eq(users.id, userId));

        return { id: entry.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

/**
 * Handle reading state sync
 */
async function handleReadingStateSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        let qlr = data.quranLastRead || data;

        // Robustness: If the data came as a string (double-stringified in local storage), parse it
        if (typeof qlr === 'string' && qlr.startsWith('{')) {
            try { qlr = JSON.parse(qlr); } catch (e) { }
        }

        await db
            .insert(userReadingState)
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
                },
            });

        return { id: entry.id };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { id: entry.id, error: errorMessage };
    }
}

export async function POST(req: NextRequest): Promise<NextResponse<SyncResponse | { error: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            ) as any;
        }

        const body = await req.json();
        const userId = session.user.id;


        /**
         * NEW FORMAT: Handle sync queue entries
         */
        if (Array.isArray(body.entries) && body.entries.length > 0) {
            const synced: Array<{ id: string; cloudId?: string }> = [];
            const failed: Array<{ id: string; error: string }> = [];

            for (const entry of body.entries as SyncQueueEntry[]) {

                let result;

                switch (entry.type) {
                    case 'bookmark':
                        result = await handleBookmarkSync(userId, entry, entry.action as 'create' | 'update' | 'delete');
                        break;

                    case 'journal':
                        result = await handleIntentionSync(userId, entry, entry.action as 'create' | 'update' | 'delete');
                        break;

                    case 'mission_progress':
                        // FIXED: Use specific handler for missions
                        result = await handleMissionSync(userId, entry, entry.action as 'create' | 'update');
                        break;

                    case 'daily_activity':
                        result = await handleDailyActivitySync(userId, entry, entry.action as 'create' | 'update');
                        break;

                    case 'setting':
                        result = await handleSettingSync(userId, entry, entry.action as 'create' | 'update');
                        break;

                    case 'reading_state':
                        result = await handleReadingStateSync(userId, entry, entry.action as 'create' | 'update');
                        break;

                    default:
                        result = {
                            id: entry.id,
                            error: `Unknown entity type: ${entry.type}`,
                        };
                }

                if ('error' in result) {
                    failed.push(result as { id: string; error: string });
                } else {
                    synced.push(result as { id: string; cloudId?: string });
                }
            }


            return NextResponse.json({
                success: failed.length === 0,
                synced,
                failed,
                message: `Synced ${synced.length} items${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
            });
        }

        /**
         * LEGACY FORMAT: Handle bulk arrays (for backwards compatibility)
         */
        const {
            bookmarks: localBookmarks,
            intentions: localIntentions,
            settings: localSettings,
            completedMissions: localMissions,
            dailyActivity: localActivity,
            readingState: localReadingState
        } = body;

        if (Array.isArray(localBookmarks) && localBookmarks.length > 0) {
            for (const b of localBookmarks) {
                const key = `${b.surahId}:${b.verseId}`;
                const existing = await db.query.bookmarks.findFirst({
                    where: (bookmarks, { eq, and }) =>
                        and(eq(bookmarks.userId, userId), eq(bookmarks.key, key)),
                });

                if (!existing) {
                    await db.insert(bookmarks).values({
                        userId,
                        surahId: b.surahId,
                        surahName: b.surahName,
                        verseId: b.verseId,
                        verseText: b.verseText,
                        key,
                        note: b.note,
                        tags: b.tags,
                        createdAt: new Date(b.createdAt || Date.now()),
                    });
                }
            }
        }

        if (Array.isArray(localIntentions) && localIntentions.length > 0) {
            for (const i of localIntentions) {
                // Determine niatDate - ensure it's a string YYYY-MM-DD
                let dateStr = i.niatDate;
                if (!dateStr && i.createdAt) {
                    dateStr = new Date(i.createdAt).toISOString().split('T')[0];
                }

                // Check for duplicates based on userId + niatDate + niatText (rudimentary check)
                // Better to just insert and let DB handle or skip if we don't have a unique constraint
                // For now, we just insert.
                await db.insert(intentions).values({
                    userId,
                    niatText: i.niatText,
                    niatType: i.niatType,
                    niatDate: dateStr,
                    reflectionText: i.reflectionText,
                    reflectionRating: i.reflectionRating,
                    isPrivate: i.isPrivate ?? true,
                    createdAt: new Date(i.createdAt || Date.now()),
                });
            }
        }

        // Sync Missions (Legacy)
        if (Array.isArray(localMissions) && localMissions.length > 0) {
            for (const m of localMissions) {
                await db.insert(userCompletedMissions)
                    .values({
                        userId,
                        missionId: m.id,
                        xpEarned: m.xpEarned,
                        completedAt: new Date(m.completedAt),
                    })
                    .onConflictDoNothing();
            }
        }

        // Sync Daily Activity (Legacy)
        if (localActivity && localActivity.date) {
            await db
                .insert(dailyActivities)
                .values({
                    userId,
                    date: localActivity.date,
                    quranAyat: localActivity.quranAyat || 0,
                    tasbihCount: localActivity.tasbihCount || 0,
                    prayersLogged: localActivity.prayersLogged || [],
                })
                .onConflictDoUpdate({
                    target: [dailyActivities.userId, dailyActivities.date],
                    set: {
                        quranAyat: localActivity.quranAyat,
                        tasbihCount: localActivity.tasbihCount,
                        prayersLogged: localActivity.prayersLogged,
                        lastUpdatedAt: new Date(),
                    }
                });
        }

        if (localReadingState && localReadingState.quranLastRead) {
            let qlr = localReadingState.quranLastRead;

            // Robustness: If the data came as a string (double-stringified in local storage), parse it
            if (typeof qlr === 'string' && qlr.startsWith('{')) {
                try { qlr = JSON.parse(qlr); } catch (e) { }
            }
            await db
                .insert(userReadingState)
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
                    },
                });
        }

        if (localSettings && typeof localSettings === 'object') {
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: { settings: true },
            });

            const currentSettings = (user?.settings || {}) as Record<string, any>;

            // Extract lastReadQuran if present in legacy format
            const lastReadQuran = localSettings.lastReadQuran || currentSettings.lastReadQuran;

            const { lastReadQuran: _, ...restSettings } = localSettings;

            const newSettings = {
                ...currentSettings,
                theme: restSettings.theme || currentSettings.theme,
                muadzin: restSettings.muadzin || currentSettings.muadzin,
                calculationMethod: restSettings.calculationMethod || currentSettings.calculationMethod,
                locale: restSettings.locale || currentSettings.locale,
                notificationPreferences: restSettings.notificationPreferences || currentSettings.notificationPreferences,
            };

            // Update settings (without lastReadQuran)
            await db
                .update(users)
                .set({ settings: newSettings })
                .where(eq(users.id, userId));

            // Move lastReadQuran to its own table
            if (lastReadQuran) {
                const qlr = lastReadQuran;
                await db
                    .insert(userReadingState)
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
                        },
                    });
            }
        }

        return NextResponse.json({
            success: true,
            synced: [],
            failed: [],
            message: 'Data synchronized successfully',
        });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Internal Server Error';
        console.error("Sync Error:", e);
        return NextResponse.json(
            {
                success: false,
                synced: [],
                failed: [],
                error: errorMessage,
                message: 'Sync failed',
            } as any,
            { status: 500 }
        );
    }
}
