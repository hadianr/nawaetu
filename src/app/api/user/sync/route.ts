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
import { db, checkConnection } from "@/db";
import { bookmarks, intentions, users, userCompletedMissions, dailyActivities, userReadingState } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { type SyncQueueEntry, type SyncEntityType } from "@/lib/sync-queue";
import { DbSyncRepository } from "@/core/repositories/db-sync.repository";
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

function convertLegacyBodyToEntries(body: any): SyncQueueEntry[] {
    const entries: SyncQueueEntry[] = [];
    if (!body || typeof body !== "object") return entries;

    const arrayMappers: Record<string, SyncEntityType> = {
        bookmarks: 'bookmark',
        intentions: 'intention',
        completedMissions: 'mission_progress',
    };

    for (const [key, type] of Object.entries(arrayMappers)) {
        if (Array.isArray(body[key])) {
            body[key].forEach((data: any, i: number) => {
                entries.push({ id: `legacy-${type}-${i}`, type, action: 'create', data, status: 'pending', retryCount: 0, createdAt: Date.now() });
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
            entries.push({ id: `legacy-${type}`, type, action: 'create', data: body[key], status: 'pending', retryCount: 0, createdAt: Date.now() });
        }
    }

    if (body.ramadhan?.tarawehLog && typeof body.ramadhan.tarawehLog === "object") {
        Object.entries(body.ramadhan.tarawehLog).forEach(([dateOrDay, count]: [string, any], i: number) => {
            const dayNum = parseInt(dateOrDay.split('-').pop() || '1', 10);
            entries.push({
                id: `legacy-taraweh-${i}`,
                type: 'ramadhan_taraweh',
                action: 'create',
                data: { hijriYear: 1447, hijriDay: isNaN(dayNum) ? 1 : dayNum, choice: String(count) },
                status: 'pending',
                retryCount: 0,
                createdAt: Date.now()
            });
        });
    }

    if (Array.isArray(body.extraEntries)) {
        body.extraEntries.forEach((extra: any, i: number) => {
            entries.push({
                id: extra.id || `legacy-extra-${i}`,
                type: extra.type,
                action: extra.action || 'create',
                data: extra.data || {},
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
            ) as any;
        }

        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as any;
        }

        let body: any = null;
        try {
            if (typeof req.text === "function") {
                const rawBody = await req.text();
                if (rawBody && rawBody.trim()) {
                    body = JSON.parse(rawBody);
                }
            } else if (typeof req.json === "function") {
                body = await req.json();
            }
        } catch (err) {
            return NextResponse.json(
                { success: false, synced: [], failed: [], error: "Invalid JSON payload", message: "Invalid request payload" } as any,
                { status: 400 }
            );
        }

        const userId = session.user.id;
        const repo = new DbSyncRepository(userId);

        const rawEntries = body && Array.isArray(body.entries) ? body.entries : convertLegacyBodyToEntries(body);

        if (rawEntries.length > 0) {
            const results = await Promise.allSettled(rawEntries.map((entry: SyncQueueEntry) => processSyncEntry(repo, entry)));

            const synced: Array<{ id: string; cloudId?: string }> = [];
            const failed: Array<{ id: string; error: string }> = [];

            results.forEach((res, i) => {
                const entry = rawEntries[i];
                if (res.status === "fulfilled") synced.push(res.value);
                else failed.push({ id: entry.id, error: res.reason?.message || "Sync failed" });
            });

            return NextResponse.json({ success: true, synced, failed, message: "Sync complete" });
        }

        return NextResponse.json({
            success: true,
            synced: [],
            failed: [],
            message: "No entries to sync",
        });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
        logger.error('Sync error', e, { route: '/api/user/sync' });
        return NextResponse.json(
            { success: false, synced: [], failed: [], error: errorMessage, message: "Sync failed" } as any,
            { status: 500 }
        );
    }
}
