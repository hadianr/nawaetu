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

import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PWAInstallPromptProps {
    shouldShow?: boolean;
}

export default function PWAInstallPrompt({ shouldShow = true }: PWAInstallPromptProps) {
    const { isStandalone, isIOS, isMobile, deferredPrompt, promptInstall } = usePWAInstall();
    const { t } = useLocale();
    const [isVisible, setIsVisible] = useState(false);
    const storage = getStorageService();

    useEffect(() => {
        // Only show if parent says it's ok (after interaction) AND not installed AND (has prompt OR iOS)
        if (shouldShow && !isStandalone && (deferredPrompt || isIOS || isMobile)) {
            try {
                const lastDismissed = storage.getOptional<number>(STORAGE_KEYS.PWA_PROMPT_DISMISSED);
                if (!lastDismissed || Date.now() - lastDismissed > 24 * 60 * 60 * 1000) {
                    queueMicrotask(() => setIsVisible(true));
                }
            } catch {
                // Restricted/quota-full storage must not block the install prompt.
                queueMicrotask(() => setIsVisible(true));
            }
        }
    }, [shouldShow, isStandalone, deferredPrompt, isIOS, isMobile, storage]);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            storage.set(STORAGE_KEYS.PWA_PROMPT_DISMISSED, Date.now());
        } catch {
            // Dismissal still applies for this mount when persistence is unavailable.
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="bg-[rgb(var(--color-surface))]/95 backdrop-blur-xl border border-[rgb(var(--color-border))]/30 p-4 rounded-2xl shadow-[var(--shadow-floating)] relative overflow-hidden text-[rgb(var(--color-text))]">
                {/* Background Noise */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-3 bg-[rgb(var(--color-surface-subtle))] rounded-full hover:bg-[rgb(var(--color-surface-subtle))]/80 active:scale-90 transition-all z-20 cursor-pointer touch-manipulation flex items-center justify-center"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-[rgb(var(--color-text-muted))]" />
                </button>

                <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-xl font-bold text-[rgb(var(--color-primary-foreground))]">N</span>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-sm">{t.pwaInstallTitle}</h3>
                        <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1 leading-relaxed">
                            {t.pwaInstallDesc}
                        </p>

                        {isIOS ? (
                            <div className="mt-3 space-y-2 bg-[rgb(var(--color-surface-subtle))]/70 p-2 rounded-lg border border-[rgb(var(--color-border))]/20">
                                <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text))]">
                                    <span className="flex items-center justify-center w-5 h-5 bg-[rgb(var(--color-border))]/20 rounded-md">1</span>
                                    <span>{t.pwaInstallIosStep1} <Share className="w-3 h-3 inline mx-1" /></span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text))]">
                                    <span className="flex items-center justify-center w-5 h-5 bg-[rgb(var(--color-border))]/20 rounded-md">2</span>
                                    <span>{t.pwaInstallIosStep2} <PlusSquare className="w-3 h-3 inline mx-1" /></span>
                                </div>
                            </div>
                        ) : deferredPrompt ? (
                            <Button
                                onClick={async () => {
                                    const success = await promptInstall();
                                    if (success) {
                                        setIsVisible(false);
                                    } else {
                                        // If install failed, keep prompt visible
                                        // User can try again or dismiss manually
                                    }
                                }}
                                className="mt-3 w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] font-bold h-9 text-xs"
                            >
                                <Download className="w-3 h-3 mr-2" />
                                {t.pwaInstallButton}
                            </Button>
                        ) : (
                            <div className="mt-3 space-y-2 bg-[rgb(var(--color-surface-subtle))]/70 p-2 rounded-lg border border-[rgb(var(--color-border))]/20 text-xs text-[rgb(var(--color-text))]">
                                <p>{t.pwaInstallManualTitle}</p>
                                <p>{t.pwaInstallManualDesc}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
