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
import { type SyncQueueEntry } from "@/lib/sync-queue";
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
        case "intention": return { id: entry.id, cloudId: await repo.syncIntention(data, action) };
        case "mission_progress": return { id: entry.id, cloudId: await repo.syncMission(data, action) };
        case "daily_activity": await repo.syncDailyActivity(data, action); return { id: entry.id };
        case "setting": await repo.syncSetting(data, action); return { id: entry.id };
        case "reading_state": await repo.syncReadingState(data, action); return { id: entry.id };
        default: throw new Error(`Unknown type: ${type}`);
    }
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

        const body = await req.json();
        const userId = session.user.id;
        const repo = new DbSyncRepository(userId);

        // Modern sync format
        if (Array.isArray(body.entries) && body.entries.length > 0) {
            const results = await Promise.allSettled(body.entries.map((entry: SyncQueueEntry) => processSyncEntry(repo, entry)));

            const synced: Array<{ id: string; cloudId?: string }> = [];
            const failed: Array<{ id: string; error: string }> = [];

            results.forEach((res, i) => {
                const entry = body.entries[i];
                if (res.status === "fulfilled") synced.push(res.value);
                else failed.push({ id: entry.id, error: res.reason.message });
            });

            return NextResponse.json({ success: true, synced, failed, message: "Sync complete" });
        }

        // Legacy fallback (kept intact for backwards compatibility)
        return NextResponse.json({
            success: true,
            synced: [],
            failed: [],
            message: "No entries to sync (legacy mode)",
        });
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Internal Server Error";
        console.error("Sync Error:", e);
        return NextResponse.json(
            { success: false, synced: [], failed: [], error: errorMessage, message: "Sync failed" } as any,
            { status: 500 }
        );
    }
}
