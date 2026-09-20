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

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { Check, Sparkles, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMissions } from "@/hooks/useMissions";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { addHasanah } from "@/lib/habits/leveling";
import { updateStreak } from "@/lib/habits/streak-utils";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toast } from "sonner";
import { calculateHasanahReward } from "@/lib/utils/hasanah";
import { useLocale } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";
import { useDataSync } from "@/hooks/useDataSync";
import { APP_EVENTS } from "@/lib/constants/events";
import { getPrayerMissionId, normalizeMissionId } from "@/lib/mission-resolver";
import { DateUtils } from "@/lib/utils/date";
import type { Gender } from "@/data/missions";
import type { TranslationTree } from "@/context/LocaleContext";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/lib/icon-names";

// Prayer config: suffix for mission ID, icon, and the prayerTimes keys for time-awareness
const PRAYERS: { suffix: string; icon: AppIconName; prayerKey: string; endKey: string | null; i18n: string }[] = [
    { suffix: "subuh", icon: "moon", prayerKey: "Fajr", endKey: "Sunrise", i18n: "prayerFajr" },
    { suffix: "dzuhur", icon: "sun", prayerKey: "Dhuhr", endKey: "Asr", i18n: "prayerDhuhr" },
    { suffix: "ashar", icon: "cloud-sun", prayerKey: "Asr", endKey: "Maghrib", i18n: "prayerAsr" },
    { suffix: "maghrib", icon: "sun", prayerKey: "Maghrib", endKey: "Isha", i18n: "prayerMaghrib" },
    { suffix: "isya", icon: "moon", prayerKey: "Isha", endKey: null, i18n: "prayerIsha" },
] as const;

