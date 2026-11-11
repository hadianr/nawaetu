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
import { syncQueue } from "@/lib/sync-queue";
import { getSyncUserId } from "@/lib/sync/award";
import { pullAndApply, pullBookmarksIfChanged } from "@/lib/sync/pull";
import { seedQueueFromLocal, startSyncTracker } from "@/lib/sync/tracker";

/** Wait this long after the last change before sending, so a burst of taps is one request. */
const SEND_DELAY_MS = 2000;
/** But never wait longer than this while changes keep coming (continuous dhikr counting). */
const SEND_MAX_WAIT_MS = 15000;
/** Do not ask the server for other devices' changes more often than this. */
const PULL_INTERVAL_MS = 60000;

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
                    description: "Login berhasil. Selamat datang kembali.",
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

    // The sync engine: queue every change as it happens, send it soon after, and pick up other devices'
    // changes when the app comes back into view or the connection returns.
    useEffect(() => {
        if (status !== "authenticated" || !userId) return;

        let stopTracker: (() => void) | null = null;
        let sendTimer: ReturnType<typeof setTimeout> | undefined;
        let firstQueuedAt = 0;
        let lastPullAt = 0;
        let cancelled = false;

        const send = () => {
            clearTimeout(sendTimer);
            firstQueuedAt = 0;
            // Nothing queued means nothing to send: skip the work and the re-render.
            if (syncQueue.getPendingEntries(userId).length > 0) void syncDataRef.current({ silent: true });
        };

        const scheduleSend = () => {
            const now = Date.now();
            if (!firstQueuedAt) firstQueuedAt = now;
            clearTimeout(sendTimer);
            // Trailing debounce with a ceiling: the timer restarts on each change but never past the max wait.
            sendTimer = setTimeout(send, Math.max(0, Math.min(SEND_DELAY_MS, firstQueuedAt + SEND_MAX_WAIT_MS - now)));
        };

        const onQueued = () => {
            // Remember when unsynced work began, so the user can be warned before it ages out.
            if (!storage.getOptional(STORAGE_KEYS.UNSYNCED_SINCE)) storage.set(STORAGE_KEYS.UNSYNCED_SINCE, Date.now());
            scheduleSend();
        };

        const pullIfDue = async (force = false) => {
            if (document.visibilityState !== "visible" || !navigator.onLine) return;
            if (!force && Date.now() - lastPullAt < PULL_INTERVAL_MS) return;
            lastPullAt = Date.now();
            // Send our own changes first, so the server's answer already includes them.
            const sent = await syncDataRef.current({ silent: true });
            if (!sent.success) return;
            await pullAndApply(userId, ["progress", "missions", "activity", "profile"]);
            await pullBookmarksIfChanged(userId);
        };

        const start = () => {
            if (cancelled || stopTracker || getSyncUserId() !== userId) return;
            // Entries saved for another account on this device are never sent for this one.
            syncQueue.discardOtherAccounts(userId);
            seedQueueFromLocal(userId);
            stopTracker = startSyncTracker(userId, onQueued);
            if (syncQueue.getPendingEntries(userId).length > 0) onQueued();
            void pullIfDue(true);
        };

        // GuestSyncManager decides hydrate-or-import at login; the engine starts once it has finished.
        if (getSyncUserId() === userId) start();
        else window.addEventListener("sync_login_settled", start, { once: true });

        const onVisible = () => { if (document.visibilityState === "visible") { send(); void pullIfDue(); } };
        const onOnline = () => { send(); void pullIfDue(true); };
        window.addEventListener("sync_queue_changed", onQueued);
        window.addEventListener("online", onOnline);
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            cancelled = true;
            clearTimeout(sendTimer);
            stopTracker?.();
            window.removeEventListener("sync_login_settled", start);
            window.removeEventListener("sync_queue_changed", onQueued);
            window.removeEventListener("online", onOnline);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [status, userId, storage]);

    return null; // Invisible component
}
