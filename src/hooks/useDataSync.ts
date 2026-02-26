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
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getStorageService } from "@/core/infrastructure/storage";

interface SyncResult {
    success: boolean;
    message?: string;
}

export function useDataSync() {
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

            const localData = {
                bookmarks: storage.getOptional<any>(STORAGE_KEYS.QURAN_BOOKMARKS) || [],
                intentions: storage.getOptional<any>(STORAGE_KEYS.INTENTION_JOURNAL) || [],
                completedMissions: storage.getOptional<any>(STORAGE_KEYS.COMPLETED_MISSIONS) || [],
                dailyActivity: {
                    date: activityTracker.date || new Date().toISOString().split('T')[0],
                    quranAyat: activityTracker.quranAyat || 0,
                    tasbihCount: activityTracker.tasbihCount || 0,
                    prayersLogged: activityTracker.prayersLogged || [],
                },
                settings: {
                    theme: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_THEME),
                    muadzin: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_MUADZIN),
                    calculationMethod: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD),
                    hijriAdjustment: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
                    locale: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_LOCALE),
                    notificationPreferences: Object.keys(notificationPrefs).length > 0 ? notificationPrefs : null,
                },
                readingState: {
                    quranLastRead: lastReadQuran
                },
                streaks: {
                    current: streakData.streak || 0,
                    longest: streakData.longestStreak || 0,
                },
                ramadhan: {
                    tarawehLog: storage.getOptional<any>(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG) || {},
                    khatamanLog: storage.getOptional<any>(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG) || { currentJuz: 0, completedJuz: [], history: [] }
                }
            };

            // If no data to sync, skip but mark as synced
            const hasBookmarks = localData.bookmarks.length > 0;
            const hasIntentions = localData.intentions.length > 0;
            const hasMissions = localData.completedMissions.length > 0;
            const hasActivity = localData.dailyActivity.quranAyat > 0 || localData.dailyActivity.tasbihCount > 0 || localData.dailyActivity.prayersLogged.length > 0;
            const hasStreak = localData.streaks.current > 0;
            const hasSettings = !!localData.settings.notificationPreferences;
            const hasReadingState = !!lastReadQuran;

            if (!hasBookmarks && !hasIntentions && !hasMissions && !hasActivity && !hasStreak && !hasSettings && !hasReadingState) {
                storage.set("nawaetu_synced_v1" as any, "true");
                if (toastId) toast.dismiss(toastId);
                return { success: true, message: "Tidak ada data lokal untuk disinkronkan" };
            }

            // 2. Send to API
            const res = await fetch("/api/user/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(localData)
            });

            if (!res.ok) throw new Error("Gagal menyimpan ke server");

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
    }, []);

    return {
        isSyncing,
        syncData
    };
}
