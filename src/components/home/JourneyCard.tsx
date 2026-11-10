"use client";

import { useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ChevronRight, Flame, Info } from "lucide-react";
import JourneyAboutDialog from "@/components/home/JourneyAboutDialog";
import JourneyMilestoneDialog from "@/components/home/JourneyMilestoneDialog";
import DalilBadge from "@/components/ramadhan/DalilBadge";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import { Button } from "@/components/ui/button";
import LottieMoment from "@/components/ui/LottieMoment";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { getStreakRepository } from "@/core/repositories/streak.repository";
import { dalilRef, getJourneyHabit } from "@/data/ramadhan-journey";
import StreakWeek from "@/components/streak/StreakWeek";
import { useStreak } from "@/hooks/useStreak";
import { useStreakDates } from "@/hooks/useStreakDates";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import { getRamadhanJourney, JOURNEY_DAYS } from "@/lib/ramadhan-journey";
import { DateUtils } from "@/lib/utils/date";

const StreakDetails = dynamic(() => import("@/components/StreakBadge"), { ssr: false });

const RING_RADIUS = 30;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const PHASE_SHORT = {
    reset: "journeyPhaseResetShort",
    build: "journeyPhaseBuildShort",
    sharpen: "journeyPhaseSharpenShort",
} as const;

const PHASE_LONG = {
    reset: "journeyPhaseReset",
    build: "journeyPhaseBuild",
    sharpen: "journeyPhaseSharpen",
} as const;

const fill = (template: unknown, values: Record<string, number>) =>
    Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), String(template));

