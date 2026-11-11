import { getStorageService, type StorageService } from "@/core/infrastructure/storage";
import { resetActivityRepository } from "@/core/repositories/activity.repository";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { syncQueue } from "@/lib/sync-queue";
import { DateUtils } from "@/lib/utils/date";
import {
    mergeBookmarks, mergeMissions, mergeTodayActivity,
    type LocalActivity, type LocalBookmark, type LocalMission, type ServerActivity, type ServerBookmark, type ServerMission,
} from "./merge";
import { resetTrackerSnapshot, withoutTracking } from "./tracker";

export type PullPart = "progress" | "missions" | "activity" | "bookmarks";

interface Progression {
    hasanah?: number;
    level?: number;
    streak?: {
        currentDays?: number; longestDays?: number; lastStreakDate?: string | null; freezesAvailable?: number;
        days?: Array<{ localDate: string; status?: string }>;
    };
}

interface PullResponse {
    progression?: Progression;
    missions?: ServerMission[];
    activity?: ServerActivity[];
    bookmarks?: ServerBookmark[];
    bookmarkFingerprint?: string;
}

const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The server's points and streak become this device's, the same way after a sync as after a pull. */
export function applyProgression(storage: StorageService, userId: string, progression: Progression): void {
    const streak = progression.streak;
    if (streak) {
        storage.set(STORAGE_KEYS.USER_STREAK, {
            currentStreak: streak.currentDays || 0,
            longestStreak: streak.longestDays || 0,
            lastActiveDate: streak.lastStreakDate || "",
            milestones: [],
            freezesAvailable: streak.freezesAvailable || 0,
            protectedDates: (streak.days || []).filter((day) => day.status === "frozen").map((day) => day.localDate),
        });
    }
    storage.set(STORAGE_KEYS.CANONICAL_PROGRESSION, { ...progression, userId });
    storage.set(STORAGE_KEYS.USER_HASANAH, String(progression.hasanah || 0));
    window.dispatchEvent(new Event("streak_updated"));
    window.dispatchEvent(new Event("hasanah_updated"));
}

async function fetchPull(query: string): Promise<PullResponse | null> {
    try {
        const response = await fetch(`/api/user/pull?${query}&tz=${encodeURIComponent(timezone())}`, { cache: "no-store" });
        return response.ok ? ((await response.json()) as PullResponse) : null;
    } catch {
        return null;
    }
}

/**
 * Brings this device up to date with what other devices did. Returns false when the server could not be
 * reached, so the caller can try again later.
 *
 * Nothing that is still waiting in the queue is overwritten: the merge rules keep unsent changes, and the
 * points total is only replaced when nothing is waiting (otherwise it would briefly drop below what the
 * user just earned).
 */
export async function pullAndApply(userId: string, parts: PullPart[]): Promise<boolean> {
    const body = await fetchPull(`parts=${parts.join(",")}`);
    if (!body) return false;

    const storage = getStorageService();
    const pending = syncQueue.pendingKeys(userId);
    const today = DateUtils.today();

    if (body.progression && syncQueue.getPendingEntries(userId).length === 0) {
        applyProgression(storage, userId, body.progression);
    }

    withoutTracking(() => {
        if (body.missions) {
            const local = storage.getOptional<LocalMission[]>(STORAGE_KEYS.COMPLETED_MISSIONS) ?? [];
            storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, mergeMissions(Array.isArray(local) ? local : [], body.missions, pending, today));
            window.dispatchEvent(new Event("mission_updated"));
        }
        if (body.activity) {
            const local = storage.getOptional<LocalActivity>(STORAGE_KEYS.ACTIVITY_TRACKER);
            const merged = mergeTodayActivity(local, body.activity, today);
            if (merged && merged !== local) {
                storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, merged);
                resetActivityRepository(); // it caches today's activity and would not see this write
                window.dispatchEvent(new CustomEvent("activity_updated", { detail: merged }));
            }
        }
        if (body.bookmarks) {
            const local = storage.getOptional<LocalBookmark[]>(STORAGE_KEYS.QURAN_BOOKMARKS) ?? [];
            storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, mergeBookmarks(Array.isArray(local) ? local : [], body.bookmarks, pending));
            window.dispatchEvent(new Event("bookmarks_updated"));
        }
    });
    resetTrackerSnapshot();
    return true;
}

/**
 * Bookmarks carry verse text, so ask for a short fingerprint first and download them only when another
 * device changed them.
 */
export async function pullBookmarksIfChanged(userId: string): Promise<boolean> {
    const probe = await fetchPull("parts=bookmarks&fingerprint=1");
    if (!probe) return false;
    const storage = getStorageService();
    if (probe.bookmarkFingerprint === storage.getOptional<string>(STORAGE_KEYS.BOOKMARKS_FINGERPRINT)) return true;

    const ok = await pullAndApply(userId, ["bookmarks"]);
    if (ok && probe.bookmarkFingerprint) storage.set(STORAGE_KEYS.BOOKMARKS_FINGERPRINT, probe.bookmarkFingerprint);
    return ok;
}
