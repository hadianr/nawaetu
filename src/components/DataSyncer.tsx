"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useDataSync } from "@/hooks/useDataSync";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";

import { getStorageService } from "@/core/infrastructure/storage";

export default function DataSyncer() {
    const { data: session, status } = useSession();
    const hasSyncedRef = useRef(false);
    const { syncData } = useDataSync();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { setTheme } = useTheme();
    const { setLocale } = useLocale();
    const storage = getStorageService();

    // Helper to check if a setting was recently changed manually
    const RECENT_CHANGE_THRESHOLD_MS = 5000; // 5 seconds
    const isRecentlyChanged = (settingKey: string): boolean => {
        const timestamp = localStorage.getItem(`${settingKey}_last_changed`);
        if (!timestamp) return false;
        return Date.now() - parseInt(timestamp) < RECENT_CHANGE_THRESHOLD_MS;
    };

    const restoreSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/user/settings");
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    const d = data.data;

                    // 1. Restore Settings (with race condition protection)
                    if (d.settings) {
                        const s = d.settings;

                        // Only restore if not recently changed by user
                        if (s.theme && !isRecentlyChanged(STORAGE_KEYS.SETTINGS_THEME)) {
                            setTheme(s.theme);
                        }
                        if (s.locale && !isRecentlyChanged(STORAGE_KEYS.SETTINGS_LOCALE)) {
                            setLocale(s.locale);
                        }
                        if (s.muadzin && !isRecentlyChanged(STORAGE_KEYS.SETTINGS_MUADZIN)) {
                            storage.set(STORAGE_KEYS.SETTINGS_MUADZIN, s.muadzin);
                        }
                        if (s.calculationMethod && !isRecentlyChanged(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD)) {
                            storage.set(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD, s.calculationMethod);
                            // Trigger refresh of prayer times
                            window.dispatchEvent(new CustomEvent("calculation_method_changed", { detail: { method: s.calculationMethod } }));
                        }
                        if (s.notificationPreferences) {
                            storage.set(STORAGE_KEYS.ADHAN_PREFERENCES, s.notificationPreferences);
                        }
                        if (s.lastReadQuran) {
                            storage.set(STORAGE_KEYS.QURAN_LAST_READ, s.lastReadQuran);
                        }
                    }

                    // 2. Restore Bookmarks
                    if (Array.isArray(d.bookmarks) && d.bookmarks.length > 0) {
                        const bookmarksData = d.bookmarks.map((b: any) => ({
                            surahId: b.surahId,
                            surahName: b.surahName,
                            verseId: b.verseId,
                            verseText: b.verseText,
                            key: b.key,
                            note: b.note,
                            tags: b.tags,
                            createdAt: b.createdAt
                        }));
                        storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, bookmarksData);
                    }

                    // 3. Restore Intentions (Journal)
                    if (Array.isArray(d.intentions) && d.intentions.length > 0) {
                        const intentionsData = d.intentions.map((i: any) => ({
                            id: i.id,
                            niatText: i.niatText,
                            niatType: i.niatType,
                            niatDate: i.niatDate,
                            reflectionText: i.reflectionText,
                            reflectionRating: i.reflectionRating,
                            isPrivate: i.isPrivate ?? true,
                            createdAt: i.createdAt
                        }));
                        storage.set(STORAGE_KEYS.INTENTION_JOURNAL, intentionsData);
                    }

                }
            }
        } catch (e) {
        }
    }, [setTheme, setLocale]);

    useEffect(() => {
        const handleAuthSync = async () => {
            if (status === "authenticated" && session?.user && !hasSyncedRef.current) {
                hasSyncedRef.current = true;

                // Logic for Welcome Toast - show only once per login session
                const welcomeKey = `nawaetu_login_welcome_${session.user.id || session.user.email}`;
                if (!localStorage.getItem(welcomeKey)) {
                    toast.success(`Ahlan wa Sahlan, ${session.user.name?.split(' ')[0] || 'Sobat'}!`, {
                        icon: "👋",
                        description: "Login berhasil. Selamat datang kembali.",
                        duration: 4000
                    });
                    localStorage.setItem(welcomeKey, "true");
                }

                // 1. Always restore settings first to get cloud preferences
                // This ensures we don't overwrite cloud settings with local defaults
                await restoreSettings();

                // 2. Check if we need to push local guest data (bookmarks, etc) to cloud
                const hasSyncedFlag = localStorage.getItem("nawaetu_synced_v1");
                if (!hasSyncedFlag) {
                    await syncData();
                }
            } else if (status === "unauthenticated") {
                // Clear welcome flag on logout so it shows again on next login
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('nawaetu_login_welcome_')) {
                        localStorage.removeItem(key);
                    }
                });
                hasSyncedRef.current = false;
            }
        };

        handleAuthSync();

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
            ];

            if (syncableKeys.includes(key)) {
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

    }, [status, session, syncData, restoreSettings]);

    return null; // Invisible component
}
