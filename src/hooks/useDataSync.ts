import { useState, useCallback } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

interface SyncResult {
    success: boolean;
    message?: string;
}

export function useDataSync() {
    const [isSyncing, setIsSyncing] = useState(false);

    const syncData = useCallback(async (options?: { silent?: boolean }): Promise<SyncResult> => {
        setIsSyncing(true);
        const toastId = options?.silent ? undefined : toast.loading("Sinkronisasi data...");

        try {
            // 1. Gather Local Data
            const streakData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_STREAK) || "{\"streak\":0,\"longestStreak\":0}");
            const notificationPrefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADHAN_PREFERENCES) || "{}");
            const lastReadQuran = localStorage.getItem(STORAGE_KEYS.QURAN_LAST_READ);
            const activityTracker = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_TRACKER) || "{}");

            const localData = {
                bookmarks: JSON.parse(localStorage.getItem(STORAGE_KEYS.QURAN_BOOKMARKS) || "[]"),
                intentions: JSON.parse(localStorage.getItem(STORAGE_KEYS.INTENTION_JOURNAL) || "[]"),
                completedMissions: JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_MISSIONS) || "[]"),
                dailyActivity: {
                    date: activityTracker.date || new Date().toISOString().split('T')[0],
                    quranAyat: activityTracker.quranAyat || 0,
                    tasbihCount: activityTracker.tasbihCount || 0,
                    prayersLogged: activityTracker.prayersLogged || [],
                },
                settings: {
                    theme: localStorage.getItem(STORAGE_KEYS.SETTINGS_THEME),
                    muadzin: localStorage.getItem(STORAGE_KEYS.SETTINGS_MUADZIN),
                    calculationMethod: localStorage.getItem(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD),
                    hijriAdjustment: localStorage.getItem(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
                    locale: localStorage.getItem(STORAGE_KEYS.SETTINGS_LOCALE),
                    notificationPreferences: Object.keys(notificationPrefs).length > 0 ? notificationPrefs : null,
                },
                readingState: {
                    quranLastRead: lastReadQuran ? (lastReadQuran.startsWith('{') ? JSON.parse(lastReadQuran) : lastReadQuran) : null
                },
                streaks: {
                    current: streakData.streak || 0,
                    longest: streakData.longestStreak || 0,
                },
                ramadhan: {
                    tarawehLog: JSON.parse(localStorage.getItem(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG) || "{}"),
                    khatamanLog: JSON.parse(localStorage.getItem(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG) || "{\"currentJuz\":0,\"completedJuz\":[],\"history\":[]}")
                }
            };

            // If no data to sync, skip but mark as synced
            // We check if arrays are empty and if objects have meaningful data
            const hasBookmarks = localData.bookmarks.length > 0;
            const hasIntentions = localData.intentions.length > 0;
            const hasMissions = localData.completedMissions.length > 0;
            const hasActivity = localData.dailyActivity.quranAyat > 0 || localData.dailyActivity.tasbihCount > 0 || localData.dailyActivity.prayersLogged.length > 0;
            const hasStreak = localData.streaks.current > 0;
            const hasSettings = !!localData.settings.notificationPreferences;
            const hasReadingState = !!lastReadQuran;

            if (!hasBookmarks && !hasIntentions && !hasMissions && !hasActivity && !hasStreak && !hasSettings && !hasReadingState) {
                localStorage.setItem("nawaetu_synced_v1", "true");
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
            localStorage.setItem("nawaetu_synced_v1", "true");

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
