import {  db } from "@/db";
import {
    bookmarks,
    intentions,
    userCompletedMissions,
    dailyActivities,
    users,
    userReadingState,
    ramadhanFastingLog,
    ramadhanTarawehLog,
    ramadhanDailyLog,
    sirahUserProgress,
    sirahBookmarks,
} from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { findMissionDefinition } from "@/data/missions";
import { normalizeMissionId } from "@/lib/mission-resolver";
import { processProgressionEvidence } from "@/core/repositories/progression.repository";

function validTimezone(value: unknown): string {
    if (typeof value !== "string" || value.length > 100) return "UTC";
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
        return value;
    } catch {
        return "UTC";
    }
}

function canonicalMissionReward(missionId: string, requested: unknown): number | null {
    const mission = findMissionDefinition(normalizeMissionId(missionId));
    if (!mission) return null;

    const fullRewards = [mission.hasanahReward, ...(mission.completionOptions?.map((option) => option.hasanahReward) ?? [])];
    const validRewards = new Set(fullRewards.flatMap((reward) => [reward, Math.floor(reward * 0.5)]));
    const amount = Number(requested);
    return Number.isInteger(amount) && validRewards.has(amount) ? amount : mission.hasanahReward;
}

export class DbSyncRepository {
    constructor(private userId: string) {}

    async syncBookmarkAsync(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const surahId = Number(data.surahId);
            const verseId = Number(data.verseId);
            const key = data.key || `${surahId}:${verseId}`;
            const result = await db
                .insert(bookmarks)
                .values({
                    userId: this.userId,
                    surahId,
                    surahName: data.surahName || '',
                    verseId,
                    verseText: data.verseText || '',
                    translationText: data.translationText || null,
                    key,
                    note: data.note || null,
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [bookmarks.userId, bookmarks.key],
                    set: {
                        surahName: data.surahName || '',
                        verseText: data.verseText || '',
                        translationText: data.translationText || null,
                        note: data.note || null,
                        tags: Array.isArray(data.tags) ? data.tags : [],
                        updatedAt: new Date(),
                    },
                })
                .returning({ id: bookmarks.id });
            return result[0]?.id;
        } else if (action === 'delete') {
            if (data.cloudId || data.id) {
                await db.delete(bookmarks).where(and(eq(bookmarks.userId, this.userId), eq(bookmarks.id, data.cloudId || data.id)));
            } else if (data.key || (data.surahId && data.verseId)) {
                const key = data.key || `${data.surahId}:${data.verseId}`;
                await db.delete(bookmarks).where(and(eq(bookmarks.userId, this.userId), eq(bookmarks.key, key)));
            }
            return undefined;
        }

