"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useDataSync } from "@/hooks/useDataSync";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";

export default function DataSyncer() {
    const { data: session, status } = useSession();
    const hasSyncedRef = useRef(false);
    const { syncData } = useDataSync();
    const { setTheme } = useTheme();
    const { setLocale } = useLocale();

    const restoreSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/user/settings");
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    const d = data.data;

                    // 1. Restore Settings
                    if (d.settings) {
                        const s = d.settings;
                        if (s.theme) {
                            setTheme(s.theme);
                        }
                        if (s.locale) {
                            setLocale(s.locale);
                        }
                        if (s.muadzin) {
                            localStorage.setItem(STORAGE_KEYS.SETTINGS_MUADZIN, s.muadzin);
                        }
                        if (s.calculationMethod) {
                            localStorage.setItem(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD, s.calculationMethod);
                            // Trigger refresh of prayer times
                            window.dispatchEvent(new CustomEvent("calculation_method_changed", { detail: { method: s.calculationMethod } }));
                        }
                        if (s.notificationPreferences) {
                            localStorage.setItem(STORAGE_KEYS.ADHAN_PREFERENCES, JSON.stringify(s.notificationPreferences));
                        }
                        if (s.lastReadQuran) {
                            localStorage.setItem(STORAGE_KEYS.QURAN_LAST_READ, s.lastReadQuran);
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
                        localStorage.setItem(STORAGE_KEYS.QURAN_BOOKMARKS, JSON.stringify(bookmarksData));
                        console.log('[DataSyncer] ✓ Restored', bookmarksData.length, 'bookmarks');
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
                        localStorage.setItem(STORAGE_KEYS.INTENTION_JOURNAL, JSON.stringify(intentionsData));
                        console.log('[DataSyncer] ✓ Restored', intentionsData.length, 'intentions');
                    }

                    console.log('[DataSyncer] ✓ All cloud data restored successfully');
                }
            }
        } catch (e) {
            console.error("Failed to restore settings", e);
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
    }, [status, session, syncData, restoreSettings]);

    return null; // Invisible component
}
