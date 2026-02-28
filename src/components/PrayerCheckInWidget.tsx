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
import { Check, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMissions } from "@/hooks/useMissions";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { addXP } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import type { Gender } from "@/data/missions";

// Prayer config: suffix for mission ID, icon, and the prayerTimes keys for time-awareness
const PRAYERS = [
    { suffix: "subuh", icon: "🌙", prayerKey: "Fajr", endKey: "Sunrise", i18n: "prayerFajr" },
    { suffix: "dzuhur", icon: "☀️", prayerKey: "Dhuhr", endKey: "Asr", i18n: "prayerDhuhr" },
    { suffix: "ashar", icon: "🌤️", prayerKey: "Asr", endKey: "Maghrib", i18n: "prayerAsr" },
    { suffix: "maghrib", icon: "🌅", prayerKey: "Maghrib", endKey: "Isha", i18n: "prayerMaghrib" },
    { suffix: "isya", icon: "🌃", prayerKey: "Isha", endKey: null, i18n: "prayerIsha" },
] as const;

// Bottom-sheet state for male jamaah option
type SheetState = {
    prayer: typeof PRAYERS[number];
    missionId: string;
} | null;

export default function PrayerCheckInWidget() {
    const { data: session } = useSession();
    const { t, locale } = useLocale();
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";
    const { completedMissions, completeMission, isCompleted } = useMissions();
    const { data: prayerData } = usePrayerTimesContext();

    const [gender, setGender] = useState<Gender>(null);
    const [mounted, setMounted] = useState(false);
    const [sheet, setSheet] = useState<SheetState>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

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
            return completedMissions.some((m) => {
                if (m.id !== id) return false;
                return m.completedAt.split("T")[0] === selectedDate;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [completedMissions, gender, selectedDate]
    );

    const completedCount = PRAYERS.filter((p) => isPrayerDone(p.suffix)).length;

    // Determine current/next active prayer window
    const getTimeStatus = (prayerKey: string, endKey: string | null) => {
        // If the user selected a past date, all prayers are open (late) but not "future" anymore
        const todayStr = new Date().toISOString().split("T")[0];
        if (selectedDate < todayStr) {
            return { isActive: false, isUpcoming: false, isLate: true, isFuture: false };
        }

        // When prayer data not loaded yet, don't lock anything
        if (!prayerData?.prayerTimes) return { isActive: false, isUpcoming: false, isLate: false, isFuture: true };

        const now = new Date();
        const parseTime = (k: string) => {
            const rawStr = prayerData.prayerTimes[k];
            if (!rawStr) return null;
            // Aladhan API sometimes returns "18:11 (WIB)" — we only need "18:11"
            const str = rawStr.split(" ")[0];
            const [h, m] = str.split(":").map(Number);
            if (isNaN(h) || isNaN(m)) return null;

            const d = new Date();
            d.setHours(h, m, 0, 0);
            return isNaN(d.getTime()) ? null : d;
        };

        const start = parseTime(prayerKey);
        const end = endKey ? parseTime(endKey) : null;

        if (!start || isNaN(start.getTime())) return { isActive: false, isUpcoming: false, isLate: false, isFuture: false };

        const diffFromStart = now.getTime() - start.getTime();
        const minsFromStart = diffFromStart / 60000;

        if (minsFromStart < 0) {
            // Before this prayer time starts — it's a future prayer, lock it strictly
            const isUpcoming = minsFromStart > -30;
            const res = { isActive: false, isUpcoming, isLate: false, isFuture: true };
            // console.log(`[getTimeStatus] ${prayerKey}: minsFromStart=${minsFromStart.toFixed(1)}, res=`, res);
            return res;
        }

        if (end && !isNaN(end.getTime())) {
            const diffToEnd = end.getTime() - now.getTime();
            const minsToEnd = diffToEnd / 60000;
            if (minsToEnd <= 0) {
                // Window passed — still tappable (user may have forgotten to log)
                return { isActive: false, isUpcoming: false, isLate: true, isFuture: false };
            }
            return { isActive: true, isUpcoming: false, isLate: minsToEnd < 30, isFuture: false };
        }

        // Isha: active if started, we cap at 4h
        const isActive = minsFromStart >= 0 && minsFromStart < 240;
        return { isActive, isUpcoming: false, isLate: minsFromStart > 180 && isActive, isFuture: false };
    };

    const doComplete = (missionId: string, xpReward: number) => {
        const completedTodayCount = completedMissions.filter(
            (m) => m.completedAt.split("T")[0] === selectedDate
        ).length;

        const todayStr = new Date().toISOString().split("T")[0];
        // Only trigger generic streak logic if it's really today's first activity
        if (completedTodayCount === 0 && selectedDate === todayStr) {
            updateStreak();
        }

        addXP(xpReward);
        window.dispatchEvent(new CustomEvent("xp_updated"));
        completeMission(missionId, xpReward, selectedDate);
        window.dispatchEvent(new CustomEvent("mission_storage_updated"));

        toast.success(t.homePrayerCheckInToastTitle || "Alhamdulillah! ✅", {
            description: (t.homePrayerCheckInToastDesc || "Sholat tercatat (+{xp} XP)").replace("{xp}", String(xpReward)),
            duration: 2500,
            icon: "🎉",
        });
    };

    const handlePrayerTap = (prayer: typeof PRAYERS[number]) => {
        const missionId = getMissionId(prayer.suffix);
        if (isPrayerDone(prayer.suffix)) return; // Already done

        const status = getTimeStatus(prayer.prayerKey, prayer.endKey);
        // console.log(`[handlePrayerTap] ${prayer.label} tap:`, { status, time: new Date().toLocaleTimeString() });

        if (status.isFuture) {
            const label = (t as any)[prayer.i18n] || prayer.i18n;
            toast.error(t.homePrayerCheckInNotYet.replace("{prayer}", label), {
                description: t.homePrayerCheckInWait,
                icon: "🔒",
            });
            return; // Time hasn't arrived yet
        }

        if (gender !== "female") {
            // Show jamaah option sheet for male / unknown gender
            setSheet({ prayer, missionId });
        } else {
            // Female: 1-tap complete
            doComplete(missionId, 25);
        }
    };

    if (!mounted || !prayerData?.prayerTimes) {
        return (
            <div className={cn(
                "w-full h-[88px] animate-pulse rounded-2xl border",
                isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
            )} />
        );
    }

    return (
        <>
            <div className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-md px-4 py-3.5 transition-all",
                isDaylight
                    ? "bg-white border-slate-200 shadow-sm shadow-slate-200/50"
                    : "bg-black/20 border-white/10"
            )}>
                {/* Soft Glow */}
                <div className={cn(
                    "absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] pointer-events-none opacity-40",
                    isDaylight ? "bg-emerald-200" : "bg-[rgb(var(--color-primary))]/10"
                )} />

                {/* Header */}
                <div className="flex items-center justify-between mb-2 relative z-10 gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">🕌</span>
                        <p className={cn("text-[10px] font-black uppercase tracking-tight truncate", isDaylight ? "text-slate-800" : "text-white")}>
                            {selectedDate === new Date().toISOString().split("T")[0]
                                ? t.homePrayerCheckInTitle
                                : t.homePrayerCheckInHistoryTitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Date Selector */}
                        <div className="relative group/date">
                            <input
                                type="date"
                                value={selectedDate}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className={cn(
                                    "text-[9px] font-bold uppercase cursor-pointer outline-none bg-transparent appearance-none text-right px-0 relative z-10 w-[72px] h-5",
                                    isDaylight
                                        ? "text-slate-400 hover:text-slate-600"
                                        : "text-white/40 hover:text-white/70",
                                    "flex-row-reverse"
                                )}
                                style={{ colorScheme: isDaylight ? 'light' : 'dark' }}
                            />
                        </div>

                        <div className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold border transition-colors whitespace-nowrap",
                            completedCount === 5
                                ? isDaylight
                                    ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                                    : "bg-[rgb(var(--color-primary))]/20 border-[rgb(var(--color-primary))]/40 text-[rgb(var(--color-primary-light))]"
                                : isDaylight
                                    ? "bg-slate-50 border-slate-100 text-slate-400"
                                    : "bg-white/5 border-white/10 text-white/40"
                        )}>
                            {completedCount}/5
                        </div>
                    </div>
                </div>

                {/* Prayer Pills */}
                <div className="flex items-center gap-2 relative z-10">
                    {PRAYERS.map((prayer) => {
                        const done = isPrayerDone(prayer.suffix);
                        const { isActive, isUpcoming, isLate, isFuture } = getTimeStatus(prayer.prayerKey, prayer.endKey);
                        const isLocked = isFuture && !done;

                        return (
                            <button
                                key={prayer.suffix}
                                onClick={() => handlePrayerTap(prayer)}
                                disabled={done || isLocked}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                    done
                                        ? isDaylight
                                            ? "bg-emerald-50 border-emerald-100 cursor-default"
                                            : "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/30 cursor-default"
                                        : isLocked
                                            ? isDaylight
                                                ? "bg-slate-50 border-slate-100 cursor-not-allowed opacity-40"
                                                : "bg-white/[0.01] border-white/[0.05] cursor-not-allowed opacity-40 pointer-events-none"
                                            : isLate
                                                ? isDaylight
                                                    ? "bg-orange-50 border-orange-200 active:scale-95"
                                                    : "bg-amber-500/10 border-amber-500/30 active:scale-95"
                                                : isActive
                                                    ? isDaylight
                                                        ? "bg-emerald-50 border-emerald-200 shadow-sm active:scale-95"
                                                        : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[0_0_10px_rgba(var(--color-primary),0.15)] active:scale-95"
                                                    : isUpcoming
                                                        ? isDaylight
                                                            ? "bg-slate-50/50 border-slate-100 active:scale-95"
                                                            : "bg-white/[0.04] border-white/10 active:scale-95"
                                                        : isDaylight
                                                            ? "bg-white border-slate-50 active:scale-95"
                                                            : "bg-white/[0.02] border-white/5 active:scale-95"
                                )}
                            >
                                {/* Active pulse for current prayer */}
                                {isActive && !done && (
                                    <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/5 animate-pulse pointer-events-none" />
                                )}

                                {done ? (
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center",
                                        isDaylight ? "bg-emerald-500" : "bg-[rgb(var(--color-primary))]"
                                    )}>
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                ) : isLate ? (
                                    <AlertCircle className={cn("w-4 h-4", isDaylight ? "text-orange-500" : "text-amber-400")} />
                                ) : (
                                    <span className="text-[13px] leading-none">{prayer.icon}</span>
                                )}

                                <span className={cn(
                                    "text-[9px] font-bold leading-none transition-colors",
                                    done
                                        ? isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                                        : isLocked
                                            ? isDaylight ? "text-slate-300" : "text-white/25"
                                            : isActive
                                                ? isDaylight ? "text-slate-900" : "text-white"
                                                : isUpcoming
                                                    ? isDaylight ? "text-slate-500" : "text-white/70"
                                                    : isDaylight ? "text-slate-400" : "text-white/50"
                                )}>
                                    {(t as any)[prayer.i18n] || prayer.i18n}
                                </span>

                                {/* Status hint below label */}
                                {!done && !isLocked && (isActive || isLate) && (
                                    <span className={cn(
                                        "text-[7px] font-black leading-none",
                                        isLate
                                            ? isDaylight ? "text-orange-600" : "text-amber-400/70"
                                            : isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]/60"
                                    )}>
                                        +{gender !== "female" ? "75" : "25"} XP
                                    </span>
                                )}
                                {!done && isUpcoming && !isLocked && (
                                    <span className="text-[7px] font-medium leading-none text-white/30">
                                        {t.homePrayerCheckInUpcoming}
                                    </span>
                                )}
                                {isLocked && (
                                    <span className="text-[7px] font-medium leading-none text-white/20">
                                        🔒
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Completeness Banner */}
                {completedCount === 5 && (
                    <div className={cn(
                        "mt-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border relative z-10 transition-colors",
                        isDaylight
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                    )}>
                        <Sparkles className={cn("w-3 h-3", isDaylight ? "text-emerald-500" : "text-[rgb(var(--color-primary-light)) ]")} />
                        <p className={cn("text-[10px] font-black", isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light)) ] text-center")}>
                            {t.homePrayerCheckInDone}
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
                        className={cn(
                            "relative w-full max-w-md border rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-10",
                            isDaylight ? "bg-white border-slate-200" : "bg-[rgb(var(--color-background))] border-white/10"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className={cn("w-10 h-1 rounded-full mx-auto mb-5", isDaylight ? "bg-slate-200" : "bg-white/20")} />

                        <div className="flex items-center gap-3 mb-5">
                            <div className={cn(
                                "w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-colors",
                                isDaylight ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
                            )}>
                                {sheet.prayer.icon}
                            </div>
                            <div>
                                <p className={cn("text-sm font-black", isDaylight ? "text-slate-900" : "text-white")}>
                                    {t.homePrayerCheckInSheetTitle.replace("{prayer}", (t as any)[sheet.prayer.i18n] || sheet.prayer.i18n)}
                                </p>
                                <p className={cn("text-[10px] font-medium", isDaylight ? "text-slate-400" : "text-white/50")}>{t.homePrayerCheckInSheetSubtitle}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Sendiri */}
                            <button
                                onClick={() => {
                                    doComplete(sheet.missionId, 25);
                                    setSheet(null);
                                }}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all border group",
                                    isDaylight
                                        ? "bg-slate-50 border-slate-100 hover:bg-slate-100"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <span className="text-2xl group-active:scale-110 transition-transform">🏠</span>
                                <span className={cn("text-xs font-black uppercase tracking-wide", isDaylight ? "text-slate-800" : "text-white")}>{t.homePrayerCheckInOptionSolo}</span>
                                <span className={cn("text-[10px] font-black", isDaylight ? "text-slate-400" : "text-white/50")}>+25 XP</span>
                            </button>

                            {/* Berjamaah */}
                            <button
                                onClick={() => {
                                    doComplete(sheet.missionId, 75);
                                    setSheet(null);
                                }}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all border relative overflow-hidden group shadow-lg",
                                    isDaylight
                                        ? "bg-emerald-600 border-emerald-500 shadow-emerald-200/50 hover:bg-emerald-500"
                                        : "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary-light))]/20 shadow-[rgb(var(--color-primary))]/20 hover:brightness-110"
                                )}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                <span className="text-2xl relative group-active:scale-110 transition-transform">🕌</span>
                                <span className="text-xs font-black uppercase tracking-wide text-white relative">{t.homePrayerCheckInOptionJamaah}</span>
                                <span className={cn("text-[10px] font-black relative", isDaylight ? "text-emerald-100" : "text-white/80")}>+75 XP</span>
                            </button>
                        </div>

                        <div className={cn(
                            "mt-4 mb-6 p-4 rounded-xl border relative",
                            isDaylight ? "bg-emerald-50/50 border-emerald-100/50" : "bg-white/[0.03] border-white/5"
                        )}>
                            <p className={cn(
                                "text-[10px] text-center italic leading-relaxed font-bold",
                                isDaylight ? "text-emerald-800" : "text-white/60"
                            )}>
                                {t.homePrayerCheckInQuote}
                            </p>
                        </div>

                        <button
                            onClick={() => setSheet(null)}
                            className={cn(
                                "w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                isDaylight
                                    ? "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {(t as any).buttonCancel || "Batal"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
