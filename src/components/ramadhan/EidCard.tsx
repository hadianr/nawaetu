"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";

export default function EidCard() {
    const { t } = useLocale();
    const { data: prayerData } = usePrayerTimesContext();
    const [showSunnah, setShowSunnah] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    if (!mounted) return null;

    const hijriDay = prayerData?.hijriDay || 1;
    const dayString = (t.lebaranDayX as string).replace('{day}', String(hijriDay));

    return (
        <section className="w-full mb-2 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <button 
                onClick={() => setShowSunnah(true)}
                className="w-full relative overflow-hidden group rounded-2xl border border-[rgb(var(--color-primary))]/30 bg-black/40 backdrop-blur-sm shadow-[0_0_20px_rgba(var(--color-primary),0.15)] flex items-center justify-between p-4 transition-transform active:scale-95 text-left"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[rgb(var(--color-primary-dark))]/50 to-black/80 -z-10" />
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-primary-light))] filter drop-shadow-sm">
                        {t.lebaranGreeting}
                    </span>
                    <span className="text-xl font-bold text-white font-serif">
                        {dayString}
                    </span>
                </div>
                <span className="text-3xl filter drop-shadow opacity-90 group-hover:scale-110 transition-transform">✨</span>
            </button>

            {/* Sunnah Dialog */}
            <Dialog open={showSunnah} onOpenChange={setShowSunnah}>
                <DialogContent className="bg-black/80 backdrop-blur-xl border border-[rgb(var(--color-primary))]/20 text-white w-[90%] max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                            ✨ {t.eidSunnahTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            {t.eidSunnahDesc}
                        </p>
                        <div className="bg-[rgb(var(--color-primary-dark))]/20 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                            <ul className="text-sm text-[rgb(var(--color-primary-light))] space-y-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">🤝</span>
                                    <span>{t.eidSunnah1}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">👨‍👩‍👧‍👦</span>
                                    <span>{t.eidSunnah2}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">🎁</span>
                                    <span>{t.eidSunnah3}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">🤐</span>
                                    <span>{t.eidSunnah4}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-lg leading-none mt-0.5">🌙</span>
                                    <span>{t.eidSunnah5}</span>
                                </li>
                            </ul>
                        </div>
                        <Button 
                            onClick={() => setShowSunnah(false)} 
                            className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white shadow-md transition-all active:scale-95"
                        >
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
