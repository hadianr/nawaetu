"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

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

    }, [t]);

    return null; // This component handles logic only, UI is via Toast
}