const SUNNAH_PRAYERS = [
    { id: "sunnah_qobliyah_fajr", icon: "sparkles", prayerKey: "Fajr", endKey: "Fajr", isQobliyah: true, i18n: "mission_sunnah_qobliyah_fajr_title", hasanah: 30 },
    { id: "sunnah_dhuha", icon: "sun", prayerKey: "Sunrise", endKey: "Dhuhr", i18n: "mission_sunnah_dhuha_title", hasanah: 50 },
    { id: "sunnah_qobliyah_dhuhr", icon: "sun", prayerKey: "Dhuhr", endKey: "Dhuhr", isQobliyah: true, i18n: "mission_sunnah_qobliyah_dhuhr_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_dhuhr", icon: "sun", prayerKey: "Dhuhr", endKey: "Asr", i18n: "mission_sunnah_ba_diyah_dhuhr_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_maghrib", icon: "sun", prayerKey: "Maghrib", endKey: "Isha", i18n: "mission_sunnah_ba_diyah_maghrib_title", hasanah: 25 },
    { id: "sunnah_ba_diyah_isha", icon: "moon", prayerKey: "Isha", endKey: null, i18n: "mission_sunnah_ba_diyah_isha_title", hasanah: 25 },
    { id: "sunnah_witir", icon: "moon", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_witir_title", hasanah: 40 },
    { id: "sunnah_tahajjud", icon: "moon", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_tahajjud_title", hasanah: 50 },
    { id: "sunnah_istikharah", icon: "help", prayerKey: null, endKey: null, i18n: "mission_sunnah_istikharah_title", hasanah: 30 },
    { id: "sunnah_hajat", icon: "hands", prayerKey: null, endKey: null, i18n: "mission_sunnah_hajat_title", hasanah: 30 },
    { id: "sunnah_taubat", icon: "hands", prayerKey: null, endKey: null, i18n: "mission_sunnah_taubat_title", hasanah: 30 },
    // Seasonal
    { id: "sunnah_tarawih", icon: "landmark", prayerKey: "Isha", endKey: "Fajr", i18n: "mission_sunnah_tarawih_title", hasanah: 50, visibility: { hijriMonth: 'Ramadan' } },
    { id: "sunnah_eid_fitri", icon: "moon", prayerKey: null, endKey: null, i18n: "mission_sunnah_eid_fitri_title", hasanah: 100, visibility: { hijriMonth: 'Shawwal', hijriDay: 1 } },
    { id: "sunnah_eid_adha", icon: "kaaba", prayerKey: null, endKey: null, i18n: "mission_sunnah_eid_adha_title", hasanah: 100, visibility: { hijriMonth: 'Dhu al-Hijjah', hijriDay: 10 } },
    { id: "sunnah_gerhana", icon: "moon", prayerKey: null, endKey: null, i18n: "mission_sunnah_gerhana_title", hasanah: 50 },
    { id: "sunnah_istisqa", icon: "cloud-sun", prayerKey: null, endKey: null, i18n: "mission_sunnah_istisqa_title", hasanah: 50 },
] as const;

// Bottom-sheet state for male jamaah option
type SheetState = {
    prayer: typeof PRAYERS[number];
    missionId: string;
} | null;

export default function PrayerCheckInWidget() {
    const { data: session } = useSession();
    const { syncData } = useDataSync();
    const { t, locale } = useLocale();
    const { completedMissions, completeMission, undoCompleteMission } = useMissions();
    const { data: prayerData, loading: prayerDataLoading } = usePrayerTimesContext();

    const [gender, setGender] = useState<Gender>(null);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );
    const [sheet, setSheet] = useState<SheetState>(null);
    const [selectedDate, setSelectedDate] = useState<string>(DateUtils.today());
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [showSunnah, setShowSunnah] = useState(false);
    const todayStr = DateUtils.today();
    const isBackdated = selectedDate !== todayStr;
    const getHasanahReward = (baseHasanah: number) => calculateHasanahReward(baseHasanah, isBackdated);
    const getTranslation = (key: string, fallback = key) => {
        const value = (t as TranslationTree)[key as keyof TranslationTree];
        return typeof value === "string" ? value : fallback;
    };

    useEffect(() => {
        const storage = getStorageService();
        const savedGender = (storage.getOptional(STORAGE_KEYS.USER_GENDER) || session?.user?.gender) as Gender;
        queueMicrotask(() => setGender(savedGender));
    }, [session]);

    // Refresh gender when profile updates
    useEffect(() => {
        const storage = getStorageService();
        const handleUpdate = () => {
            const savedGender = (storage.getOptional(STORAGE_KEYS.USER_GENDER) || session?.user?.gender) as Gender;
            setGender(savedGender);
        };
        window.addEventListener(APP_EVENTS.PROFILE_UPDATED, handleUpdate);
        window.addEventListener(APP_EVENTS.STORAGE_UPDATED, handleUpdate);
        return () => {
            window.removeEventListener(APP_EVENTS.PROFILE_UPDATED, handleUpdate);
            window.removeEventListener(APP_EVENTS.STORAGE_UPDATED, handleUpdate);
        };
    }, [session]);

    const isFridaySelected = new Date(selectedDate).getDay() === 5;

    const getMissionId = (suffix: string) => {
        return getPrayerMissionId(suffix, gender, isFridaySelected);
    };

    const isPrayerDone = useCallback(
        (suffix: string) => {
            const id = normalizeMissionId(getMissionId(suffix));
            return completedMissions.some((m) => {
                if (normalizeMissionId(m.id) !== id) return false;
                return DateUtils.toLocalDate(m.completedAt) === selectedDate;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [completedMissions, gender, selectedDate]
    );

    const completedCount = PRAYERS.filter((p) => isPrayerDone(p.suffix)).length;

    // Determine current/next active prayer window
    const getTimeStatus = (prayerKey: string | null, endKey: string | null, isQobliyah = false) => {
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
        if (isQobliyah) {
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
        return {
            isActive,
            isUpcoming: false,
            isLate: minsFromStart >= 240 || (minsFromStart > 180 && isActive),
            isFuture: false,
        };
    };

    const doComplete = (missionId: string, hasanahReward: number) => {
        const finalHasanah = getHasanahReward(hasanahReward);

        const completedTodayCount = completedMissions.filter(
            (m) => DateUtils.toLocalDate(m.completedAt) === selectedDate
        ).length;

        // Only trigger generic streak logic if it's really today's first activity
        if (completedTodayCount === 0 && !isBackdated) {
            updateStreak();
        }

        addHasanah(finalHasanah, selectedDate);
        window.dispatchEvent(new CustomEvent(APP_EVENTS.HASANAH_UPDATED));
        completeMission(missionId, finalHasanah, selectedDate);
        window.dispatchEvent(new CustomEvent(APP_EVENTS.MISSION_UPDATED));
        if (session?.user?.id && !isBackdated) {
            void syncData({ silent: true });
        }

        toast.success(t.homePrayerCheckInToastTitle || "Alhamdulillah! ✅", {
            description: (t.homePrayerCheckInToastDesc || "Sholat tercatat (+{hasanah} Hasanah)").replace("{hasanah}", String(finalHasanah)),
            duration: 2500,
            icon: <AppIcon name="sparkles" size="sm" tone="primary" />,
        });
    };

    const handlePrayerTap = (prayer: typeof PRAYERS[number] | typeof SUNNAH_PRAYERS[number]) => {
        const isSunnah = 'id' in prayer;
        const missionId = normalizeMissionId(isSunnah ? prayer.id : getMissionId(prayer.suffix));
        const doneRecord = completedMissions.find(m => normalizeMissionId(m.id) === missionId && DateUtils.toLocalDate(m.completedAt) === selectedDate);
        const done = !!doneRecord;

        if (done) {
            // Undo logic
            const hasanahToSubtract = doneRecord.hasanahEarned || 0;
            undoCompleteMission(missionId, selectedDate);
            addHasanah(-hasanahToSubtract, selectedDate);
            window.dispatchEvent(new CustomEvent(APP_EVENTS.HASANAH_UPDATED));
            window.dispatchEvent(new CustomEvent(APP_EVENTS.MISSION_UPDATED));

            toast.info(t.habitUndoTitle || "Habit dibatalkan", {
                description: t.habitUndoDesc || "Point Hasanah telah dikembalikan.",
                icon: <AppIcon name="refresh" size="sm" tone="primary" />,
            });
            return;
        }

        const status = getTimeStatus(
            prayer.prayerKey,
            prayer.endKey,
            Boolean("isQobliyah" in prayer && prayer.isQobliyah),
        );

        if (status.isFuture) {
            const label = getTranslation(prayer.i18n);
            toast.error(t.homePrayerCheckInNotYet.replace("{prayer}", label), {
                description: t.homePrayerCheckInWait,
                icon: <AppIcon name="lock" size="sm" tone="muted" />,
            });
            return;
        }

        if (isSunnah) {
            // Sunnah points are smaller or fixed
            const hasanah = "hasanah" in prayer ? prayer.hasanah : 25;
            doComplete(missionId, hasanah);
        } else if (gender !== "female") {
            setSheet({ prayer: prayer as typeof PRAYERS[number], missionId });
        } else {
            doComplete(missionId, 25);
        }
    };

    if (!mounted || prayerDataLoading) {
        return (
            <div className={cn(
                "w-full h-[88px] animate-pulse rounded-2xl border",
                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
            )} />
        );
    }

    if (!prayerData?.prayerTimes) return null;

    return (
        <>
            <div className={cn(
                "glass-surface prayer-checkin-widget relative overflow-hidden rounded-2xl border px-4 py-3.5 transition-all",
                "shadow-[var(--shadow-card)]"
            )}>
                {/* Soft Glow */}
                <div className={cn(
                    "absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] pointer-events-none opacity-40",
                    "bg-[rgb(var(--color-primary))]/10"
                )} />

                {/* Header */}
                <div className="flex items-center justify-between mb-2 relative z-10 gap-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                        <AppIcon name="landmark" size="sm" tone="primary" />
                        <p className="truncate text-[10px] font-black uppercase tracking-tight">
                            {isBackdated ? t.homePrayerCheckInHistoryTitle : t.homePrayerCheckInSectionTitle}
                        </p>
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                        {/* Date Selector */}
                        <div
                            onClick={() => {
                                // Provide native fallback by just allowing target click if showPicker isn't supported
                                try {
                                    dateInputRef.current?.showPicker();
                                } catch {
                                    // Ignore error, fallback to focus and native mobile tap
                                    dateInputRef.current?.focus();
                                }
                            }}
                            className="relative min-h-11 min-w-11 shrink-0 flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-pointer touch-manipulation group/date"
                        >
                            <Calendar className="w-3 h-3 text-[rgb(var(--color-text-muted))] transition-colors" />
                            <span className="text-[9px] font-bold uppercase text-[rgb(var(--color-text-muted))] transition-colors">
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
                                max={new Date().toLocaleDateString('en-CA')} // Strict YYYY-MM-DD format for native mobile
                                onChange={(e) => {
                                    if (e.target.value) {
                                        // Also prevent selecting future dates manually
                                        if (e.target.value > new Date().toLocaleDateString('en-CA')) {
                                            toast.error(t.homePrayerCheckInNotYet || "Belum waktunya");
                                            return;
                                        }
                                        setSelectedDate(e.target.value);
                                    }
                                }}
                                className="prayer-date-input absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                        </div>

                        <div className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold border transition-colors whitespace-nowrap",
                            completedCount === 5
                                ? "bg-[rgb(var(--color-primary))]/15 border-[rgb(var(--color-primary))]/30 text-[rgb(var(--color-primary))]"
                                : "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]"
                        )}>
                            {completedCount}/5
                        </div>
                    </div>
                </div>

                {/* Prayer Pills */}
                <div className="flex items-center gap-2 relative z-10">
                    {PRAYERS.map((prayer) => {
                        const done = isPrayerDone(prayer.suffix);
                        const { isActive, isUpcoming, isLate, isFuture } = getTimeStatus(
                            prayer.prayerKey,
                            prayer.endKey,
                            Boolean("isQobliyah" in prayer && prayer.isQobliyah),
                        );
                        const isLocked = isFuture && !done;

                        return (
                            <button
                                key={prayer.suffix}
                                onClick={() => handlePrayerTap(prayer)}
                                disabled={isLocked}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                    done
                                        ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 cursor-default"
                                        : isLocked
                                            ? "bg-[rgb(var(--color-surface-subtle))]/20 border-[rgb(var(--color-border))]/40 cursor-not-allowed opacity-40 pointer-events-none"
                                            : isLate
                                                ? "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/30 active:scale-95"
                                                : isActive
                                                ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)] active:scale-95"
                                                    : isUpcoming
                                                        ? "bg-[rgb(var(--color-surface-subtle))]/60 border-[rgb(var(--color-border))] active:scale-95"
                                                        : "bg-[rgb(var(--color-surface-subtle))]/40 border-[rgb(var(--color-border))]/70 active:scale-95"
                                )}
                            >
                                {/* Active pulse for current prayer */}
                                {isActive && !done && (
                                    <div className="absolute inset-0 bg-[rgb(var(--color-primary))]/5 animate-pulse pointer-events-none" />
                                )}

                                {done ? (
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center",
                                        "bg-[rgb(var(--color-primary))]"
                                    )}>
                                    <Check className="w-3 h-3 text-[rgb(var(--color-primary-foreground))]" />
                                    </div>
                                ) : isLate ? (
                                    <AlertCircle className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                                ) : (
                                    <AppIcon name={prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected ? "landmark" : prayer.icon} size="sm" tone="primary" />
                                )}

                                <span className={cn(
                                    "text-[9px] font-bold leading-none transition-colors",
                                        done
                                        ? "text-[rgb(var(--color-primary))]"
                                        : isLocked
                                                    ? "text-[rgb(var(--color-text-muted))]/40"
                                            : isActive
                                                ? "text-[rgb(var(--color-text-strong))]"
                                                : isUpcoming
                                                    ? "text-[rgb(var(--color-text-muted))]"
                                            : "text-[rgb(var(--color-text-muted))]/70"
                                )}>
                                    {prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected
                                        ? getTranslation("prayerJumuah", "Jumat")
                                        : getTranslation(prayer.i18n)}
                                </span>

                                {/* Status hint below label */}
                                {!done && !isLocked && (isActive || isLate) && (
                                    <span className={cn(
                                        "text-[7px] font-black leading-none",
                                        isLate
                                            ? "text-[rgb(var(--color-warning))]/80"
                                            : "text-[rgb(var(--color-primary))]/70"
                                    )}>
                                        +{getHasanahReward(gender !== "female" ? 75 : 25)} Hasanah
                                    </span>
                                )}
                                {!done && isUpcoming && !isLocked && (
                                    <span className="text-[7px] font-medium leading-none text-[rgb(var(--color-text-muted))]/70">
                                        {t.homePrayerCheckInUpcoming}
                                    </span>
                                )}
                                {isLocked && (
                                    <span className="text-[7px] font-medium leading-none text-[rgb(var(--color-text-muted))]/50">
                                        <AppIcon name="lock" size="xs" tone="muted" />
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
                        "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                    )}>
                        <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary))]" />
                        <p className="text-[10px] font-black text-[rgb(var(--color-primary))] text-center">
                            {t.homePrayerCheckInDone}
                        </p>
                    </div>
                )}

                {/* Sunnah Toggle & Section */}
                <div className="mt-4 pt-3 border-t border-dashed border-[rgb(var(--color-border))] relative z-10">
                    <button
                        onClick={() => setShowSunnah(!showSunnah)}
                        className={cn(
                            "w-full flex items-center justify-between py-1 transition-colors group",
                            "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-primary))]"
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
                            "bg-[rgb(var(--color-surface-subtle))] group-hover:bg-[rgb(var(--color-primary))]/10"
                        )}>
                            <span className="inline-flex items-center gap-1"><AppIcon name={showSunnah ? "target" : "sparkles"} size="xs" tone="muted" /> {showSunnah ? "Hide" : "Show"}</span>
                        </div>
                    </button>

                    {showSunnah && (
                        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-7 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Sunnah Prayers Section */}
                            {(() => {
                                const activeSunnah = SUNNAH_PRAYERS.filter(p => {
                                    if (!("visibility" in p)) return true;
                                    const vis = p.visibility;
                                    const hMonth = prayerData?.hijriMonth;
                                    const hDay = prayerData?.hijriDay;
                                    if (vis.hijriMonth && vis.hijriMonth !== hMonth) return false;
                                    if ("hijriDay" in vis && vis.hijriDay !== hDay) return false;
                                    return true;
                                });

                                return activeSunnah.map((prayer) => {
                                    const done = completedMissions.some(m => m.id === prayer.id && DateUtils.toLocalDate(m.completedAt) === selectedDate);
                                    const { isActive, isLate, isFuture } = getTimeStatus(
                                        prayer.prayerKey,
                                        prayer.endKey,
                                        Boolean("isQobliyah" in prayer && prayer.isQobliyah),
                                    );
                                    const isLocked = isFuture && !done;

                                    return (
                                        <button
                                            key={prayer.id}
                                            onClick={() => handlePrayerTap(prayer)}
                                            disabled={isLocked}
                                            className={cn(
                                                "flex flex-col items-center gap-1 py-1.5 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                                done
                                                    ? "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20 opacity-80"
                                                    : isLocked
                                                        ? "bg-[rgb(var(--color-surface-subtle))]/20 border-[rgb(var(--color-border))]/40 opacity-30 grayscale pointer-events-none"
                                                        : isActive
                                                            ? "bg-[rgb(var(--color-warning))]/10 border-[rgb(var(--color-warning))]/25 shadow-[var(--shadow-card)] active:scale-95"
                                                            : "bg-[rgb(var(--color-surface-subtle))]/40 border-[rgb(var(--color-border))]/70 active:scale-95"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xl",
                                                done
                                                    ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]"
                                                    : isLate
                                                        ? "bg-[rgb(var(--color-warning))]/15 text-[rgb(var(--color-warning))]"
                                                        : "bg-[rgb(var(--color-surface-subtle))] text-[rgb(var(--color-text-muted))]"
                                            )}>
                                                {done ? <Check className="w-3 h-3" /> : (isLate && !isLocked ? <AlertCircle className="w-3 h-3" /> : <AppIcon name={prayer.icon} size="sm" tone="primary" />)}
                                            </div>
                                            <span className={cn(
                                                "text-[6.5px] font-black uppercase text-center px-1 leading-[1.1] min-h-[16px] flex items-center justify-center",
                                                done
                                                    ? "text-[rgb(var(--color-primary))]"
                                                    : isLate
                                                        ? "text-[rgb(var(--color-warning))]/80"
                                                        : "text-[rgb(var(--color-text-muted))]"
                                            )}>
                                                {getTranslation(prayer.i18n, prayer.i18n.split("_").pop())}
                                            </span>

                                            {/* Sunnah XP Preview */}
                                            {!done && !isLocked && (isActive || isLate) && (
                                                <span className={cn(
                                                    "text-[6px] font-black leading-none mt-0.5",
                                                    isLate
                                                        ? "text-[rgb(var(--color-warning))]/70"
                                                        : "text-[rgb(var(--color-primary))]/70"
                                                )}>
                                                    +{getHasanahReward("hasanah" in prayer ? prayer.hasanah : 25)} Hasanah
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
                    <div className="absolute inset-0 bg-[rgb(var(--color-canvas))]/70 backdrop-blur-sm" />

                    <div
                        className={cn(
                            "relative w-full max-w-md border rounded-t-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-10",
                            "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle */}
                        <div className="w-10 h-1 rounded-full mx-auto mb-5 bg-[rgb(var(--color-border))]" />

                        <div className="flex items-center gap-3 mb-5">
                            <div className={cn(
                                "w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-colors",
                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
                            )}>
                                <AppIcon name={sheet.prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected ? "landmark" : sheet.prayer.icon} size="lg" tone="primary" />
                            </div>
                            <div>
                                <p className="text-sm font-black">
                                    {sheet.prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected
                                        ? t.homePrayerCheckInSheetTitle.replace("{prayer}", getTranslation("prayerJumuah", "Jumat"))
                                        : t.homePrayerCheckInSheetTitle.replace("{prayer}", getTranslation(sheet.prayer.i18n))}
                                </p>
                                <p className="text-[10px] font-medium text-[rgb(var(--color-text-muted))]">
                                    {sheet.prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected
                                        ? (locale === "id" ? "Sholat Jumat wajib dilaksanakan secara berjamaah di masjid." : "Friday prayer is obligatory in congregation at the mosque.")
                                        : t.homePrayerCheckInSheetSubtitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* For Friday Prayer (Male on Friday), only 1 option: Jamaah di Masjid */}
                            {sheet.prayer.suffix === "dzuhur" && gender === "male" && isFridaySelected ? (
                                <button
                                    onClick={() => {
                                        doComplete(sheet.missionId, 200);
                                        setSheet(null);
                                    }}
                                    className={cn(
                                        "w-full flex flex-col items-center gap-2 py-5 rounded-2xl transition-all border relative overflow-hidden group shadow-lg",
                                        "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)] hover:bg-[rgb(var(--color-primary-strong))]"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                    <AppIcon name="landmark" size="lg" tone="default" className="relative group-active:scale-110 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-wide text-[rgb(var(--color-primary-foreground))] relative">
                                        {locale === "id" ? "Berjamaah di Masjid" : "Congregation (Mosque)"}
                                    </span>
                                    <span className="text-[10px] font-black text-[rgb(var(--color-primary-foreground))]/80 relative">
                                        +{getHasanahReward(200)} Hasanah
                                    </span>
                                </button>
                            ) : (
                                <>
                                    {/* Sendiri */}
                                    <button
                                        onClick={() => {
                                            doComplete(sheet.missionId, 25);
                                            setSheet(null);
                                        }}
                                        className={cn(
                                            "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all border group",
                                            "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10"
                                        )}
                                    >
                                        <AppIcon name="home" size="lg" tone="primary" className="group-active:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-wide">{t.homePrayerCheckInOptionSolo}</span>
                                        <span className="text-[10px] font-black text-[rgb(var(--color-text-muted))]">+{getHasanahReward(25)} Hasanah</span>
                                    </button>

                                    {/* Berjamaah */}
                                    <button
                                        onClick={() => {
                                            doComplete(sheet.missionId, 75);
                                            setSheet(null);
                                        }}
                                        className={cn(
                                            "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all border relative overflow-hidden group shadow-lg",
                                            "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]/30 shadow-[var(--shadow-card)] hover:bg-[rgb(var(--color-primary-strong))]"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                        <AppIcon name="landmark" size="lg" tone="default" className="relative group-active:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-wide text-[rgb(var(--color-primary-foreground))] relative">{t.homePrayerCheckInOptionJamaah}</span>
                                        <span className="text-[10px] font-black text-[rgb(var(--color-primary-foreground))]/80 relative">+{getHasanahReward(75)} Hasanah</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className={cn(
                            "mt-4 mb-6 p-4 rounded-xl border relative",
                            "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-primary))]/20"
                        )}>
                            <p className={cn(
                                "text-[10px] text-center italic leading-relaxed font-bold",
                                "text-[rgb(var(--color-text-muted))]"
                            )}>
                                {t.homePrayerCheckInQuote}
                            </p>
                        </div>

                        <button
                            onClick={() => setSheet(null)}
                            className={cn(
                                "w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10 hover:text-[rgb(var(--color-text))]"
                            )}
                        >
                            {getTranslation("buttonCancel", "Batal")}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
