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

import Link from "next/link";
import { Flame, ChevronRight } from "@/components/ui/icons";
import { AppIcon } from "@/components/ui/AppIcon";
import { useLocale } from "@/context/LocaleContext";
import type { TranslationTree } from "@/context/LocaleContext";
import { STAGES, getStageIndex } from "@/lib/habits/progression";
import { STAGE_ICONS } from "@/components/progress/StageGuide";

interface GamificationStatsProps {
    stats: {
        streak: number;
        level: number;
        hasanah: number;
        nextLevelHasanah: number;
        progress: number;
    };
}

/**
 * The profile only summarises: stage, level and streak in one row that opens /stats,
 * where the full journey (progress, focus, guide, streak detail) lives.
 */
export function GamificationStats({ stats }: GamificationStatsProps) {
    const { t } = useLocale();
    const j = (t as TranslationTree).stats.journey;
    const index = Math.max(0, getStageIndex(stats.level));
    const stage = STAGES[index];

    return (
        <Link
            href="/stats"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-4 shadow-[var(--shadow-card)] transition-colors hover:border-[rgb(var(--color-primary))]/40"
        >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary))]/15">
                <AppIcon name={STAGE_ICONS[stage.key]} size="md" tone="primary" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-xs text-[rgb(var(--color-text-muted))]">
                    {j.stageOf.replace("{{n}}", String(index + 1)).replace("{{total}}", String(STAGES.length))} · {j.level.replace("{{level}}", String(stats.level))}
                </span>
                <span className="block truncate text-base font-bold text-[rgb(var(--color-text-strong))]">{(t as TranslationTree).stats.stages[stage.key].name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-[rgb(var(--color-text-muted))]">
                    <Flame className="size-3.5 text-[rgb(var(--color-accent-strong))]" aria-hidden="true" />
                    {stats.streak > 0 ? j.streakDays.replace("{{n}}", String(stats.streak)) : j.streakRestart}
                </span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[rgb(var(--color-primary-strong))]">
                {j.seeJourney}
                <ChevronRight className="size-4" aria-hidden="true" />
            </span>
        </Link>
    );
}
