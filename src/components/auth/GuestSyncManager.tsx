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

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";

import { getStorageService, type StorageService } from "@/core/infrastructure/storage";
import { mergeSyncRecords } from "@/lib/sync/merge-sync-data";
import { sendGAEvent } from "@/lib/analytics/analytics";

interface GuestActivityTracker {
    quranAyat?: number;
    tasbihCount?: number;
    prayersLogged?: string[];
}

interface GuestSyncSettings {
    theme?: unknown;
    locale?: unknown;
    reciter?: unknown;
    muadzin?: unknown;
    calculationMethod?: unknown;
    hijriAdjustment?: unknown;
    adhanPreferences?: unknown;
}

interface GuestSyncMission {
    id?: string;
    missionId?: string;
    [key: string]: unknown;
}

interface GuestSyncActivity {
    date: string;
    quranAyat: number;
    tasbihCount: number;
    prayersLogged: string[];
}

interface GuestSyncData {
    profile?: {
        name?: string;
        gender?: string;
        totalInfaq?: number;
        guestSyncEligible?: boolean;
        settings?: GuestSyncSettings;
        streaks?: { current?: number };
    };
    bookmarks?: unknown[];
    completedMissions?: GuestSyncMission[];
    intentions?: unknown[];
    dailyActivities?: GuestSyncActivity[];
    progression?: {
        hasanah?: number;
        streak?: {
            currentDays?: number;
            longestDays?: number;
            lastStreakDate?: string | null;
            freezesAvailable?: number;
            days?: Array<{ status?: string; localDate: string }>;
        };
    };
    readingState?: {
        quranLastRead?: unknown;
    } | null;
}

function checkForLocalGuestData(storage: StorageService): boolean {
    if (typeof window === "undefined") return false;

    const profileKeys = [
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_GENDER,
    ];

    const hasCustomProfile = profileKeys.some(key => {
        const val = localStorage.getItem(key);
        if (!val) return false;
        const lowerVal = val.toLowerCase().trim();
        if (lowerVal === "guest" || lowerVal === "mode guest" || lowerVal === "loading" || lowerVal === "") return false;
        return true;
    });

    if (hasCustomProfile) return true;

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
        const val = storage.getOptional(key);
        if (!val) return false;
        const strVal = typeof val === 'string' ? val : JSON.stringify(val);
        return strVal !== "[]" && strVal !== "{}" && strVal !== "0" && strVal !== "0||0";
    });
}

function checkServerProgress(data: GuestSyncData): boolean {
    if (data.bookmarks && data.bookmarks.length > 0) return true;
    if (data.completedMissions && data.completedMissions.length > 0) return true;
    if (data.intentions && data.intentions.length > 0) return true;
    if (data.profile?.name && data.profile.name.toLowerCase() !== "guest") return true;
    if (data.profile?.streaks?.current && data.profile.streaks.current > 0) return true;
    if (data.readingState?.quranLastRead) return true;
    if (data.dailyActivities && data.dailyActivities.length > 0) return true;
    if (data.progression?.hasanah && data.progression.hasanah > 0) return true;
    if (data.progression?.streak?.days && data.progression.streak.days.length > 0) return true;
    return false;
}

