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

import { Crown, Flame, Info, Gift } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { useState } from "react";

interface GamificationStatsProps {
    stats: {
        streak: number;
        level: number;
        hasanah: number;
        nextLevelHasanah: number;
        progress: number;
    };
}

export function GamificationStats({ stats }: GamificationStatsProps) {
    const { t } = useLocale();
    const translations = t as TranslationTree;
    const [showLevelInfo, setShowLevelInfo] = useState(false);

    return (
        <div className="flex flex-col gap-3 mb-6">
            {/* Level Progress */}
            <div className={cn(
                "rounded-2xl p-4 transition-all border",
                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
            )}>
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            "bg-[rgb(var(--color-primary))]/15"
                        )}>
                            <Crown className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
                        </div>
                        <div>
                            <div
                                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setShowLevelInfo(!showLevelInfo)}
                            >
                                <p className="text-[10px] text-[rgb(var(--color-text-muted))] uppercase tracking-wider font-medium">
                                    {translations.gamificationLevelName} {stats.level}: {
                                        stats.level <= 10 ? translations.gamificationLevelTitle_0_10 :
                                            stats.level <= 25 ? translations.gamificationLevelTitle_11_25 :
                                                stats.level <= 50 ? translations.gamificationLevelTitle_26_50 :
                                                    stats.level <= 99 ? translations.gamificationLevelTitle_51_99 : translations.gamificationLevelTitle_100
                                    }
                                </p>
                                <Info className="w-3 h-3 text-[rgb(var(--color-text-muted))]" />
                            </div>
                            <p className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{stats.hasanah} {translations.gamificationXpName}</p>
                        </div>
                    </div>
                    <span className="text-[10px] text-[rgb(var(--color-text-muted))]">{stats.hasanah} / {stats.nextLevelHasanah} {translations.gamificationXpName}</span>
                </div>
                <div className={cn(
                    "h-2.5 w-full rounded-full overflow-hidden border shadow-inner mb-2.5 transition-all",
                    "bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
                )}>
                    <div
                        className="h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{
                            width: `${stats.progress}%`,
                            background: "rgb(var(--color-primary))",
                            boxShadow: "var(--shadow-card)"
                        }}
                    />
                </div>

                {showLevelInfo ? (
                    <div className={cn(
                        "mt-3 p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-1",
                        "bg-[rgb(var(--color-primary))]/10 border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]"
                    )}>
                        <div className="font-bold mb-1 text-[11px] uppercase tracking-wider text-[rgb(var(--color-primary-strong))]">{translations.gamificationLevelName} Tingkatan:</div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{translations.gamificationLevelTitle_0_10} (Lvl 1-10)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-[rgb(var(--color-border))] pl-2">{translations.gamificationLevelDesc_0_10}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{translations.gamificationLevelTitle_11_25} (Lvl 11-25)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-[rgb(var(--color-border))] pl-2">{translations.gamificationLevelDesc_11_25}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{translations.gamificationLevelTitle_26_50} (Lvl 26-50)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-[rgb(var(--color-border))] pl-2">{translations.gamificationLevelDesc_26_50}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{translations.gamificationLevelTitle_51_99} (Lvl 51-99)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-[rgb(var(--color-border))] pl-2">{translations.gamificationLevelDesc_51_99}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[rgb(var(--color-primary-light))]">{translations.gamificationLevelTitle_100} (Lvl 100+)</span>
                            </div>
                            <p className="text-[9px] leading-relaxed italic border-l border-[rgb(var(--color-border))] pl-2">{translations.gamificationLevelDesc_100}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] text-[rgb(var(--color-text-muted))] leading-snug">
                        {translations.profileXpDesc}
                    </p>
                )}
            </div>

            <Link
                href="/rewards"
                className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors",
                    "border-[rgb(var(--color-accent))]/30 bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/20"
                )}
            >
                <Gift className="h-4 w-4" />
                {translations.rewards.cta}
            </Link>

            {/* Streak Row (Full Width) */}
            <div className={cn(
                "rounded-2xl p-4 flex items-center gap-4 border transition-all",
                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-all",
                    "bg-[rgb(var(--color-primary))]/15"
                )}>
                    <Flame className="w-6 h-6 text-[rgb(var(--color-primary-light))]" />
                </div>
                <div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black leading-none text-[rgb(var(--color-text-strong))]">{stats.streak}</span>
                        <span className="text-[11px] text-[rgb(var(--color-text-muted))] uppercase tracking-wider font-medium mb-[2px]">{translations.profileDays}</span>
                    </div>
                    <div className="text-[11px] text-[rgb(var(--color-text-muted))] mt-1 leading-snug">{translations.profileStreakDesc}</div>
                </div>
            </div>
        </div>
    );
}
