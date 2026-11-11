import { getStorageService, type StorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue, type SyncActionType, type SyncEntityType } from "@/lib/sync-queue";
import { DateUtils } from "@/lib/utils/date";
import { addDays, SYNC_WINDOW_DAYS_BACK } from "@/lib/utils/timezone";
import { bookmarkKey, missionKey, type LocalBookmark, type LocalMission } from "./merge";

type Change = { type: SyncEntityType; action: SyncActionType; data: Record<string, unknown> };

interface Snapshot {
    missions: Map<string, LocalMission>;
    bookmarks: Map<string, string>;      // key -> fingerprint of what the server stores for it
    sirahProgress: Set<string>;
    sirahBookmarks: Set<string>;
}

const SETTING_NAMES: Record<string, string> = {
    [STORAGE_KEYS.SETTINGS_THEME]: "theme",
    [STORAGE_KEYS.SETTINGS_LOCALE]: "locale",
    [STORAGE_KEYS.SETTINGS_RECITER]: "reciter",
    [STORAGE_KEYS.SETTINGS_MUADZIN]: "muadzin",
    [STORAGE_KEYS.SETTINGS_CALCULATION_METHOD]: "calculationMethod",
    [STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT]: "hijriAdjustment",
    [STORAGE_KEYS.ADHAN_PREFERENCES]: "adhanPreferences",
};

const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const bookmarkFingerprint = (bookmark: LocalBookmark) => JSON.stringify([bookmark.note ?? null, bookmark.tags ?? null, bookmark.verseText]);

// While a pull writes server data into storage those writes are not the user's changes.
let suspended = 0;
export function withoutTracking<T>(work: () => T): T {
    suspended++;
    try {
        return work();
    } finally {
        suspended--;
    }
}

let active: { storage: StorageService; snapshot: Snapshot } | null = null;

/** Only the sync window is compared: older records cannot be synced, so they never need a diff. */
function readMissions(storage: StorageService): Map<string, LocalMission> {
    const start = addDays(DateUtils.today(), -(SYNC_WINDOW_DAYS_BACK + 1));
    const map = new Map<string, LocalMission>();
    for (const mission of asArray<LocalMission>(storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS))) {
        if (!mission?.id || !mission.completedAt) continue;
        const date = DateUtils.toLocalDate(mission.completedAt);
        if (date >= start) map.set(missionKey(mission.id, date), mission);
    }
    return map;
}

function readBookmarks(storage: StorageService): Map<string, string> {
    const map = new Map<string, string>();
    for (const bookmark of asArray<LocalBookmark>(storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS))) {
        if (bookmark?.surahId && bookmark?.verseId) map.set(bookmarkKey(bookmark.surahId, bookmark.verseId), bookmarkFingerprint(bookmark));
    }
    return map;
}

const readIds = (storage: StorageService, key: string) => new Set(asArray<string>(storage.getOptional(key)).filter((id) => typeof id === "string"));

function takeSnapshot(storage: StorageService): Snapshot {
    return {
        missions: readMissions(storage),
        bookmarks: readBookmarks(storage),
        sirahProgress: readIds(storage, STORAGE_KEYS.SIRAH_COMPLETED),
        sirahBookmarks: readIds(storage, STORAGE_KEYS.SIRAH_BOOKMARKS),
    };
}

/** Call after writing server data to storage so it is not mistaken for local changes on the next edit. */
export function resetTrackerSnapshot(): void {
    if (active) active.snapshot = takeSnapshot(active.storage);
}

function diffIds(previous: Set<string>, next: Set<string>, type: SyncEntityType): Change[] {
    const slug = (id: string) => id.split("-")[0] || "chapter";
    return [
        ...[...next].filter((id) => !previous.has(id)).map((id): Change => ({ type, action: "create", data: { sectionId: id, chapterSlug: slug(id) } })),
        ...[...previous].filter((id) => !next.has(id)).map((id): Change => ({ type, action: "delete", data: { sectionId: id, chapterSlug: slug(id) } })),
    ];
}

