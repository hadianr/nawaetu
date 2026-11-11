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
import { eq, and, sql } from "drizzle-orm";
import { findMissionDefinition, missionRewardOptions } from "@/data/missions";
import { normalizeMissionId } from "@/lib/mission-resolver";
import { processProgressionEvidence, processProgressionEvidenceBatch, raiseProgressionEvidence, reverseProgressionEvidence } from "@/core/repositories/progression.repository";
import { validateHasanahEvent } from "@/lib/hasanah-events";
import { isInSyncWindow, localDateIn, validTimezone } from "@/lib/utils/timezone";
import { sanitizeSyncedSettings } from "@/lib/validations/sync";

/** The user's own calendar day: an explicit date wins, then a date-only value, then the instant in the user's timezone. */
function missionLocalDate(item: MissionSyncPayload, completedAt: Date): string {
    const isDate = (value?: string) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '');
    if (isDate(item.completedDate)) return item.completedDate as string;
    if (isDate(item.completedAt)) return item.completedAt as string;
    return localDateIn(completedAt, item.timezone);
}

const DAILY_PRAYER_IDS = new Set(['fajr_prayer', 'dhuhr_prayer', 'asr_prayer', 'maghrib_prayer', 'isha_prayer']);

/**
 * A woman earns the full prayer reward whether she prays at home or at the mosque, so the server never
 * accepts the lower "alone" amounts for her, whichever device or app version sent them. The late (half)
 * amounts keep the same relation. Anyone else keeps what they reported.
 */
export function genderAdjustedReward(missionId: string, amount: number, gender: string | null): number {
    if (gender !== 'female' || !DAILY_PRAYER_IDS.has(missionId)) return amount;
    if (amount === 75 || amount === 37) return amount;
    return amount <= 12 ? 37 : 75;
}

function canonicalMissionReward(missionId: string, requested: unknown): number | null {
    const mission = findMissionDefinition(normalizeMissionId(missionId));
    if (!mission) return null;

    const validRewards = new Set(missionRewardOptions(mission).flatMap((reward) => [reward, Math.floor(reward * 0.5)]));
    const amount = Number(requested);
    return Number.isInteger(amount) && validRewards.has(amount) ? amount : mission.hasanahReward;
}

interface DailyActivitySyncData {
    date?: string;
    quranAyat?: number;
    quranReadingSeconds?: number;
    hasanahGained?: number;
    tasbihCount?: number;
    prayersLogged?: string[];
    timezone?: string;
}

interface StreakSyncData {
    current?: number;
    streak?: number;
    longest?: number;
    longestStreak?: number;
    lastDate?: string;
}

interface RamadhanDailySyncData {
    hijriYear: number | string;
    hijriDay: number | string;
    fajrAtMasjid?: boolean | null;
    dhuhrAtMasjid?: boolean | null;
    asrAtMasjid?: boolean | null;
    maghribAtMasjid?: boolean | null;
    ishaAtMasjid?: boolean | null;
    dhuha?: boolean;
    rawatibQabl?: boolean;
    rawatibBad?: boolean;
    witir?: boolean;
    istikharah?: boolean;
    hajat?: boolean;
    taubat?: boolean;
}

interface ReadingStateSyncData {
    quranLastRead?: string | ReadingStateValue;
    surahId?: number | string;
    surahName?: string;
    verseId?: number | string;
    timestamp?: string | number;
}

interface ReadingStateValue {
    surahId?: number | string;
    surahName?: string;
    verseId?: number | string;
    timestamp?: string | number;
}

interface SirahSyncData {
    sectionId?: string;
    id?: string;
    chapterSlug?: string;
    completedAt?: string | number;
    createdAt?: string | number;
}

interface BookmarkSyncPayload {
    surahId?: number | string;
    verseId?: number | string;
    surahName?: string;
    verseText?: string;
    translationText?: string | null;
    key?: string;
    note?: string | null;
    tags?: string[];
    createdAt?: string | number;
    cloudId?: string;
    id?: string;
}

export interface IntentionSyncPayload {
    intentionDate?: string | number;
    niatDate?: string | number;
    intentionText?: string;
    niatText?: string;
    intentionType?: string;
    niatType?: string;
    reflectionText?: string | null;
    reflectionRating?: number | null;
    isPrivate?: boolean;
    createdAt?: string | number;
    timezone?: string;
    cloudId?: string;
    id?: string;
}

export interface MissionSyncPayload {
    completedAt?: string;
    /** The user's local YYYY-MM-DD, sent by the client so the server never guesses the day. */
    completedDate?: string;
    id?: string;
    missionId?: string;
    hasanahEarned?: number;
    xpEarned?: number;
    timezone?: string;
}

