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
                if (data.settings) {
                    const s = data.settings;

                    // Apply to Local Storage & Contexts
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
