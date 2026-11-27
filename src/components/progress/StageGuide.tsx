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

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/AppIcon";
import type { TranslationTree } from "@/context/LocaleContext";
import { STAGES, type StageKey } from "@/lib/habits/progression";
import type { AppIconName } from "@/lib/icon-names";
import { cn } from "@/lib/utils";

export const STAGE_ICONS: Record<StageKey, AppIconName> = {
    start: "compass",
    habit: "calendar-heart",
    onTime: "clock",
    add: "sparkles",
    deepen: "book-heart",
    steady: "shield-check",
    share: "hand-heart",
};

interface StageGuideProps {
    t: TranslationTree;
    stageIndex: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** How levels work, every stage with the reader's own marked, and what Hasanah is not. */
export function StageGuide({ t, stageIndex, open, onOpenChange }: StageGuideProps) {
    const j = t.stats.journey;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                closeLabel={j.close}
                className="max-h-[90dvh] overflow-y-auto border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]"
            >
                <DialogHeader>
                    <DialogTitle className="pr-12 text-left text-lg font-bold text-[rgb(var(--color-text-strong))]">{j.guideTitle}</DialogTitle>
                    <DialogDescription className="text-left text-sm leading-relaxed text-[rgb(var(--color-text))]">{j.guideIntro}</DialogDescription>
                </DialogHeader>

                <ol className="space-y-2 text-sm leading-relaxed">
                    {[j.rule1, j.rule2, j.rule3].map((rule, i) => (
                        <li key={rule} className="flex gap-2.5">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))]/15 text-xs font-bold text-[rgb(var(--color-primary-strong))]">{i + 1}</span>
                            <span>{rule}</span>
                        </li>
                    ))}
                </ol>

                <section aria-labelledby="stage-guide-stages">
                    <h3 id="stage-guide-stages" className="mb-2 text-xs font-bold text-[rgb(var(--color-text-muted))]">{j.stagesTitle}</h3>
                    <ol className="space-y-2">
                        {STAGES.map((stage, i) => {
                            const copy = t.stats.stages[stage.key];
                            const next = STAGES[i + 1];
                            const current = i === stageIndex;
                            return (
                                <li
                                    key={stage.key}
                                    aria-current={current ? "step" : undefined}
                                    className={cn(
                                        "rounded-[var(--radius-card)] border p-3",
                                        current
                                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10"
                                            : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))]",
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <AppIcon name={STAGE_ICONS[stage.key]} size="sm" tone={current ? "primary" : "muted"} />
                                        <span className="text-sm font-bold text-[rgb(var(--color-text-strong))]">{i + 1}. {copy.name}</span>
                                        <span className="ml-auto shrink-0 text-xs text-[rgb(var(--color-text-muted))]">
                                            {next
                                                ? j.levels.replace("{{from}}", String(stage.fromLevel)).replace("{{to}}", String(next.fromLevel - 1))
                                                : j.levelsFrom.replace("{{from}}", String(stage.fromLevel))}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--color-text))]">{copy.about}</p>
                                    {current && (
                                        <>
                                            <p className="mt-2 text-xs font-bold text-[rgb(var(--color-primary-strong))]">{j.youAreHere}</p>
                                            <p className="mt-1 text-xs italic leading-relaxed text-[rgb(var(--color-text-muted))]">{copy.reminder}</p>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section className="rounded-[var(--radius-card)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] p-3" aria-labelledby="stage-guide-hasanah">
                    <h3 id="stage-guide-hasanah" className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--color-text-strong))]">
                        <AppIcon name="help" size="sm" tone="primary" />
                        {j.disclaimerTitle}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--color-text))]">{j.disclaimer}</p>
                    <p className="mt-2 text-xs italic leading-relaxed text-[rgb(var(--color-primary-strong))]">{j.disclaimerQuote}</p>
                </section>

                <Button className="min-h-11 w-full" onClick={() => onOpenChange(false)}>{j.close}</Button>
            </DialogContent>
        </Dialog>
    );
}
