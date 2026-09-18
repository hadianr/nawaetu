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
import { AppIcon } from "@/components/ui/AppIcon";

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
                className="w-full relative overflow-hidden group rounded-2xl border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-surface))]/90 backdrop-blur-sm shadow-[var(--shadow-card)] flex items-center justify-between p-4 transition-transform active:scale-95 text-left"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-surface))] via-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-surface))] -z-10" />
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-primary-light))] filter drop-shadow-sm">
                        {t.lebaranGreeting}
                    </span>
                    <span className="text-xl font-bold text-[rgb(var(--color-text-strong))] font-serif">
                        {dayString}
                    </span>
                </div>
                <AppIcon name="sparkles" size="xl" tone="primary" className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Sunnah Dialog */}
            <Dialog open={showSunnah} onOpenChange={setShowSunnah}>
                <DialogContent className="bg-[rgb(var(--color-surface))] backdrop-blur-xl border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] w-[90%] max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-[rgb(var(--color-text-strong))]">
                            <AppIcon name="sparkles" size="sm" tone="primary" /> {t.eidSunnahTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-[rgb(var(--color-text))] leading-relaxed font-medium">
                            {t.eidSunnahDesc}
                        </p>
                        <div className="bg-[rgb(var(--color-primary-dark))]/20 p-4 rounded-xl border border-[rgb(var(--color-primary))]/10">
                            <ul className="text-sm text-[rgb(var(--color-primary-light))] space-y-3">
                                <li className="flex items-start gap-2">
                                    <AppIcon name="heart-handshake" size="sm" tone="primary" className="mt-0.5" />
                                    <span>{t.eidSunnah1}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AppIcon name="hands" size="sm" tone="primary" className="mt-0.5" />
                                    <span>{t.eidSunnah2}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AppIcon name="sparkles" size="sm" tone="primary" className="mt-0.5" />
                                    <span>{t.eidSunnah3}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AppIcon name="lock" size="sm" tone="primary" className="mt-0.5" />
                                    <span>{t.eidSunnah4}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AppIcon name="moon" size="sm" tone="primary" className="mt-0.5" />
                                    <span>{t.eidSunnah5}</span>
                                </li>
                            </ul>
                        </div>
                        <Button 
                            onClick={() => setShowSunnah(false)} 
                            className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-strong))] text-[rgb(var(--color-primary-foreground))] shadow-md transition-all active:scale-95"
                        >
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
