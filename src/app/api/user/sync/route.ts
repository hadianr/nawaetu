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
import { getServerSession } from "@/lib/auth";
import { checkConnection } from "@/db";
import { logger } from "@/lib/logger";
import { type SyncQueueEntry, type SyncEntityType } from "@/lib/sync-queue";
import { DbSyncRepository, type IntentionSyncPayload, type MissionSyncPayload } from "@/core/repositories/db-sync.repository";
import { SyncEntrySchema } from "@/lib/validations/sync";

interface SyncResponse {
    success: boolean;
    synced: Array<{ id: string; cloudId?: string }>;
    failed: Array<{ id: string; error: string }>;
    message: string;
}

async function processSyncEntry(repo: DbSyncRepository, entry: SyncQueueEntry) {
    const parsed = SyncEntrySchema.safeParse(entry);
    if (!parsed.success) throw new Error("Invalid sync entry format");

    const { type, action, data } = parsed.data;

    switch (type) {
        case "bookmark": return { id: entry.id, cloudId: await repo.syncBookmarkAsync(data, action) };
        case "intention":
        case "journal": return { id: entry.id, cloudId: await repo.syncIntention(data, action) };
        case "mission":
        case "mission_progress": return { id: entry.id, cloudId: await repo.syncMission(data, action) };
        case "daily_activity":
        case "dhikr_stats": await repo.syncDailyActivity(data, action); return { id: entry.id };
        case "setting": await repo.syncSetting(data, action); return { id: entry.id };
        case "reading_state": await repo.syncReadingState(data, action); return { id: entry.id };
        case "streak": await repo.syncStreak(data); return { id: entry.id };
        case "ramadhan_fasting": return { id: entry.id, cloudId: await repo.syncRamadhanFasting(data, action) };
        case "ramadhan_taraweh": return { id: entry.id, cloudId: await repo.syncRamadhanTaraweh(data, action) };
        case "ramadhan_daily": return { id: entry.id, cloudId: await repo.syncRamadhanDaily(data, action) };
        case "sirah_progress": return { id: entry.id, cloudId: await repo.syncSirahProgress(data, action) };
        case "sirah_bookmark": return { id: entry.id, cloudId: await repo.syncSirahBookmark(data, action) };
        default: throw new Error(`Unknown type: ${type}`);
    }
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function toMissionPayload(value: Record<string, unknown>): MissionSyncPayload {
    return {
        id: typeof value.id === "string" ? value.id : undefined,
        missionId: typeof value.missionId === "string" ? value.missionId : undefined,
        completedAt: typeof value.completedAt === "string" ? value.completedAt : undefined,
        hasanahEarned: typeof value.hasanahEarned === "number" ? value.hasanahEarned : undefined,
        xpEarned: typeof value.xpEarned === "number" ? value.xpEarned : undefined,
        timezone: typeof value.timezone === "string" ? value.timezone : undefined,
    };
}

function toIntentionPayload(value: Record<string, unknown>): IntentionSyncPayload {
    return {
        intentionDate: typeof value.intentionDate === "string" || typeof value.intentionDate === "number" ? value.intentionDate : undefined,
        niatDate: typeof value.niatDate === "string" || typeof value.niatDate === "number" ? value.niatDate : undefined,
        intentionText: typeof value.intentionText === "string" ? value.intentionText : undefined,
        niatText: typeof value.niatText === "string" ? value.niatText : undefined,
        intentionType: typeof value.intentionType === "string" ? value.intentionType : undefined,
        niatType: typeof value.niatType === "string" ? value.niatType : undefined,
        reflectionText: typeof value.reflectionText === "string" ? value.reflectionText : null,
        reflectionRating: typeof value.reflectionRating === "number" ? value.reflectionRating : null,
        isPrivate: typeof value.isPrivate === "boolean" ? value.isPrivate : undefined,
        createdAt: typeof value.createdAt === "string" || typeof value.createdAt === "number" ? value.createdAt : undefined,
        timezone: typeof value.timezone === "string" ? value.timezone : undefined,
    };
}

function isSyncQueueEntry(value: unknown): value is SyncQueueEntry {
    const record = asRecord(value);
    return Boolean(record && typeof record.id === "string" && typeof record.type === "string" && typeof record.action === "string" && asRecord(record.data));
}

function convertLegacyBodyToEntries(value: unknown): SyncQueueEntry[] {
    const entries: SyncQueueEntry[] = [];
    const body = asRecord(value);
    if (!body) return entries;

    const arrayMappers: Record<string, SyncEntityType> = {
        bookmarks: 'bookmark',
        intentions: 'intention',
        completedMissions: 'mission_progress',
    };

    for (const [key, type] of Object.entries(arrayMappers)) {
        if (Array.isArray(body[key])) {
            body[key].forEach((data: unknown, i: number) => {
                entries.push({ id: `legacy-${type}-${i}`, type, action: 'create', data: asRecord(data) ?? {}, status: 'pending', retryCount: 0, createdAt: Date.now() });
            });
        }
    }

    const objectMappers: Record<string, SyncEntityType> = {
        dailyActivity: 'daily_activity',
        settings: 'setting',
        readingState: 'reading_state',
        streaks: 'streak',
    };

    for (const [key, type] of Object.entries(objectMappers)) {
        if (body[key] && typeof body[key] === "object") {
            entries.push({ id: `legacy-${type}`, type, action: 'create', data: asRecord(body[key]) ?? {}, status: 'pending', retryCount: 0, createdAt: Date.now() });
        }
    }

    const ramadhan = asRecord(body.ramadhan);
    const tarawehLog = asRecord(ramadhan?.tarawehLog);
    if (tarawehLog) {
        let i = 0;
        for (const [yearOrDate, value] of Object.entries(tarawehLog)) {
            const year = /^\d{4}$/.test(yearOrDate) ? Number(yearOrDate) : 1447;
            const days = /^\d{4}$/.test(yearOrDate) && value && typeof value === "object"
                ? Object.entries(value as Record<string, unknown>)
                : [[yearOrDate, value] as [string, unknown]];
            for (const [dateOrDay, entry] of days) {
                const choice = asRecord(entry)?.choice ?? entry;
                if (choice !== "8" && choice !== "20" && choice !== 8 && choice !== 20) continue;
                const dayNum = parseInt(dateOrDay.split('-').pop() || '1', 10);
                entries.push({
                    id: `legacy-taraweh-${i++}`,
                    type: 'ramadhan_taraweh',
                    action: 'create',
                    data: { hijriYear: year, hijriDay: isNaN(dayNum) ? 1 : dayNum, choice: String(choice) },
                    status: 'pending',
                    retryCount: 0,
                    createdAt: Date.now()
                });
            }
        }
    }

    if (Array.isArray(body.extraEntries)) {
        body.extraEntries.forEach((extra: unknown, i: number) => {
            const extraRecord = asRecord(extra);
            if (!extraRecord || typeof extraRecord.type !== "string") return;
            entries.push({
                id: typeof extraRecord.id === "string" ? extraRecord.id : `legacy-extra-${i}`,
                type: extraRecord.type as SyncEntityType,
                action: extraRecord.action === "update" || extraRecord.action === "delete" ? extraRecord.action : 'create',
                data: asRecord(extraRecord.data) ?? {},
                status: 'pending',
                retryCount: 0,
                createdAt: Date.now()
            });
        });
    }

    return entries;
}

export async function POST(req: NextRequest): Promise<NextResponse<SyncResponse | { error: string }>> {
    try {
        const dbStatus = await checkConnection();
        if (!dbStatus.success) {
            return NextResponse.json(
                { success: false, error: "Database offline", message: "Database is currently unavailable" },
                { status: 503 }
            );
        }

        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: unknown = null;
        try {
            if (typeof req.text === "function") {
                const rawBody = await req.text();
                if (rawBody && rawBody.trim()) {
                    body = JSON.parse(rawBody);
                }
            } else if (typeof req.json === "function") {
                body = await req.json();
            }
        } catch {
            return NextResponse.json(
                { success: false, synced: [], failed: [], error: "Invalid JSON payload", message: "Invalid request payload" },
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const repo = new DbSyncRepository(userId);

        const payload = asRecord(body) ?? {};
        const synced: Array<{ id: string; cloudId?: string }> = [];
        const failed: Array<{ id: string; error: string }> = [];
        const remainingPayload = { ...payload };

        if (!Array.isArray(payload.entries)) {
            const missionRecords = Array.isArray(payload.completedMissions)
                ? payload.completedMissions.map(asRecord).filter((value): value is Record<string, unknown> => value !== null)
                : [];
            const intentionRecords = Array.isArray(payload.intentions)
                ? payload.intentions.map(asRecord).filter((value): value is Record<string, unknown> => value !== null)
                : [];

            delete remainingPayload.completedMissions;
            delete remainingPayload.intentions;

            if (missionRecords.length > 0) {
                try {
                    await repo.syncMissionsBatch(missionRecords.map(toMissionPayload));
                    missionRecords.forEach((_, index) => synced.push({ id: `legacy-mission-${index}` }));
                } catch (error) {
                    failed.push({ id: 'legacy-missions', error: error instanceof Error ? error.message : 'Mission sync failed' });
                }
            }

            if (intentionRecords.length > 0) {
                try {
                    await repo.syncIntentionsBatch(intentionRecords.map(toIntentionPayload));
                    intentionRecords.forEach((_, index) => synced.push({ id: `legacy-intention-${index}` }));
                } catch (error) {
                    failed.push({ id: 'legacy-intentions', error: error instanceof Error ? error.message : 'Intention sync failed' });
                }
            }
        }

        const rawEntries: SyncQueueEntry[] = Array.isArray(payload.entries)
            ? payload.entries.filter(isSyncQueueEntry)
            : convertLegacyBodyToEntries(remainingPayload);

        if (rawEntries.length > 0) {
            const results = await Promise.allSettled(rawEntries.map((entry: SyncQueueEntry) => processSyncEntry(repo, entry)));

            results.forEach((res, i) => {
                const entry = rawEntries[i];
                if (res.status === "fulfilled") synced.push(res.value);
                else failed.push({ id: entry.id, error: res.reason?.message || "Sync failed" });
            });

            return NextResponse.json({ success: true, synced, failed, message: "Sync complete" });
        }

        return NextResponse.json({
            success: true,
            synced,
            failed,
            message: synced.length > 0 || failed.length > 0 ? "Sync complete" : "No entries to sync",
        });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
        logger.error('Sync error', e, { route: '/api/user/sync' });
        return NextResponse.json(
            { success: false, synced: [], failed: [], error: errorMessage, message: "Sync failed" },
            { status: 500 }
        );
    }
}
