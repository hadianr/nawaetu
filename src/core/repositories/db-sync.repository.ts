import {  db } from "@/db";
import {
    intentions,
    userCompletedMissions,
    dailyActivities,
    users,
    userReadingState
} from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export class DbSyncRepository {
    constructor(private userId: string) {}

    async syncBookmarkAsync(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        // Delegates to DbBookmarkRepository for this operation
        return undefined;
    }

    async syncIntention(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const intentionDateValue = new Date(data.intentionDate || data.niatDate);
            const startOfToday = new Date(intentionDateValue);
            startOfToday.setUTCHours(0, 0, 0, 0);
            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setUTCDate(startOfToday.getUTCDate() + 1);

            const existingIntention = await db.query.intentions.findFirst({
                where: (intentions, { eq, and, gte, lt }) =>
                    and(
                        eq(intentions.userId, this.userId),
                        gte(intentions.intentionDate, startOfToday),
                        lt(intentions.intentionDate, startOfTomorrow)
                    ),
            });

            if (!existingIntention) {
                const result = await db
                    .insert(intentions)
                    .values({
                        userId: this.userId,
                        intentionText: data.intentionText || data.niatText,
                        intentionType: data.intentionType || data.niatType,
                        intentionDate: intentionDateValue,
                        reflectionText: data.reflectionText,
                        reflectionRating: data.reflectionRating,
                        isPrivate: data.isPrivate ?? true,
                        createdAt: new Date(data.createdAt || Date.now()),
                    })
                    .returning({ id: intentions.id });

                return result[0]?.id;
            } else {
                await db.update(intentions).set({
                    intentionText: data.intentionText || data.niatText,
                    reflectionText: data.reflectionText || existingIntention.reflectionText,
                    reflectionRating: data.reflectionRating || existingIntention.reflectionRating,
                    updatedAt: new Date()
                }).where(eq(intentions.id, existingIntention.id));
                return existingIntention.id;
            }
        } else if (action === 'delete') {
            if (data.cloudId) {
                await db.delete(intentions).where(eq(intentions.id, data.cloudId));
            }
            return undefined;
        }

        throw new Error(`Unknown action: ${action}`);
    }

    async syncMission(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const completedAt = new Date(data.completedAt);
            const completedDate = completedAt.toISOString().split('T')[0];

            const existing = await db.query.userCompletedMissions.findFirst({
                where: (ucm, { eq, and }) =>
                    and(eq(ucm.userId, this.userId), eq(ucm.missionId, data.id), eq(ucm.completedDate, completedDate)),
            });

            if (!existing) {
                const result = await db
                    .insert(userCompletedMissions)
                    .values({
                        userId: this.userId,
                        missionId: data.id,
                        hasanahEarned: data.xpEarned,
                        completedAt: completedAt,
                        completedDate: completedDate,
                    })
                    .returning({ id: userCompletedMissions.id });
                return result[0]?.id;
            }
            return existing.id;
        }
        return undefined;
    }

    async syncDailyActivity(data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
        if (action === 'create' || action === 'update') {
            await db
                .insert(dailyActivities)
                .values({
                    userId: this.userId,
                    date: data.date,
                    quranAyat: data.quranAyat || 0,
                    quranReadingSeconds: data.quranReadingSeconds || 0,
                    hasanahGained: data.hasanahGained || 0,
                    tasbihCount: data.tasbihCount || 0,
                    prayersLogged: data.prayersLogged || [],
                })
                .onConflictDoUpdate({
                    target: [dailyActivities.userId, dailyActivities.date],
                    set: {
                        quranAyat: data.quranAyat,
                        quranReadingSeconds: data.quranReadingSeconds,
                        hasanahGained: data.hasanahGained,
                        tasbihCount: data.tasbihCount,
                        prayersLogged: data.prayersLogged,
                        lastUpdatedAt: new Date(),
                    },
                });
        }
    }

    async syncSetting(data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
        const user = await db.query.users.findFirst({
            where: eq(users.id, this.userId),
            columns: { settings: true },
        });

        const currentSettings = (user?.settings || {}) as Record<string, any>;
        const newSettings = { ...currentSettings, ...data };

        await db
            .update(users)
            .set({ settings: newSettings })
            .where(eq(users.id, this.userId));
    }

    async syncReadingState(data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
        let qlr = data.quranLastRead || data;
        if (typeof qlr === 'string' && qlr.startsWith('{')) {
            try { qlr = JSON.parse(qlr); } catch (e) { }
        }

        await db
            .insert(userReadingState)
            .values({
                userId: this.userId,
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
