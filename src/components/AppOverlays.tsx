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

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { APP_CONFIG } from "@/config/app-config";
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });
const SWUpdatePrompt = dynamic(() => import("@/components/SWUpdatePrompt"), { ssr: false });


const CACHE_CLEANUP_RULES = [
    { prefix: "quran_tafsir_", ttlMs: 7 * 24 * 60 * 60 * 1000 },
    { prefix: "verse_", ttlMs: 7 * 24 * 60 * 60 * 1000 },
    { prefix: STORAGE_KEYS.HIJRI_CALENDAR_CACHE_PREFIX, ttlMs: 24 * 60 * 60 * 1000 },
];

const CACHE_VERSIONS: Record<string, number> = {
    quran_tafsir_: 1,
    verse_: 1,
    [STORAGE_KEYS.HIJRI_CALENDAR_CACHE_PREFIX]: 1,
};

const cleanupDynamicCaches = () => {
    if (typeof window === "undefined") return;
    const now = Date.now();

    try {
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
            const key = localStorage.key(i);
            if (!key) continue;

            const rule = CACHE_CLEANUP_RULES.find((entry) => key.startsWith(entry.prefix));
            if (!rule) continue;

            const raw = localStorage.getItem(key);
            if (!raw) continue;

            try {
                const parsed = JSON.parse(raw) as { ts?: number; v?: number };
                const expectedVersion = CACHE_VERSIONS[rule.prefix];
                if (expectedVersion !== undefined && parsed?.v !== expectedVersion) {
                    localStorage.removeItem(key);
                    continue;
                }

                if (typeof parsed?.ts === "number") {
                    if (now - parsed.ts > rule.ttlMs) {
                        localStorage.removeItem(key);
                    }
                } else {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key);
            }
        }
    } catch {
        // Silently fail if storage is restricted
    }
};

import { Toaster } from "sonner";
import { THEMES, useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function AppOverlays() {
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);
    const { currentTheme } = useTheme();
    const themeMode = THEMES[currentTheme].mode;

    useEffect(() => {
        const show = () => setShowPwaPrompt(true);

        // Only show PWA prompt after first user interaction (not on page load)
        const onInteraction = () => {
            show();
            document.removeEventListener("click", onInteraction);
            document.removeEventListener("scroll", onInteraction);
            document.removeEventListener("keydown", onInteraction);
            document.removeEventListener("touchstart", onInteraction);
        };

        document.addEventListener("click", onInteraction, { once: true, passive: true });
        document.addEventListener("scroll", onInteraction, { once: true, passive: true });
        document.addEventListener("keydown", onInteraction, { once: true, passive: true });
        document.addEventListener("touchstart", onInteraction, { once: true, passive: true });

        return () => {
            document.removeEventListener("click", onInteraction);
            document.removeEventListener("scroll", onInteraction);
            document.removeEventListener("keydown", onInteraction);
            document.removeEventListener("touchstart", onInteraction);
        };
    }, []);

    // Cleanup dynamic cache keys on first client load
    useEffect(() => {
        cleanupDynamicCaches();
    }, []);

    // iOS hard refresh on version change to prevent reverting to old PWA shell
    // FIX: Run only ONCE per browser session, not on every navigation
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Global flag to ensure this logic runs ONLY ONCE per browser session
        const GLOBAL_SESSION_KEY = 'nawaetu_app_initialized';
        let wasInitialized = false;

        try {
            wasInitialized = sessionStorage.getItem(GLOBAL_SESSION_KEY) === 'true';
        } catch {
            // If sessionStorage is blocked, we can't track initialization this way.
            // But we shouldn't crash.
        }

        if (wasInitialized) {
            return;
        }

        const storage = getStorageService();
        const storedVersion = storage.getOptional(STORAGE_KEYS.APP_VERSION) as string | null;
        const currentVersion = APP_CONFIG.version;

        // Mark as initialized IMMEDIATELY to prevent redirect loop
        try {
            sessionStorage.setItem(GLOBAL_SESSION_KEY, 'true');
        } catch {
            // Silently fail if sessionStorage is blocked
        }

        // If version mismatch, just update localStorage and log it
        // Don't redirect - AppOverlays may mount multiple times during navigation
        if (storedVersion !== currentVersion) {
            storage.set(STORAGE_KEYS.APP_VERSION, currentVersion);
        }

    }, []);

    return (
        <>
            <PWAInstallPrompt shouldShow={showPwaPrompt} />
            <SWUpdatePrompt />

            <Toaster
                position="top-center"
                theme={themeMode}
                toastOptions={{
                    classNames: {
                        toast: cn(
                            "group toast group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl transition-all border",
                            "group-[.toaster]:bg-[rgb(var(--color-surface))]/95 group-[.toaster]:text-[rgb(var(--color-text))] group-[.toaster]:border-[rgb(var(--color-border))] group-[.toaster]:shadow-[var(--shadow-floating)]"
                        ),
                        description: "group-[.toast]:text-[rgb(var(--color-text-muted))] font-medium",
                        actionButton: "group-[.toast]:bg-[rgb(var(--color-primary))] group-[.toast]:text-[rgb(var(--color-primary-foreground))]",
                        cancelButton: "group-[.toast]:bg-[rgb(var(--color-surface-subtle))] group-[.toast]:text-[rgb(var(--color-text-muted))]",
                        title: cn(
                            "font-bold",
                            "group-[.toast]:text-[rgb(var(--color-text-strong))]"
                        ),
                        icon: "group-[.toast]:text-[rgb(var(--color-primary))]"
                    }
                }}
            />
        </>
    );
}
