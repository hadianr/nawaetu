"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import JourneyHero from "@/components/home/JourneyHero";
import DalilBadge from "@/components/ramadhan/DalilBadge";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/context/LocaleContext";
import { dalilRef, JOURNEY_GOAL_EVIDENCE, JOURNEY_PHASE_EVIDENCE } from "@/data/ramadhan-journey";
import { cn } from "@/lib/utils";
import { getPhaseProgress, JOURNEY_DAYS, type JourneyPhase } from "@/lib/ramadhan-journey";

const PHASES: { phase: JourneyPhase; from: number; to: number; title: string; desc: string; goal: string }[] = [
    { phase: "reset", from: 100, to: 71, title: "journeyPhaseResetShort", desc: "journeyPhaseReset", goal: "journeyPhaseGoalReset" },
    { phase: "build", from: 70, to: 31, title: "journeyPhaseBuildShort", desc: "journeyPhaseBuild", goal: "journeyPhaseGoalBuild" },
    { phase: "sharpen", from: 30, to: 1, title: "journeyPhaseSharpenShort", desc: "journeyPhaseSharpen", goal: "journeyPhaseGoalSharpen" },
];

const fill = (template: unknown, values: Record<string, number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), String(template));

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phase: JourneyPhase;
    dayNumber: number;
}

/** Same look as the streak dialog: gradient hero with a Lottie moment, bordered tiles below. */
export default function JourneyAboutDialog({ open, onOpenChange, phase, dayNumber }: Props) {
    const { t, locale } = useLocale();
    const [expanded, setExpanded] = useState<JourneyPhase | null>(phase);
    const label = (evidence: Parameters<typeof dalilRef>[0]) => `${String(t.journeyDalilPrefix)}: ${dalilRef(evidence, locale)}`;
    const daysLeft = JOURNEY_DAYS - dayNumber + 1;
    const currentIndex = PHASES.findIndex(item => item.phase === phase);
    const progress = getPhaseProgress(phase, daysLeft);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                closeLabel={String(t.journeyAboutClose)}
                className="max-h-[calc(100dvh-7rem)] max-w-[min(26rem,calc(100%-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-surface))] p-0 text-[rgb(var(--color-text-strong))] motion-reduce:animate-none"
            >
                <JourneyHero
                    title={<DialogTitle className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--color-primary-foreground))]">{String(t.journeyAboutTitle)}</DialogTitle>}
                    daysLeft={daysLeft}
                    sub={fill(t.journeyDayOf, { day: dayNumber, total: JOURNEY_DAYS })}
                />

                <div className="space-y-4 overflow-y-auto p-5">
                    <DialogDescription className="text-sm leading-relaxed text-[rgb(var(--color-text))]">
                        {String(t.journeyAboutIntroShort)}
                    </DialogDescription>

                    <ol className="space-y-2" aria-label={String(t.journeyAboutPhases)}>
                        {PHASES.map((item, index) => {
                            const current = item.phase === phase;
                            const done = index < currentIndex;
                            const isOpen = expanded === item.phase;
                            return (
                                <li
                                    key={item.phase}
                                    aria-current={current ? "step" : undefined}
                                    className={cn(
                                        "rounded-xl border p-3 transition-colors motion-reduce:transition-none",
                                        current
                                            ? "border-[rgb(var(--color-primary))]/40 bg-[rgb(var(--color-primary))]/10"
                                            : "border-[rgb(var(--color-border))]/20 bg-[rgb(var(--color-surface-subtle))]",
                                    )}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => setExpanded(isOpen ? null : item.phase)}
                                        className="flex min-h-11 w-full items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                                    >
                                        <span
                                            className={cn(
                                                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                                                done
                                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]"
                                                    : current
                                                        ? "border-2 border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-light))]"
                                                        : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]",
                                            )}
                                        >
                                            {done ? <Check className="size-4" aria-label={String(t.journeyAboutPhaseDone)} /> : index + 1}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                {String(t[item.title])}
                                                {current && <span className="ml-2 text-xs font-medium text-[rgb(var(--color-primary-light))]">· {String(t.journeyAboutHere)}</span>}
                                            </span>
                                            <span className="block text-xs text-[rgb(var(--color-text-muted))]">
                                                {String(t.journeyPhaseRange).replace("{from}", String(item.from)).replace("{to}", String(item.to))}
                                            </span>
                                        </span>
                                        <ChevronDown className={cn("size-4 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} aria-hidden="true" />
                                    </button>

                                    {current && (
                                        <div className="mt-2 space-y-1">
                                            <Progress
                                                value={(progress.day / progress.total) * 100}
                                                className="h-1.5 bg-[rgb(var(--color-text-muted))]/25"
                                                aria-label={fill(t.journeyPhaseProgress, { day: progress.day, total: progress.total })}
                                            />
                                            <p className="text-xs text-[rgb(var(--color-text))]">{fill(t.journeyPhaseProgress, { day: progress.day, total: progress.total })}</p>
                                        </div>
                                    )}

                                    {isOpen && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm font-medium">{String(t[item.goal])}</p>
                                            <p className="text-sm leading-relaxed text-[rgb(var(--color-text))]">{String(t[item.desc])}</p>
                                            <div className="flex flex-wrap gap-x-4">
                                                {JOURNEY_PHASE_EVIDENCE[item.phase].map(evidence => (
                                                    <DalilBadge key={evidence.id} dalil={evidence} variant="link" label={label(evidence)} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>

                    <div className="rounded-xl border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-muted))]">{String(t.journeyAboutGoal)}</p>
                        <DalilBadge dalil={JOURNEY_GOAL_EVIDENCE} variant="link" label={label(JOURNEY_GOAL_EVIDENCE)} />
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-[rgb(var(--color-primary))]/15 bg-[rgb(var(--color-primary))]/5 p-3 text-sm text-[rgb(var(--color-text))]">
                        <AnimatedCheck className="mt-0.5 size-5 shrink-0 text-[rgb(var(--color-primary))]" />
                        <div className="space-y-1">
                            <p className="font-medium text-[rgb(var(--color-text-strong))]">{String(t.journeyAboutObligations)}</p>
                            <p>{String(t.journeyAboutLate)}</p>
                        </div>
                    </div>

                    <Button size="lg" className="w-full rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={() => onOpenChange(false)}>
                        {String(t.journeyAboutGotIt)}
                    </Button>

                    {/* The honest fine print stays, but small: it is a footnote, not the opening line. */}
                    <p className="text-[11px] leading-relaxed text-[rgb(var(--color-text-muted))]">
                        {String(t.journeyAboutIntro)} {String(t.journeyAboutReview)}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