async function handleSyncToNewAccount(
    storage: StorageService,
    userId: string,
    translations: TranslationTree,
): Promise<void> {
    try {
        const activityTracker = storage.getOptional<GuestActivityTracker>(STORAGE_KEYS.ACTIVITY_TRACKER);
        const payload = {
            profile: {
                name: storage.getOptional<string>(STORAGE_KEYS.USER_NAME),
                gender: storage.getOptional<string>(STORAGE_KEYS.USER_GENDER),
            },
            settings: {
                theme: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_THEME),
                locale: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_LOCALE),
                reciter: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_RECITER),
                muadzin: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_MUADZIN),
                calculationMethod: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD),
                hijriAdjustment: storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
                adhanPreferences: storage.getOptional<unknown>(STORAGE_KEYS.ADHAN_PREFERENCES),
            },
            readingState: {
                quranLastRead: storage.getOptional(STORAGE_KEYS.QURAN_LAST_READ) ? storage.getOptional<unknown>(STORAGE_KEYS.QURAN_LAST_READ) : null,
            },
            bookmarks: storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS) || [],
            completedMissions: storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS) || [],
            intentions: storage.getOptional(STORAGE_KEYS.INTENTION_JOURNAL) || [],
            activity: {
                date: new Date().toISOString().split('T')[0],
                quranAyat: activityTracker?.quranAyat || 0,
                tasbihCount: activityTracker?.tasbihCount || 0,
                prayersLogged: activityTracker?.prayersLogged || [],
            },
        };

        const res = await fetch("/api/user/sync-guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Sync failed");

        storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID, userId);
        toast.success(translations.syncUploadSuccess || "✨ Berhasil! Progress tamu kamu sudah aman di akun ini.");
        sendGAEvent("sync_recovery_outcome", { outcome: "success" });
    } catch (error) {
        console.error(error);
        toast.error(translations.syncError || "Failed to sync data.");
        sendGAEvent("sync_recovery_outcome", { outcome: "error" });
    }
}

function isValidSetting(value: unknown): value is string | number {
    return value !== undefined && value !== null
        && (typeof value === 'string' || typeof value === 'number')
        && value.toString().length < 500;
}

async function hydrateFromServer(
    data: GuestSyncData,
    storage: StorageService,
    userId: string,
): Promise<void> {
    try {
        storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID, userId);
        storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");

        if (data.profile) {
            if (data.profile.name) storage.set(STORAGE_KEYS.USER_NAME, data.profile.name);
            if (data.profile.gender) storage.set(STORAGE_KEYS.USER_GENDER, data.profile.gender);
            if (data.profile.totalInfaq !== undefined) {
                storage.set(STORAGE_KEYS.USER_TOTAL_DONATION, data.profile.totalInfaq.toString());
            }

            if (data.profile.settings) {
                const settings = data.profile.settings;

                if (isValidSetting(settings.theme)) storage.set(STORAGE_KEYS.SETTINGS_THEME, settings.theme);
                if (isValidSetting(settings.locale)) storage.set(STORAGE_KEYS.SETTINGS_LOCALE, settings.locale);
                if (isValidSetting(settings.reciter)) storage.set(STORAGE_KEYS.SETTINGS_RECITER, settings.reciter);
                if (isValidSetting(settings.muadzin)) storage.set(STORAGE_KEYS.SETTINGS_MUADZIN, settings.muadzin);
                if (isValidSetting(settings.calculationMethod)) {
                    storage.set(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD, settings.calculationMethod);
                }
                if (isValidSetting(settings.hijriAdjustment)) {
                    storage.set(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT, settings.hijriAdjustment);
                }
                if (settings.adhanPreferences && typeof settings.adhanPreferences === 'object') {
                    storage.set(STORAGE_KEYS.ADHAN_PREFERENCES, settings.adhanPreferences);
                }
            }
        }

        if (data.readingState?.quranLastRead) {
            storage.set(STORAGE_KEYS.QURAN_LAST_READ, data.readingState.quranLastRead);
        }

        if (data.bookmarks) {
            const localBookmarks = storage.getOptional(STORAGE_KEYS.QURAN_BOOKMARKS);
            storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, mergeSyncRecords(localBookmarks, data.bookmarks, "bookmark"));
        }

        if (data.completedMissions && Array.isArray(data.completedMissions)) {
            const mappedMissions = data.completedMissions.map((mission: GuestSyncMission) => ({
                ...mission,
                id: mission.missionId || mission.id,
            }));
            const localMissions = storage.getOptional(STORAGE_KEYS.COMPLETED_MISSIONS);
            storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, mergeSyncRecords(localMissions, mappedMissions, "mission"));
        }

        if (data.intentions) {
            const localIntentions = storage.getOptional(STORAGE_KEYS.INTENTION_JOURNAL);
            storage.set(STORAGE_KEYS.INTENTION_JOURNAL, mergeSyncRecords(localIntentions, data.intentions, "intention"));
        }

        if (data.dailyActivities && data.dailyActivities.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const todayActivity = data.dailyActivities.find((activity: GuestSyncActivity) => activity.date === today);
            if (todayActivity) {
                storage.set(STORAGE_KEYS.DHIKR_COUNT, todayActivity.tasbihCount.toString());
                storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, {
                    date: today,
                    quranAyat: todayActivity.quranAyat,
                    tasbihCount: todayActivity.tasbihCount,
                    prayersLogged: todayActivity.prayersLogged,
                });
            }
        }

        if (data.progression?.streak) {
            const canonicalStreak = data.progression.streak;
            storage.set(STORAGE_KEYS.USER_STREAK, {
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
            storage.set(STORAGE_KEYS.CANONICAL_PROGRESSION, {
                ...data.progression,
                userId,
            });
            storage.set(STORAGE_KEYS.USER_HASANAH, String(data.progression.hasanah || 0));
            window.dispatchEvent(new Event("hasanah_updated"));
        }

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("bookmarks_updated"));
        window.dispatchEvent(new Event("mission_updated"));
        window.dispatchEvent(new Event("streak_updated"));
        window.dispatchEvent(new Event("hasanah_updated"));
    } catch (error) {
        console.error("Hydration error", error);
    }
}

