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
import type { TranslationTree } from "@/context/LocaleContext";
import { formatHasanahRange } from "@/lib/utils/hasanah";
import { AppIcon, resolveAppIconName } from "@/components/ui/AppIcon";

interface DailyMissionCardProps {
    mission: Mission;
    isCompleted: boolean;
    isLocked: boolean;
    isSpecial: boolean;
    validation: { locked: boolean; reason?: string; isEarly?: boolean; isLate?: boolean };
    prayerData: { prayerTimes?: Record<string, string> } | null | undefined;
    t: TranslationTree;
    getRulingLabel: (ruling: string, t: TranslationTree) => string | string[];
    onClick: (mission: Mission) => void;
    isBackdated?: boolean;
}

export default function DailyMissionCard({
    mission,
    isCompleted,
    isLocked,
    isSpecial,
    validation,
    prayerData,
    t,
    getRulingLabel,
    onClick,
    isBackdated = false
}: DailyMissionCardProps) {
    let urgencyNode = null;

    if (mission.category === 'prayer' && !isCompleted && !isLocked && !validation.isLate && prayerData?.prayerTimes) {
        const idToKey: { [key: string]: string } = {
            'fajr_prayer': 'Fajr', 'sholat_subuh_male': 'Fajr', 'sholat_subuh_female': 'Fajr', 'fajr_prayer_male': 'Fajr', 'fajr_prayer_female': 'Fajr',
            'dhuhr_prayer': 'Dhuhr', 'sholat_dzuhur_male': 'Dhuhr', 'sholat_dzuhur_female': 'Dhuhr', 'dhuhr_prayer_male': 'Dhuhr', 'dhuhr_prayer_female': 'Dhuhr',
            'asr_prayer': 'Asr', 'sholat_ashar_male': 'Asr', 'sholat_ashar_female': 'Asr', 'asr_prayer_male': 'Asr', 'asr_prayer_female': 'Asr',
            'maghrib_prayer': 'Maghrib', 'sholat_maghrib_male': 'Maghrib', 'sholat_maghrib_female': 'Maghrib', 'maghrib_prayer_male': 'Maghrib', 'maghrib_prayer_female': 'Maghrib',
            'isha_prayer': 'Isha', 'sholat_isya_male': 'Isha', 'sholat_isya_female': 'Isha', 'isha_prayer_male': 'Isha', 'isha_prayer_female': 'Isha'
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
                        <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-[rgb(var(--color-warning))]/10 border border-[rgb(var(--color-warning))]/20">
                            <AlertCircle className="w-3 h-3 text-[rgb(var(--color-warning))] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-[rgb(var(--color-warning))] leading-tight">{t.home_mission_late_title.replace("{minutes}", Math.floor(minsRemaining).toString())}</p>
                                <p className="text-[9px] text-[rgb(var(--color-warning))]/70 leading-tight italic">{t.home_mission_late_quote}</p>
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
                    ? "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))] opacity-70"
                    : "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/5 hover:border-[rgb(var(--color-primary-light))]"
            )}
        >
            {!isCompleted && !isLocked && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    "bg-[rgb(var(--color-primary))]"
                )} />
            )}
            <div className="flex items-center gap-3 w-full">
                <AppIcon
                    name={mission.iconKey ?? resolveAppIconName(mission.icon)}
                    size="lg"
                    tone={isCompleted ? "muted" : "primary"}
                    className={cn(isCompleted && "opacity-60", isLocked && "opacity-50")}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className={cn(
                            "text-xs font-semibold truncate pr-2",
                            isCompleted
                                ? "text-[rgb(var(--color-primary-light))] line-through"
                                : isSpecial ? "text-[rgb(var(--color-accent-foreground))]" : "text-[rgb(var(--color-text-strong))]"
                        )}>
                            {mission.title}
                        </p>
                        {isSpecial && !isCompleted && !isLocked && (
                            <span className="text-[8px] px-1 rounded bg-[rgb(var(--color-accent))]/15 text-[rgb(var(--color-accent-foreground))] border border-[rgb(var(--color-accent))]/30">
                                {t.home_mission_special}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[7px] px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0",
                            mission.ruling === 'obligatory'
                                ? "bg-[rgb(var(--color-info))]/15 text-[rgb(var(--color-info))] border-[rgb(var(--color-info))]/30"
                                : "bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))] border-[rgb(var(--color-success))]/20"
                        )}>
                            {getRulingLabel(mission.ruling, t)}
                        </span>
                        <p className="text-[10px] truncate text-[rgb(var(--color-text))]">
                            {formatHasanahRange(mission.hasanahReward, mission.completionOptions, isBackdated)} Hasanah
                        </p>

                        {isLocked ? (
                            <span className="text-[9px] flex items-center gap-0.5 ml-auto text-[rgb(var(--color-text-muted))]">
                                {t.home_mission_locked}
                            </span>
                        ) : validation.isLate ? (
                            <span className="text-[9px] text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger))]/10 px-1.5 py-0.5 rounded border border-[rgb(var(--color-danger))]/20 flex items-center gap-1 font-medium ml-auto animate-pulse">
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
                        "bg-[rgb(var(--color-primary))]"
                    )}>
                        <Check className="w-3 h-3 text-[rgb(var(--color-primary-foreground))]" />
                    </div>
                ) : (
                    <div className={cn(
                        "w-5 h-5 rounded-full border transition-colors",
                        isSpecial ? "border-[rgb(var(--color-accent))]/40 group-hover:border-[rgb(var(--color-accent))]/60" : "border-[rgb(var(--color-border))] group-hover:border-[rgb(var(--color-primary))]"
                    )} />
                )}
            </div>

            {!isCompleted && !isLocked && urgencyNode}
        </button>
    );
}
