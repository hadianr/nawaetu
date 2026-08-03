"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Dynamic Hijri & Ramadan Calendar Modal (Bilingual EN/ID)
 */

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRamadhanCalendar, CalendarViewMode } from "@/hooks/useRamadhanCalendar";
import { Loader2, Calendar as CalendarIcon, MapPin, Moon } from "lucide-react";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/context/LocaleContext";
import { getRamadhanDay } from "@/data/ramadhan";

export default function RamadhanCalendar() {
    const {
        calendarData,
        loading,
        error,
        fetchCalendar,
        viewMode,
        setViewMode,
        activeHijriTitle
    } = useRamadhanCalendar();

    const { data: prayerData } = usePrayerTimesContext();
    const t = useTranslations();

    const onOpenChange = (open: boolean) => {
        if (open && calendarData.length === 0) {
            fetchCalendar("current_month");
        }
    };

    const handleModeChange = (mode: CalendarViewMode) => {
        setViewMode(mode);
        fetchCalendar(mode);
    };

    // Scroll to today logic
    useEffect(() => {
        if (calendarData.length > 0) {
            setTimeout(() => {
                const todayEl = document.getElementById("ramadhan-today");
                if (todayEl) {
                    todayEl.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
        }
    }, [calendarData]);

    return (
        <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{t.calendarViewMonth}</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg bg-black/60 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden gap-0 shadow-2xl">
                <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-white/5 relative">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-left flex items-center gap-2">
                            <span>{t.calendarTitle}</span>
                            {activeHijriTitle && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                                    {activeHijriTitle}
                                </span>
                            )}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{prayerData?.locationName || t.calendarYourLocation}</span>
                    </div>

                    {/* View Mode Toggle Tabs */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 mt-3">
                        <button
                            onClick={() => handleModeChange("current_month")}
                            className={cn(
                                "py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                viewMode === "current_month"
                                    ? "bg-white/15 text-white shadow-sm"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.calendarCurrentMonthTab || "Bulan Ini"}</span>
                        </button>
                        <button
                            onClick={() => handleModeChange("ramadan")}
                            className={cn(
                                "py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                viewMode === "ramadan"
                                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 shadow-sm"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <Moon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.calendarRamadhanTab || "Ramadhan"}</span>
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-[50vh] max-h-[70vh] relative bg-transparent">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--color-primary))" }} />
                            <p className="text-sm">{t.calendarLoading}</p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white/50">
                            <p className="text-sm text-red-400">{error}</p>
                            <button onClick={() => fetchCalendar(viewMode)} className="text-xs underline">{t.calendarRetry}</button>
                        </div>
                    ) : (
                        <ScrollArea className="h-full max-h-[60vh]">
                            <div className="min-w-full">
                                {/* Table Header */}
                                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 text-[10px] sm:text-xs font-bold text-white/70 sticky top-0 backdrop-blur-md z-10 border-b border-white/5">
                                    <div className="text-center">{viewMode === "ramadan" ? t.calendarHeaderRamadhan : (t.calendarHijriHeader || "Hijriah")}</div>
                                    <div className="text-center">{t.calendarHeaderDate}</div>
                                    <div className="text-center" style={{ color: "rgb(var(--color-primary-light))" }}>{t.calendarHeaderImsak}</div>
                                    <div className="text-center" style={{ color: "rgb(var(--color-primary-light))" }}>{t.calendarHeaderFajr}</div>
                                    <div className="text-center" style={{ color: "rgb(var(--color-primary-light))" }}>{t.calendarHeaderIftar}</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-white/5">
                                    {calendarData.map((day, idx) => {
                                        const ramadhanDay = getRamadhanDay(day.hijriDay);
                                        const progressiveOpacity = 0.5 + (ramadhanDay / 30) * 0.5;
                                        const bgOpacity = day.isToday ? (0.1 + (progressiveOpacity * 0.15)) : 0;
                                        const hoverBgOpacity = day.isToday ? (0.2 + (progressiveOpacity * 0.15)) : 0.05;

                                        return (
                                            <div
                                                key={idx}
                                                id={day.isToday ? "ramadhan-today" : undefined}
                                                className={cn(
                                                    "grid grid-cols-5 gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs transition-all duration-300",
                                                )}
                                                style={day.isToday ? {
                                                    backgroundColor: `rgba(var(--color-primary), ${bgOpacity})`,
                                                    boxShadow: `0 0 ${15 + ramadhanDay}px rgba(var(--color-primary-light), ${0.2 * progressiveOpacity})`,
                                                    borderLeft: `3px solid rgba(var(--color-primary-light), ${0.6 + progressiveOpacity * 0.4})`,
                                                } : undefined}
                                                onMouseEnter={(e) => {
                                                    if (day.isToday) {
                                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary), ${hoverBgOpacity})`;
                                                    } else {
                                                        e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, 0.05)`;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (day.isToday) {
                                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary), ${bgOpacity})`;
                                                    } else {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                <div
                                                    className={cn("text-center font-medium", day.isToday ? "font-bold" : "text-white/80")}
                                                    style={day.isToday ? {
                                                        color: "rgb(var(--color-primary-light))",
                                                        textShadow: `0 0 ${8 + ramadhanDay * 0.5}px rgba(var(--color-primary-light), ${0.5 * progressiveOpacity})`
                                                    } : undefined}
                                                >
                                                    {day.hijriDay}
                                                </div>
                                                <div
                                                    className="text-center text-white/50"
                                                    style={day.isToday ? {
                                                        color: `rgba(255, 255, 255, ${0.6 + progressiveOpacity * 0.2})`
                                                    } : undefined}
                                                >
                                                    {day.gregorianDate.split(" ").slice(0, 2).join(" ")}
                                                </div>
                                                <div className="text-center font-mono text-white/90 text-[11px] sm:text-xs">{day.timings.Imsak}</div>
                                                <div className="text-center font-mono text-white/90 text-[11px] sm:text-xs">{day.timings.Subuh}</div>
                                                <div className="text-center font-mono text-white/90 text-[11px] sm:text-xs">{day.timings.Maghrib}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {calendarData.length === 0 && !loading && (
                                    <div className="p-8 text-center text-white/30 text-sm">
                                        {t.calendarNoData}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
