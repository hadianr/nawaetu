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

import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import DalilBadge from "./DalilBadge";
import NiatCard from "./NiatCard";
import { DALIL_FASTING_SCHEDULE, DOA_IFTAR, DOA_IFTAR_2, DOA_IFTAR_3, DOA_SAHUR } from "@/data/ramadhan-data";
import { useState, useEffect } from "react";
import RamadhanCalendar from "./RamadhanCalendar";
import { useTranslations } from "@/context/LocaleContext";

function parseTimeToDate(timeStr: string): Date | null {
    if (!timeStr) return null;
    const clean = timeStr.split(" ")[0];
    const [hoursStr, minutesStr] = clean.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RamadhanScheduleCard() {
    const { data } = usePrayerTimesContext();
    const t = useTranslations();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const prayers = data?.prayerTimes ?? {};
    const imsakTime = prayers["Imsak"] ?? "";
    const fajrTime = prayers["Fajr"] ?? "";
    const maghribTime = prayers["Maghrib"] ?? "";
    const ishaTime = prayers["Isha"] ?? "";

    const imsakDate = parseTimeToDate(imsakTime);
    const maghribDate = parseTimeToDate(maghribTime);

    let countdownLabel = "";
    let countdownMs = 0;
    let countdownStyle: React.CSSProperties = { color: `rgb(var(--color-primary-light))` };

    const isRamadhan = data?.hijriMonth?.toLowerCase().includes("ramadan") || false;

    if (imsakDate && now < imsakDate) {
        countdownLabel = isRamadhan ? t.scheduleImsakIn : t.scheduleFajrIn;
        countdownMs = imsakDate.getTime() - now.getTime();
        countdownStyle = { color: `rgb(var(--color-primary-light))` };
    } else if (maghribDate && now < maghribDate) {
        countdownLabel = isRamadhan ? t.scheduleIftarIn : t.scheduleMaghribIn;
        countdownMs = maghribDate.getTime() - now.getTime();
        countdownStyle = { color: `rgba(var(--color-primary-light), 0.9)` };
    } else {
        countdownLabel = t.scheduleAlreadyIftar;
        countdownMs = 0;
    }

    const scheduleItems = [
        { label: t.scheduleImsak, time: imsakTime || "--:--", icon: "🌙", colorStyle: { color: `rgb(var(--color-primary-light))` } },
        { label: t.scheduleFajr, time: fajrTime || "--:--", icon: "🌅", colorStyle: { color: "rgb(147 197 253)" } },
        { label: isRamadhan ? t.scheduleMaghribIftar : t.scheduleMaghrib, time: maghribTime || "--:--", icon: "🌇", colorStyle: { color: `rgba(var(--color-primary-light), 0.85)` } },
        { label: t.scheduleIsha, time: ishaTime || "--:--", icon: "⭐", colorStyle: { color: "rgb(216 180 254)" } },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-lg shadow-xl shadow-black/5">
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <h3 className="font-bold text-white text-base">{t.scheduleTodayTitle}</h3>
                </div>
                <DalilBadge dalil={DALIL_FASTING_SCHEDULE} variant="pill" />
            </div>

            {/* Countdown */}
            {countdownMs > 0 ? (
                <div className="mx-3 mb-2 rounded-2xl bg-black/30 border border-white/10 px-3 py-2 sm:mx-4 sm:mb-3 sm:px-4 sm:py-3 text-center backdrop-blur-md shadow-lg">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 sm:mb-2">{countdownLabel}</p>
                    <p className="text-2xl sm:text-3xl font-mono font-black tracking-widest" style={countdownStyle}>
                        {formatCountdown(countdownMs)}
                    </p>
                </div>
            ) : (
                <div className="mx-3 mb-2 rounded-2xl border border-white/10 px-3 py-2 sm:mx-4 sm:mb-3 sm:px-4 sm:py-2.5 text-center backdrop-blur-md shadow-lg" style={{ background: "rgba(var(--color-primary), 0.1)" }}>
                    <p className="text-sm font-bold" style={{ color: "rgb(var(--color-primary-light))" }}>{countdownLabel}</p>
                </div>
            )}

            {/* Schedule grid */}
            <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4">
                {scheduleItems.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl bg-black/20 border border-white/5 px-2 py-1.5 sm:px-3 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm shadow-md hover:bg-black/30 hover:border-white/10 transition-all"
                    >
                        <span className="text-sm sm:text-base">{item.icon}</span>
                        <div>
                            <p className="text-[10px] sm:text-xs text-white/40">{item.label}</p>
                            <p className="text-xs sm:text-sm font-bold font-mono" style={item.colorStyle}>{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Doa shortcuts - Compact */}
            <div className="border-t border-white/5 px-3 py-2 sm:px-4 sm:py-2.5">
                <div className="space-y-2">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1">{t.scheduleSuhoorDua}</p>
                        <NiatCard niat={DOA_SAHUR} variant="pill" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1">{t.scheduleIftarDua}</p>
                        <div className="space-y-1">
                            <NiatCard niat={DOA_IFTAR} variant="pill" />
                            <NiatCard niat={DOA_IFTAR_2} variant="pill" />
                            <NiatCard niat={DOA_IFTAR_3} variant="pill" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Link */}
            <div className="bg-white/[0.02] border-t border-white/5 px-4 py-2 flex justify-center">
                <RamadhanCalendar />
            </div>
        </div>
    );
}
