"use client";

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
    const { isStandalone, isIOS, deferredPrompt, promptInstall } = usePWAInstall();
    const { t } = useLocale();
    const [isVisible, setIsVisible] = useState(false);
    const storage = getStorageService();

    useEffect(() => {
        // Only show if parent says it's ok (after interaction) AND not installed AND (has prompt OR iOS)
        if (shouldShow && !isStandalone && (deferredPrompt || isIOS)) {
            const lastDismissed = storage.getOptional<number>(STORAGE_KEYS.PWA_PROMPT_DISMISSED);
            if (!lastDismissed || Date.now() - lastDismissed > 24 * 60 * 60 * 1000) {
                setIsVisible(true);
            }
        }
    }, [shouldShow, isStandalone, deferredPrompt, isIOS, storage]);

    const handleDismiss = () => {
        setIsVisible(false);
        storage.set(STORAGE_KEYS.PWA_PROMPT_DISMISSED, Date.now());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Background Noise */}
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-3 bg-white/5 rounded-full hover:bg-white/10 active:scale-90 transition-all z-20 cursor-pointer touch-manipulation flex items-center justify-center"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-xl font-bold text-white">N</span>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{t.pwaInstallTitle}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {t.pwaInstallDesc}
                        </p>

                        {isIOS ? (
                            <div className="mt-3 space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="flex items-center justify-center w-5 h-5 bg-white/10 rounded-md">1</span>
                                    <span>{t.pwaInstallIosStep1} <Share className="w-3 h-3 inline mx-1" /></span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="flex items-center justify-center w-5 h-5 bg-white/10 rounded-md">2</span>
                                    <span>{t.pwaInstallIosStep2} <PlusSquare className="w-3 h-3 inline mx-1" /></span>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => {
                                    promptInstall();
                                    setIsVisible(false);
                                }}
                                className="mt-3 w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold h-9 text-xs"
                            >
                                <Download className="w-3 h-3 mr-2" />
                                {t.pwaInstallButton}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
