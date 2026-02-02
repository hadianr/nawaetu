"use client";

import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
    const { isStandalone, isIOS, deferredPrompt, promptInstall } = usePWAInstall();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show prompt only if not installed and (we have a prompt OR it's iOS)
        // Delay showing to not overwhelm user immediately on load
        const timer = setTimeout(() => {
            if (!isStandalone && (deferredPrompt || isIOS)) {
                // Check if user dismissed it recently (e.g., in last 24 hours)
                const lastDismissed = localStorage.getItem("pwa_prompt_dismissed");
                if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
                    setIsVisible(true);
                }
            }
        }, 3000); // 3 seconds delay

        return () => clearTimeout(timer);
    }, [isStandalone, deferredPrompt, isIOS]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                >
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
                        {/* Background Noise */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>

                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                <span className="text-xl font-bold text-white">N</span>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm">Install Nawaetu</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Akses lebih cepat, hemat kuota, dan fitur full screen tanpa perlu download di Store.
                                </p>

                                {isIOS ? (
                                    <div className="mt-3 space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <span className="flex items-center justify-center w-5 h-5 bg-white/10 rounded-md">1</span>
                                            <span>Tap tombol <strong>Share</strong> <Share className="w-3 h-3 inline mx-1" /></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <span className="flex items-center justify-center w-5 h-5 bg-white/10 rounded-md">2</span>
                                            <span>Pilih <strong>Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline mx-1" /></span>
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
                                        Install sekarang
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