function changesFor(key: string, storage: StorageService, snapshot: Snapshot): Change[] {
    if (key === STORAGE_KEYS.COMPLETED_MISSIONS) {
        const next = readMissions(storage);
        const changes: Change[] = [];
        for (const [mapKey, mission] of next) {
            if (snapshot.missions.has(mapKey)) continue;
            const completedDate = DateUtils.toLocalDate(mission.completedAt);
            changes.push({ type: "mission", action: "create", data: { id: mission.id, completedAt: mission.completedAt, completedDate, hasanahEarned: mission.hasanahEarned, timezone: timezone() } });
        }
        for (const [mapKey, mission] of snapshot.missions) {
            if (next.has(mapKey)) continue;
            changes.push({ type: "mission", action: "delete", data: { id: mission.id, completedDate: DateUtils.toLocalDate(mission.completedAt), timezone: timezone() } });
        }
        snapshot.missions = next;
        return changes;
    }

    if (key === STORAGE_KEYS.QURAN_BOOKMARKS) {
        const list = asArray<LocalBookmark>(storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS));
        const next = readBookmarks(storage);
        const changes: Change[] = [];
        for (const bookmark of list) {
            const mapKey = bookmarkKey(bookmark.surahId, bookmark.verseId);
            const before = snapshot.bookmarks.get(mapKey);
            if (before === next.get(mapKey)) continue;
            changes.push({
                type: "bookmark",
                action: before === undefined ? "create" : "update",
                data: {
                    surahId: bookmark.surahId, verseId: bookmark.verseId, surahName: bookmark.surahName, verseText: bookmark.verseText,
                    translationText: bookmark.translationText, note: bookmark.note, tags: bookmark.tags, createdAt: bookmark.createdAt,
                },
            });
        }
        for (const mapKey of snapshot.bookmarks.keys()) {
            if (next.has(mapKey)) continue;
            const [, surahId, verseId] = mapKey.split(":");
            changes.push({ type: "bookmark", action: "delete", data: { surahId: Number(surahId), verseId: Number(verseId) } });
        }
        snapshot.bookmarks = next;
        return changes;
    }

    if (key === STORAGE_KEYS.ACTIVITY_TRACKER) {
        const activity = storage.getOptional<Record<string, unknown>>(STORAGE_KEYS.ACTIVITY_TRACKER);
        if (!activity || typeof activity.date !== "string") return [];
        return [{ type: "daily_activity", action: "update", data: {
            date: activity.date, quranAyat: activity.quranAyat, tasbihCount: activity.tasbihCount,
            hasanahGained: activity.hasanahGained, prayersLogged: activity.prayersLogged, timezone: timezone(),
        } }];
    }

    if (key === STORAGE_KEYS.QURAN_LAST_READ) {
        const lastRead = storage.getOptional<unknown>(STORAGE_KEYS.QURAN_LAST_READ);
        return lastRead ? [{ type: "reading_state", action: "update", data: { quranLastRead: lastRead } }] : [];
    }

    if (key in SETTING_NAMES) {
        const value = storage.getOptional<unknown>(key);
        return value === null || value === undefined ? [] : [{ type: "setting", action: "update", data: { [SETTING_NAMES[key]]: value } }];
    }

    if (key === STORAGE_KEYS.SIRAH_COMPLETED) {
        const next = readIds(storage, key);
        const changes = diffIds(snapshot.sirahProgress, next, "sirah_progress");
        snapshot.sirahProgress = next;
        return changes;
    }
    if (key === STORAGE_KEYS.SIRAH_BOOKMARKS) {
        const next = readIds(storage, key);
        const changes = diffIds(snapshot.sirahBookmarks, next, "sirah_bookmark");
        snapshot.sirahBookmarks = next;
        return changes;
    }

    return [];
}

/**
 * Turns every change to the synced data in this tab into queue entries. Hooking the storage layer once
 * means every screen that edits missions, bookmarks, activity or settings is covered without each one
 * having to remember to queue, and a change is queued with only what changed.
 */
export function startSyncTracker(userId: string, onQueued: () => void): () => void {
    const storage = getStorageService();
    active = { storage, snapshot: takeSnapshot(storage) };

    const onChange = (event: Event) => {
        const detail = (event as CustomEvent<{ key?: string; source?: string }>).detail;
        // Another tab's change is queued by that tab; queuing it here too would send it twice.
        if (suspended > 0 || !detail?.key || detail.source === "remote_tab" || !active) return;
        const changes = changesFor(detail.key, storage, active.snapshot);
        if (changes.length === 0) return;
        syncQueue.addMany(changes, userId);
        onQueued();
    };

    window.addEventListener("nawaetu_storage_change", onChange);
    return () => {
        window.removeEventListener("nawaetu_storage_change", onChange);
        active = null;
    };
}

/**
 * One-time catch-up for a device that was already signed in before this queue existed: its older
 * unsent changes were only ever held by the previous full upload, so queue what is in the window once.
 */
export function seedQueueFromLocal(userId: string): void {
    const storage = getStorageService();
    if (storage.getOptional(STORAGE_KEYS.OUTBOX_SEEDED) === userId) return;
    storage.set(STORAGE_KEYS.OUTBOX_SEEDED, userId);
    // A device that has never synced under the old scheme is covered by the login import instead.
    if (!storage.getOptional("nawaetu_synced_v1")) return;

    const changes: Change[] = [];
    for (const mission of readMissions(storage).values()) {
        changes.push({ type: "mission", action: "create", data: {
            id: mission.id, completedAt: mission.completedAt, completedDate: DateUtils.toLocalDate(mission.completedAt),
            hasanahEarned: mission.hasanahEarned, timezone: timezone(),
        } });
    }
    // Bookmarks too: a pull drops a local bookmark the server does not have and that is not queued.
    for (const bookmark of asArray<LocalBookmark>(storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS))) {
        if (!bookmark?.surahId || !bookmark?.verseId) continue;
        changes.push({ type: "bookmark", action: "create", data: {
            surahId: bookmark.surahId, verseId: bookmark.verseId, surahName: bookmark.surahName, verseText: bookmark.verseText,
            translationText: bookmark.translationText, note: bookmark.note, tags: bookmark.tags, createdAt: bookmark.createdAt,
        } });
    }
    for (const key of [STORAGE_KEYS.ACTIVITY_TRACKER, STORAGE_KEYS.QURAN_LAST_READ, ...Object.keys(SETTING_NAMES)]) {
        changes.push(...changesFor(key, storage, takeSnapshot(storage)));
    }
    if (changes.length > 0) syncQueue.addMany(changes, userId);
}