export function GuestSyncManager() {
    const { data: session, status } = useSession();
    const { t } = useLocale();
    const translations = t as TranslationTree;
    const storage = getStorageService();

    useEffect(() => {
        if (status === "unauthenticated") {
            storage.remove(STORAGE_KEYS.LAST_SYNC_USER_ID);
        }
    }, [status, storage]);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user?.id) return;
        const userId = session.user.id;

        const checkSyncStatus = async () => {
            // Prevent re-syncing if we've already synced this user in this session
            const lastSyncedId = storage.getOptional<string>(STORAGE_KEYS.LAST_SYNC_USER_ID);
            if (lastSyncedId === session.user.id) return;

            // Start Sync Process
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
            const hasLocalData = checkForLocalGuestData(storage);

                if (hasServerProgress) {
                    // Scenario: User has existing account data (HYDRATE)
                    // ACTION: Auto-Hydrate (Restore data).
                    toast.info(translations.syncHydrateLoading || "📂 Sedang mengambil data lama kamu dari server...", { duration: 2000 });
                    await hydrateFromServer(serverData, storage, userId);

                    // Success and Info Feedback
                    toast.success(translations.syncHydrateSuccess || "✅ Sip! Data akun lamamu sudah kembali. Yuk lanjut ibadah!");
                    setTimeout(() => {
                        toast.info(translations.syncHydrateInfo || "⚠️ Data tamu di HP ini telah kami ganti dengan data akun utamamu.", { duration: 4000 });
                    }, 500);
                    sendGAEvent("sync_recovery_outcome", { outcome: "success" });

                } else if (hasLocalData && serverData.profile?.guestSyncEligible === true) {
                    // Only a server-marked, brand-new account may import guest activity.
                    toast.info(translations.syncUploadLoading || "🚀 Sedang memindahkan data tamu kamu ke akun baru...", { duration: 2000 });
                    await handleSyncToNewAccount(storage, userId, translations);
                } else if (hasLocalData) {
                    // Do not import or delete guest activity when the account has
                    // no server progress yet. Keeping it is recoverable; clearing
                    // it here would make a transient/empty response destructive.
                    storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID, userId);
                    toast.info(translations.syncHydrateInfo || "Data lokal kamu tetap aman; belum ada data akun untuk dipulihkan.", { duration: 4000 });
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
                    storage.set(STORAGE_KEYS.LAST_SYNC_USER_ID, userId);
                    sendGAEvent("sync_recovery_outcome", { outcome: "success" });
                }

            } catch (error) {
                console.error("Sync error:", error);
                sendGAEvent("sync_recovery_outcome", { outcome: "error" });
                // Fail silently or toast error? Silent is better for auto-sync unless critical.
            } finally {
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
    }, [status, session, storage, translations]);

    return null; // No UI needed for auto-sync
}
