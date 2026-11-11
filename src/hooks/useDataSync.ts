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
import { useLocale } from "@/context/LocaleContext";
import { drainSyncQueue } from "@/lib/sync/drain";
import { pullAndApply } from "@/lib/sync/pull";
import { trackStreakEvent } from "@/lib/analytics/analytics";

interface SyncResult {
    success: boolean;
    message?: string;
}

const storage = getStorageService();

// Tell the user once per page load, not on every sync.
let notifiedRejected = false;

/**
 * Sends the queued changes and refreshes points and streak. Only what changed is sent, so the cost of a
 * sync no longer grows with how long the account has existed.
 */
export function useDataSync() {
    const { data: session } = useSession();
    const { t } = useLocale();
    const userId = session?.user?.id;
    const [isSyncing, setIsSyncing] = useState(false);

    const syncData = useCallback(async (options?: { silent?: boolean }): Promise<SyncResult> => {
        if (!userId) return { success: false, message: "Not signed in" };
        setIsSyncing(true);
        const toastId = options?.silent ? undefined : toast.loading("Sinkronisasi data...");

        try {
            const result = await drainSyncQueue(userId);

            if (result.rejected > 0 && !notifiedRejected) {
                // Older than the sync window: not an error, and still on this device.
                notifiedRejected = true;
                toast.info((t as unknown as Record<string, string>).syncOldDataKept, { duration: 8000 });
            }

            if (!result.ok) throw new Error("Some changes could not be sent yet");

            // Logged-in progression is server-authoritative: refresh it once the changes are accepted.
            // The small "progress" read replaces the old download of the whole account.
            if (result.sent > 0 && await pullAndApply(userId, ["progress"])) {
                trackStreakEvent("reconciled", { userMode: "logged_in", syncState: "canonical" });
            }

            storage.set("nawaetu_synced_v1", "true");
            storage.remove(STORAGE_KEYS.UNSYNCED_SINCE);
            storage.remove(STORAGE_KEYS.SYNC_WARNED_LEVEL);

            if (toastId) toast.success("Data berhasil disinkronkan!", { id: toastId });
            return { success: true };
        } catch {
            if (toastId) toast.error("Gagal sinkronisasi data", { id: toastId });
            return { success: false, message: "Terjadi kesalahan saat sinkronisasi" };
        } finally {
            setIsSyncing(false);
        }
    }, [userId, t]);

    return { isSyncing, syncData };
}