export class DbSyncRepository {
    /** Mission records refused because their day is outside the sync window; the client keeps them on the device. */
    rejected = 0;

    private genderLookup: Promise<string | null> | null = null;

    constructor(private userId: string) {}

    /** Looked up at most once per request, and only if a prayer needs it. */
    private gender(): Promise<string | null> {
        this.genderLookup ??= (async () => {
            try {
                const user = await db.query.users.findFirst({ where: eq(users.id, this.userId), columns: { gender: true } });
                return user?.gender ?? null;
            } catch {
                return null;
            }
        })();
        return this.genderLookup;
    }

    private async rewardFor(missionId: string, amount: number): Promise<number> {
        return DAILY_PRAYER_IDS.has(missionId) ? genderAdjustedReward(missionId, amount, await this.gender()) : amount;
    }

    private outsideWindow(localDate: string, timezone: unknown): boolean {
        const outside = !isInSyncWindow(localDate, localDateIn(new Date(), timezone));
        if (outside) this.rejected++;
        return outside;
    }

    async syncBookmarkAsync(data: BookmarkSyncPayload, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
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
            const bookmarkId = data.cloudId || data.id;
            if (bookmarkId) {
                await db.delete(bookmarks).where(and(eq(bookmarks.userId, this.userId), eq(bookmarks.id, bookmarkId)));
            } else if (data.key || (data.surahId && data.verseId)) {
                const key = data.key || `${data.surahId}:${data.verseId}`;
                await db.delete(bookmarks).where(and(eq(bookmarks.userId, this.userId), eq(bookmarks.key, key)));
            }
            return undefined;
        }

        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Many bookmark saves in one statement. A device that was offline, or a first sync with a long
     * bookmark list, used to cost one database round trip per bookmark.
     */
    async syncBookmarksBatch(items: BookmarkSyncPayload[]): Promise<void> {
        const rows = new Map<string, typeof bookmarks.$inferInsert>();
        for (const data of items) {
            const surahId = Number(data.surahId);
            const verseId = Number(data.verseId);
            if (!Number.isInteger(surahId) || !Number.isInteger(verseId) || surahId < 1 || verseId < 1) continue;
            const key = data.key || `${surahId}:${verseId}`;
            rows.set(key, {
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
            });
        }
        if (rows.size === 0) return;

        await db
            .insert(bookmarks)
            .values([...rows.values()])
            .onConflictDoUpdate({
                target: [bookmarks.userId, bookmarks.key],
                set: {
                    surahName: sql`excluded.surah_name`,
                    verseText: sql`excluded.verse_text`,
                    translationText: sql`excluded.translation_text`,
                    note: sql`excluded.note`,
                    tags: sql`excluded.tags`,
                    updatedAt: new Date(),
                },
            });
    }

    async syncIntention(data: IntentionSyncPayload, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
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
                        intentionType: data.intentionType === 'prayer' || data.intentionType === 'custom'
                            ? data.intentionType
                            : data.niatType === 'prayer' || data.niatType === 'custom'
                                ? data.niatType
                                : 'daily',
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
            const intentionId = data.cloudId || data.id;
            if (intentionId) {
                await db.delete(intentions).where(and(eq(intentions.userId, this.userId), eq(intentions.id, intentionId)));
            }
            return undefined;
        }

