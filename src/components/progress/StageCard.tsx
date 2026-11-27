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

"use client";

import { useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import type { TranslationTree } from "@/context/LocaleContext";
import { STAGES, getStageIndex } from "@/lib/habits/progression";
import { cn } from "@/lib/utils";
import { STAGE_ICONS, StageGuide } from "./StageGuide";

interface StageCardProps {
    t: TranslationTree;
    stats: { level: number; hasanah: number; nextLevelHasanah: number; progress: number };
    className?: string;
}

/** The one place level and stage are shown, in stats and in the profile. */
export function StageCard({ t, stats, className }: StageCardProps) {
    const [guideOpen, setGuideOpen] = useState(false);
    const j = t.stats.journey;
    const index = Math.max(0, getStageIndex(stats.level));
    const stage = STAGES[index];
    const copy = t.stats.stages[stage.key];
    const next = STAGES[index + 1];
    const toNext = Math.max(0, stats.nextLevelHasanah - stats.hasanah);

    return (
        <section
            aria-labelledby="stage-card-name"
            className={cn("rounded-2xl border border-[rgb(var(--color-border))] bg-gradient-to-br from-[rgb(var(--color-primary))]/15 via-[rgb(var(--color-surface))] to-[rgb(var(--color-surface-subtle))] p-4 shadow-[var(--shadow-card)]", className)}
        >
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]">
                    <AppIcon name={STAGE_ICONS[stage.key]} size="md" tone="primary" />
                </span>
                <div className="min-w-0 flex-1">
                    {/* The level sits on this line, not beside the text, so the text keeps the full width. */}
                    <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-[rgb(var(--color-text-muted))]">
                        {j.stageOf.replace("{{n}}", String(index + 1)).replace("{{total}}", String(STAGES.length))}
                        <span className="rounded-md border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary))]/15 px-1.5 font-bold text-[rgb(var(--color-primary-strong))]">
                            {j.level.replace("{{level}}", String(stats.level))}
                        </span>
                    </p>
                    <h2 id="stage-card-name" className="text-lg font-bold leading-tight text-[rgb(var(--color-text-strong))]">{copy.name}</h2>
                </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--color-text))]">{copy.about}</p>

            <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(stats.progress)}
                aria-label={j.toNextLevel.replace("{{n}}", toNext.toLocaleString()).replace("{{level}}", String(stats.level + 1))}
            >
                <div className="h-full rounded-full bg-[rgb(var(--color-primary))] transition-all duration-700" style={{ width: `${stats.progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-[rgb(var(--color-text-muted))]">
                {j.toNextLevel.replace("{{n}}", toNext.toLocaleString()).replace("{{level}}", String(stats.level + 1))}
            </p>

            <div className="mt-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] px-3 py-2">
                <p className="text-xs font-bold text-[rgb(var(--color-primary-strong))]">{j.focus}</p>
                <p className="text-sm leading-relaxed text-[rgb(var(--color-text))]">{copy.focus}</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">
                    {next
                        ? j.nextStage.replace("{{name}}", t.stats.stages[next.key].name).replace("{{level}}", String(next.fromLevel))
                        : j.lastStage}
                </p>
                <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[rgb(var(--color-primary-strong))] underline-offset-4 hover:underline"
                >
                    <AppIcon name="help" size="sm" tone="primary" />
                    {j.howItWorks}
                </button>
            </div>

            <StageGuide t={t} stageIndex={index} open={guideOpen} onOpenChange={setGuideOpen} />
        </section>
    );
}
