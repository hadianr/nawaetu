import { useState, useCallback } from "react";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

interface SyncResult {
    success: boolean;
    message?: string;
}

export function useDataSync() {
    const [isSyncing, setIsSyncing] = useState(false);

    const syncData = useCallback(async (): Promise<SyncResult> => {
        setIsSyncing(true);
        const toastId = toast.loading("Sinkronisasi data...");

        try {
            // 1. Gather Local Data
            const streakData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_STREAK) || "{\"streak\":0,\"longestStreak\":0}");
            const notificationPrefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADHAN_PREFERENCES) || "{}");
            const lastReadQuran = localStorage.getItem(STORAGE_KEYS.QURAN_LAST_READ);

            const localData = {
                bookmarks: JSON.parse(localStorage.getItem(STORAGE_KEYS.QURAN_BOOKMARKS) || "[]"),
                intentions: JSON.parse(localStorage.getItem(STORAGE_KEYS.INTENTION_JOURNAL) || "[]"),
                settings: {
                    theme: localStorage.getItem(STORAGE_KEYS.SETTINGS_THEME),
                    muadzin: localStorage.getItem(STORAGE_KEYS.SETTINGS_MUADZIN),
                    calculationMethod: localStorage.getItem(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD),
                    locale: localStorage.getItem(STORAGE_KEYS.SETTINGS_LOCALE),
                    notificationPreferences: Object.keys(notificationPrefs).length > 0 ? notificationPrefs : null,
                    lastReadQuran: lastReadQuran
                },
                streaks: {
                    current: streakData.streak || 0,
                    longest: streakData.longestStreak || 0,
                }
            };

            // If no data to sync, skip but mark as synced
            if (localData.bookmarks.length === 0 && localData.intentions.length === 0 && localData.streaks.current === 0 && !localData.settings.notificationPreferences && !lastReadQuran) {
                localStorage.setItem("nawaetu_synced_v1", "true");
                toast.dismiss(toastId);
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

            toast.success("Data berhasil disinkronkan!", { id: toastId });
            return { success: true };

        } catch (e) {
            console.error("Sync error:", e);
            toast.error("Gagal sinkronisasi data", { id: toastId });
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
