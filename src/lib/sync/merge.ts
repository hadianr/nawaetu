import { findMissionDefinition } from "@/data/missions";
import { normalizeMissionId } from "@/lib/mission-resolver";
import { addDays, SYNC_WINDOW_DAYS_BACK } from "@/lib/utils/timezone";
import { DateUtils } from "@/lib/utils/date";

export interface PendingKeys {
    upserts: Set<string>;
    deletes: Set<string>;
}

export interface LocalMission { id: string; completedAt: string; hasanahEarned: number }
export interface ServerMission { missionId: string; completedDate: string | null; hasanahEarned: number | null }

export const missionKey = (id: string, date: string) => `m:${normalizeMissionId(id)}:${date}`;

/**
 * Brings the local missions in line with the server for the sync window, without undoing anything that
 * has not been sent yet. Older history is left alone.
 *
 * - a mission the server has and another device undid stays gone only if the server no longer has it;
 * - a mission completed here and still queued is kept;
 * - a mission undone here and still queued stays undone.
 */
export function mergeMissions(local: LocalMission[], server: ServerMission[], pending: PendingKeys, today: string): LocalMission[] {
    const windowStart = addDays(today, -(SYNC_WINDOW_DAYS_BACK + 1));
    const dateOf = (mission: LocalMission) => DateUtils.toLocalDate(mission.completedAt);

    const result: LocalMission[] = local.filter((mission) => dateOf(mission) < windowStart);
    const localInWindow = new Map(local.filter((mission) => dateOf(mission) >= windowStart).map((mission) => [missionKey(mission.id, dateOf(mission)), mission]));
    const seen = new Set<string>();

    for (const row of server) {
        if (!row.completedDate) continue;
        const key = missionKey(row.missionId, row.completedDate);
        if (pending.deletes.has(key) || seen.has(key)) continue;
        seen.add(key);
        // Keep this device's own record when there is one: it has the exact completion time.
        result.push(localInWindow.get(key) ?? { id: normalizeMissionId(row.missionId), completedAt: row.completedDate, hasanahEarned: row.hasanahEarned ?? 0 });
    }

    for (const [key, mission] of localInWindow) {
        if (seen.has(key)) continue;
        // Not on the server: it was undone elsewhere, unless it is waiting to be sent or the server cannot hold it
        // (an id that is no longer in the catalogue is never stored there, so it must not be dropped here).
        const unknownToServer = !findMissionDefinition(normalizeMissionId(mission.id));
        if (pending.upserts.has(key) || unknownToServer) result.push(mission);
    }

    return result;
}

export interface LocalBookmark { id: string; surahId: number; verseId: number; [field: string]: unknown }
export interface ServerBookmark {
    key: string; surahId: number; surahName: string; verseId: number; verseText: string;
    translationText: string | null; note: string | null; tags: string[] | null; createdAt: string | null; updatedAt: string | null;
}

export const bookmarkKey = (surahId: number, verseId: number) => `b:${surahId}:${verseId}`;

export function mergeBookmarks(local: LocalBookmark[], server: ServerBookmark[], pending: PendingKeys): LocalBookmark[] {
    const result: LocalBookmark[] = [];
    const seen = new Set<string>();
    const localByKey = new Map(local.map((bookmark) => [bookmarkKey(bookmark.surahId, bookmark.verseId), bookmark]));

    for (const row of server) {
        const key = bookmarkKey(row.surahId, row.verseId);
        if (pending.deletes.has(key) || seen.has(key)) continue;
        seen.add(key);
        // A change made here and not yet sent is newer than the server's copy.
        if (pending.upserts.has(key) && localByKey.has(key)) { result.push(localByKey.get(key) as LocalBookmark); continue; }
        result.push({
            id: `${row.surahId}:${row.verseId}`,
            surahId: row.surahId,
            surahName: row.surahName,
            verseId: row.verseId,
            verseText: row.verseText,
            translationText: row.translationText ?? undefined,
            note: row.note ?? undefined,
            tags: row.tags ?? undefined,
            createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
            updatedAt: row.updatedAt ? new Date(row.updatedAt).getTime() : Date.now(),
        });
    }

    for (const [key, bookmark] of localByKey) {
        if (!seen.has(key) && pending.upserts.has(key)) result.push(bookmark);
    }
    return result;
}

export interface LocalActivity {
    date: string; quranAyat: number; tasbihCount: number; prayersLogged: string[]; [field: string]: unknown;
}
export interface ServerActivity {
    date: string; quranAyat: number | null; tasbihCount: number | null; prayersLogged: string[] | null;
}

/** Counters keep the higher value and prayers are a union, the same rule the server uses when it receives them. */
export function mergeTodayActivity(local: LocalActivity | null, server: ServerActivity[], today: string): LocalActivity | null {
    const remote = server.find((row) => row.date === today);
    if (!remote) return local;
    const base: LocalActivity = local && local.date === today ? local : { date: today, quranAyat: 0, tasbihCount: 0, prayersLogged: [] };
    return {
        ...base,
        quranAyat: Math.max(base.quranAyat ?? 0, remote.quranAyat ?? 0),
        tasbihCount: Math.max(base.tasbihCount ?? 0, remote.tasbihCount ?? 0),
        prayersLogged: [...new Set([...(base.prayersLogged ?? []), ...(remote.prayersLogged ?? [])])],
    };
}
