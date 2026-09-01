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

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { RefreshCw, Database, AlertTriangle, CheckCircle2, X } from "lucide-react";

import { getStorageService } from "@/core/infrastructure/storage";
import { mergeSyncRecords } from "@/lib/sync/merge-sync-data";
import { sendGAEvent } from "@/lib/analytics/analytics";

export function GuestSyncManager() {
    const { data: session, status } = useSession();
    const { t } = useLocale();
    const storage = getStorageService();

    // Dialog States
    const [showNewUserSyncInfo, setShowNewUserSyncInfo] = useState(false);
    const [showExistingConflict, setShowExistingConflict] = useState(false);

    // Sync Status
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            storage.remove(STORAGE_KEYS.LAST_SYNC_USER_ID as any);
        }
    }, [status]);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user?.id) return;

        const checkSyncStatus = async () => {
            // Prevent re-syncing if we've already synced this user in this session
            const lastSyncedId = storage.getOptional<string>(STORAGE_KEYS.LAST_SYNC_USER_ID as any);
            if (lastSyncedId === session.user.id) return;

            // Start Sync Process
            setIsSyncing(true);

            try {
                // 1. Fetch Server Data
                const res = await fetch("/api/user/full-data");

                // 401 = session cookie not yet propagated.
                // 404 = user record not yet created/propagated in DB.
                // 5xx = transient server error.
                // In these cases, return silently — the effect will re-trigger when session stabilizes.
                if (res.status === 401 || res.status === 404 || res.status >= 500) {
                    sendGAEvent("sync_recovery_outcome", { outcome: "deferred" });
                    return;
                }

                if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
                const serverData = await res.json();
                const hasServerProgress = checkServerProgress(serverData);

                // 2. Check Local Guest Data
                const hasLocalData = checkForLocalGuestData();

                if (hasServerProgress) {
                    // Scenario: User has existing account data (HYDRATE)
                    // ACTION: Auto-Hydrate (Restore data).
                    toast.info((t as any).syncHydrateLoading || "📂 Sedang mengambil data lama kamu dari server...", { duration: 2000 });
                    await hydrateFromServer(serverData);

                    // Success and Info Feedback
                    toast.success((t as any).syncHydrateSuccess || "✅ Sip! Data akun lamamu sudah kembali. Yuk lanjut ibadah!");
                    setTimeout(() => {
                        toast.info((t as any).syncHydrateInfo || "⚠️ Data tamu di HP ini telah kami ganti dengan data akun utamamu.", { duration: 4000 });
                    }, 500);
                    sendGAEvent("sync_recovery_outcome", { outcome: "success" });

                } else if (hasLocalData && serverData.profile?.guestSyncEligible === true) {
                    // Only a server-marked, brand-new account may import guest activity.
                    toast.info((t as any).syncUploadLoading || "🚀 Sedang memindahkan data tamu kamu ke akun baru...", { duration: 2000 });
                    await handleSyncToNewAccount();
                } else if (hasLocalData) {
                    // Do not import or delete guest activity when the account has
                    // no server progress yet. Keeping it is recoverable; clearing
                    // it here would make a transient/empty response destructive.
                    storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID as any, session.user.id);
                    toast.info((t as any).syncHydrateInfo || "Data lokal kamu tetap aman; belum ada data akun untuk dipulihkan.", { duration: 4000 });
                    sendGAEvent("sync_recovery_outcome", { outcome: "preserved_local" });
                } else {
                    // Scenario: Clean slate on both ends.
                    if (serverData.profile?.guestSyncEligible === true) {
                        await fetch("/api/user/sync-guest", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ consumeOnly: true }),
                        });
                    }
                    storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID as any, session.user.id);
                    sendGAEvent("sync_recovery_outcome", { outcome: "success" });
                }

            } catch (error) {
                console.error("Sync error:", error);
                sendGAEvent("sync_recovery_outcome", { outcome: "error" });
                // Fail silently or toast error? Silent is better for auto-sync unless critical.
            } finally {
                setIsSyncing(false);
            }
        };

        let fallbackTask: ReturnType<typeof setTimeout> | undefined;
        let idleTask: number | undefined;
        const runSync = () => { void checkSyncStatus(); };

        if ("requestIdleCallback" in window) {
            idleTask = (window as Window & typeof globalThis).requestIdleCallback(runSync, { timeout: 1500 });
        } else {
            fallbackTask = setTimeout(runSync, 1200);
        }

        return () => {
            if (fallbackTask) clearTimeout(fallbackTask);
            if (idleTask !== undefined && "cancelIdleCallback" in window) {
                (window as Window & typeof globalThis).cancelIdleCallback(idleTask);
            }
        };
    }, [status, session]);

    const checkForLocalGuestData = () => {
        if (typeof window === "undefined") return false;

        // 1. Check Profile Fields (if not default)
        const profileKeys = [
            STORAGE_KEYS.USER_NAME,
            STORAGE_KEYS.USER_GENDER,
        ];

        const hasCustomProfile = profileKeys.some(key => {
            const val = localStorage.getItem(key);
            if (!val) return false;
            const lowerVal = val.toLowerCase().trim();
            // Ignore default/loading states
            if (lowerVal === "guest" || lowerVal === "mode guest" || lowerVal === "loading" || lowerVal === "") return false;
            return true;
        });

        if (hasCustomProfile) return true;

        // 2. Check Progress/Activity
        const activityKeys = [
            STORAGE_KEYS.QURAN_BOOKMARKS,
            STORAGE_KEYS.COMPLETED_MISSIONS,
            STORAGE_KEYS.INTENTION_JOURNAL,
            STORAGE_KEYS.DHIKR_COUNT,
            STORAGE_KEYS.USER_STREAK,
            STORAGE_KEYS.ACTIVITY_TRACKER,
            STORAGE_KEYS.AI_CHAT_SESSIONS,
        ];

        return activityKeys.some(key => {
            const val = storage.getOptional(key as any);
            if (!val) return false;
            const strVal = typeof val === 'string' ? val : JSON.stringify(val);
            // Filter out empty arrays/objects or zero counts
            if (strVal === "[]" || strVal === "{}" || strVal === "0" || strVal === "0||0") return false;
            return true;
        });
    };

    const checkServerProgress = (data: any) => {
        if (data.bookmarks?.length > 0) return true;
        if (data.completedMissions?.length > 0) return true;
        if (data.intentions?.length > 0) return true;
        // Check if profile has a name that isn't empty or default
        if (data.profile?.name && data.profile.name.toLowerCase() !== "guest") return true;
        if (data.profile?.streaks?.current > 0) return true;
        if (data.readingState?.quranLastRead) return true;
        if (data.dailyActivities?.length > 0) return true;
        if (data.progression?.hasanah > 0) return true;
        if (data.progression?.streak?.days?.length > 0) return true;
        return false;
    };

    const handleSyncToNewAccount = async () => {
        try {
            const payload = {
                profile: {
                    name: storage.getOptional<string>(STORAGE_KEYS.USER_NAME as any),
                    gender: storage.getOptional<string>(STORAGE_KEYS.USER_GENDER as any),
                },
                settings: {
                    theme: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_THEME as any),
                    locale: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_LOCALE as any),
                    reciter: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_RECITER as any),
                    muadzin: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_MUADZIN as any),
                    calculationMethod: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any),
                    hijriAdjustment: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT as any),
                    adhanPreferences: storage.getOptional<any>(STORAGE_KEYS.ADHAN_PREFERENCES as any),
                },
                readingState: {
                    quranLastRead: storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ) ? storage.getOptional<any>(STORAGE_KEYS.QURAN_LAST_READ) : null,
                },
                bookmarks: storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS) || [],
                completedMissions: storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS) || [],
                intentions: storage.getOptional(STORAGE_KEYS.INTENTION_JOURNAL) || [],
                activity: {
                    date: new Date().toISOString().split('T')[0],
                    quranAyat: (storage.getOptional<any>(STORAGE_KEYS.ACTIVITY_TRACKER) || {})?.quranAyat || 0,
                    tasbihCount: (storage.getOptional<any>(STORAGE_KEYS.ACTIVITY_TRACKER) || {})?.tasbihCount || 0,
                    prayersLogged: (storage.getOptional<any>(STORAGE_KEYS.ACTIVITY_TRACKER) || {})?.prayersLogged || [],
                },
            };

            const res = await fetch("/api/user/sync-guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Sync failed");

            storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID as any, session?.user?.id as string);
            toast.success((t as any).syncUploadSuccess || "✨ Berhasil! Progress tamu kamu sudah aman di akun ini.");
            sendGAEvent("sync_recovery_outcome", { outcome: "success" });
            // Reload to ensure state is fresh? Not strictly needed for upload, but good for consistency
            // window.location.reload();

        } catch (error) {
            console.error(error);
            toast.error((t as any).syncError || "Failed to sync data.");
            sendGAEvent("sync_recovery_outcome", { outcome: "error" });
        }
    };

    const hydrateFromServer = async (data: any) => {
        try {
            // Mark sync as completed for this user
            if (session?.user?.id) {
                storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID as any, session.user.id);
            }

            // Mark onboarding as completed
            storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED as any, "true");

            if (data.profile) {
                if (data.profile.name) storage.set(STORAGE_KEYS.USER_NAME as any, data.profile.name);
                if (data.profile.gender) storage.set(STORAGE_KEYS.USER_GENDER as any, data.profile.gender);
                if (data.profile.totalInfaq !== undefined) {
                    storage.set(STORAGE_KEYS.USER_TOTAL_DONATION as any, data.profile.totalInfaq.toString());
                }

                if (data.profile.settings) {
                    const s = data.profile.settings;

                    // Sanity checks for settings (prevent 16MB corruption bugs)
                    const isValid = (val: any) => (val !== undefined && val !== null) &&
                        (typeof val === 'string' || typeof val === 'number') &&
                        val.toString().length < 500;

                    if (isValid(s.theme)) storage.set(STORAGE_KEYS.SETTINGS_THEME as any, s.theme);
                    if (isValid(s.locale)) storage.set(STORAGE_KEYS.SETTINGS_LOCALE as any, s.locale);
                    if (isValid(s.reciter)) storage.set(STORAGE_KEYS.SETTINGS_RECITER as any, s.reciter);
                    if (isValid(s.muadzin)) storage.set(STORAGE_KEYS.SETTINGS_MUADZIN as any, s.muadzin);
                    if (isValid(s.calculationMethod)) {
                        storage.set(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD as any, s.calculationMethod);
                    }
                    if (isValid(s.hijriAdjustment)) {
                        storage.set(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT as any, s.hijriAdjustment);
                    }
                    if (s.adhanPreferences && typeof s.adhanPreferences === 'object') {
                        storage.set(STORAGE_KEYS.ADHAN_PREFERENCES as any, s.adhanPreferences);
                    }
                }
            }

            if (data.readingState?.quranLastRead) {
                storage.set(STORAGE_KEYS.QURAN_LAST_READ as any, data.readingState.quranLastRead);
            }

            if (data.bookmarks) {
                const localBookmarks = storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS as any);
                storage.set(STORAGE_KEYS.QURAN_BOOKMARKS as any, mergeSyncRecords(localBookmarks, data.bookmarks, "bookmark"));
            }

            // Fix Mission Mapping: DB has 'missionId', LocalStorage needs 'id'
            if (data.completedMissions && Array.isArray(data.completedMissions)) {
                const mappedMissions = data.completedMissions.map((m: any) => ({
                    ...m,
                    id: m.missionId || m.id
                }));
                const localMissions = storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS as any);
                storage.set(STORAGE_KEYS.COMPLETED_MISSIONS as any, mergeSyncRecords(localMissions, mappedMissions, "mission"));
            }

            if (data.intentions) {
                const localIntentions = storage.getOptional(STORAGE_KEYS.INTENTION_JOURNAL as any);
                storage.set(STORAGE_KEYS.INTENTION_JOURNAL as any, mergeSyncRecords(localIntentions, data.intentions, "intention"));
            }

            // Hydrate Activity if exists for today
            if (data.dailyActivities && data.dailyActivities.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const todayActivity = data.dailyActivities.find((a: any) => a.date === today);
                if (todayActivity) {
                    storage.set(STORAGE_KEYS.DHIKR_COUNT as any, todayActivity.tasbihCount.toString());
                    // Update activity tracker format
                    const tracker = {
                        date: today,
                        quranAyat: todayActivity.quranAyat,
                        tasbihCount: todayActivity.tasbihCount,
                        prayersLogged: todayActivity.prayersLogged
                    };
                    storage.set(STORAGE_KEYS.ACTIVITY_TRACKER as any, tracker);
                }
            }

            if (data.progression?.streak) {
                const canonicalStreak = data.progression.streak;
                storage.set(STORAGE_KEYS.USER_STREAK as any, {
                    currentStreak: canonicalStreak.currentDays || 0,
                    longestStreak: canonicalStreak.longestDays || 0,
                    lastActiveDate: canonicalStreak.lastStreakDate || "",
                    milestones: [],
                    freezesAvailable: canonicalStreak.freezesAvailable || 0,
                    protectedDates: (canonicalStreak.days || [])
                        .filter((day: { status?: string }) => day.status === "frozen")
                        .map((day: { localDate: string }) => day.localDate),
                });
                window.dispatchEvent(new Event("streak_updated"));
            }

            if (data.progression) {
                storage.set(STORAGE_KEYS.CANONICAL_PROGRESSION as any, {
                    ...data.progression,
                    userId: session?.user?.id,
                });
                storage.set(STORAGE_KEYS.USER_HASANAH as any, String(data.progression.hasanah || 0));
                window.dispatchEvent(new Event("hasanah_updated"));
            }

            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("bookmarks_updated"));
            window.dispatchEvent(new Event("mission_updated"));
            window.dispatchEvent(new Event("streak_updated"));
            window.dispatchEvent(new Event("hasanah_updated"));

            // Reload page to reflect changes (e.g. Theme, Language)
            // setTimeout(() => window.location.reload(), 1000);

        } catch (e) {
            console.error("Hydration error", e);
        }
    };

    return null; // No UI needed for auto-sync
}