        throw new Error(`Unknown action: ${action}`);
    }

    async syncIntention(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const intentionDateValue = new Date(data.intentionDate || data.niatDate || Date.now());
            const startOfToday = new Date(intentionDateValue);
            startOfToday.setUTCHours(0, 0, 0, 0);
            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setUTCDate(startOfToday.getUTCDate() + 1);

            const existingIntention = await db.query.intentions.findFirst({
                where: (intentionsTable, { eq, and, gte, lt }) =>
                    and(
                        eq(intentionsTable.userId, this.userId),
                        gte(intentionsTable.intentionDate, startOfToday),
                        lt(intentionsTable.intentionDate, startOfTomorrow)
                    ),
            });

            if (!existingIntention) {
                const result = await db
                    .insert(intentions)
                    .values({
                        userId: this.userId,
                        intentionText: data.intentionText || data.niatText || '',
                        intentionType: data.intentionType || data.niatType || 'daily',
                        intentionDate: intentionDateValue,
                        reflectionText: data.reflectionText,
                        reflectionRating: data.reflectionRating,
                        isPrivate: data.isPrivate ?? true,
                        createdAt: new Date(data.createdAt || Date.now()),
                    })
                    .returning({ id: intentions.id });

                const intentionId = result[0]?.id;
                await processProgressionEvidence(this.userId, {
                    source: "intention",
                    sourceId: `intention:${intentionDateValue.toISOString().slice(0, 10)}`,
                    hasanah: 0,
                    localDate: intentionDateValue.toISOString().slice(0, 10),
                    occurredAt: intentionDateValue,
                    timezone: validTimezone(data.timezone),
                });
                return intentionId;
            } else {
                await db.update(intentions).set({
                    intentionText: data.intentionText || data.niatText || existingIntention.intentionText,
                    reflectionText: data.reflectionText !== undefined ? data.reflectionText : existingIntention.reflectionText,
                    reflectionRating: data.reflectionRating !== undefined ? data.reflectionRating : existingIntention.reflectionRating,
                    updatedAt: new Date()
                }).where(eq(intentions.id, existingIntention.id));
                await processProgressionEvidence(this.userId, {
                    source: "intention",
                    sourceId: `intention:${intentionDateValue.toISOString().slice(0, 10)}`,
                    hasanah: 0,
                    localDate: intentionDateValue.toISOString().slice(0, 10),
                    occurredAt: intentionDateValue,
                    timezone: validTimezone(data.timezone),
                });
                return existingIntention.id;
            }
        } else if (action === 'delete') {
            if (data.cloudId || data.id) {
                await db.delete(intentions).where(and(eq(intentions.userId, this.userId), eq(intentions.id, data.cloudId || data.id)));
            }
            return undefined;
        }

        throw new Error(`Unknown action: ${action}`);
    }

    async syncMission(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
            const completedDate = /^\d{4}-\d{2}-\d{2}$/.test(data.completedAt)
                ? data.completedAt
                : completedAt.toISOString().split('T')[0];
            const missionId = normalizeMissionId(data.id || data.missionId);
            const hasanahEarned = canonicalMissionReward(missionId, data.hasanahEarned ?? data.xpEarned);

            // Legacy clients can retain mission IDs no longer present in the
            // catalog. Ignore those records without blocking valid evidence.
            if (hasanahEarned === null) return undefined;
            if (Number.isNaN(completedAt.getTime())) throw new Error("Invalid mission completion date");

            const existing = await db.query.userCompletedMissions.findFirst({
                where: (ucm, { eq, and }) =>
                    and(eq(ucm.userId, this.userId), eq(ucm.missionId, missionId), eq(ucm.completedDate, completedDate)),
            });

            let resultId = existing?.id;
            if (!existing) {
                const result = await db
                    .insert(userCompletedMissions)
                    .values({
                        userId: this.userId,
                        missionId,
                        hasanahEarned,
                        completedAt: completedAt,
                        completedDate: completedDate,
                    })
                    .returning({ id: userCompletedMissions.id });
                resultId = result[0]?.id;
            }

            await processProgressionEvidence(this.userId, {
                source: "mission",
                sourceId: `${missionId}:${completedDate}`,
                hasanah: hasanahEarned,
                localDate: completedDate,
                occurredAt: completedAt,
                timezone: validTimezone(data.timezone),
            });

            return resultId;
        }
        return undefined;
    }

    async syncDailyActivity(data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
        if (action === 'create' || action === 'update') {
            const dateStr = data.date || new Date().toISOString().split('T')[0];
            await db
                .insert(dailyActivities)
                .values({
                    userId: this.userId,
                    date: dateStr,
                    quranAyat: data.quranAyat || 0,
                    quranReadingSeconds: data.quranReadingSeconds || 0,
                    hasanahGained: data.hasanahGained || 0,
                    tasbihCount: data.tasbihCount || 0,
                    prayersLogged: data.prayersLogged || [],
                })
                .onConflictDoUpdate({
                    target: [dailyActivities.userId, dailyActivities.date],
                    set: {
                        quranAyat: data.quranAyat !== undefined ? data.quranAyat : undefined,
                        quranReadingSeconds: data.quranReadingSeconds !== undefined ? data.quranReadingSeconds : undefined,
                        hasanahGained: data.hasanahGained !== undefined ? data.hasanahGained : undefined,
                        tasbihCount: data.tasbihCount !== undefined ? data.tasbihCount : undefined,
                        prayersLogged: data.prayersLogged !== undefined ? data.prayersLogged : undefined,
                        lastUpdatedAt: new Date(),
                    },
                });

            const source = Array.isArray(data.prayersLogged) && data.prayersLogged.length > 0
                ? "prayer"
                : Number(data.quranAyat) > 0 || Number(data.quranReadingSeconds) > 0
                    ? "quran"
                    : Number(data.tasbihCount) > 0 ? "dhikr" : null;
            if (source) {
                const occurredAt = new Date(`${dateStr}T12:00:00Z`);
                await processProgressionEvidence(this.userId, {
                    source,
                    sourceId: `${source}:${dateStr}`,
                    hasanah: 0,
                    localDate: dateStr,
                    occurredAt,
                    timezone: validTimezone(data.timezone),
                });
            }
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
            .set({ settings: newSettings, updatedAt: new Date() })
            .where(eq(users.id, this.userId));
    }

    async syncReadingState(data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
        let qlr = data.quranLastRead || data;
        if (typeof qlr === 'string' && qlr.startsWith('{')) {
            try { qlr = JSON.parse(qlr); } catch (e) { }
        }

        if (!qlr || !qlr.surahId) return;

        await db
            .insert(userReadingState)
            .values({
                userId: this.userId,
                surahId: Number(qlr.surahId),
                surahName: qlr.surahName || '',
                verseId: Number(qlr.verseId || 1),
                lastReadAt: new Date(qlr.timestamp || Date.now()),
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [userReadingState.userId],
                set: {
                    surahId: Number(qlr.surahId),
                    surahName: qlr.surahName || '',
                    verseId: Number(qlr.verseId || 1),
                    lastReadAt: new Date(qlr.timestamp || Date.now()),
                    updatedAt: new Date(),
                },
            });
    }

    async syncStreak(data: any): Promise<void> {
        await db
            .update(users)
            .set({
                intentionStreakCurrent: data.current ?? data.streak ?? 0,
                intentionStreakLongest: data.longest ?? data.longestStreak ?? 0,
                lastIntentionDate: data.lastDate ? data.lastDate : undefined,
                updatedAt: new Date(),
            })
            .where(eq(users.id, this.userId));
    }

    async syncRamadhanFasting(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(ramadhanFastingLog)
                .values({
                    userId: this.userId,
                    hijriYear: Number(data.hijriYear),
                    hijriDay: Number(data.hijriDay),
                    status: data.status || 'fasting',
                    consequence: data.consequence || 'none',
                    madzhab: data.madzhab || null,
                    note: data.note || null,
                    qadhaDone: Boolean(data.qadhaDone),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [ramadhanFastingLog.userId, ramadhanFastingLog.hijriYear, ramadhanFastingLog.hijriDay],
                    set: {
                        status: data.status || 'fasting',
                        consequence: data.consequence || 'none',
                        madzhab: data.madzhab || null,
                        note: data.note || null,
                        qadhaDone: Boolean(data.qadhaDone),
                        updatedAt: new Date(),
                    },
                })
                .returning({ id: ramadhanFastingLog.id });
            return result[0]?.id;
        }
        return undefined;
    }

    async syncRamadhanTaraweh(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(ramadhanTarawehLog)
                .values({
                    userId: this.userId,
                    hijriYear: Number(data.hijriYear),
                    hijriDay: Number(data.hijriDay),
                    choice: data.choice || null,
                    location: data.location || null,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [ramadhanTarawehLog.userId, ramadhanTarawehLog.hijriYear, ramadhanTarawehLog.hijriDay],
                    set: {
                        choice: data.choice || null,
                        location: data.location || null,
                        updatedAt: new Date(),
                    },
                })
                .returning({ id: ramadhanTarawehLog.id });
            return result[0]?.id;
        }
        return undefined;
    }

    async syncRamadhanDaily(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(ramadhanDailyLog)
                .values({
                    userId: this.userId,
                    hijriYear: Number(data.hijriYear),
                    hijriDay: Number(data.hijriDay),
                    fajrAtMasjid: data.fajrAtMasjid ?? null,
                    dhuhrAtMasjid: data.dhuhrAtMasjid ?? null,
                    asrAtMasjid: data.asrAtMasjid ?? null,
                    maghribAtMasjid: data.maghribAtMasjid ?? null,
                    ishaAtMasjid: data.ishaAtMasjid ?? null,
                    dhuha: Boolean(data.dhuha),
                    rawatibQabl: Boolean(data.rawatibQabl),
                    rawatibBad: Boolean(data.rawatibBad),
                    witir: Boolean(data.witir),
                    istikharah: Boolean(data.istikharah),
                    hajat: Boolean(data.hajat),
                    taubat: Boolean(data.taubat),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [ramadhanDailyLog.userId, ramadhanDailyLog.hijriYear, ramadhanDailyLog.hijriDay],
                    set: {
                        fajrAtMasjid: data.fajrAtMasjid ?? null,
                        dhuhrAtMasjid: data.dhuhrAtMasjid ?? null,
                        asrAtMasjid: data.asrAtMasjid ?? null,
                        maghribAtMasjid: data.maghribAtMasjid ?? null,
                        ishaAtMasjid: data.ishaAtMasjid ?? null,
                        dhuha: Boolean(data.dhuha),
                        rawatibQabl: Boolean(data.rawatibQabl),
                        rawatibBad: Boolean(data.rawatibBad),
                        witir: Boolean(data.witir),
                        istikharah: Boolean(data.istikharah),
                        hajat: Boolean(data.hajat),
                        taubat: Boolean(data.taubat),
                        updatedAt: new Date(),
                    },
                })
                .returning({ id: ramadhanDailyLog.id });
            return result[0]?.id;
        }
        return undefined;
    }

    async syncSirahProgress(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const sectionId = data.sectionId || data.id;
            const result = await db
                .insert(sirahUserProgress)
                .values({
                    userId: this.userId,
                    sectionId,
                    chapterSlug: data.chapterSlug || '',
                    completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
                })
                .onConflictDoUpdate({
                    target: [sirahUserProgress.userId, sirahUserProgress.sectionId],
                    set: {
                        chapterSlug: data.chapterSlug || '',
                        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
                    },
                })
                .returning({ id: sirahUserProgress.id });
            return result[0]?.id;
        } else if (action === 'delete') {
            await db
                .delete(sirahUserProgress)
                .where(and(eq(sirahUserProgress.userId, this.userId), eq(sirahUserProgress.sectionId, data.sectionId || data.id)));
            return undefined;
        }
        return undefined;
    }

    async syncSirahBookmark(data: any, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const sectionId = data.sectionId || data.id;
            const result = await db
                .insert(sirahBookmarks)
                .values({
                    userId: this.userId,
                    sectionId,
                    chapterSlug: data.chapterSlug || '',
                    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                })
                .onConflictDoUpdate({
                    target: [sirahBookmarks.userId, sirahBookmarks.sectionId],
                    set: {
                        chapterSlug: data.chapterSlug || '',
                    },
                })
                .returning({ id: sirahBookmarks.id });
            return result[0]?.id;
        } else if (action === 'delete') {
            await db
                .delete(sirahBookmarks)
                .where(and(eq(sirahBookmarks.userId, this.userId), eq(sirahBookmarks.sectionId, data.sectionId || data.id)));
            return undefined;
        }
        return undefined;
    }
}
