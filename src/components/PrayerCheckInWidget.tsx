"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMissions } from "@/hooks/useMissions";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import type { Gender } from "@/data/missions-data";

// Prayer config: id, label, icon, and the prayerTimes key for time-awareness
const PRAYERS = [
    { suffix: "subuh", label: "Subuh", icon: "🌙", prayerKey: "Fajr", endKey: "Sunrise" },
    { suffix: "dzuhur", label: "Dzuhur", icon: "☀️", prayerKey: "Dhuhr", endKey: "Asr" },
    { suffix: "ashar", label: "Ashar", icon: "🌤️", prayerKey: "Asr", endKey: "Maghrib" },
    { suffix: "maghrib", label: "Maghrib", icon: "🌅", prayerKey: "Maghrib", endKey: "Isha" },
    { suffix: "isya", label: "Isya", icon: "🌃", prayerKey: "Isha", endKey: null },
] as const;

// Bottom-sheet state for male jamaah option
type SheetState = {
    prayer: typeof PRAYERS[number];
    missionId: string;
} | null;

export default function PrayerCheckInWidget() {
    const { data: session } = useSession();
    const { t } = useLocale();
    const { completedMissions, completeMission, isCompleted } = useMissions();
    const { data: prayerData } = usePrayerTimes();

    const [gender, setGender] = useState<Gender>(null);
    const [mounted, setMounted] = useState(false);
    const [sheet, setSheet] = useState<SheetState>(null);

    useEffect(() => {
        setMounted(true);
        const storage = getStorageService();
        const savedGender = (session?.user?.gender || storage.getOptional(STORAGE_KEYS.USER_GENDER)) as Gender;
        setGender(savedGender);
    }, [session]);

    // Refresh gender when profile updates
    useEffect(() => {
        const storage = getStorageService();
        const handleUpdate = () => {
            const savedGender = (session?.user?.gender || storage.getOptional(STORAGE_KEYS.USER_GENDER)) as Gender;
            setGender(savedGender);
        };
        window.addEventListener("profile_updated", handleUpdate);
        window.addEventListener("storage", handleUpdate);
        return () => {
            window.removeEventListener("profile_updated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, [session]);

    const getMissionId = (suffix: string) =>
        gender === "female" ? `sholat_${suffix}_female` : `sholat_${suffix}_male`;

    const isPrayerDone = useCallback(
        (suffix: string) => {
            const id = getMissionId(suffix);
            const todayStr = new Date().toISOString().split("T")[0];
            return completedMissions.some((m) => {
                if (m.id !== id) return false;
                return m.completedAt.split("T")[0] === todayStr;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [completedMissions, gender]
    );

    const completedCount = PRAYERS.filter((p) => isPrayerDone(p.suffix)).length;

    // Determine current/next active prayer window
    const getTimeStatus = (prayerKey: string, endKey: string | null) => {
        if (!prayerData?.prayerTimes) return { isActive: false, isUpcoming: false, isLate: false };

        const now = new Date();
        const parseTime = (k: string) => {
            const str = prayerData.prayerTimes[k];
            if (!str) return null;
            const [h, m] = str.split(":").map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d;
        };

        const start = parseTime(prayerKey);
        const end = endKey ? parseTime(endKey) : null;

        if (!start) return { isActive: false, isUpcoming: false, isLate: false };

        const diffFromStart = now.getTime() - start.getTime();
        const minsFromStart = diffFromStart / 60000;

        if (minsFromStart < 0) {
            // Before this prayer time — upcoming if < 30 mins away
            return { isActive: false, isUpcoming: minsFromStart > -30, isLate: false };
        }

        if (end) {
            const diffToEnd = end.getTime() - now.getTime();
            const minsToEnd = diffToEnd / 60000;
            if (minsToEnd <= 0) {
                return { isActive: false, isUpcoming: false, isLate: true }; // Window passed
            }
            return { isActive: true, isUpcoming: false, isLate: minsToEnd < 30 };
        }

        // Isha: active if started, we cap at 4h
        const isActive = minsFromStart >= 0 && minsFromStart < 240;
        return { isActive, isUpcoming: false, isLate: minsFromStart > 180 && isActive };
    };

    const doComplete = (missionId: string, xpReward: number) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const completedTodayCount = completedMissions.filter(
            (m) => m.completedAt.split("T")[0] === todayStr
        ).length;
        if (completedTodayCount === 0) updateStreak();

        addXP(xpReward);
        window.dispatchEvent(new CustomEvent("xp_updated"));
        completeMission(missionId, xpReward);
        window.dispatchEvent(new CustomEvent("mission_storage_updated"));

        toast.success("Alhamdulillah! ✅", {
            description: `Sholat tercatat (+${xpReward} XP)`,
            duration: 2500,
            icon: "🎉",
        });
    };

    const handlePrayerTap = (prayer: typeof PRAYERS[number]) => {
        const missionId = getMissionId(prayer.suffix);
        if (isPrayerDone(prayer.suffix)) return; // Already done

        if (gender !== "female") {
            // Show jamaah option sheet for male / unknown gender
            setSheet({ prayer, missionId });
        } else {
            // Female: 1-tap complete
            doComplete(missionId, 25);
        }
    };

    if (!mounted) {
        return (
            <div className="w-full h-[88px] bg-white/5 border border-white/10 animate-pulse rounded-2xl" />
        );
    }

    return (
        <>
            <div className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-md px-4 py-3.5 transition-all",
                "bg-black/20 border-white/10"
            )}>
                {/* Soft Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgb(var(--color-primary))]/10 rounded-full blur-[50px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🕌</span>
                        <p className="text-xs font-bold text-white">Sholat Hari Ini</p>
                    </div>
                    <div className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold border",
                        completedCount === 5
                            ? "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-primary-light))]"
                            : "bg-white/5 border-white/10 text-white/60"
                    )}>
                        {completedCount}/5 Terlaksana
                    </div>
                </div>

                {/* Prayer Pills */}
                <div className="flex items-center gap-2 relative z-10">
                    {PRAYERS.map((prayer) => {
                        const done = isPrayerDone(prayer.suffix);
                        const { isActive, isUpcoming, isLate } = getTimeStatus(prayer.prayerKey, prayer.endKey);

                        return (
                            <button
                                key={prayer.suffix}
                                onClick={() => handlePrayerTap(prayer)}
                                disabled={done}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                    done
                                        ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/30 cursor-default"
                                        : isLate && isActive
                                            ? "bg-amber-500/10 border-amber-500/30 active:scale-95"
                                            : isActive
                                                ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[0_0_10px_rgba(var(--color-primary),0.15)] active:scale-95"
                                                : isUpcoming
                                                    ? "bg-white/[0.04] border-white/10 active:scale-95"
                                                    : "bg-white/[0.02] border-white/5 active:scale-95"
                                )}
                            >
                                {/* Active pulse for current prayer */}
                                {isActive && !done && (
                                    <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/5 animate-pulse pointer-events-none" />
                                )}

                                {done ? (
                                    <div className="w-5 h-5 rounded-full bg-[rgb(var(--color-primary))] flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                ) : isLate && isActive ? (
                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                ) : (
                                    <span className="text-sm leading-none">{prayer.icon}</span>
                                )}

                                <span className={cn(
                                    "text-[9px] font-semibold leading-none",
                                    done
                                        ? "text-[rgb(var(--color-primary-light))]"
                                        : isActive
                                            ? isLate ? "text-amber-300" : "text-white"
                                            : "text-white/50"
                                )}>
                                    {prayer.label}
                                </span>

                                {/* XP hint on active undone prayer */}
                                {!done && isActive && (
                                    <span className={cn(
                                        "text-[7px] font-bold leading-none",
                                        isLate ? "text-amber-400/70" : "text-[rgb(var(--color-primary-light))]/60"
                                    )}>
                                        +{gender !== "female" ? "75" : "25"} XP
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Completeness Banner */}
                {completedCount === 5 && (
                    <div className="mt-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20 relative z-10">
                        <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary-light))]" />
                        <p className="text-[10px] font-bold text-[rgb(var(--color-primary-light))]">
                            Semua sholat hari ini terlaksana! Masya Allah 🎉
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Sheet: Jamaah or Sendiri (for male/unknown) */}
            {sheet && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onClick={() => setSheet(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <div
                        className="relative w-full max-w-md bg-[rgb(var(--color-background))] border border-white/10 rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                                {sheet.prayer.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Sholat {sheet.prayer.label}</p>
                                <p className="text-[10px] text-white/50">Bagaimana kamu sholat?</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Sendiri */}
                            <button
                                onClick={() => {
                                    doComplete(sheet.missionId, 25);
                                    setSheet(null);
                                }}
                                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <span className="text-2xl">🏠</span>
                                <span className="text-xs font-semibold text-white">Sholat Sendiri</span>
                                <span className="text-[10px] text-white/50 font-semibold">+25 XP</span>
                            </button>

                            {/* Berjamaah */}
                            <button
                                onClick={() => {
                                    doComplete(sheet.missionId, 75);
                                    setSheet(null);
                                }}
                                className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary-light))]/20 hover:brightness-110 active:scale-95 transition-all relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                <span className="text-2xl relative">🕌</span>
                                <span className="text-xs font-semibold text-white relative">Berjamaah di Masjid</span>
                                <span className="text-[10px] text-white/80 font-bold relative">+75 XP</span>
                            </button>
                        </div>

                        <p className="text-[9px] text-white/30 text-center mt-4 italic">
                            "Sholat berjamaah lebih utama 27 derajat" — HR. Bukhari & Muslim
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
