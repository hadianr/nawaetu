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

import { useState, useEffect, useCallback } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DALIL_TADARUS, NIAT_TADARUS } from "@/data/ramadhan";
import NiatCard from "./NiatCard";
import DalilBadge from "./DalilBadge";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "@/context/LocaleContext";
import { addXP } from "@/lib/leveling";
import { toast } from "sonner";

interface KhatamanLog {
    currentJuz: number;
    targetJuzPerDay: number;
    log: { date: string; juz: number }[];
}

const DEFAULT_LOG: KhatamanLog = {
    currentJuz: 0,
    targetJuzPerDay: 1,
    log: [],
};

export default function KhatamanProgress() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations();
    const [khatamanData, setKhatamanData] = useState<KhatamanLog>(DEFAULT_LOG);

    useEffect(() => {
        const storage = getStorageService();
        const saved = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG as any);
        if (saved) {
            try {
                setKhatamanData(JSON.parse(saved));
            } catch {
                setKhatamanData(DEFAULT_LOG);
            }
        }
    }, []);

    const save = useCallback((updated: KhatamanLog) => {
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG as any, JSON.stringify(updated));
        setKhatamanData(updated);
    }, []);

    const adjustJuz = (delta: number) => {
        const newJuz = Math.max(0, Math.min(30, khatamanData.currentJuz + delta));

        if (delta > 0 && newJuz > khatamanData.currentJuz) {
            const xpEarned = 20 * (newJuz - khatamanData.currentJuz);
            addXP(xpEarned);
            toast.success((t as any).khatamanTitle || "Tadarus", {
                description: `Masya Allah! +${xpEarned} ${(t as any).gamificationXpName || "Hasanah"}`,
                duration: 3000,
                icon: "📖"
            });
        }

        const today = new Date().toISOString().split("T")[0];
        const existingLogIndex = khatamanData.log.findIndex((e) => e.date === today);
        const newLog = [...khatamanData.log];
        if (existingLogIndex >= 0) {
            newLog[existingLogIndex] = { date: today, juz: newJuz };
        } else {
            newLog.push({ date: today, juz: newJuz });
        }
        save({ ...khatamanData, currentJuz: newJuz, log: newLog });
    };

    const { currentJuz, targetJuzPerDay } = khatamanData;
    const progressPct = Math.round((currentJuz / 30) * 100);
    const hijriDay = data?.hijriDay ?? 1;
    const remainingJuz = 30 - currentJuz;
    const remainingDays = 30 - hijriDay;
    const onTrack = remainingDays > 0 ? currentJuz >= hijriDay * targetJuzPerDay : currentJuz >= 30;
    const estimatedFinishDay = remainingJuz > 0 && remainingDays > 0
        ? Math.ceil(remainingJuz / targetJuzPerDay) + hijriDay
        : null;

    return (
        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📖</span>
                    <h3 className="font-bold text-white text-base">{t.khatamanTitle}</h3>
                </div>
                <DalilBadge dalil={DALIL_TADARUS} variant="pill" />
            </div>

            {/* Progress bar */}
            <div className="px-3 mb-2 sm:px-4 sm:mb-3">
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <span className="text-3xl font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{currentJuz}</span>
                        <span className="text-sm text-white/40 ml-1">{t.khatamanOf30Juz}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold" style={{ color: onTrack ? "rgb(var(--color-primary-light))" : "rgb(251 146 60)" }}>
                            {onTrack ? t.khatamanOnTrack : t.khatamanCatchUp}
                        </span>
                        <p className="text-xs text-white/40">{progressPct}% {t.khatamanCompleted}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden shadow-inner backdrop-blur-sm">
                    <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                            width: `${progressPct}%`,
                            background: `linear-gradient(to right, rgb(var(--color-primary-dark)), rgb(var(--color-primary-light)))`,
                            boxShadow: "0 0 20px rgba(var(--color-primary), 0.5)"
                        }}
                    />
                </div>

                {/* Juz markers */}
                <div className="flex justify-between mt-1">
                    {[0, 10, 20, 30].map((n) => (
                        <span key={n} className="text-xs text-white/40">{n}</span>
                    ))}
                </div>
            </div>

            {/* Juz input */}
            <div className="flex items-center justify-center gap-3 px-3 pb-2 sm:gap-4 sm:px-4 sm:pb-3">
                <button
                    onClick={() => adjustJuz(-1)}
                    disabled={currentJuz <= 0}
                    className="rounded-full bg-black/20 border border-white/10 p-2.5 text-white/40 hover:bg-black/30 hover:border-white/15 disabled:opacity-30 transition-all active:scale-90 backdrop-blur-sm shadow-md"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                    <p className="text-xs text-white/40 mb-0.5">{t.khatamanCurrentJuz}</p>
                    <p className="text-xl font-bold text-white">Juz {currentJuz}</p>
                </div>
                <button
                    onClick={() => adjustJuz(1)}
                    disabled={currentJuz >= 30}
                    className="rounded-full p-2.5 hover:opacity-80 disabled:opacity-30 transition-all active:scale-90 border border-white/10 backdrop-blur-sm shadow-md"
                    style={{
                        background: "rgba(var(--color-primary), 0.15)",
                        color: "rgb(var(--color-primary-light))",
                    }}
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Estimate */}
            {estimatedFinishDay && estimatedFinishDay <= 30 && (
                <div className="mx-3 mb-2 rounded-xl border px-2 py-1.5 sm:mx-4 sm:mb-3 sm:px-3 sm:py-2 text-center backdrop-blur-md shadow-md" style={{
                    background: "rgba(var(--color-primary), 0.1)",
                    borderColor: "rgba(var(--color-primary), 0.2)"
                }}>
                    <p className="text-xs" style={{ color: "rgb(var(--color-primary-light))" }}>
                        {t.khatamanEstimateFinish.replace("{day}", String(estimatedFinishDay))}
                    </p>
                </div>
            )}
            {currentJuz >= 30 && (
                <div className="mx-3 mb-2 rounded-xl border px-2 py-1.5 sm:mx-4 sm:mb-3 sm:px-3 sm:py-2 text-center backdrop-blur-md shadow-lg" style={{
                    background: "rgba(var(--color-primary), 0.15)",
                    borderColor: "rgba(var(--color-primary), 0.3)"
                }}>
                    <p className="text-sm font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{t.khatamanAlhamdulillah}</p>
                </div>
            )}

            {/* Niat button */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <NiatCard niat={NIAT_TADARUS} variant="pill" />
            </div>
        </div>
    );
}
