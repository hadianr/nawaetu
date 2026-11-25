"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Moon } from "@/components/ui/icons";
import LottieMoment from "@/components/ui/LottieMoment";
import { getTranslationText, useLocale } from "@/context/LocaleContext";
import type { Madzhab } from "@/data/fasting/types";
import { getHijriMonthInfo, type HijriMonthPractice, type HijriPracticeAction } from "@/data/hijri-months";
import type { HijriCalendarDay } from "@/hooks/useHijriCalendar";
import { fillTemplate, getNextOddNight, zakatTimingKey } from "@/lib/hijri-calendar-notes";
import { getHijriMonthName } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";

const VISIBLE_PRACTICES = 3;

export type MonthMoment = "ramadan" | "hilal" | null;

interface HijriMonthCardProps {
    month: number;
    /** The days of the month shown, for Ramadan progress and the odd-night countdown. */
    days: HijriCalendarDay[];
    madzhab: Madzhab | null;
    /** Which animation to play in the identity slot; null shows the static icon. */
    moment: MonthMoment;
    onAction: (action: HijriPracticeAction) => void;
    className?: string;
}

function PracticeRow({ practice, madzhab, onAction }: { practice: HijriMonthPractice; madzhab: Madzhab | null; onAction: (action: HijriPracticeAction) => void }) {
    const { locale, t } = useLocale();
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const en = locale === "en";
    const evidence = practice.evidence;
    const translation = evidence && (en ? evidence.translation_en : evidence.translation);
    const body = practice.key === "zakatFitr"
        ? `${en ? practice.body.en : practice.body.id} ${getTranslationText(t, zakatTimingKey(madzhab))}`
        : en ? practice.body.en : practice.body.id;
    const actionLabel = practice.action === "zakatCalculator" ? t.hijriOpenZakat : t.hijriOpenGuide;

    return (
        <li className="border-t border-[rgb(var(--color-border))] first:border-t-0">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(value => !value)}
                className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
            >
                {en ? practice.title.en : practice.title.id}
                <ChevronDown className={cn("size-4 shrink-0 text-[rgb(var(--color-text-muted))] transition-transform", open && "rotate-180")} />
            </button>
            {open && (
                <div id={panelId} className="space-y-2 pb-3 text-xs leading-relaxed">
                    <p>{body}</p>
                    {evidence?.arabic && <p lang="ar" dir="rtl" className="font-arabic text-base leading-loose text-[rgb(var(--color-text-strong))]">{evidence.arabic}</p>}
                    {translation && <p className="italic text-[rgb(var(--color-text-muted))]">“{translation}”</p>}
                    <p className="text-[rgb(var(--color-text-muted))]">{practice.source}</p>
                    {practice.action && (
                        <button type="button" onClick={() => onAction(practice.action!)} className="min-h-11 font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                            {actionLabel}
                        </button>
                    )}
                    {practice.href && (
                        <Link href={practice.href} className="inline-flex min-h-11 items-center font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline">
                            {t.hijriOpenLink}
                        </Link>
                    )}
                </div>
            )}
        </li>
    );
}

/** Ramadan progress and the countdown to the next odd night, only while this Ramadan is the current one. */
function RamadanNow({ days }: { days: HijriCalendarDay[] }) {
    const { t } = useLocale();
    const reduced = useReducedMotion();
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const today = days.find(day => day.isToday);
    if (!today) return null;
    const total = days.length;
    const percent = Math.round((today.hijriDay / total) * 100);
    const lastTenFrom = Math.round((20 / total) * 100);
    const next = getNextOddNight(days, now);
    let countdown: string | null = null;
    if (next?.ongoing) {
        countdown = fillTemplate(t.hijriOddNightNow, { night: next.night, time: next.endDay.timings.Subuh });
    } else if (next) {
        const minutes = Math.max(0, Math.round((next.start.getTime() - now.getTime()) / 60_000));
        countdown = fillTemplate(t.hijriNextOddNight, {
            night: next.night,
            time: next.startDay.timings.Maghrib,
            remaining: fillTemplate(t.hijriHoursMinutes, { h: Math.floor(minutes / 60), m: minutes % 60 }),
        });
    }

    return (
        <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold">{fillTemplate(t.hijriRamadanDay, { day: today.hijriDay, total })}</p>
            <div
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={today.hijriDay}
                aria-label={fillTemplate(t.hijriRamadanDay, { day: today.hijriDay, total })}
                className="relative h-1.5 overflow-hidden rounded-full bg-[rgb(var(--color-surface-subtle))]"
            >
                <span className="absolute inset-y-0 right-0 bg-[rgb(var(--color-accent))]/25" style={{ left: `${lastTenFrom}%` }} />
                <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--color-primary))]"
                    initial={reduced ? false : { width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={reduced ? { width: `${percent}%` } : undefined}
                />
            </div>
            {countdown && <p aria-live="polite" className="text-xs text-[rgb(var(--color-text-muted))]">{countdown}</p>}
        </div>
    );
}

