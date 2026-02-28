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

import { Sparkles, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mission } from "@/data/missions";
import { getRulingLabel } from "@/lib/mission-utils";

interface DailyMissionCardProps {
    mission: Mission;
    isCompleted: boolean;
    isLocked: boolean;
    isSpecial: boolean;
    validation: { locked: boolean; reason?: string; isEarly?: boolean; isLate?: boolean };
    prayerData: any;
    gender: 'male' | 'female' | null;
    t: any;
    getRulingLabel: (ruling: string, t: any) => string | string[];
    onClick: (mission: Mission) => void;
}

export default function DailyMissionCard({
    mission,
    isCompleted,
    isLocked,
    isSpecial,
    validation,
    prayerData,
    gender,
    t,
    getRulingLabel,
    onClick
}: DailyMissionCardProps) {
    let urgencyNode = null;

    if (mission.category === 'prayer' && !isCompleted && !isLocked && !validation.isLate && prayerData?.prayerTimes) {
        const idToKey: { [key: string]: string } = {
            'sholat_subuh_male': 'Fajr', 'sholat_subuh_female': 'Fajr',
            'sholat_dzuhur_male': 'Dhuhr', 'sholat_dzuhur_female': 'Dhuhr',
            'sholat_ashar_male': 'Asr', 'sholat_ashar_female': 'Asr',
            'sholat_maghrib_male': 'Maghrib', 'sholat_maghrib_female': 'Maghrib',
            'sholat_isya_male': 'Isha', 'sholat_isya_female': 'Isha'
        };
        const prayerKey = idToKey[mission.id];

        if (prayerKey) {
            const pTime = prayerData.prayerTimes[prayerKey];
            let endTimeStr = null;
            if (prayerKey === 'Fajr') endTimeStr = prayerData.prayerTimes['Sunrise'];
            else if (prayerKey === 'Dhuhr') endTimeStr = prayerData.prayerTimes['Asr'];
            else if (prayerKey === 'Asr') endTimeStr = prayerData.prayerTimes['Maghrib'];
            else if (prayerKey === 'Maghrib') endTimeStr = prayerData.prayerTimes['Isha'];
            else if (prayerKey === 'Isha') endTimeStr = prayerData.prayerTimes['Midnight'];

            if (pTime && endTimeStr) {
                const now = new Date();
                const [sH, sM] = pTime.split(':').map(Number);
                const [eH, eM] = endTimeStr.split(':').map(Number);

                const startDate = new Date(); startDate.setHours(sH, sM, 0, 0);
                const endDate = new Date(); endDate.setHours(eH, eM, 0, 0);

                if (endDate < startDate) {
                    endDate.setDate(endDate.getDate() + 1);
                }

                const diffMs = now.getTime() - startDate.getTime();
                const remainingMs = endDate.getTime() - now.getTime();

                const minsSinceStart = diffMs / (1000 * 60);
                const minsRemaining = remainingMs / (1000 * 60);

                if (minsSinceStart <= 60 && minsSinceStart >= 0) {
                    urgencyNode = (
                        <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                            <Sparkles className="w-3 h-3 text-[rgb(var(--color-primary-light))] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-[rgb(var(--color-primary-light))] leading-tight">{t.home_mission_early_title}</p>
                                <p className="text-[9px] text-[rgb(var(--color-primary-light))]/70 leading-tight italic">{t.home_mission_early_quote}</p>
                            </div>
                        </div>
                    );
                } else if (minsRemaining <= 30 && minsRemaining > 0) {
                    urgencyNode = (
                        <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                            <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-amber-500 leading-tight">{t.home_mission_late_title.replace("{minutes}", Math.floor(minsRemaining).toString())}</p>
                                <p className="text-[9px] text-amber-500/70 leading-tight italic">{t.home_mission_late_quote}</p>
                            </div>
                        </div>
                    );
                }
            }
        }
    }

    return (
        <button
            onClick={() => onClick(mission)}
            className={cn(
                "w-full flex flex-col gap-2 p-3 rounded-2xl transition-all text-left group relative overflow-hidden",
                "border backdrop-blur-sm",
                isCompleted
                    ? "bg-black/20 border-white/5 opacity-60"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
            )}
        >
            {!isCompleted && !isLocked && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    mission.ruling === 'obligatory' ? "bg-blue-500" : "bg-emerald-500/50"
                )} />
            )}
            <div className="flex items-center gap-3 w-full">
                <span className={cn(
                    "text-xl transition-all",
                    isCompleted && "grayscale",
                    isLocked && "opacity-50 grayscale"
                )}>
                    {mission.icon}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className={cn(
                            "text-xs font-semibold truncate pr-2",
                            isCompleted
                                ? gender === 'female' ? "text-pink-400 line-through" :
                                    gender === 'male' ? "text-blue-400 line-through" :
                                        "text-[rgb(var(--color-primary-light))] line-through"
                                : isSpecial ? "text-amber-200" : "text-white"
                        )}>
                            {mission.title}
                        </p>
                        {isSpecial && !isCompleted && !isLocked && (
                            <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {t.home_mission_special}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[7px] px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0",
                            mission.ruling === 'obligatory'
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                            {getRulingLabel(mission.ruling, t)}
                        </span>
                        <p className="text-[10px] text-white/90 truncate">
                            +{mission.xpReward} XP
                        </p>

                        {isLocked ? (
                            <span className="text-[9px] text-white/60 flex items-center gap-0.5 ml-auto">
                                {t.home_mission_locked}
                            </span>
                        ) : validation.isLate ? (
                            <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-1 font-medium ml-auto animate-pulse">
                                <AlertCircle className="w-2.5 h-2.5" /> {t.home_mission_late}
                            </span>
                        ) : validation.isEarly ? (
                            <span className="text-[9px] text-[rgb(var(--color-primary-light))] bg-[rgb(var(--color-primary))]/10 px-1.5 py-0.5 rounded border border-[rgb(var(--color-primary))]/20 flex items-center gap-1 font-medium ml-auto">
                                <Sparkles className="w-2.5 h-2.5" /> {t.home_mission_early}
                            </span>
                        ) : null}
                    </div>
                </div>
                {isCompleted ? (
                    <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        gender === 'female' ? "bg-pink-500" : gender === 'male' ? "bg-blue-500" : "bg-[rgb(var(--color-primary))]"
                    )}>
                        <Check className="w-3 h-3 text-white" />
                    </div>
                ) : (
                    <div className={cn(
                        "w-5 h-5 rounded-full border transition-colors",
                        isSpecial ? "border-amber-500/40 group-hover:border-amber-400/60" : "border-white/20 group-hover:border-white/40"
                    )} />
                )}
            </div>

            {!isCompleted && !isLocked && urgencyNode}
        </button>
    );
}
