"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Compact Taraweh Tracker using new DB-synced hook.
 */

import { useState, useMemo } from "react";
import { TARAWEH_EVIDENCE, TARAWEH_INTENTION } from "@/data/ramadhan";
import IntentionCard from "./IntentionCard";
import DalilBadge from "./DalilBadge";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTranslations } from "@/context/LocaleContext";
import { addHasanah } from "@/lib/habits/leveling";
import { toast } from "sonner";
import { MapPin, Home } from "lucide-react";
import { useTarawehTracker, type TarawehChoice, type TarawehLocation } from "@/hooks/useTarawehTracker";

function getStreak(log: Record<string, { choice: TarawehChoice, location: TarawehLocation, isQiyam: boolean }>, currentDay: number): number {
    let streak = 0;
    for (let i = currentDay; i >= 1; i--) {
        const entry = log[`1447-${i}`];
        if (entry && entry.choice !== null) {
            streak++;
        } else if (i < currentDay) {
            break; // Streak broken
        }
    }
    return streak;
}

export default function TarawehTracker() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations() as any;

    const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10);
    const currentHijriDay = data?.hijriDay ?? 1;

    const { log, updateDay } = useTarawehTracker(hijriYear);
    const [viewDay, setViewDay] = useState<number>(currentHijriDay);

    const isToday = viewDay === currentHijriDay;
    const isFuture = viewDay > currentHijriDay;
    const dayKey = `${hijriYear}-${viewDay}`;
    const todayData = log[dayKey] || { choice: null, location: null, isQiyam: false };
    const todayChoice = todayData.choice;
    const todayLocation = todayData.location;

    const streak = getStreak(log, currentHijriDay);
    const totalNights = Object.values(log).filter((v) => v && v.choice !== null).length;

    const handleSelect = (choice: TarawehChoice) => {
        if (isFuture) return;
        if (choice !== null && todayChoice === null) {
            addHasanah(15);
            toast.success(t.tarawehTitle || "Taraweh", {
                description: t.toastRamadhanTarawehReward || `Alhamdulillah! +15 ${t.gamificationXpName || "Hasanah"}`,
                duration: 3000,
                icon: "🕌"
            });
        }
        updateDay(viewDay, { choice });
    };

    const handleLocationSelect = (loc: TarawehLocation) => {
        if (isFuture || !todayChoice) return;
        updateDay(viewDay, { location: todayLocation === loc ? null : loc });
    };

    // Show current day and 4 previous days for compact history
    const historyDays = useMemo(() => {
        const days = [];
        for (let i = Math.max(1, currentHijriDay - 4); i <= currentHijriDay; i++) {
            days.push(i);
        }
        return days;
    }, [currentHijriDay]);

    return (
        <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🕌</span>
                    <h3 className="font-bold text-white text-base">{t.tarawehTitle}</h3>
                </div>
                <DalilBadge dalil={TARAWEH_EVIDENCE} variant="pill" />
            </div>

            {/* Stats row */}
            <div className="flex gap-1.5 px-3 mb-2 sm:gap-2 sm:px-4 sm:mb-3">
                <div className="flex-1 rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-center backdrop-blur-sm shadow-md">
                    <p className="text-lg font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{streak > 0 ? `🔥 ${streak}` : "—"}</p>
                    <p className="text-xs text-white/40">{t.tarawehStreakNights}</p>
                </div>
                <div className="flex-1 rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-center backdrop-blur-sm shadow-md">
                    <p className="text-lg font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{totalNights}</p>
                    <p className="text-xs text-white/40">{t.tarawehTotalNights}</p>
                </div>
            </div>

            {/* 30-Day Grid */}
            <div className="px-3 pb-2 sm:px-4 sm:pb-3">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-1">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                        const dKey = `${hijriYear}-${day}`;
                        const dData = log[dKey] || { choice: null, location: null, isQiyam: false };
                        const dChoice = dData.choice;
                        const active = day === viewDay;
                        const future = day > currentHijriDay;
                        
                        return (
                            <button
                                key={day}
                                onClick={() => setViewDay(day)}
                                className={`flex flex-col items-center justify-center rounded-lg h-9 sm:h-10 transition-all border
                                    ${active ? "bg-white/15 border-white/30 scale-105 shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "bg-white/5 border-white/10"} 
                                    ${future ? "opacity-30 mix-blend-luminosity" : "hover:bg-white/10 active:scale-95"}
                                `}
                            >
                                <span className="text-[10px] text-white/50 leading-none mb-1 font-bold">{day}</span>
                                <span className="text-[12px] leading-none text-white drop-shadow-md">
                                    {dChoice === 8 ? "🌙" : dChoice === 20 ? "✨" : "·"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Day Action Area */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-white/5 pt-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                        {isToday ? t.fastingDayToday : `Hari ke-${viewDay}`}
                    </span>
                    {isFuture && <span className="text-xs text-white/30">Belum Waktunya</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {([8, 20] as TarawehChoice[]).map((choice) => {
                        const isSelected = todayChoice === choice;
                        const label = choice === 8 ? t.taraweh8Rakaat || "8 Rakaat" : t.taraweh20Rakaat || "20 Rakaat";
                        const icon = choice === 8 ? "🌙" : "✨";
                        const activeStyle =
                            choice === 8
                                ? "border-blue-500/60 bg-gradient-to-br from-blue-500/30 to-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/20"
                                : "border-purple-500/60 bg-gradient-to-br from-purple-500/30 to-purple-500/10 text-purple-300 shadow-lg shadow-purple-500/20";

                        return (
                            <button
                                key={String(choice)}
                                disabled={isFuture}
                                onClick={() => handleSelect(todayChoice === choice ? null : choice)}
                                className={`
                                    relative flex flex-col items-center justify-center gap-1 rounded-xl py-3 border transition-all duration-300
                                    ${isSelected
                                        ? activeStyle
                                        : "bg-black/40 border-white/10 text-white/50 hover:bg-white/10"}
                                    ${isFuture ? "opacity-30 cursor-not-allowed" : "active:scale-95"}
                                `}
                            >
                                {/* Cancel affordance badge */}
                                {isSelected && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[8px] text-white/70 font-bold border border-white/10">
                                        ×
                                    </span>
                                )}
                                <span className={`text-xl ${isSelected ? "" : "opacity-60 grayscale"}`}>{icon}</span>
                                <span className="font-semibold text-xs">{label}</span>
                                {isSelected && (
                                    <span className="text-[8px] opacity-60 -mt-0.5">ketuk untuk batal</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Location Toggles */}
                {todayChoice !== null && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 animate-in slide-in-from-top-1 fade-in duration-200">
                        <button
                            onClick={() => handleLocationSelect("masjid")}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                                todayLocation === "masjid" 
                                ? "bg-[rgba(var(--color-primary),0.2)] border-[rgba(var(--color-primary-light),0.4)] text-[rgba(var(--color-primary-light),1)]" 
                                : "bg-black/30 border-white/5 text-white/40 hover:bg-white/5"
                            }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            Di Masjid
                        </button>
                        <button
                            onClick={() => handleLocationSelect("rumah")}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                                todayLocation === "rumah" 
                                ? "bg-white/15 border-white/30 text-white" 
                                : "bg-black/30 border-white/5 text-white/40 hover:bg-white/5"
                            }`}
                        >
                            <Home className="w-3.5 h-3.5" />
                            Di Rumah
                        </button>
                    </div>
                )}
            </div>

            {/* Niat button */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-white/5 pt-3">
                <IntentionCard intention={TARAWEH_INTENTION} variant="pill" />
            </div>
        </div>
    );
}
