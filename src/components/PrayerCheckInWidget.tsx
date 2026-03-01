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

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Sparkles, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMissions } from "@/hooks/useMissions";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { addHasanah } from "@/lib/leveling";
import { updateStreak } from "@/lib/streak-utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import { DateUtils } from "@/lib/utils/date";
import type { Gender } from "@/data/missions";

// Prayer config: suffix for mission ID, icon, and the prayerTimes keys for time-awareness
const PRAYERS = [
    { suffix: "subuh", icon: "🌙", prayerKey: "Fajr", endKey: "Sunrise", i18n: "prayerFajr" },
    { suffix: "dzuhur", icon: "☀️", prayerKey: "Dhuhr", endKey: "Asr", i18n: "prayerDhuhr" },
    { suffix: "ashar", icon: "🌤️", prayerKey: "Asr", endKey: "Maghrib", i18n: "prayerAsr" },
    { suffix: "maghrib", icon: "🌅", prayerKey: "Maghrib", endKey: "Isha", i18n: "prayerMaghrib" },
    { suffix: "isya", icon: "🌃", prayerKey: "Isha", endKey: null, i18n: "prayerIsha" },
] as const;

const SUNNAH_PRAYERS = [
    { id: "sunnah_qobliyah_fajr", icon: "✨", prayerKey: "Fajr", endKey: "Fajr", isQobliyah: true, i18n: "mission_sunnah_qobliyah_fajr_title", hasanah: 30 },
    { id: "sunnah_dhuha", icon: "☀️", prayerKey: "Sunrise", endKey: "Dhuhr", i18n: "mission_sunnah_dhuha_title", hasanah: 50 },
    { id: "sunnah_qobliyah_dhuhr", icon: "☀️", prayerKey: "Dhuhr", endKey: "Dhuhr", isQobliyah: true, i18n: "mission_sunnah_qobliyah_dhuhr_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_dhuhr", icon: "☀️", prayerKey: "Dhuhr", endKey: "Asr", i18n: "mission_sunnah_ba_diyah_dhuhr_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_maghrib", icon: "🌅", prayerKey: "Maghrib", endKey: "Isha", i18n: "mission_sunnah_ba_diyah_maghrib_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_isha", icon: "🌃", prayerKey: "Isha", endKey: null, i18n: "mission_sunnah_ba_diyah_isha_title", hasanah: 25 },
    { id: "sunnah_witir", icon: "🌙", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_witir_title", hasanah: 40 },
    { id: "sunnah_tahajjud", icon: "🌙", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_tahajjud_title", hasanah: 50 },
    { id: "sunnah_istikharah", icon: "❓", prayerKey: null, endKey: null, i18n: "mission_sunnah_istikharah_title", hasanah: 30 },
    { id: "sunnah_hajat", icon: "🤲", prayerKey: null, endKey: null, i18n: "mission_sunnah_hajat_title", hasanah: 30 },
    { id: "sunnah_taubat", icon: "📿", prayerKey: null, endKey: null, i18n: "mission_sunnah_taubat_title", hasanah: 30 },
    // Seasonal
    { id: "sunnah_tarawih", icon: "🕌", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_tarawih_title", hasanah: 50, visibility: { hijriMonth: 'Ramadan' } },
    { id: "sunnah_eid_fitri", icon: "🌙", prayerKey: null, endKey: null, i18n: "mission_sunnah_eid_fitri_title", hasanah: 100, visibility: { hijriMonth: 'Shawwal', hijriDay: 1 } },
    { id: "sunnah_eid_adha", icon: "🕋", prayerKey: null, endKey: null, i18n: "mission_sunnah_eid_adha_title", hasanah: 100, visibility: { hijriMonth: 'Dhu al-Hijjah', hijriDay: 10 } },
    { id: "sunnah_gerhana", icon: "🌑", prayerKey: null, endKey: null, i18n: "mission_sunnah_gerhana_title", hasanah: 50 },
    { id: "sunnah_istisqa", icon: "🌧️", prayerKey: null, endKey: null, i18n: "mission_sunnah_istisqa_title", hasanah: 50 },
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
    const { completedMissions, completeMission, undoCompleteMission, isCompleted } = useMissions();
    const { data: prayerData } = usePrayerTimesContext();

    const [gender, setGender] = useState<Gender>(null);
    const [mounted, setMounted] = useState(false);
    const [sheet, setSheet] = useState<SheetState>(null);
    const [selectedDate, setSelectedDate] = useState<string>(DateUtils.today());
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [showSunnah, setShowSunnah] = useState(false);

    const todayStr = DateUtils.today();
    const isBackdated = selectedDate !== todayStr;
    const getHasanahReward = (baseHasanah: number) => isBackdated ? Math.floor(baseHasanah * 0.5) : baseHasanah;

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
                return DateUtils.toLocalDate(m.completedAt) === selectedDate;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [completedMissions, gender, selectedDate]
    );

    const completedCount = PRAYERS.filter((p) => isPrayerDone(p.suffix)).length;

    // Determine current/next active prayer window
    const getTimeStatus = (prayerKey: string | null, endKey: string | null) => {
        // Flexible/Special Prayers (Istikharah, Hajat, Taubat)
        if (!prayerKey) {
            return { isActive: true, isUpcoming: false, isLate: false, isFuture: false };
        }

        // If the user selected a past date, all prayers are open (late) but not "future" anymore
        const todayStr = DateUtils.today();
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

        // For Qobliyah: active before fardhu starts (up to 30 mins before) or during fardhu
        if ((arguments[0] as any).isQobliyah) {
            if (minsFromStart >= -30 && minsFromStart < 1) {
                return { isActive: true, isUpcoming: false, isLate: false, isFuture: false };
            }
        }

        if (minsFromStart < 0) {
            // Before this prayer time starts — it's a future prayer, lock it strictly
            const isUpcoming = minsFromStart > -30;
            const res = { isActive: false, isUpcoming, isLate: false, isFuture: true };
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

        // Isha: active if started, we cap at 4h (for Fardhu)
        // Witir: active from Isha until Fajr
        const isWitir = prayerKey === "Isha" && endKey === "Fajr";
        if (isWitir) {
            return { isActive: minsFromStart >= 0, isUpcoming: false, isLate: false, isFuture: false };
        }

        const isActive = minsFromStart >= 0 && minsFromStart < 240;
        return { isActive, isUpcoming: false, isLate: minsFromStart > 180 && isActive, isFuture: false };
    };

    const doComplete = (missionId: string, hasanahReward: number) => {
        const finalHasanah = getHasanahReward(hasanahReward);

        const completedTodayCount = completedMissions.filter(
            (m) => m.completedAt.split("T")[0] === selectedDate
        ).length;

        // Only trigger generic streak logic if it's really today's first activity
        if (completedTodayCount === 0 && !isBackdated) {
            updateStreak();
        }

        addHasanah(finalHasanah, selectedDate);
        window.dispatchEvent(new CustomEvent("hasanah_updated"));
        completeMission(missionId, finalHasanah, selectedDate);
        window.dispatchEvent(new CustomEvent("mission_storage_updated"));

        toast.success(t.homePrayerCheckInToastTitle || "Alhamdulillah! ✅", {
            description: (t.homePrayerCheckInToastDesc || "Sholat tercatat (+{hasanah} Hasanah)").replace("{hasanah}", String(finalHasanah)),
            duration: 2500,
            icon: "🎉",
        });
    };

    const handlePrayerTap = (prayer: typeof PRAYERS[number] | typeof SUNNAH_PRAYERS[number]) => {
        const isSunnah = 'id' in prayer;
        const missionId = isSunnah ? prayer.id : getMissionId(prayer.suffix);
        const doneRecord = completedMissions.find(m => m.id === missionId && m.completedAt.split("T")[0] === selectedDate);
        const done = !!doneRecord;

        if (done) {
            // Undo logic
            const hasanahToSubtract = doneRecord.hasanahEarned || 0;
            undoCompleteMission(missionId, selectedDate);
            addHasanah(-hasanahToSubtract, selectedDate);
            window.dispatchEvent(new CustomEvent("hasanah_updated"));
            window.dispatchEvent(new CustomEvent("mission_storage_updated"));

            toast.info(t.habitUndoTitle || "Habit dibatalkan", {
                description: t.habitUndoDesc || "Point Hasanah telah dikembalikan.",
                icon: "↩️",
            });
            return;
        }

        const status = getTimeStatus(prayer.prayerKey, prayer.endKey);

        if (status.isFuture) {
            const label = (t as any)[prayer.i18n] || prayer.i18n;
            toast.error(t.homePrayerCheckInNotYet.replace("{prayer}", label), {
                description: t.homePrayerCheckInWait,
                icon: "🔒",
            });
            return;
        }

        if (isSunnah) {
            // Sunnah points are smaller or fixed
            const hasanah = (prayer as any).hasanah || 25;
            doComplete(missionId, hasanah);
        } else if (gender !== "female") {
            setSheet({ prayer: prayer as typeof PRAYERS[number], missionId });
        } else {
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
                            {selectedDate === DateUtils.today()
                                ? t.homePrayerCheckInTitle
                                : t.homePrayerCheckInHistoryTitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Date Selector */}
                        <div
                            onClick={() => dateInputRef.current?.showPicker()}
                            className="relative shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group/date"
                        >
                            <Calendar className={cn("w-3 h-3 transition-colors pointer-events-none", isDaylight ? "text-slate-400 group-hover/date:text-slate-600" : "text-white/40 group-hover/date:text-white/70")} />
                            <span className={cn(
                                "text-[9px] font-bold uppercase transition-colors pointer-events-none",
                                isDaylight
                                    ? "text-slate-400 group-hover/date:text-slate-600"
                                    : "text-white/40 group-hover/date:text-white/70"
                            )}>
                                {new Date(selectedDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                max={DateUtils.today()}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
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
                                disabled={isLocked}
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
                                        +{getHasanahReward(gender !== "female" ? 75 : 25)} Hasanah
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

                {/* Sunnah Toggle & Section */}
                <div className="mt-4 pt-3 border-t border-dashed border-white/10 relative z-10">
                    <button
                        onClick={() => setShowSunnah(!showSunnah)}
                        className={cn(
                            "w-full flex items-center justify-between py-1 transition-colors group",
                            isDaylight ? "text-slate-500 hover:text-emerald-600" : "text-white/40 hover:text-[rgb(var(--color-primary-light))]"
                        )}
                    >
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {t.sunnah_prayer_section_title || "Sunnah Prayers"}
                            </span>
                        </div>
                        <div className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors",
                            isDaylight ? "bg-slate-100 group-hover:bg-emerald-50" : "bg-white/5 group-hover:bg-white/10"
                        )}>
                            {showSunnah ? "↑ Hide" : "↓ Show"}
                        </div>
                    </button>

                    {showSunnah && (
                        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-7 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Sunnah Prayers Section */}
                            {(() => {
                                const activeSunnah = SUNNAH_PRAYERS.filter(p => {
                                    if (!(p as any).visibility) return true;
                                    const vis = (p as any).visibility;
                                    const hMonth = prayerData?.hijriMonth;
                                    const hDay = prayerData?.hijriDay;
                                    if (vis.hijriMonth && vis.hijriMonth !== hMonth) return false;
                                    if (vis.hijriDay && vis.hijriDay !== hDay) return false;
                                    return true;
                                });

                                return activeSunnah.map((prayer) => {
                                    const done = completedMissions.some(m => m.id === prayer.id && m.completedAt.split("T")[0] === selectedDate);
                                    const { isActive, isUpcoming, isLate, isFuture } = getTimeStatus(prayer.prayerKey, prayer.endKey);
                                    const isLocked = isFuture && !done;

                                    return (
                                        <button
                                            key={prayer.id}
                                            onClick={() => handlePrayerTap(prayer)}
                                            disabled={isLocked}
                                            className={cn(
                                                "flex flex-col items-center gap-1 py-1.5 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                                done
                                                    ? isDaylight
                                                        ? "bg-emerald-50/50 border-emerald-100 opacity-80"
                                                        : "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 opacity-80"
                                                    : isLocked
                                                        ? isDaylight
                                                            ? "bg-slate-50/50 border-slate-50 opacity-30 grayscale"
                                                            : "bg-white/[0.01] border-white/[0.05] opacity-30 grayscale pointer-events-none"
                                                        : isActive
                                                            ? isDaylight
                                                                ? "bg-orange-50 border-orange-200 shadow-sm active:scale-95"
                                                                : "bg-amber-500/10 border-amber-500/20 shadow-sm active:scale-95"
                                                            : isDaylight
                                                                ? "bg-white border-slate-100 active:scale-95"
                                                                : "bg-white/[0.02] border-white/5 active:scale-95"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xl",
                                                done
                                                    ? isDaylight ? "bg-emerald-500 text-white" : "bg-[rgb(var(--color-primary))] text-white"
                                                    : isLate
                                                        ? isDaylight ? "bg-orange-100 text-orange-600" : "bg-amber-500/20 text-amber-400"
                                                        : isDaylight ? "bg-slate-100 text-slate-400" : "bg-white/5 text-white/40"
                                            )}>
                                                {done ? <Check className="w-3 h-3" /> : (isLate && !isLocked ? <AlertCircle className="w-3 h-3" /> : prayer.icon)}
                                            </div>
                                            <span className={cn(
                                                "text-[6.5px] font-black uppercase text-center px-1 leading-[1.1] min-h-[16px] flex items-center justify-center",
                                                done
                                                    ? isDaylight ? "text-emerald-700" : "text-[rgb(var(--color-primary-light))]"
                                                    : isLate
                                                        ? isDaylight ? "text-orange-700" : "text-amber-400/80"
                                                        : isDaylight ? "text-slate-400" : "text-white/40"
                                            )}>
                                                {(t as any)[prayer.i18n] || prayer.i18n.split("_").pop()}
                                            </span>

                                            {/* Sunnah XP Preview */}
                                            {!done && !isLocked && (isActive || isLate) && (
                                                <span className={cn(
                                                    "text-[6px] font-black leading-none mt-0.5",
                                                    isLate
                                                        ? isDaylight ? "text-orange-600" : "text-amber-400/60"
                                                        : isDaylight ? "text-emerald-600" : "text-[rgb(var(--color-primary-light))]/60"
                                                )}>
                                                    +{getHasanahReward((prayer as any).hasanah || 25)} Hasanah
                                                </span>
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
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
                                <span className={cn("text-[10px] font-black", isDaylight ? "text-slate-400" : "text-white/50")}>+{getHasanahReward(25)} Hasanah</span>
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
                                <span className={cn("text-[10px] font-black relative", isDaylight ? "text-emerald-100" : "text-white/80")}>+{getHasanahReward(75)} Hasanah</span>
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
