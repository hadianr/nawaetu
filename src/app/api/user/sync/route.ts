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
import { type SyncQueueEntry } from "@/lib/sync-queue";
import { DbSyncRepository, type MissionSyncPayload } from "@/core/repositories/db-sync.repository";
import { SyncEntrySchema } from "@/lib/validations/sync";
import { syncRateLimiter } from "@/lib/rate-limit";

interface SyncResponse {
    success: boolean;
    synced: Array<{ id: string; cloudId?: string }>;
    failed: Array<{ id: string; error: string }>;
    message: string;
    /** Records outside the sync window. They are not errors: the client keeps them on the device. */
    rejected?: number;
}

// Twice the client queue size (100), so honest clients never hit it.
const MAX_SYNC_ENTRIES = 200;

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
        case "hasanah_event": await repo.syncHasanahEvent(data, action); return { id: entry.id };
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
        completedDate: typeof value.completedDate === "string" ? value.completedDate : undefined,
        hasanahEarned: typeof value.hasanahEarned === "number" ? value.hasanahEarned : undefined,
        xpEarned: typeof value.xpEarned === "number" ? value.xpEarned : undefined,
        timezone: typeof value.timezone === "string" ? value.timezone : undefined,
    };
}

function isSyncQueueEntry(value: unknown): value is SyncQueueEntry {
    const record = asRecord(value);
    return Boolean(record && typeof record.id === "string" && typeof record.type === "string" && typeof record.action === "string" && asRecord(record.data));
}

/** Keys the old client sent in one full-state body. Entries replaced that format. */
const LEGACY_BODY_KEYS = ["completedMissions", "intentions", "bookmarks", "dailyActivity", "settings", "readingState", "streaks", "ramadhan", "extraEntries"];

// Seconds. Up to 200 entries; missions and bookmarks are written as batches, the rest one at a time.
export const maxDuration = 60;

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
        if (!(await syncRateLimiter.check(`sync:${userId}`)).success) {
            return NextResponse.json({ success: false, synced: [], failed: [], error: "Too many sync requests", message: "Please wait a moment and try again" }, { status: 429 });
        }
        const repo = new DbSyncRepository(userId);

        const payload = asRecord(body) ?? {};
        const synced: Array<{ id: string; cloudId?: string }> = [];
        const failed: Array<{ id: string; error: string }> = [];

        // The old client uploaded its whole local state in one body. That format is gone: it cost more with
        // every day of history and could not carry an undo. Say so plainly instead of dropping the data
        // silently; the app updates itself on the next load and the data on the device is untouched.
        if (!Array.isArray(payload.entries) && LEGACY_BODY_KEYS.some((key) => key in payload)) {
            return NextResponse.json(
                { success: false, synced: [], failed: [], error: "outdated_client", message: "This version of the app is out of date. Reload it to update." },
                { status: 410 },
            );
        }

        const rawEntries: SyncQueueEntry[] = Array.isArray(payload.entries) ? payload.entries.filter(isSyncQueueEntry) : [];

        if (rawEntries.length > 0) {
            // One at a time: overlapping queries on our single pooled connection can wedge it.
            // The client queue holds at most 100 entries; the rest are reported as failed so they are retried.
            const accepted = rawEntries.slice(0, MAX_SYNC_ENTRIES);

            // Mission completions are written together: one insert and one progression update instead of
            // a locked transaction per mission. Undo and everything else stay one at a time.
            const missionCompletions: SyncQueueEntry[] = [];
            const bookmarkSaves: SyncQueueEntry[] = [];
            const others: SyncQueueEntry[] = [];
            for (const entry of accepted) {
                const isMission = entry.type === "mission" || entry.type === "mission_progress";
                const valid = SyncEntrySchema.safeParse(entry).success;
                if (isMission && entry.action !== "delete" && valid) missionCompletions.push(entry);
                else if (entry.type === "bookmark" && entry.action !== "delete" && valid) bookmarkSaves.push(entry);
                else others.push(entry);
            }

            if (bookmarkSaves.length > 0) {
                try {
                    await repo.syncBookmarksBatch(bookmarkSaves.map((entry) => asRecord(entry.data) ?? {}));
                    bookmarkSaves.forEach((entry) => synced.push({ id: entry.id }));
                } catch (error) {
                    const message = error instanceof Error && error.message ? error.message : "Sync failed";
                    bookmarkSaves.forEach((entry) => failed.push({ id: entry.id, error: message }));
                }
            }

            if (missionCompletions.length > 0) {
                try {
                    await repo.syncMissionsBatch(missionCompletions.map((entry) => toMissionPayload(asRecord(entry.data) ?? {})));
                    missionCompletions.forEach((entry) => synced.push({ id: entry.id }));
                } catch (error) {
                    const message = error instanceof Error && error.message ? error.message : "Sync failed";
                    missionCompletions.forEach((entry) => failed.push({ id: entry.id, error: message }));
                }
            }

            for (const entry of others) {
                try {
                    synced.push(await processSyncEntry(repo, entry));
                } catch (error) {
                    failed.push({ id: entry.id, error: error instanceof Error && error.message ? error.message : "Sync failed" });
                }
            }
            for (const entry of rawEntries.slice(MAX_SYNC_ENTRIES)) {
                failed.push({ id: entry.id, error: "Too many entries in one request; retry the rest" });
            }

            return NextResponse.json({ success: true, synced, failed, message: "Sync complete", ...(repo.rejected > 0 ? { rejected: repo.rejected } : {}) });
        }

        return NextResponse.json({
            success: true,
            synced,
            failed,
            message: synced.length > 0 || failed.length > 0 ? "Sync complete" : "No entries to sync",
            ...(repo.rejected > 0 ? { rejected: repo.rejected } : {}),
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
