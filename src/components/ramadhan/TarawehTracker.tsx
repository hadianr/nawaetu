"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { DALIL_TARAWEH, NIAT_TARAWEH, formatHijriKey } from "@/data/ramadhan-data";
import NiatCard from "./NiatCard";
import DalilBadge from "./DalilBadge";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useTranslations } from "@/context/LocaleContext";
import { addXP } from "@/lib/leveling";
import { toast } from "sonner";

type TarawehChoice = 8 | 20 | null;
type TarawehLog = Record<string, TarawehChoice>;

function getStreak(log: TarawehLog, currentKey: string): number {
    let streak = 0;
    const entries = Object.entries(log)
        .filter(([, v]) => v !== null)
        .sort(([a], [b]) => b.localeCompare(a));

    if (entries.length === 0) return 0;

    const todayLogged = log[currentKey] != null;
    if (!todayLogged && entries.length > 0) {
        streak = entries.length > 0 ? 1 : 0;
    }

    for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] !== null) {
            streak = i + 1;
        } else {
            break;
        }
    }
    return Math.min(streak, entries.length);
}

export default function TarawehTracker() {
    const { data } = usePrayerTimes();
    const t = useTranslations();
    const [log, setLog] = useState<TarawehLog>({});
    const [todayKey, setTodayKey] = useState("");

    useEffect(() => {
        const storage = getStorageService();
        const hijriYear = parseInt(data?.hijriDate?.split(" ").pop()?.replace("H", "") ?? "1447", 10);
        const hijriDay = data?.hijriDay ?? 1;
        const key = formatHijriKey(hijriYear, hijriDay);
        setTodayKey(key);

        const saved = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG as any);
        if (saved) {
            try {
                setLog(JSON.parse(saved));
            } catch {
                setLog({});
            }
        }
    }, [data?.hijriDate, data?.hijriDay]);

    const handleSelect = useCallback((choice: TarawehChoice) => {
        const storage = getStorageService();

        const currentChoice = log[todayKey];
        if (choice !== null && !currentChoice) {
            addXP(15);
            toast.success((t as any).tarawehTitle || "Taraweh", {
                description: (t as any).toastRamadhanTarawehReward || "Alhamdulillah! +15 Hasanah",
                duration: 3000,
                icon: "🕌"
            });
        }

        setLog((prev) => {
            const next = { ...prev, [todayKey]: choice };
            storage.set(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG as any, JSON.stringify(next));
            return next;
        });
    }, [todayKey, log, t]);

    const todayChoice = log[todayKey] ?? null;
    const streak = getStreak(log, todayKey);
    const totalNights = Object.values(log).filter((v) => v !== null).length;

    return (
        <div className="rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🕌</span>
                    <h3 className="font-bold text-white text-base">{t.tarawehTitle}</h3>
                </div>
                <DalilBadge dalil={DALIL_TARAWEH} variant="pill" />
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

            {/* Choice buttons */}
            <div className="grid grid-cols-3 gap-1.5 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4">
                {([8, 20, null] as TarawehChoice[]).map((choice) => {
                    const isSelected = todayChoice === choice;
                    const label = choice === null ? t.tarawehNotYet : choice === 8 ? t.taraweh8Rakaat : t.taraweh20Rakaat;
                    const icon = choice === null ? "😴" : choice === 8 ? "🌙" : "✨";
                    const activeStyle =
                        choice === null
                            ? "border-red-500/60 bg-gradient-to-br from-red-500/30 to-red-500/10 text-red-300 shadow-lg shadow-red-500/20"
                            : choice === 8
                                ? "border-blue-500/60 bg-gradient-to-br from-blue-500/30 to-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/20"
                                : "border-purple-500/60 bg-gradient-to-br from-purple-500/30 to-purple-500/10 text-purple-300 shadow-lg shadow-purple-500/20";

                    return (
                        <button
                            key={String(choice)}
                            onClick={() => handleSelect(choice)}
                            className={`
                rounded-xl border px-2 py-3 text-center transition-all duration-200 active:scale-95 backdrop-blur-sm
                ${isSelected
                                    ? activeStyle
                                    : "border-white/10 bg-black/20 text-white/40 hover:border-white/15 hover:text-white/60 hover:bg-black/30"
                                }
              `}
                        >
                            <span className="block text-xl mb-1">{icon}</span>
                            <span className="text-xs font-semibold">{label}</span>
                            {isSelected && <span className="block text-xs mt-0.5">✓</span>}
                        </button>
                    );
                })}
            </div>

            {/* Niat button */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <NiatCard niat={NIAT_TARAWEH} variant="pill" />
            </div>
        </div>
    );
}