export default function JourneyCard() {
    const { t, locale } = useLocale();
    const storage = getStorageService();
    // Loaded with ssr:false, so reading storage in initial state cannot cause a hydration mismatch.
    const [adjustment, setAdjustment] = useState(() =>
        parseHijriAdjustment(storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT)),
    );
    const [aboutOpen, setAboutOpen] = useState(false);
    const [streakOpen, setStreakOpen] = useState(false);
    // Logged-in streaks refresh after a sync, so the press shows at once; a reload trusts only the streak.
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
        const onChange = (event: Event) => {
            const detail = (event as CustomEvent<{ adjustment?: string | number }>).detail;
            setAdjustment(parseHijriAdjustment(detail?.adjustment));
        };
        window.addEventListener("hijri_adjustment_changed", onChange);
        return () => window.removeEventListener("hijri_adjustment_changed", onChange);
    }, []);

    const journey = useMemo(() => getRamadhanJourney(new Date(), adjustment), [adjustment]);
    // The streak is the only record of a counted day, so the card never disagrees with the streak badge.
    const { activeDates } = useStreakDates();
    const { streak, display } = useStreak();
    if (!journey.active || !journey.phase) return null;

    const today = DateUtils.today();
    const doneToday = pressed || activeDates.has(today);
    const hasHistory = activeDates.size > 0 || streak.longestStreak > 0;
    const { copyKey, evidence } = getJourneyHabit(journey.phase, journey.dayNumber);
    const lateJoin = journey.dayNumber > 7 && !hasHistory;
    const finalStretch = journey.daysLeft <= 10;

    const markDone = () => {
        setPressed(true);
        // One streak, one set of freezes: the journey counts as a qualifying day like any mission.
        getStreakRepository().updateStreak();
    };

    return (
        <MotionConfig reducedMotion="user">
            <section
                aria-label={String(t.journeyTitle)}
                aria-describedby="journey-phase-desc"
                className="w-full rounded-2xl border border-[rgb(var(--color-border))]/15 bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-card)]"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text))]">
                            {String(t.journeyTitle)}
                        </h2>
                        {/* Plain text, not a pill: it names the phase; it is not a button. */}
                        <p className="mt-0.5 text-sm font-medium text-[rgb(var(--color-text-strong))]">
                            {String(t[PHASE_SHORT[journey.phase]])}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAboutOpen(true)}
                        aria-label={String(t.journeyAboutOpen)}
                        className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text))] outline-none transition-colors hover:bg-[rgb(var(--color-surface-subtle))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                    >
                        <Info className="size-5" aria-hidden="true" />
                    </button>
                </div>
                <p id="journey-phase-desc" className="sr-only">{String(t[PHASE_LONG[journey.phase]])}</p>

                <div className="mt-3 flex items-center gap-4">
                    <div
                        className="relative size-[76px] shrink-0"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={JOURNEY_DAYS}
                        aria-valuenow={journey.dayNumber}
                        aria-valuetext={fill(t.journeyRingLabel, { day: journey.dayNumber, total: JOURNEY_DAYS, days: journey.daysLeft })}
                    >
                        <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden="true">
                            <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-[rgb(var(--color-text-muted))]/25" />
                            <motion.circle
                                cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="6" strokeLinecap="round"
                                className={finalStretch ? "stroke-[rgb(var(--color-accent))]" : "stroke-[rgb(var(--color-primary))]"}
                                strokeDasharray={RING_LENGTH}
                                initial={{ strokeDashoffset: RING_LENGTH }}
                                animate={{ strokeDashoffset: RING_LENGTH * (1 - journey.dayNumber / JOURNEY_DAYS) }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                            <span className="text-[26px] font-semibold leading-none text-[rgb(var(--color-text-strong))]">{journey.daysLeft}</span>
                            <span className="mt-0.5 text-[11px] text-[rgb(var(--color-text))]">
                                {String(journey.daysLeft === 1 ? t.journeyDayUnitOne : t.journeyDaysUnit)}
                            </span>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs text-[rgb(var(--color-text))]">{String(t.journeyTodayLabel)}</p>
                        <p className="mt-1 text-[15px] leading-snug text-[rgb(var(--color-text))]">{String(t[copyKey])}</p>
                        {evidence && (
                            <DalilBadge
                                dalil={evidence}
                                variant="link"
                                label={`${String(t.journeyDalilPrefix)}: ${dalilRef(evidence, locale)}`}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    {doneToday ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                            role="status"
                            className="flex min-h-12 items-center gap-2 rounded-xl bg-[rgb(var(--color-primary))]/15 px-4 text-sm text-[rgb(var(--color-text))]"
                        >
                            <LottieMoment
                                src="/lottie/flame.lottie"
                                className="size-9 shrink-0"
                                fallback={<AnimatedCheck className="size-5 shrink-0 text-[rgb(var(--color-primary))]" />}
                            />
                            {String(t.journeyDone)}
                        </motion.div>
                    ) : (
                        <>
                            <Button size="lg" className="w-full rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={markDone}>
                                {String(t.journeyMarkDone)}
                            </Button>
                            {lateJoin && (
                                <p className="mt-2 text-xs text-[rgb(var(--color-text))]">{String(t.journeyLateJoin)}</p>
                            )}
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setStreakOpen(true)}
                    aria-label={String(t.streakOpenDetails).replace("{count}", String(display.streak))}
                    className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                >
                    <Flame
                        className={`size-5 shrink-0 ${doneToday ? "fill-current text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-muted))]"}`}
                        aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tabular-nums text-[rgb(var(--color-text-strong))]">
                            {display.streak} {String(t.streakDayCount)}
                        </span>
                        {!doneToday && (
                            <span className="block text-xs text-[rgb(var(--color-text))]">
                                {String(display.streak > 0 ? t.streakAtRisk : display.isLost ? t.streakLostRestart : t.streakStart)}
                            </span>
                        )}
                    </span>
                    <StreakWeek compact />
                    <ChevronRight className="size-4 shrink-0 text-[rgb(var(--color-text-muted))]" aria-hidden="true" />
                </button>
            </section>
            <JourneyAboutDialog open={aboutOpen} onOpenChange={setAboutOpen} phase={journey.phase} dayNumber={journey.dayNumber} />
            <JourneyMilestoneDialog daysLeft={journey.daysLeft} dayNumber={journey.dayNumber} hadStreak={hasHistory} />
            {streakOpen && <StreakDetails modalOnly celebrate={false} open onOpenChange={setStreakOpen} />}
        </MotionConfig>
    );
}
