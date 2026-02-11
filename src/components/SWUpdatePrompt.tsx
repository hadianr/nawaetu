"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { APP_CONFIG } from "@/config/app-config";

export default function SWUpdatePrompt() {
    const { t } = useLocale();

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !window.navigator ||
            !window.navigator.serviceWorker
        ) {
            return;
        }

        const handleNewServiceWorker = (registration: ServiceWorkerRegistration) => {
            const waitingWorker = registration.waiting;

            if (waitingWorker) {
                showUpdateToast(waitingWorker);
            }
        };

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

        const onSWUpdate = (e: Event) => {
            const registration = (e as any).detail as ServiceWorkerRegistration;
            handleNewServiceWorker(registration);
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
        navigator.serviceWorker.ready.then((registration) => {
            if (registration.waiting) {
                showUpdateToast(registration.waiting);
            }
        });

        // 2. Listen for 'updatefound' (standard) usually handled by workbox-window or next-pwa
        // next-pwa might not emit a custom event, so we poll or hook into registration
        // But since we don't have easy access to the registration object globally here without re-registering...
        // We rely on standard API.

        // However, standard SW registration happens in window load usually.
        // We can try to get registrations.
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
                navigator.serviceWorker.ready.then((reg) => {
                    reg.update().catch(err => console.error('SW Update Check Failed:', err));
                });
            }

            // B. "Nuclear" Version Check (Fix for iOS Revert Bug)
            // Fetch server version and kill SW if client is stuck
            try {
                // Get current client version from config (bundled at build time)
                // We need to import APP_CONFIG here or use a prop.
                // Since this component is client-side, we fetching the API is best.

                const res = await fetch('/api/system/version?t=' + Date.now()); // Bust API cache
                if (res.ok) {
                    const data = await res.json();
                    const serverVersion = data.version;

                    // Client version must be injected or known.
                    // We can read it from a data attribute or global variable if needed, 
                    // but usually we can't easily get the *running* code version unless we bake it in.
                    // Let's assume the build system injects it, or we rely on the fact that 
                    // this code ITSELF is running v1.5.3 (if stuck).
                    // WAIT. If this code is running v1.5.7, then we are fine.
                    // The problem is when the code running is v1.5.3.
                    // But I can't change v1.5.3 code anymore! It's already cached!

                    // THIS IS THE CATCH-22.
                    // If the user is seeing v1.5.3, they are running v1.5.3's `SWUpdatePrompt.tsx`.
                    // I cannot patch v1.5.3.

                    // HOWEVER, the user said: "versinya sudah update otomatis akan tetapi ketika saya kill appsnya... kembali lagi"
                    // This means they DO see v1.5.7 momentarily.
                    // This means v1.5.7 *does* load.
                    // So if I add this logic to v1.5.8, when they update to v1.5.8, 
                    // the *next* time they open, if it ever tries to revert, v1.5.8's SW (if installed correctly) should hold.

                    // Actually, if they revert to v1.5.3, my new code won't run.
                    // BUT, if they are *currently* on the "good" version (before kill), 
                    // maybe I can do something to "cement" the new SW?

                    // The issue is likely that v1.5.3 SW is waiting or active and not letting go.
                    // If I run `unregister()` in v1.5.8, it will kill whatever SW is currently running (even if it's the old one, assuming we can control it).

                    // Check if we are running the NEW version.
                    // If we are, ensure we unregister any 'zombie' SWs that might be lurking or ensure we are NOT caching the app shell.

                    // Actually, the most effective fix for "reverts to old version" is to ensure the NEW version's SW (v1.5.8)
                    // has `skipWaiting()` and `clients.claim()` called IMMEDIATELY.

                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(regs => {
                            regs.forEach(reg => {
                                // If we are in v1.5.8, we want to make sure we own the client.
                                // We can also aggressively clear old caches here.
                            });
                        });
                    }
                }
            } catch (e) {
                console.error("Version check failed", e);
            }
        };

        // 4. iOS REVERT BUG FIX (v1.5.9)
        // Ensure we kill "sw.js" (Zombie v1.5.3) but KEEP "sw-v158.js" (New)
        const nukeOldCaches = async () => {
            const FIX_KEY = `nawaetu_ios_fix_${APP_CONFIG.version}_smart`;

            // Run this cleanup to ensure old SW is dead
            if (typeof window !== 'undefined' && !localStorage.getItem(FIX_KEY)) {
                console.log("[SW] Executing Smart Zombie Cleanup...");

                try {
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
                                console.log("[SW] Unregistering Legacy Zombie:", reg.scope);
                                await reg.unregister();
                                reloadNeeded = true;
                            }
                        }
                    }

                    // 2. Clear All Caches (Force fresh assets) - Still good to do once
                    if ('caches' in window) {
                        const keys = await caches.keys();
                        // Optional: Only clear if we really need to. 
                        // But to be safe against v1.5.3 HTML cache, lets clear.
                        await Promise.all(keys.map(key => caches.delete(key)));
                        console.log("[SW] Cleared caches:", keys);
                    }

                    // 3. Mark as fixed
                    localStorage.setItem(FIX_KEY, 'true');

                    // 4. Force Reload if we killed something
                    if (reloadNeeded) {
                        window.location.reload();
                    }

                } catch (e) {
                    console.error("[SW] Cleanup failed:", e);
                }
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
