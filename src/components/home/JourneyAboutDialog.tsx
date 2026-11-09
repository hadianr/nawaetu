"use client";

import DalilBadge from "@/components/ramadhan/DalilBadge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/context/LocaleContext";
import { dalilRef, JOURNEY_GOAL_EVIDENCE, JOURNEY_PHASE_EVIDENCE } from "@/data/ramadhan-journey";
import { JOURNEY_DAYS, type JourneyPhase } from "@/lib/ramadhan-journey";

const PHASES: { phase: JourneyPhase; from: number; to: number; title: string; desc: string }[] = [
    { phase: "reset", from: 100, to: 71, title: "journeyPhaseResetShort", desc: "journeyPhaseReset" },
    { phase: "build", from: 70, to: 31, title: "journeyPhaseBuildShort", desc: "journeyPhaseBuild" },
    { phase: "sharpen", from: 30, to: 1, title: "journeyPhaseSharpenShort", desc: "journeyPhaseSharpen" },
];

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phase: JourneyPhase;
    dayNumber: number;
}

export default function JourneyAboutDialog({ open, onOpenChange, phase, dayNumber }: Props) {
    const { t, locale } = useLocale();
    const label = (evidence: Parameters<typeof dalilRef>[0]) => `${String(t.journeyDalilPrefix)}: ${dalilRef(evidence, locale)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                closeLabel={String(t.journeyAboutClose)}
                className="max-h-[85vh] max-w-[min(28rem,calc(100%-2rem))] gap-4 overflow-y-auto"
            >
                <DialogTitle className="pr-8 text-lg text-[rgb(var(--color-text-strong))]">{String(t.journeyAboutTitle)}</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-[rgb(var(--color-text))]">
                    {String(t.journeyAboutIntro)}
                </DialogDescription>

                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text))]">{String(t.journeyAboutGoal)}</h3>
                    <DalilBadge dalil={JOURNEY_GOAL_EVIDENCE} variant="link" label={label(JOURNEY_GOAL_EVIDENCE)} />
                </section>

                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text))]">{String(t.journeyAboutPhases)}</h3>
                    <ol className="mt-2 space-y-3">
                        {PHASES.map(item => {
                            const current = item.phase === phase;
                            return (
                                <li
                                    key={item.phase}
                                    aria-current={current ? "step" : undefined}
                                    className={`rounded-xl border p-3 ${current ? "border-[rgb(var(--color-primary))]" : "border-[rgb(var(--color-border))]/20"}`}
                                >
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-strong))]">
                                        {String(t[item.title])}
                                        {current && <span className="ml-2 text-xs font-medium text-[rgb(var(--color-primary-strong))]">· {String(t.journeyAboutHere)}</span>}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text))]">
                                        {String(t.journeyPhaseRange).replace("{from}", String(item.from)).replace("{to}", String(item.to))}
                                    </p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-[rgb(var(--color-text))]">{String(t[item.desc])}</p>
                                    <div className="flex flex-wrap gap-x-4">
                                        {JOURNEY_PHASE_EVIDENCE[item.phase].map(evidence => (
                                            <DalilBadge key={evidence.id} dalil={evidence} variant="link" label={label(evidence)} />
                                        ))}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <p className="text-sm font-medium text-[rgb(var(--color-text-strong))]">
                    {String(t.journeyAboutDayNow).replace("{day}", String(dayNumber)).replace("{total}", String(JOURNEY_DAYS))}
                </p>
                <p className="text-sm leading-relaxed text-[rgb(var(--color-text))]">{String(t.journeyAboutLate)}</p>
                <p className="text-xs leading-relaxed text-[rgb(var(--color-text))]">{String(t.journeyAboutReview)}</p>
            </DialogContent>
        </Dialog>
    );
}
