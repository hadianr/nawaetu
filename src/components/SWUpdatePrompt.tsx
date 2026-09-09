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
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { APP_CONFIG } from "@/config/app-config";

import { getStorageService } from "@/core/infrastructure/storage";

export default function SWUpdatePrompt() {
    const { t } = useLocale();

    useEffect(() => {
        const storage = getStorageService();
        if (
            typeof window === "undefined" ||
            !window.navigator ||
            !window.navigator.serviceWorker
        ) {
            return;
        }

        // Service workers are optional. Safari and restricted browsers may
        // reject /sw.js; keep that failure from becoming an application error.
        const registrationPromise = navigator.serviceWorker.register("/sw.js").catch(() => null);

        const showUpdateToast = (worker: ServiceWorker) => {
            toast(t.pwaUpdateAvailableTitle || "Update Available", {
                description: t.pwaUpdateAvailableDesc || "A new version of Nawaetu is available.",
                duration: Infinity, // Don't auto-dismiss
                action: {
                    label: t.pwaUpdateAction || "Update Now",
                    onClick: () => {
                        worker.postMessage({ type: "SKIP_WAITING" });
                    },
                },
                icon: <RefreshCcw className="w-5 h-5 animate-spin-slow" />,
            });
        };

        // Listen for controller change (when new SW takes over)
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });

        // 1. Check if there is already a waiting worker on load
        registrationPromise.then((registration) => {
            if (!registration) return;
            if (registration.waiting) {
                showUpdateToast(registration.waiting);
            }
        });

        // 2. Listen for 'updatefound' (standard) usually handled by workbox-window or next-pwa
        navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach(reg => {
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New update available
                                showUpdateToast(newWorker);
                            }
                        });
                    }
                });
            });
        });

        // 3. AGGRESSIVE CHECK: Force update check on mount, interval, and visibility change
        const checkUpdate = async () => {
            // A. Standard SW Update
            if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                // Force update check
                    registration.update().catch(() => { });
                });
            }

            // B. "Nuclear" Version Check
            try {
                const res = await fetch('/api/system/version?t=' + Date.now()); // Bust API cache
                if (res.ok) {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(regs => {
                            regs.forEach(() => {
                                // Logic to ensure we catch reverts could go here
                            });
                        });
                    }
                }
            } catch {
                // Silently fail version check
            }
        };

        // 4. iOS REVERT BUG FIX (v1.5.9)
        // Ensure we kill "sw.js" (Zombie v1.5.3) but KEEP "sw-v158.js" (New)
        const nukeOldCaches = async () => {
            const FIX_KEY = `nawaetu_ios_fix_${APP_CONFIG.version}_smart`;

            // Run this cleanup to ensure old SW is dead
            try {
                // Use storage service instead of direct localStorage to avoid SecurityError
                if (typeof window !== 'undefined' && !storage.getOptional(FIX_KEY)) {

                    let reloadNeeded = false;

                    // 1. Unregister OLD 'sw.js' and 'sw-v158.js' (zombies)
                    if ('serviceWorker' in navigator) {
                        const regs = await navigator.serviceWorker.getRegistrations();
                        for (const reg of regs) {
                            // Check if this is an OLD worker
                            if (
                                reg.active?.scriptURL.includes('sw.js') ||
                                reg.waiting?.scriptURL.includes('sw.js') ||
                                reg.active?.scriptURL.includes('sw-v158.js') ||
                                reg.waiting?.scriptURL.includes('sw-v158.js')
                            ) {
                                await reg.unregister();
                                reloadNeeded = true;
                            }
                        }
                    }

                    // 2. Clear All Caches (Force fresh assets)
                    if ('caches' in window) {
                        try {
                            const keys = await caches.keys();
                            await Promise.all(keys.map(key => caches.delete(key)));
                        } catch {
                            // Caches might also be blocked in restricted iframes
                        }
                    }

                    // 3. Mark as fixed
                    storage.set(FIX_KEY, 'true');

                    // 4. Force Reload if we killed something
                    if (reloadNeeded) {
                        window.location.reload();
                    }
                }
            } catch {
                // Outer catch for extreme safety
            }
        };

        nukeOldCaches(); // Run cleanup immediately on mount
        checkUpdate();   // Run update check

        // Check every 1 hour
        const interval = setInterval(checkUpdate, 60 * 60 * 1000);

        // Check when window becomes visible (user comes back to app)
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkUpdate();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };

    }, [t]);

    return null;
}
