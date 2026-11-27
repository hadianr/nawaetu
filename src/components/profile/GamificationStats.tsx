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

import { Flame, Gift } from "@/components/ui/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { StageCard } from "@/components/progress/StageCard";

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

    return (
        <div className="flex flex-col gap-3 mb-6">
            <StageCard t={translations} stats={stats} />

            <Link
                href="/rewards"
                className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors shadow-[var(--shadow-card)]",
                    "border-[rgb(var(--color-accent))]/30 bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent-strong))] hover:bg-[rgb(var(--color-accent))]/20"
                )}
            >
                <Gift className="h-4 w-4" />
                {translations.rewards.cta}
            </Link>

            {/* Streak Row (Full Width) */}
            <div className={cn(
                "rounded-2xl p-4 flex items-center gap-4 border transition-all shadow-[var(--shadow-card)]",
                "bg-[rgb(var(--color-surface-subtle))] border-[rgb(var(--color-border))]"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center transition-all",
                    "bg-[rgb(var(--color-primary))]/15"
                )}>
                    <Flame className="w-6 h-6 text-[rgb(var(--color-primary-strong))]" />
                </div>
                <div>
                    <div className="flex items-end gap-2">
                        {stats.streak > 0 ? (
                            <>
                                <span className="text-2xl font-bold leading-none text-[rgb(var(--color-text-strong))]">{stats.streak}</span>
                                <span className="text-xs text-[rgb(var(--color-text-muted))] font-medium mb-[2px]">{translations.profileDays}</span>
                            </>
                        ) : (
                            // A lapsed streak reads as an invitation, not a big zero.
                            <span className="text-lg font-bold leading-none text-[rgb(var(--color-text-strong))]">{translations.stats.journey.streakRestart}</span>
                        )}
                    </div>
                    <div className="text-xs text-[rgb(var(--color-text-muted))] mt-1 leading-snug">{translations.profileStreakDesc}</div>
                </div>
            </div>
        </div>
    );
}
