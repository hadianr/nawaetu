"use client";

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

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDataSync } from "@/hooks/useDataSync";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getStorageService } from "@/core/infrastructure/storage";
import { AppIcon } from "@/components/ui/AppIcon";
import { useLocale } from "@/context/LocaleContext";
import { getSyncWarning } from "@/lib/sync-warning";
import { DateUtils } from "@/lib/utils/date";

export default function DataSyncer() {
    const { data: session, status } = useSession();
    const { syncData } = useDataSync();
    const { t } = useLocale();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const storage = getStorageService();

    // GuestSyncManager owns the login-time hydrate/import decision. This component
    // only syncs changes made after authentication, avoiding concurrent uploads.
    useEffect(() => {
        const handleAuthSync = async () => {
            if (status === "authenticated" && session?.user) {
                // Logic for Welcome Toast - show only once per login session
                const welcomeKey = `nawaetu_login_welcome_${session.user.id || session.user.email}`;
                if (!storage.getOptional(welcomeKey)) {
                    toast.success(`Ahlan wa Sahlan, ${session.user.name?.split(' ')[0] || 'Sobat'}!`, {
                        icon: <AppIcon name="hands" size="sm" tone="primary" />,
                        description: "Login berhasil. Selamat datang kembali.",
                        duration: 4000
                    });
                    storage.set(welcomeKey, "true");
                }

            } else if (status === "unauthenticated") {
                // Clear welcome flag on logout so it shows again on next login
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('nawaetu_login_welcome_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };

        handleAuthSync();

        // Warn once a day when changes have waited a week, and again close to the 30-day limit.
        if (status === "authenticated") {
            const warning = getSyncWarning(storage.getOptional(STORAGE_KEYS.UNSYNCED_SINCE));
            const marker = `${warning.level}:${DateUtils.today()}`;
            if (warning.level > 0 && storage.getOptional(STORAGE_KEYS.SYNC_WARNED_LEVEL) !== marker) {
                storage.set(STORAGE_KEYS.SYNC_WARNED_LEVEL, marker);
                const since = new Date(Date.now() - warning.ageDays * 86_400_000).toLocaleDateString();
                const tree = t as unknown as Record<string, string>;
                const text = (warning.level === 2 ? tree.syncUnsyncedUrgent : tree.syncUnsyncedNotice)
                    .replace("{date}", since)
                    .replace("{days}", String(warning.daysLeft));
                (warning.level === 2 ? toast.warning : toast.info)(text, { duration: 10000 });
            }
        }

        // 3. Listen for local storage changes (Same Tab) to trigger auto-sync
        // We only listen for specific keys that need syncing
        const handleStorageChange = (e: Event) => {
            if (status !== "authenticated" || !session?.user) return;

            const customEvent = e as CustomEvent;
            const key = customEvent.detail?.key;

            if (!key) return;

            // List of keys that should trigger a sync
            const syncableKeys = [
                STORAGE_KEYS.QURAN_LAST_READ,
                STORAGE_KEYS.QURAN_BOOKMARKS,
                STORAGE_KEYS.INTENTION_JOURNAL,
                STORAGE_KEYS.COMPLETED_MISSIONS,
                STORAGE_KEYS.ACTIVITY_TRACKER,
                STORAGE_KEYS.ADHAN_PREFERENCES,
                STORAGE_KEYS.SETTINGS_THEME,
                STORAGE_KEYS.SETTINGS_LOCALE,
                STORAGE_KEYS.SETTINGS_RECITER,
                STORAGE_KEYS.SETTINGS_MUADZIN,
                STORAGE_KEYS.SETTINGS_CALCULATION_METHOD,
                STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT,
            ];

            if (syncableKeys.includes(key)) {
                // Remember when unsynced work started, so the user can be warned before it ages out.
                if (!storage.getOptional(STORAGE_KEYS.UNSYNCED_SINCE)) storage.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now());

                // Debounce Sync
                if (syncTimeoutRef.current) {
                    clearTimeout(syncTimeoutRef.current);
                }

                syncTimeoutRef.current = setTimeout(() => {
                    syncData({ silent: true });
                }, 2000); // 2s debounce to avoid spamming if multiple updates occur
            }
        };

        window.addEventListener('nawaetu_storage_change', handleStorageChange);

        return () => {
            window.removeEventListener('nawaetu_storage_change', handleStorageChange);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };

    }, [status, session, storage, syncData, t]);

    return null; // Invisible component
}
