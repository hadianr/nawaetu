"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { getStorageService } from "@/core/infrastructure/storage";
import { getStreakRepository } from "@/core/repositories/streak.repository";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import { getRamadhanJourney, JOURNEY_DAYS } from "@/lib/ramadhan-journey";
import { DateUtils } from "@/lib/utils/date";

const HABIT_COUNT = 14;

const PHASE_KEY = {
    reset: "journeyPhaseReset",
    build: "journeyPhaseBuild",
    sharpen: "journeyPhaseSharpen",
} as const;

export default function JourneyCard() {
    const { t } = useLocale();
    const storage = getStorageService();
    // Loaded with ssr:false, so reading storage in initial state cannot cause a hydration mismatch.
    const [adjustment, setAdjustment] = useState(() =>
        parseHijriAdjustment(storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT)),
    );
    const [doneToday, setDoneToday] = useState(
        () => storage.getOptional<string>(STORAGE_KEYS.JOURNEY_LAST_DONE) === DateUtils.today(),
    );

    useEffect(() => {
        const onChange = (event: Event) => {
            const detail = (event as CustomEvent<{ adjustment?: string | number }>).detail;
            setAdjustment(parseHijriAdjustment(detail?.adjustment));
        };
        window.addEventListener("hijri_adjustment_changed", onChange);
        return () => window.removeEventListener("hijri_adjustment_changed", onChange);
    }, []);

    const journey = useMemo(() => getRamadhanJourney(new Date(), adjustment), [adjustment]);
    if (!journey.active || !journey.phase) return null;

    const fill = (template: unknown, values: Record<string, number>) =>
        Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), String(template));

    const habit = t[`journeyHabit${(journey.dayNumber % HABIT_COUNT) + 1}`];
    const lateJoin = journey.dayNumber > 7 && !storage.getOptional<string>(STORAGE_KEYS.JOURNEY_LAST_DONE);

    const markDone = () => {
        storage.set(STORAGE_KEYS.JOURNEY_LAST_DONE, DateUtils.today());
        setDoneToday(true);
        // One streak, one set of freezes: the journey counts as a qualifying day like any mission.
        getStreakRepository().updateStreak();
    };

    return (
        <section
            aria-label={String(t.journeyTitle)}
            className="w-full rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-card)]"
        >
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold text-[rgb(var(--color-text))]">{String(t.journeyTitle)}</h2>
                <span className="text-xs text-[rgb(var(--color-text-muted))]">
                    {journey.daysLeft === 1
                        ? String(t.journeyDayLeftOne)
                        : fill(t.journeyDaysLeft, { days: journey.daysLeft })}
                </span>
            </div>

            <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--color-surface-subtle))]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={JOURNEY_DAYS}
                aria-valuenow={journey.dayNumber}
            >
                <div
                    className="h-full rounded-full bg-[rgb(var(--color-primary))]"
                    style={{ width: `${journey.dayNumber}%` }}
                />
            </div>
            <p className="mt-1 text-xs text-[rgb(var(--color-text-muted))]">
                {fill(t.journeyDayOf, { day: journey.dayNumber, total: JOURNEY_DAYS })} · {String(t[PHASE_KEY[journey.phase]])}
            </p>

            <p className="mt-3 text-[11px] uppercase tracking-wide text-[rgb(var(--color-text-muted))]">
                {String(t.journeyTodayLabel)}
            </p>
            <p className="mt-1 text-sm text-[rgb(var(--color-text))]">{String(habit)}</p>

            {doneToday ? (
                <p className="mt-3 text-sm text-[rgb(var(--color-primary-light))]" role="status">{String(t.journeyDone)}</p>
            ) : (
                <>
                    <Button size="sm" className="mt-3" onClick={markDone}>{String(t.journeyMarkDone)}</Button>
                    {lateJoin && (
                        <p className="mt-2 text-xs text-[rgb(var(--color-text-muted))]">{String(t.journeyLateJoin)}</p>
                    )}
                </>
            )}
        </section>
    );
}
