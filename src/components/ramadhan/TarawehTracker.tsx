"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Compact Taraweh Tracker using new DB-synced hook.
 */

import { useState } from "react";
import { TARAWEH_EVIDENCE, TARAWEH_INTENTION } from "@/data/ramadhan";
import IntentionCard from "./IntentionCard";
import DalilBadge from "./DalilBadge";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTranslations } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { addHasanah } from "@/lib/habits/leveling";
import { toast } from "sonner";
import { MapPin, Home, X } from "lucide-react";
import { useTarawehTracker, type TarawehChoice, type TarawehLocation } from "@/hooks/useTarawehTracker";
import { AppIcon } from "@/components/ui/AppIcon";

type TarawehTranslations = TranslationTree & Partial<Record<"fastingDayToday", string>>;

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
    const t = useTranslations() as TarawehTranslations;

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
                icon: <AppIcon name="landmark" size="sm" tone="primary" />
            });
        }
        updateDay(viewDay, { choice });
    };

    const handleLocationSelect = (loc: TarawehLocation) => {
        if (isFuture || !todayChoice) return;
        updateDay(viewDay, { location: todayLocation === loc ? null : loc });
    };

    return (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] backdrop-blur-md shadow-[var(--shadow-card)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <AppIcon name="landmark" size="sm" tone="primary" />
                    <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-base">{t.tarawehTitle}</h3>
                </div>
                <DalilBadge dalil={TARAWEH_EVIDENCE} variant="pill" />
            </div>

            {/* Stats row */}
            <div className="flex gap-1.5 px-3 mb-2 sm:gap-2 sm:px-4 sm:mb-3">
                <div className="flex-1 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] px-3 py-2 text-center backdrop-blur-sm shadow-[var(--shadow-card)]">
                    <p className="text-lg font-bold text-[rgb(var(--color-primary-light))] flex items-center justify-center gap-1">{streak > 0 && <AppIcon name="sparkles" size="sm" tone="primary" />}{streak || "—"}</p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.tarawehStreakNights}</p>
                </div>
                <div className="flex-1 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] px-3 py-2 text-center backdrop-blur-sm shadow-[var(--shadow-card)]">
                    <p className="text-lg font-bold text-[rgb(var(--color-primary-light))]">{totalNights}</p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.tarawehTotalNights}</p>
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
                                    ${active ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/40 scale-105 shadow-[var(--shadow-card)]" : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"}
                                    ${future ? "opacity-30 mix-blend-luminosity" : "hover:bg-[rgb(var(--color-surface-subtle))] active:scale-95"}
                                `}
                            >
                                <span className="text-[10px] text-[rgb(var(--color-text-muted))] leading-none mb-1 font-bold">{day}</span>
                                <AppIcon name={dChoice === 8 ? "moon" : "sparkles"} size="xs" tone={dChoice ? "primary" : "muted"} className={!dChoice ? "opacity-0" : undefined} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Day Action Area */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-[rgb(var(--color-border))] pt-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[rgb(var(--color-text-muted))] uppercase tracking-widest">
                        {isToday ? t.fastingDayToday : `Hari ke-${viewDay}`}
                    </span>
                    {isFuture && <span className="text-xs text-[rgb(var(--color-text-muted))]">Belum Waktunya</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {([8, 20] as TarawehChoice[]).map((choice) => {
                        const isSelected = todayChoice === choice;
                        const label = choice === 8 ? t.taraweh8Rakaat || "8 Rakaat" : t.taraweh20Rakaat || "20 Rakaat";
                        const activeStyle =
                            choice === 8
                                ? "border-[rgb(var(--color-info))]/60 bg-[rgb(var(--color-info))]/15 text-[rgb(var(--color-info))] shadow-[var(--shadow-card)]"
                                : "border-[rgb(var(--color-primary))]/60 bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))] shadow-[var(--shadow-card)]";

                        return (
                            <button
                                key={String(choice)}
                                disabled={isFuture}
                                onClick={() => handleSelect(todayChoice === choice ? null : choice)}
                                className={`
                                    relative flex flex-col items-center justify-center gap-1 rounded-xl py-3 border transition-all duration-300
                                    ${isSelected
                                        ? activeStyle
                                        : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"}
                                    ${isFuture ? "opacity-30 cursor-not-allowed" : "active:scale-95"}
                                `}
                            >
                                {/* Cancel affordance badge */}
                                {isSelected && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--color-surface-subtle))] text-[8px] text-[rgb(var(--color-text-muted))] font-bold border border-[rgb(var(--color-border))]">
                                        <X className="h-2.5 w-2.5" />
                                    </span>
                                )}
                                <AppIcon name={choice === 8 ? "moon" : "sparkles"} size="md" tone={isSelected ? "primary" : "muted"} />
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
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[rgb(var(--color-border))] animate-in slide-in-from-top-1 fade-in duration-200">
                        <button
                            onClick={() => handleLocationSelect("masjid")}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                                todayLocation === "masjid" 
                                ? "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary-light))]/40 text-[rgb(var(--color-primary-light))]"
                                : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"
                            }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            Di Masjid
                        </button>
                        <button
                            onClick={() => handleLocationSelect("rumah")}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                                todayLocation === "rumah" 
                                ? "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-strong))]"
                                : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface-subtle))]"
                            }`}
                        >
                            <Home className="w-3.5 h-3.5" />
                            Di Rumah
                        </button>
                    </div>
                )}
            </div>

            {/* Niat button */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-[rgb(var(--color-border))] pt-3">
                <IntentionCard intention={TARAWEH_INTENTION} variant="pill" />
            </div>
        </div>
    );
}