        throw new Error(`Unknown action: ${action}`);
    }

    /** Points from sources other than missions. The server prices each kind; the client only reports it. */
    async syncHasanahEvent(data: Record<string, unknown>, action: 'create' | 'update' | 'delete'): Promise<void> {
        if (action === 'delete') return; // awards are never taken back by an event
        const event = validateHasanahEvent({
            kind: String(data.kind),
            key: String(data.key),
            amount: Number(data.amount),
            localDate: String(data.localDate),
        });
        if (!event) throw new Error('invalid hasanah event');
        if (this.outsideWindow(event.localDate, data.timezone)) return;

        const evidence = {
            source: event.source,
            sourceId: event.sourceId,
            hasanah: event.hasanah,
            localDate: event.localDate,
            occurredAt: new Date(`${event.localDate}T12:00:00Z`),
            timezone: validTimezone(data.timezone),
            countsForStreak: event.countsForStreak,
        };
        if (event.mode === 'raise') await raiseProgressionEvidence(this.userId, evidence);
        else await processProgressionEvidenceBatch(this.userId, [evidence]);
    }

    async syncMission(data: MissionSyncPayload, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
            const completedDate = missionLocalDate(data, completedAt);
            const missionId = normalizeMissionId(data.id || data.missionId || '');
            const canonical = canonicalMissionReward(missionId, data.hasanahEarned ?? data.xpEarned);
            const hasanahEarned = canonical === null ? null : await this.rewardFor(missionId, canonical);

            // Legacy clients can retain mission IDs no longer present in the
            // catalog. Ignore those records without blocking valid evidence.
            if (hasanahEarned === null) return undefined;
            if (Number.isNaN(completedAt.getTime())) throw new Error("Invalid mission completion date");
            if (this.outsideWindow(completedDate, data.timezone)) return undefined;

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

        if (action === 'delete') {
            // An undone prayer or mission: remove the record and take its Hasanah and streak day back.
            const missionId = normalizeMissionId(data.id || data.missionId || '');
            const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
            const completedDate = missionLocalDate(data, Number.isNaN(completedAt.getTime()) ? new Date() : completedAt);
            if (!findMissionDefinition(missionId) || this.outsideWindow(completedDate, data.timezone)) return undefined;

            await db.delete(userCompletedMissions).where(and(
                eq(userCompletedMissions.userId, this.userId),
                eq(userCompletedMissions.missionId, missionId),
                eq(userCompletedMissions.completedDate, completedDate),
            ));
            await reverseProgressionEvidence(this.userId, { source: 'mission', sourceId: `${missionId}:${completedDate}`, localDate: completedDate });
            return undefined;
        }
        return undefined;
    }

    async syncMissionsBatch(data: MissionSyncPayload[]): Promise<string[]> {
        const rows = new Map<string, {
            userId: string;
            missionId: string;
            hasanahEarned: number;
            completedAt: Date;
            completedDate: string;
            timezone: string;
        }>();

        for (const item of data) {
            const completedAt = item.completedAt ? new Date(item.completedAt) : new Date();
            if (Number.isNaN(completedAt.getTime())) continue;
            const completedDate = missionLocalDate(item, completedAt);
            const missionId = normalizeMissionId(item.id || item.missionId || '');
            const canonical = canonicalMissionReward(missionId, item.hasanahEarned ?? item.xpEarned);
            if (canonical === null) continue;
            const hasanahEarned = await this.rewardFor(missionId, canonical);
            if (this.outsideWindow(completedDate, item.timezone)) continue;
            rows.set(`${missionId}:${completedDate}`, {
                userId: this.userId,
                missionId,
                hasanahEarned,
                completedAt,
                completedDate,
                timezone: validTimezone(item.timezone),
            });
        }

        const evidenceRows = [...rows.values()];
        if (evidenceRows.length === 0) return [];
        const values = evidenceRows.map(({ timezone, ...row }) => { void timezone; return row; });

        const inserted = await db
            .insert(userCompletedMissions)
            .values(values)
            .onConflictDoNothing()
            .returning({ id: userCompletedMissions.id });

        // One transaction for the whole batch (one lock, one bulk insert, one streak update).
        await processProgressionEvidenceBatch(this.userId, evidenceRows.map((row) => ({
            source: 'mission' as const,
            sourceId: `${row.missionId}:${row.completedDate}`,
            hasanah: row.hasanahEarned,
            localDate: row.completedDate,
            occurredAt: row.completedAt,
            timezone: row.timezone,
        })));

        return inserted.map(row => row.id);
    }

    async syncDailyActivity(data: DailyActivitySyncData, action: 'create' | 'update' | 'delete'): Promise<void> {
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
                    // Merge instead of overwrite: a second device that has seen less of the day must not
                    // erase what the first one recorded. Counters keep the higher value and prayers are a union.
                    set: {
                        quranAyat: data.quranAyat !== undefined ? sql`GREATEST(COALESCE(${dailyActivities.quranAyat}, 0), ${data.quranAyat})` : undefined,
                        quranReadingSeconds: data.quranReadingSeconds !== undefined ? sql`GREATEST(COALESCE(${dailyActivities.quranReadingSeconds}, 0), ${data.quranReadingSeconds})` : undefined,
                        hasanahGained: data.hasanahGained !== undefined ? data.hasanahGained : undefined,
                        tasbihCount: data.tasbihCount !== undefined ? sql`GREATEST(COALESCE(${dailyActivities.tasbihCount}, 0), ${data.tasbihCount})` : undefined,
                        prayersLogged: data.prayersLogged !== undefined
                            ? sql`(SELECT COALESCE(jsonb_agg(DISTINCT prayer), '[]'::jsonb) FROM jsonb_array_elements_text(COALESCE(${dailyActivities.prayersLogged}, '[]'::jsonb) || ${JSON.stringify(data.prayersLogged)}::jsonb) AS prayer)`
                            : undefined,
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

    async syncSetting(data: Record<string, unknown>, action: 'create' | 'update' | 'delete'): Promise<void> {
        void action;
        const user = await db.query.users.findFirst({
            where: eq(users.id, this.userId),
            columns: { settings: true },
        });

        const currentSettings = (user?.settings || {}) as Record<string, unknown>;
        // Only user preferences: the client must not write server-owned keys such as guestSyncEligible.
        const newSettings = { ...currentSettings, ...sanitizeSyncedSettings(data) };

        await db
            .update(users)
            .set({ settings: newSettings, updatedAt: new Date() })
            .where(eq(users.id, this.userId));
    }

    async syncReadingState(data: ReadingStateSyncData, action: 'create' | 'update' | 'delete'): Promise<void> {
        void action;
        const qlr: ReadingStateValue = typeof data.quranLastRead === 'string'
            ? JSON.parse(data.quranLastRead) as ReadingStateValue
            : data.quranLastRead || data;
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

    async syncStreak(data: StreakSyncData): Promise<void> {
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

    async syncRamadhanFasting(data: {
        hijriYear: number | string;
        hijriDay: number | string;
        status?: string;
        consequence?: string;
        madzhab?: string | null;
        note?: string | null;
        qadhaDone?: boolean;
    }, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const status = ['fasting', 'not_fasting', 'sick', 'traveling', 'menstruation', 'postpartum', 'pregnant', 'breastfeeding', 'elderly'].includes(data.status ?? '')
                ? data.status as 'fasting' | 'not_fasting' | 'sick' | 'traveling' | 'menstruation' | 'postpartum' | 'pregnant' | 'breastfeeding' | 'elderly'
                : 'fasting';
            const consequence = ['none', 'qadha', 'fidyah', 'choice'].includes(data.consequence ?? '')
                ? data.consequence as 'none' | 'qadha' | 'fidyah' | 'choice'
                : 'none';
            const result = await db
                .insert(ramadhanFastingLog)
                .values({
                    userId: this.userId,
                    hijriYear: Number(data.hijriYear),
                    hijriDay: Number(data.hijriDay),
                    status,
                    consequence,
                    madzhab: data.madzhab || null,
                    note: data.note || null,
                    qadhaDone: Boolean(data.qadhaDone),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [ramadhanFastingLog.userId, ramadhanFastingLog.hijriYear, ramadhanFastingLog.hijriDay],
                    set: {
                        status,
                        consequence,
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

    async syncRamadhanTaraweh(data: {
        hijriYear: number | string;
        hijriDay: number | string;
        choice?: string | null;
        location?: string | null;
    }, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const choice = data.choice === '8' || data.choice === '20' ? data.choice : null;
            const location = data.location === 'masjid' || data.location === 'rumah' ? data.location : null;
            const result = await db
                .insert(ramadhanTarawehLog)
                .values({
                    userId: this.userId,
                    hijriYear: Number(data.hijriYear),
                    hijriDay: Number(data.hijriDay),
                    choice,
                    location,
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [ramadhanTarawehLog.userId, ramadhanTarawehLog.hijriYear, ramadhanTarawehLog.hijriDay],
                    set: {
                        choice,
                        location,
                        updatedAt: new Date(),
                    },
                })
                .returning({ id: ramadhanTarawehLog.id });
            return result[0]?.id;
        }
        return undefined;
    }

    async syncRamadhanDaily(data: RamadhanDailySyncData, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
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

    async syncSirahProgress(data: SirahSyncData, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const sectionId = data.sectionId || data.id;
            if (!sectionId) return undefined;
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
            const sectionId = data.sectionId || data.id;
            if (!sectionId) return undefined;
            await db
                .delete(sirahUserProgress)
                .where(and(eq(sirahUserProgress.userId, this.userId), eq(sirahUserProgress.sectionId, sectionId)));
            return undefined;
        }
        return undefined;
    }

    async syncSirahBookmark(data: SirahSyncData, action: 'create' | 'update' | 'delete'): Promise<string | undefined> {
        if (action === 'create' || action === 'update') {
            const sectionId = data.sectionId || data.id;
            if (!sectionId) return undefined;
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
            const sectionId = data.sectionId || data.id;
            if (!sectionId) return undefined;
            await db
                .delete(sirahBookmarks)
                .where(and(eq(sirahBookmarks.userId, this.userId), eq(sirahBookmarks.sectionId, sectionId)));
            return undefined;
        }
        return undefined;
    }
}
