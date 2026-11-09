"use client";

import { useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Info } from "lucide-react";
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
import { useStreakDates } from "@/hooks/useStreakDates";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import { getRamadhanJourney, getRecentDays, JOURNEY_DAYS } from "@/lib/ramadhan-journey";
import { DateUtils } from "@/lib/utils/date";

const HISTORY_LIMIT = 30;
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
    const [doneDates, setDoneDates] = useState<string[]>(() => {
        const saved = storage.getOptional<string[]>(STORAGE_KEYS.JOURNEY_DONE_DATES);
        return Array.isArray(saved) ? saved : [];
    });

    useEffect(() => {
        const onChange = (event: Event) => {
            const detail = (event as CustomEvent<{ adjustment?: string | number }>).detail;
            setAdjustment(parseHijriAdjustment(detail?.adjustment));
        };
        window.addEventListener("hijri_adjustment_changed", onChange);
        return () => window.removeEventListener("hijri_adjustment_changed", onChange);
    }, []);

    const journey = useMemo(() => getRamadhanJourney(new Date(), adjustment), [adjustment]);
    // The strip is the streak itself (any habit counts), so it always agrees with the streak badge.
    const { activeDates } = useStreakDates();
    const strip = useMemo(() => getRecentDays(new Date(), [...activeDates]), [activeDates]);
    if (!journey.active || !journey.phase) return null;

    const today = DateUtils.today();
    const doneToday = doneDates.includes(today);
    const doneInStrip = strip.filter(day => day.done).length;
    const { copyKey, evidence } = getJourneyHabit(journey.phase, journey.dayNumber);
    const lateJoin = journey.dayNumber > 7 && doneDates.length === 0;
    const finalStretch = journey.daysLeft <= 10;
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" });

    const markDone = () => {
        const next = [...doneDates, today].slice(-HISTORY_LIMIT);
        storage.set(STORAGE_KEYS.JOURNEY_DONE_DATES, next);
        setDoneDates(next);
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

                <div className="mt-3 flex items-center justify-between gap-3">
                    <ul className="flex items-center gap-2" aria-label={String(t.journeyStripLabel)}>
                        {strip.map(day => (
                            <li key={day.date} className="flex size-4 items-center justify-center">
                                <span className="sr-only">
                                    {day.isToday
                                        ? String(t.journeyDayToday)
                                        : weekday.format(new Date(`${day.date}T12:00:00`))}
                                    {": "}
                                    {String(day.done ? t.journeyDayDone : t.journeyDayNotDone)}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className={[
                                        "flex size-3.5 items-center justify-center rounded-full border",
                                        day.done
                                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-accent-foreground))]"
                                            : "border-[rgb(var(--color-text-muted))]/60",
                                        day.isToday ? "outline outline-2 outline-offset-2 outline-[rgb(var(--color-text-muted))]" : "",
                                    ].join(" ")}
                                >
                                    {day.done && (
                                        <svg viewBox="0 0 24 24" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                                        </svg>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <span className="text-xs text-[rgb(var(--color-text))]">
                        {fill(t.journeyStripSummary, { done: doneInStrip })}
                    </span>
                </div>
            </section>
            <JourneyAboutDialog open={aboutOpen} onOpenChange={setAboutOpen} phase={journey.phase} dayNumber={journey.dayNumber} />
            <JourneyMilestoneDialog daysLeft={journey.daysLeft} dayNumber={journey.dayNumber} />
        </MotionConfig>
    );
}
