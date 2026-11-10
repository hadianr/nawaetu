"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronRight, Flame, Info } from "lucide-react";
import JourneyAboutDialog from "@/components/home/JourneyAboutDialog";
import JourneyFasting from "@/components/home/JourneyFasting";
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
import { isAutoHabitDone } from "@/lib/journey-auto";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import { getPhaseProgress, getRamadhanJourney, JOURNEY_DAYS } from "@/lib/ramadhan-journey";
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

const PHASE_GOAL = {
    reset: "journeyPhaseGoalReset",
    build: "journeyPhaseGoalBuild",
    sharpen: "journeyPhaseGoalSharpen",
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
    // Collapsed by default: Home already has many cards. The dot on the toggle says the details have something for today.
    const [expanded, setExpanded] = useState(false);
    const [fastingVisible, setFastingVisible] = useState(false);
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

    // Quran and Tasbih write plain storage without an event, so re-read when the user comes back to this tab.
    const [autoTick, setAutoTick] = useState(0);
    useEffect(() => {
        const refresh = () => { if (document.visibilityState === "visible") setAutoTick(tick => tick + 1); };
        document.addEventListener("visibilitychange", refresh);
        window.addEventListener("focus", refresh);
        return () => {
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, []);
    const countedRef = useRef(false);

    const journey = useMemo(() => getRamadhanJourney(new Date(), adjustment), [adjustment]);
    // The streak is the only record of a counted day, so the card never disagrees with the streak badge.
    const { activeDates } = useStreakDates();
    const { streak, display } = useStreak();

    const today = DateUtils.today();
    const habit = journey.phase ? getJourneyHabit(journey.phase, journey.dayNumber) : null;
    // `autoTick` is only a re-read trigger.
    const autoDone = autoTick >= 0 && isAutoHabitDone(habit?.auto ?? null, today);
    const alreadyCounted = activeDates.has(today);
    // Reading or dhikr that the app recorded is a real deed of the day: it counts for the one streak, once.
    useEffect(() => {
        if (!autoDone || alreadyCounted || countedRef.current) return;
        countedRef.current = true;
        getStreakRepository().updateStreak();
    }, [autoDone, alreadyCounted]);
    if (!journey.active || !journey.phase || !habit) return null;

    const { copyKey, evidence, auto } = habit;
    const doneToday = pressed || autoDone || alreadyCounted;
    const hasHistory = activeDates.size > 0 || streak.longestStreak > 0;
    const lateJoin = journey.dayNumber > 7 && !hasHistory;
    const finalStretch = journey.daysLeft <= 10;

    const markDone = () => {
        setPressed(true);
        // One streak, one set of freezes: the journey counts as a qualifying day like any mission.
        getStreakRepository().updateStreak();
    };

    const progress = getPhaseProgress(journey.phase, journey.daysLeft);

    return (
        <MotionConfig reducedMotion="user">
            <section
                aria-label={String(t.journeyTitle)}
                aria-describedby="journey-phase-desc"
                className="w-full rounded-2xl border border-[rgb(var(--color-border))]/15 bg-[rgb(var(--color-surface))] p-3 shadow-[var(--shadow-card)]"
            >
                <p id="journey-phase-desc" className="sr-only">{String(t[PHASE_LONG[journey.phase]])}</p>

                <div className="flex items-center gap-3">
                    <div
                        className="relative size-12 shrink-0"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={JOURNEY_DAYS}
                        aria-valuenow={journey.dayNumber}
                        aria-valuetext={fill(t.journeyRingLabel, { day: journey.dayNumber, total: JOURNEY_DAYS, days: journey.daysLeft })}
                    >
                        <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden="true">
                            <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="7" className="stroke-[rgb(var(--color-text-muted))]/25" />
                            <motion.circle
                                cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="7" strokeLinecap="round"
                                className={finalStretch ? "stroke-[rgb(var(--color-accent))]" : "stroke-[rgb(var(--color-primary))]"}
                                strokeDasharray={RING_LENGTH}
                                initial={{ strokeDashoffset: RING_LENGTH }}
                                animate={{ strokeDashoffset: RING_LENGTH * (1 - journey.dayNumber / JOURNEY_DAYS) }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[17px] font-semibold leading-none text-[rgb(var(--color-text-strong))]" aria-hidden="true">
                            {journey.daysLeft}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--color-text))]">
                            {String(t.journeyTitle)}
                        </h2>
                        {/* Plain text, not a pill: it names the phase; it is not a button. */}
                        <p className="truncate text-sm font-medium text-[rgb(var(--color-text-strong))]">
                            {String(t[PHASE_SHORT[journey.phase]])}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setExpanded(open => !open)}
                        aria-expanded={expanded}
                        aria-controls="journey-details"
                        aria-label={String(expanded ? t.journeyCollapse : t.journeyExpand)}
                        className="relative -my-2 -mr-1 flex size-11 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text))] outline-none transition-colors hover:bg-[rgb(var(--color-surface-subtle))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                    >
                        <ChevronDown className={`size-5 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                        {fastingVisible && !expanded && (
                            <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-[rgb(var(--color-accent))]" />
                        )}
                    </button>
                </div>

                <div className="mt-2 flex items-center gap-3">
                    <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-[rgb(var(--color-text))]">{String(t[copyKey])}</p>
                    {doneToday ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                            role="status"
                            className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-[rgb(var(--color-primary))]/15 pl-1 pr-3 text-sm text-[rgb(var(--color-text))]"
                        >
                            <LottieMoment
                                src="/lottie/flame.lottie"
                                className="size-8 shrink-0"
                                fallback={<AnimatedCheck className="size-5 shrink-0 text-[rgb(var(--color-primary))]" />}
                            />
                            {String(t.journeyDoneShort)}
                        </motion.div>
                    ) : auto ? (
                        <Button asChild size="sm" className="min-h-11 shrink-0 rounded-xl text-[rgb(var(--color-accent-foreground))]">
                            <Link href={auto.href}>{String(auto.source === "quran" ? t.journeyOpenQuran : t.journeyOpenDhikr)}</Link>
                        </Button>
                    ) : (
                        <Button size="sm" className="min-h-11 shrink-0 rounded-xl text-[rgb(var(--color-accent-foreground))]" onClick={markDone}>
                            {String(t.journeyMarkDone)}
                        </Button>
                    )}
                </div>

                {/* Mounted while collapsed so the fasting row can tell the toggle it has something to say. */}
                <div id="journey-details" hidden={!expanded} className="mt-3 border-t border-[rgb(var(--color-border))]/15 pt-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-xs leading-relaxed text-[rgb(var(--color-text))]">
                            {fill(t.journeyPhaseProgress, { day: progress.day, total: progress.total })} {String(t[PHASE_GOAL[journey.phase]])}
                        </p>
                        <button
                            type="button"
                            onClick={() => setAboutOpen(true)}
                            aria-label={String(t.journeyAboutOpen)}
                            className="-mr-2 -mt-3 flex size-11 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text))] outline-none transition-colors hover:bg-[rgb(var(--color-surface-subtle))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                        >
                            <Info className="size-5" aria-hidden="true" />
                        </button>
                    </div>
                    {evidence && (
                        <DalilBadge
                            dalil={evidence}
                            variant="link"
                            label={`${String(t.journeyDalilPrefix)}: ${dalilRef(evidence, locale)}`}
                        />
                    )}
                    {auto && !doneToday && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3">
                            <p className="text-xs text-[rgb(var(--color-text))]">{String(auto.source === "quran" ? t.journeyAutoQuran : t.journeyAutoDhikr)}</p>
                            {/* Read from a printed mushaf or counted on beads: Nawaetu cannot see it, so the user can still say so. */}
                            <button type="button" onClick={markDone} className="min-h-11 text-xs font-medium text-[rgb(var(--color-text))] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                                {String(t.journeyMarkDone)}
                            </button>
                        </div>
                    )}
                    {lateJoin && !doneToday && (
                        <p className="mt-1 text-xs text-[rgb(var(--color-text))]">{String(t.journeyLateJoin)}</p>
                    )}

                    <JourneyFasting adjustment={adjustment} onVisible={setFastingVisible} />

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
                            <span className="block text-xs text-[rgb(var(--color-text))]">
                                {String(doneToday
                                    ? t.journeyDone
                                    : display.streak > 0 ? t.streakAtRisk : display.isLost ? t.streakLostRestart : t.streakStart)}
                            </span>
                        </span>
                        <StreakWeek compact />
                        <ChevronRight className="size-4 shrink-0 text-[rgb(var(--color-text-muted))]" aria-hidden="true" />
                    </button>
                </div>
            </section>
            <JourneyAboutDialog open={aboutOpen} onOpenChange={setAboutOpen} phase={journey.phase} dayNumber={journey.dayNumber} />
            <JourneyMilestoneDialog daysLeft={journey.daysLeft} dayNumber={journey.dayNumber} hadStreak={hasHistory} />
            {streakOpen && <StreakDetails modalOnly celebrate={false} open onOpenChange={setStreakOpen} />}
        </MotionConfig>
    );
}
