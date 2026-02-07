"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        const isStandaloneMode =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes("android-app://");

        setIsStandalone(isStandaloneMode);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault(); // Prevent automatic mini-infobar
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) {
            console.warn('[PWA Install] No deferred prompt available');
            return false;
        }

        try {
            console.log('[PWA Install] Showing install prompt...');

            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`[PWA Install] User response: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('[PWA Install] User accepted the install prompt');
                setDeferredPrompt(null);
                return true;
            } else {
                console.log('[PWA Install] User dismissed the install prompt');
                return false;
            }
        } catch (error) {
            console.error('[PWA Install] Error showing install prompt:', error);
            // Reset the prompt so user can try again
            setDeferredPrompt(null);
            return false;
        }
    };

    return { isStandalone, isIOS, deferredPrompt, promptInstall };
}
