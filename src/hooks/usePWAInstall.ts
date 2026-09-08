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

import { useState, useEffect, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const subscribe = (listener: () => void) => {
        window.addEventListener("appinstalled", listener);
        return () => window.removeEventListener("appinstalled", listener);
    };
    const getIsIOS = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };
    const getIsMobile = () => getIsIOS() || /android|mobile/i.test(window.navigator.userAgent);
    const isStandalone = useSyncExternalStore(
        subscribe,
        () => window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone) || document.referrer.includes("android-app://"),
        () => false,
    );
    const isIOS = useSyncExternalStore(subscribe, getIsIOS, () => false);
    const isMobile = useSyncExternalStore(subscribe, getIsMobile, () => false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault(); // Prevent automatic mini-infobar
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
        };
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) {
            return false;
        }

        try {

            // Show the install prompt
            await deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;


            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                return true;
            } else {
                return false;
            }
        } catch {
            // Reset the prompt so user can try again
            setDeferredPrompt(null);
            return false;
        }
    };

    return { isStandalone, isIOS, isMobile, deferredPrompt, promptInstall };
}
