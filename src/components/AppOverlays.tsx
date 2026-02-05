"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import OnboardingOverlay from "@/components/OnboardingOverlay";
import { initializeQuranOptimizations } from "@/lib/optimize-quran";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });

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

export default function AppOverlays() {
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);

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

    return (
        <>
            <OnboardingOverlay />
            <PWAInstallPrompt shouldShow={showPwaPrompt} />
        </>
    );
}
