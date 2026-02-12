"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import OnboardingOverlay from "@/components/OnboardingOverlay";
import { initializeQuranOptimizations } from "@/lib/optimize-quran";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { APP_CONFIG } from "@/config/app-config";
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });
const SWUpdatePrompt = dynamic(() => import("@/components/SWUpdatePrompt"), { ssr: false });


const CACHE_CLEANUP_RULES = [
    { prefix: "quran_tafsir_", ttlMs: 7 * 24 * 60 * 60 * 1000 },
    { prefix: "verse_", ttlMs: 7 * 24 * 60 * 60 * 1000 }
];

const CACHE_VERSIONS: Record<string, number> = {
    quran_tafsir_: 1,
    verse_: 1
};

const cleanupDynamicCaches = () => {
    if (typeof window === "undefined") return;
    const now = Date.now();

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
};

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export default function AppOverlays() {
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);
    const { currentTheme } = useTheme();

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

    // Initialize Quran API optimizations on first client load
    useEffect(() => {
        const storage = getStorageService();
        const locale = (storage.getOptional(STORAGE_KEYS.SETTINGS_LOCALE) as string | null) || "id";
        initializeQuranOptimizations(locale);
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
        const wasInitialized = sessionStorage.getItem(GLOBAL_SESSION_KEY) === 'true';
        
        console.log('[AppOverlays] Init check - Already initialized:', wasInitialized);
        
        if (wasInitialized) {
            console.log('[AppOverlays] ✓ Already initialized, skipping version check');
            return;
        }

        const storage = getStorageService();
        const storedVersion = storage.getOptional(STORAGE_KEYS.APP_VERSION) as string | null;
        const currentVersion = APP_CONFIG.version;
        
        console.log('[AppOverlays] Version check:');
        console.log('[AppOverlays]   - Stored version:', storedVersion);
        console.log('[AppOverlays]   - Current version:', currentVersion);
        console.log('[AppOverlays]   - Match:', storedVersion === currentVersion);

        // Mark as initialized IMMEDIATELY to prevent redirect loop
        sessionStorage.setItem(GLOBAL_SESSION_KEY, 'true');
        console.log('[AppOverlays] ✓ Marked as initialized');

        // If version mismatch, just update localStorage and log it
        // Don't redirect - AppOverlays may mount multiple times during navigation
        if (storedVersion !== currentVersion) {
            console.log('[AppOverlays] ⚠️  Version mismatch - updating localStorage');
            storage.set(STORAGE_KEYS.APP_VERSION, currentVersion);
            console.log('[AppOverlays] Updated to:', currentVersion);
        } else {
            console.log('[AppOverlays] ✓ Version match - no action needed');
        }

    }, []);

    return (
        <>
            <OnboardingOverlay />
            <PWAInstallPrompt shouldShow={showPwaPrompt} />
            <SWUpdatePrompt />

            <Toaster
                position="top-center"
                theme="dark"
                toastOptions={{
                    classNames: {
                        toast: "group toast group-[.toaster]:bg-[rgb(var(--color-surface))] group-[.toaster]:text-white group-[.toaster]:border-[rgb(var(--color-primary))]/30 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl",
                        description: "group-[.toast]:text-white/70 font-medium",
                        actionButton: "group-[.toast]:bg-[rgb(var(--color-primary))] group-[.toast]:text-white",
                        cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white",
                        title: "group-[.toast]:text-[rgb(var(--color-primary-light))]",
                        icon: "group-[.toast]:text-[rgb(var(--color-primary-light))]"
                    }
                }}
            />
        </>
    );
}
