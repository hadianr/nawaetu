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
    const syncDataRef = useRef(syncData);
    const storage = getStorageService();
    const userId = session?.user?.id;

    useEffect(() => {
        syncDataRef.current = syncData;
    }, [syncData]);

    // Welcome toast on login, and the daily warning when changes have waited too long to be sent.
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Logic for Welcome Toast - show only once per login session
            const welcomeKey = `nawaetu_login_welcome_${session.user.id || session.user.email}`;
            if (!storage.getOptional(welcomeKey)) {
                toast.success(`Ahlan wa Sahlan, ${session.user.name?.split(' ')[0] || 'Sobat'}!`, {
                    icon: <AppIcon name="hands" size="sm" tone="primary" />,
                    description: (t as unknown as Record<string, string>).syncWelcomeDesc,
                    duration: 4000
                });
                storage.set(welcomeKey, "true");
            }

            // Warn once a day when changes have waited a week, and again close to the 30-day limit.
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
        } else if (status === "unauthenticated") {
            // Clear welcome flag on logout so it shows again on next login
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('nawaetu_login_welcome_')) localStorage.removeItem(key);
            });
        }
    }, [status, session, storage, t]);

    // The sync engine (tracker, queue, pull, merge) is loaded after the page is interactive instead of being
    // part of the first download: it is only needed once a change is made or the app returns to view.
    useEffect(() => {
        if (status !== "authenticated" || !userId) return;

        let stop: (() => void) | undefined;
        let cancelled = false;
        void import("@/lib/sync/engine").then(({ startSyncEngine }) => {
            if (!cancelled) stop = startSyncEngine({ userId, sync: () => syncDataRef.current({ silent: true }) });
        });

        return () => {
            cancelled = true;
            stop?.();
        };
    }, [status, userId]);

    return null; // Invisible component
}
