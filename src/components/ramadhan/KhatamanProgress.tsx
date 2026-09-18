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
import { QURAN_RECITATION_EVIDENCE, QURAN_RECITATION_INTENTION } from "@/data/ramadhan";
import IntentionCard from "./IntentionCard";
import DalilBadge from "./DalilBadge";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { Minus, Plus } from "lucide-react";
import { useTranslations, type TranslationTree } from "@/context/LocaleContext";
import { addHasanah } from "@/lib/habits/leveling";
import { toast } from "sonner";
import { AppIcon } from "@/components/ui/AppIcon";

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
        const saved = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG);
        if (saved) {
            try {
                queueMicrotask(() => setKhatamanData(JSON.parse(saved)));
            } catch {
                queueMicrotask(() => setKhatamanData(DEFAULT_LOG));
            }
        }
    }, []);

    const save = useCallback((updated: KhatamanLog) => {
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.RAMADHAN_KHATAMAN_LOG, JSON.stringify(updated));
        setKhatamanData(updated);
    }, []);

    const adjustJuz = (delta: number) => {
        const newJuz = Math.max(0, Math.min(30, khatamanData.currentJuz + delta));

        if (delta > 0 && newJuz > khatamanData.currentJuz) {
            const xpEarned = 20 * (newJuz - khatamanData.currentJuz);
            addHasanah(xpEarned);
            const translations = t as TranslationTree;
            toast.success(translations.khatamanTitle || "Tadarus", {
                description: `Masya Allah! +${xpEarned} ${translations.gamificationXpName || "Hasanah"}`,
                duration: 3000,
                icon: <AppIcon name="book" size="sm" tone="primary" />
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
        <div className="rounded-3xl border border-[rgb(var(--color-border))] bg-gradient-to-br from-[rgb(var(--color-surface-subtle))] via-[rgb(var(--color-surface))] to-transparent backdrop-blur-xl shadow-[var(--shadow-card)] overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <AppIcon name="book" size="sm" tone="primary" />
                    <h3 className="font-bold text-[rgb(var(--color-text-strong))] text-base">{t.khatamanTitle}</h3>
                </div>
                <DalilBadge dalil={QURAN_RECITATION_EVIDENCE} variant="pill" />
            </div>

            {/* Progress bar */}
            <div className="px-3 mb-2 sm:px-4 sm:mb-3">
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <span className="text-3xl font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{currentJuz}</span>
                        <span className="text-sm text-[rgb(var(--color-text-muted))] ml-1">{t.khatamanOf30Juz}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold" style={{ color: onTrack ? "rgb(var(--color-primary-light))" : "rgb(var(--color-warning))" }}>
                            {onTrack ? t.khatamanOnTrack : t.khatamanCatchUp}
                        </span>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{progressPct}% {t.khatamanCompleted}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-[rgb(var(--color-surface-subtle))] overflow-hidden shadow-inner backdrop-blur-sm">
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
                        <span key={n} className="text-xs text-[rgb(var(--color-text-muted))]">{n}</span>
                    ))}
                </div>
            </div>

            {/* Juz input */}
            <div className="flex items-center justify-center gap-3 px-3 pb-2 sm:gap-4 sm:px-4 sm:pb-3">
                <button
                    onClick={() => adjustJuz(-1)}
                    disabled={currentJuz <= 0}
                    className="rounded-full bg-[rgb(var(--color-surface-subtle))] border border-[rgb(var(--color-border))] p-2.5 text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-primary))]/40 disabled:opacity-30 transition-all active:scale-90 backdrop-blur-sm shadow-[var(--shadow-card)]"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                    <p className="text-xs text-[rgb(var(--color-text-muted))] mb-0.5">{t.khatamanCurrentJuz}</p>
                    <p className="text-xl font-bold text-[rgb(var(--color-text-strong))]">Juz {currentJuz}</p>
                </div>
                <button
                    onClick={() => adjustJuz(1)}
                    disabled={currentJuz >= 30}
                    className="rounded-full p-2.5 hover:opacity-80 disabled:opacity-30 transition-all active:scale-90 border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary))]/15 text-[rgb(var(--color-primary-light))] backdrop-blur-sm shadow-[var(--shadow-card)]"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {/* Estimate */}
            {estimatedFinishDay && estimatedFinishDay <= 30 && (
                <div className="mx-3 mb-2 rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/10 px-2 py-1.5 sm:mx-4 sm:mb-3 sm:px-3 sm:py-2 text-center backdrop-blur-md shadow-[var(--shadow-card)]">
                    <p className="text-xs text-[rgb(var(--color-primary-light))]">
                        {t.khatamanEstimateFinish.replace("{day}", String(estimatedFinishDay))}
                    </p>
                </div>
            )}
            {currentJuz >= 30 && (
                <div className="mx-3 mb-2 rounded-xl border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary))]/15 px-2 py-1.5 sm:mx-4 sm:mb-3 sm:px-3 sm:py-2 text-center backdrop-blur-md shadow-[var(--shadow-card)]">
                    <p className="text-sm font-bold text-[rgb(var(--color-primary-light))]">{t.khatamanAlhamdulillah}</p>
                </div>
            )}

            {/* Niat button */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <IntentionCard intention={QURAN_RECITATION_INTENTION} variant="pill" />
            </div>
        </div>
    );
}
