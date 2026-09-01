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

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getStorageService } from "@/core/infrastructure/storage";
import { trackStreakEvent } from "@/lib/analytics/analytics";

interface SyncResult {
    success: boolean;
    message?: string;
}

export function useDataSync() {
    const { data: session } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);
    const storage = getStorageService();

    const syncData = useCallback(async (options?: { silent?: boolean }): Promise<SyncResult> => {
        setIsSyncing(true);
        const toastId = options?.silent ? undefined : toast.loading("Sinkronisasi data...");

        try {
            // 1. Gather Local Data (using safety-focused storage service)
            const streakData = storage.getOptional<any>(STORAGE_KEYS.USER_STREAK) || { streak: 0, longestStreak: 0 };
            const notificationPrefs = storage.getOptional<any>(STORAGE_KEYS.ADHAN_PREFERENCES) || {};
            const lastReadQuran = storage.getOptional<any>(STORAGE_KEYS.QURAN_LAST_READ);
            const activityTracker = storage.getOptional<any>(STORAGE_KEYS.ACTIVITY_TRACKER) || {};

            const sirahCompleted = storage.getOptional<string[]>(STORAGE_KEYS.SIRAH_COMPLETED as any) || [];
            const sirahBookmarks = storage.getOptional<string[]>(STORAGE_KEYS.SIRAH_BOOKMARKS as any) || [];

            const localData = {
                bookmarks: storage.getOptional<any>(STORAGE_KEYS.QURAN_BOOKMARKS) || [],
                intentions: storage.getOptional<any>(STORAGE_KEYS.INTENTION_JOURNAL) || [],
                completedMissions: storage.getOptional<any>(STORAGE_KEYS.COMPLETED_MISSIONS) || [],
                dailyActivity: {
                    date: activityTracker.date || new Date().toISOString().split('T')[0],
                    quranAyat: activityTracker.quranAyat || 0,
                    quranReadingSeconds: activityTracker.quranReadingSeconds || 0,
                    hasanahGained: activityTracker.hasanahGained || 0,
                    tasbihCount: activityTracker.tasbihCount || 0,
                    prayersLogged: activityTracker.prayersLogged || [],
                },
                settings: {
                    theme: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_THEME),
                    reciter: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_RECITER),
                    muadzin: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_MUADZIN),
                    calculationMethod: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD),
                    hijriAdjustment: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
                    locale: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_LOCALE),
                    adhanPreferences: Object.keys(notificationPrefs).length > 0 ? notificationPrefs : null,
                },
                readingState: {
                    quranLastRead: lastReadQuran
                },
                streaks: {
                    current: streakData.currentStreak ?? streakData.streak ?? 0,
                    longest: streakData.longestStreak || 0,
                },
                ramadhan: {
                    tarawehLog: storage.getOptional<any>(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG) || {},
                    khatamanLog: storage.getOptional<any>(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG) || { currentJuz: 0, completedJuz: [], history: [] }
                }
            };

            // Convert to SyncQueue entries if queue has pending items
            const entries: any[] = [];
            sirahCompleted.forEach((secId, i) => {
                entries.push({
                    id: `local-sirah-progress-${i}`,
                    type: 'sirah_progress',
                    action: 'create',
                    data: { sectionId: secId, chapterSlug: secId.split('-')[0] || 'chapter' }
                });
            });
            sirahBookmarks.forEach((secId, i) => {
                entries.push({
                    id: `local-sirah-bm-${i}`,
                    type: 'sirah_bookmark',
                    action: 'create',
                    data: { sectionId: secId, chapterSlug: secId.split('-')[0] || 'chapter' }
                });
            });

            // If no data to sync, skip but mark as synced
            const hasBookmarks = localData.bookmarks.length > 0;
            const hasIntentions = localData.intentions.length > 0;
            const hasMissions = localData.completedMissions.length > 0;
            const hasActivity = localData.dailyActivity.quranAyat > 0 || localData.dailyActivity.tasbihCount > 0 || localData.dailyActivity.prayersLogged.length > 0;
            const hasStreak = localData.streaks.current > 0;
            const hasSettings = Object.values(localData.settings).some(value => value !== undefined && value !== null);
            const hasReadingState = !!lastReadQuran;
            const hasSirah = entries.length > 0;

            if (!hasBookmarks && !hasIntentions && !hasMissions && !hasActivity && !hasStreak && !hasSettings && !hasReadingState && !hasSirah) {
                storage.set("nawaetu_synced_v1" as any, "true");
                if (toastId) toast.dismiss(toastId);
                return { success: true, message: "Tidak ada data lokal untuk disinkronkan" };
            }

            // 2. Send to API
            const res = await fetch("/api/user/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...localData, ...(entries.length > 0 ? { extraEntries: entries } : {}) })
            });

            if (!res.ok) throw new Error("Gagal menyimpan ke server");
            const syncResult = await res.json();
            if (syncResult.failed?.length) {
                console.warn("Partial sync failure", syncResult.failed);
                throw new Error(`${syncResult.failed.length} sync item(s) failed; retry required`);
            }

            // Logged-in progression is server-authoritative; refresh it after evidence is accepted.
            const fullDataRes = await fetch("/api/user/full-data", { cache: "no-store" });
            if (fullDataRes.ok) {
                const fullData = await fullDataRes.json();
                if (fullData.progression?.streak) {
                    const s = fullData.progression.streak;
                    storage.set(STORAGE_KEYS.USER_STREAK, {
                        currentStreak: s.currentDays || 0,
                        longestStreak: s.longestDays || 0,
                        lastActiveDate: s.lastStreakDate || "",
                        milestones: [],
                        freezesAvailable: s.freezesAvailable || 0,
                        protectedDates: (s.days || [])
                            .filter((day: { status?: string }) => day.status === "frozen")
                            .map((day: { localDate: string }) => day.localDate),
                    });
                }
                if (fullData.progression) {
                    storage.set(STORAGE_KEYS.CANONICAL_PROGRESSION, {
                        ...fullData.progression,
                        userId: session?.user?.id,
                    });
                    storage.set(STORAGE_KEYS.USER_HASANAH, String(fullData.progression.hasanah || 0));
                    trackStreakEvent("reconciled", {
                        userMode: "logged_in",
                        syncState: "canonical",
                        streakDays: fullData.progression.streak?.currentDays || 0,
                    });
                }
                window.dispatchEvent(new Event("streak_updated"));
                window.dispatchEvent(new Event("hasanah_updated"));
            }

            // 3. Mark as Synced
            storage.set("nawaetu_synced_v1" as any, "true");

            if (toastId) toast.success("Data berhasil disinkronkan!", { id: toastId });
            return { success: true };

        } catch (e) {
            if (toastId) toast.error("Gagal sinkronisasi data", { id: toastId });
            return { success: false, message: "Terjadi kesalahan saat sinkronisasi" };
        } finally {
            setIsSyncing(false);
        }
    }, [session?.user?.id]);

    return {
        isSyncing,
        syncData
    };
}