/** "What month is this": identity, one insight, and the month's own practices (plan §5). */
export default function HijriMonthCard({ month, days, madzhab, moment, onAction, className }: HijriMonthCardProps) {
    const { locale, t } = useLocale();
    const reduced = useReducedMotion();
    const [showAll, setShowAll] = useState(false);
    const info = getHijriMonthInfo(month);
    if (!info) return null;
    const en = locale === "en";
    const practices = showAll ? info.practices : info.practices.slice(0, VISIBLE_PRACTICES);
    const chip = info.chip === "sacred" ? t.hijriChipSacred : info.chip === "ramadan" ? t.hijriChipRamadan : null;
    const icon = <Moon className="size-6 text-[rgb(var(--color-primary-strong))]" />;

    return (
        <motion.section
            key={month}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            aria-labelledby={`hijri-month-${month}`}
            className={cn("rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 text-[rgb(var(--color-text))] shadow-[var(--shadow-card)]", className)}
        >
            <p className="text-xs font-bold text-[rgb(var(--color-text-muted))]">{t.hijriMonthAbout}</p>
            <div className="mt-2 flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10">
                    {moment === "ramadan" ? (
                        <LottieMoment src="/lottie/lights.lottie" quietLoad fallback={icon} className="size-12" />
                    ) : moment === "hilal" ? (
                        <LottieMoment src="/lottie/hilal.json" quietLoad fallback={icon} colorSlots={{ primary: "--color-primary", accent: "--color-accent" }} className="size-10" />
                    ) : icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <h2 id={`hijri-month-${month}`} className="text-base font-bold">{getHijriMonthName(month, locale)}</h2>
                        <span lang="ar" dir="rtl" className="font-arabic text-base text-[rgb(var(--color-text-muted))]">{info.arabic}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--color-text-muted))]">
                        {fillTemplate(t.hijriMonthOrder, { n: month })}
                        {chip && <span className="rounded-full bg-[rgb(var(--color-primary))]/15 px-2 py-0.5 font-semibold text-[rgb(var(--color-primary-strong))]">{chip}</span>}
                    </div>
                </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed">{en ? info.insight.en : info.insight.id}</p>
            {info.insightSource && <p className="mt-1 text-xs text-[rgb(var(--color-text-muted))]">{info.insightSource}</p>}

            {month === 9 && <RamadanNow days={days} />}

            {info.practices.length > 0 && (
                <>
                    <ul className="mt-3">
                        {practices.map(practice => <PracticeRow key={practice.key} practice={practice} madzhab={madzhab} onAction={onAction} />)}
                    </ul>
                    {info.practices.length > VISIBLE_PRACTICES && (
                        <button
                            type="button"
                            aria-expanded={showAll}
                            onClick={() => setShowAll(value => !value)}
                            className="mt-1 min-h-11 text-xs font-semibold text-[rgb(var(--color-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                        >
                            {showAll ? t.hijriSeeLess : fillTemplate(t.hijriSeeAll, { count: info.practices.length })}
                        </button>
                    )}
                </>
            )}
        </motion.section>
    );
}
