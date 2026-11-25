"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MapPin,
    Moon,
    Settings2,
} from "@/components/ui/icons";
import { getTranslationText, useLocale } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { getStorageService } from "@/core/infrastructure/storage";
import type { Madzhab } from "@/data/fasting/types";
import { getHijriEvents } from "@/data/hijri-events";
import type { HijriPracticeAction } from "@/data/hijri-months";
import { formatHistoryDate, getHistoryChaptersForMonth } from "@/data/history/chapters";
import HijriDayDetails, { EVENT_LABELS } from "@/components/hijri-calendar/HijriDayDetails";
import HijriMonthCard, { type MonthMoment } from "@/components/hijri-calendar/HijriMonthCard";
import { MARKER_LABEL, MARKER_ORDER, Marker, MarkerRow, markersFor, type MarkerKind } from "@/components/hijri-calendar/markers";
import NuzululQuranNote from "@/components/hijri-calendar/NuzululQuranNote";
import {
    useHijriCalendar,
    type HijriCalendarDay,
    type HijriCalendarViewMode,
} from "@/hooks/useHijriCalendar";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { haptic } from "@/lib/haptic";
import { getHijriMonthName } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";

// Existing guides, opened in place from the month card and the day panel.
const LailatulQadrGuideModal = dynamic(() => import("@/components/ramadhan/LailatulQadrGuideModal"), { ssr: false });
const ZakatFitrahCalculatorModal = dynamic(() => import("@/components/ramadhan/ZakatFitrahCalculatorModal"), { ssr: false });

const SWIPE_DISTANCE = 60;
// The hilal plays once per session, the Ramadan lanterns once per Hijri year (stored).
let hilalPlayed = false;

interface HijriCalendarPageContentProps {
    initialView?: HijriCalendarViewMode;
}

export default function HijriCalendarPageContent({ initialView = "month" }: HijriCalendarPageContentProps) {
    const { locale, t } = useLocale();
    const { data: prayerData, refreshLocation } = usePrayerTimesContext();
    const reduced = useReducedMotion();
    const [selectedDay, setSelectedDay] = useState<HijriCalendarDay | null>(null);
    const [madzhab, setMadzhab] = useState<Madzhab | null>(null);
    const [focusMarker, setFocusMarker] = useState<MarkerKind | null>(null);
    const [tool, setTool] = useState<HijriPracticeAction | null>(null);
    // Motion: the direction of the last month change, whether the user changed month, and which animation plays.
    const [slideDirection, setSlideDirection] = useState<-1 | 0 | 1>(0);
    const [navigated, setNavigated] = useState(false);
    const [monthMoment, setMonthMoment] = useState<MonthMoment>(null);
    const [dayTapped, setDayTapped] = useState(false);
    const {
        calendarData,
        loading,
        error,
        fetchCalendar,
        navigateMonth,
        viewMode,
        activeHijriMonth,
        activeHijriYear,
    } = useHijriCalendar(initialView);

    useEffect(() => {
        void fetchCalendar(initialView);
        // The route's initial view is fixed for this mount; later changes use handleView.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A granted location arrives through prayer times; load the calendar that was waiting for it.
    useEffect(() => {
        if (error === "location_required" && prayerData?.locationName && !prayerData.isDefaultLocation) void fetchCalendar(viewMode);
        // Keyed on the place name only, so a failed attempt cannot loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prayerData?.locationName]);

    useEffect(() => {
        if (!calendarData.length) return;
        queueMicrotask(() => setSelectedDay(calendarData.find(day => day.isToday) || calendarData[0]));
    }, [calendarData]);

    useEffect(() => {
        const stored = getStorageService().getOptional<string>(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB);
        queueMicrotask(() => setMadzhab((stored as Madzhab) || null));
    }, []);

    // One animation per moment: the Ramadan lanterns once per Hijri year, otherwise the hilal once per session after a month change.
    useEffect(() => {
        if (!activeHijriMonth || !activeHijriYear) return;
        let next: MonthMoment = null;
        if (activeHijriMonth === 9) {
            const storage = getStorageService();
            if (storage.getOptional<number>(STORAGE_KEYS.HIJRI_RAMADAN_INTRO_SEEN) !== activeHijriYear) {
                storage.set(STORAGE_KEYS.HIJRI_RAMADAN_INTRO_SEEN, activeHijriYear);
                next = "ramadan";
            }
        }
        if (!next && navigated && !hilalPlayed) {
            hilalPlayed = true;
            next = "hilal";
        }
        queueMicrotask(() => {
            setMonthMoment(next);
            setDayTapped(false);
            setFocusMarker(null);
        });
        // Runs when the month shown changes; `navigated` is read, not watched.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeHijriMonth, activeHijriYear]);

    const handleView = (mode: HijriCalendarViewMode) => {
        if (mode !== viewMode || !calendarData.length) void fetchCalendar(mode, new Date());
    };
    const changeMonth = (direction: -1 | 1) => {
        setNavigated(true);
        setSlideDirection(direction);
        void navigateMonth(direction);
    };
    const goToToday = () => {
        setNavigated(true);
        setSlideDirection(0);
        void fetchCalendar("month", new Date());
    };
    const handleSwipe = (_: unknown, info: PanInfo) => {
        if (Math.abs(info.offset.x) < SWIPE_DISTANCE || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
        changeMonth(info.offset.x < 0 ? 1 : -1);
    };
    const selectDay = (day: HijriCalendarDay) => {
        setSelectedDay(day);
        setDayTapped(true);
        haptic();
    };
    const weekdays = [
        t.hijriCalendarSunday,
        t.hijriCalendarMonday,
        t.hijriCalendarTuesday,
        t.hijriCalendarWednesday,
        t.hijriCalendarThursday,
        t.hijriCalendarFriday,
        t.hijriCalendarSaturday,
    ];
    const monthTitle = activeHijriMonth && activeHijriYear
        ? `${getHijriMonthName(activeHijriMonth, locale)} ${activeHijriYear}H`
        : "";
    const dayEvents = new Map(calendarData.map(day => [day.gregorianIso, getHijriEvents({
        hijriDay: day.hijriDay,
        hijriMonth: day.hijriMonthNumber,
        gregorianWeekday: day.gregorianWeekday,
    })]));
    const dayMarkers = new Map([...dayEvents].map(([iso, events]) => [iso, markersFor(events)]));
    const legend = MARKER_ORDER.filter(kind => [...dayMarkers.values()].some(kinds => kinds.includes(kind)));
    const showTodayChip = viewMode === "month" && calendarData.length > 0 && !calendarData.some(day => day.isToday);
    const historyEvents = activeHijriMonth ? getHistoryChaptersForMonth(activeHijriMonth) : [];
    const dateFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const firstWeekday = viewMode === "month" && calendarData[0]
        ? calendarData[0].gregorianWeekday
        : 0;
    const showRamadanView = initialView === "ramadan" || prayerData?.hijriMonthNumber === 9;
    const surface = "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] shadow-[var(--shadow-card)]";

    return (
        <div className={cn(
            "min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans sm:px-6 sm:py-6",
            "text-[rgb(var(--color-text))]",
        )}>
            <main className="mx-auto w-full max-w-5xl">
                <header className="mb-4 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 sm:flex sm:items-start sm:gap-4">
                    <Link
                        href="/"
                        aria-label={t.hijriCalendarBackHome}
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10",
                        )}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[rgb(var(--color-primary-strong))] sm:h-5 sm:w-5" />
                            <h1 className="truncate text-lg font-bold sm:text-2xl">{t.hijriCalendarTitle}</h1>
                            {monthTitle && (
                                <span className="hidden shrink-0 rounded-full bg-[rgb(var(--color-primary))]/15 px-2 py-1 text-xs font-medium text-[rgb(var(--color-primary-strong))] sm:inline-flex">
                                    {monthTitle}
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[rgb(var(--color-text-muted))] sm:mt-1 sm:text-xs">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {prayerData?.locationName || t.hijriCalendarYourLocation}
                        </p>
                    </div>
                    <Link
                        href="/settings#hijri-date"
                        aria-label={t.hijriCalendarAdjustDate}
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[rgb(var(--color-primary-strong))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] sm:w-auto sm:border-transparent sm:px-2 sm:text-xs sm:font-semibold sm:hover:underline",
                            "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-subtle))] hover:bg-[rgb(var(--color-primary))]/10 sm:border-transparent sm:bg-transparent",
                        )}
                    >
                        <Settings2 className="h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline">{t.hijriCalendarAdjustDate}</span>
                    </Link>
                </header>

                {showRamadanView && (
                    <div className={cn("mb-4 grid grid-cols-2 rounded-xl border p-1 shadow-[var(--shadow-card)]", surface)}>
                        <button
                            type="button"
                            onClick={() => handleView("month")}
                            className={cn(
                                "min-h-11 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                viewMode === "month" ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]" : "text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10",
                            )}
                        >
                            {t.hijriCalendarMonthView}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleView("ramadan")}
                            className={cn(
                                "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                viewMode === "ramadan" ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]" : "text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10",
                            )}
                        >
                            <Moon className="h-3.5 w-3.5" />
                            {t.hijriCalendarRamadanView}
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className={cn("flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border shadow-[var(--shadow-card)]", surface)}>
                        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary-strong))]" />
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">{t.hijriCalendarLoading}</p>
                    </div>
                ) : error ? (
                    <div className={cn("flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border px-6 text-center shadow-[var(--shadow-card)]", surface)}>
                        <AlertTriangle className="h-7 w-7 text-[rgb(var(--color-warning))]" />
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">
                            {error === "location_required" ? t.hijriCalendarLocationRequired : t.hijriCalendarLoadFailed}
                        </p>
                        <button type="button" onClick={() => (error === "location_required" ? refreshLocation() : void fetchCalendar(viewMode))} className="min-h-11 text-sm font-semibold text-[rgb(var(--color-primary-strong))] underline">
                            {error === "location_required" ? t.hijriCalendarUseLocation : t.hijriCalendarRetry}
                        </button>
                    </div>
                ) : viewMode === "month" ? (
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)] md:items-start">
                        <section className={cn("rounded-2xl border p-3 sm:p-5 shadow-[var(--shadow-card)]", surface)}>
                            <div className="mb-3 flex items-center justify-between">
                                <button type="button" onClick={() => changeMonth(-1)} aria-label={t.hijriCalendarPreviousMonth} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[rgb(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                {/* The chip sits under the title so long month names never wrap on a 320px screen. */}
                                <div className="flex min-w-0 flex-col items-center">
                                    <strong className="whitespace-nowrap text-sm sm:text-base">{monthTitle}</strong>
                                    {showTodayChip && (
                                        <button type="button" onClick={goToToday} className="mt-0.5 min-h-6 min-w-0 rounded-full bg-[rgb(var(--color-primary))]/15 px-2.5 text-xs font-semibold text-[rgb(var(--color-primary-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                                            {t.hijriCalendarToday}
                                        </button>
                                    )}
                                </div>
                                <button type="button" onClick={() => changeMonth(1)} aria-label={t.hijriCalendarNextMonth} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[rgb(var(--color-primary))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Swipe left or right to change month; the arrows above stay for keyboard and mouse. */}
                            <motion.div
                                key={monthTitle}
                                drag="x"
                                dragSnapToOrigin
                                dragElastic={0.15}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleSwipe}
                                initial={reduced || slideDirection === 0 ? false : { x: slideDirection * 32, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="grid touch-pan-y grid-cols-7 gap-1"
                                role="grid"
                                aria-label={monthTitle}
                            >
                                {weekdays.map(day => <div key={day} className="py-1 text-center text-xs font-bold uppercase text-[rgb(var(--color-text-muted))] sm:text-xs">{day}</div>)}
                                {Array.from({ length: firstWeekday }, (_, index) => <div key={`empty-${index}`} />)}
                                {calendarData.map(day => {
                                    const events = dayEvents.get(day.gregorianIso) ?? [];
                                    const kinds = dayMarkers.get(day.gregorianIso) ?? [];
                                    const selected = selectedDay?.gregorianIso === day.gregorianIso;
                                    const lastTen = day.hijriMonthNumber === 9 && day.hijriDay >= 21;
                                    const dimmed = focusMarker !== null && !kinds.includes(focusMarker);
                                    const eventNames = events.map(event => getTranslationText(t, EVENT_LABELS[event.id], event.id)).join(", ");
                                    return (
                                        <motion.button
                                            type="button"
                                            role="gridcell"
                                            key={day.gregorianIso}
                                            onClick={() => selectDay(day)}
                                            whileTap={reduced ? undefined : { scale: 0.96 }}
                                            aria-label={`${day.hijriDay} ${getHijriMonthName(day.hijriMonthNumber, locale)} ${day.hijriYear}H, ${dateFormatter.format(new Date(`${day.gregorianIso}T12:00:00`))}${eventNames ? `, ${eventNames}` : ""}`}
                                            aria-current={day.isToday ? "date" : undefined}
                                            aria-selected={selected}
                                            className={cn(
                                                "flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl border text-center transition-[colors,opacity] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] shadow-[var(--shadow-card)]",
                                                selected ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]" : day.isToday ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10" : "border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-primary))]/10",
                                                lastTen && !selected && "border-t-2 border-t-[rgb(var(--color-accent))]",
                                                dimmed && "opacity-35",
                                            )}
                                        >
                                            <span className="text-sm font-bold">{day.hijriDay}</span>
                                            <span className={cn("text-xs", selected ? "text-[rgb(var(--color-primary-foreground))]" : "text-[rgb(var(--color-text-muted))]")}>{day.gregorianDay}</span>
                                            <MarkerRow kinds={kinds} inverse={selected} />
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                            {legend.length > 0 && (
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {legend.map(kind => (
                                            <button
                                                key={kind}
                                                type="button"
                                                aria-pressed={focusMarker === kind}
                                                onClick={() => setFocusMarker(current => (current === kind ? null : kind))}
                                                className={cn(
                                                    "flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                                    focusMarker === kind
                                                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/15 font-semibold text-[rgb(var(--color-text))]"
                                                        : "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-primary))]/10",
                                                )}
                                            >
                                                <span className="flex size-3 items-center justify-center"><Marker kind={kind} /></span>
                                                {getTranslationText(t, MARKER_LABEL[kind], kind)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {selectedDay && (
                            <section className={cn("rounded-2xl border p-4 md:sticky md:top-4 shadow-[var(--shadow-card)]", surface)} aria-live="polite">
                                <HijriDayDetails day={selectedDay} monthDays={calendarData} madzhab={madzhab} animate={dayTapped} onAction={setTool} />
                            </section>
                        )}
                    </div>
                ) : (
                    <section className={cn("overflow-hidden rounded-2xl border p-3 sm:p-5 shadow-[var(--shadow-card)]", surface)}>
                        <div className="overflow-x-auto">
                            <div className="grid min-w-[430px] grid-cols-5 border-b border-current/10 py-2 text-center text-xs font-bold uppercase opacity-60">
                                <span>{t.hijriCalendarHeaderHijri}</span><span>{t.hijriCalendarHeaderDate}</span><span>{t.hijriCalendarHeaderImsak}</span><span>{t.hijriCalendarHeaderFajr}</span><span>{t.hijriCalendarHeaderIftar}</span>
                            </div>
                            {calendarData.map(day => (
                                <div key={day.gregorianIso} className={cn("grid min-w-[430px] grid-cols-5 py-3 text-center text-xs", day.isToday && "bg-[rgb(var(--color-primary))]/15 font-bold")}>
                                    <span>{day.hijriDay}</span><span className="opacity-60">{day.gregorianDay}</span><span className="tabular-nums">{day.timings.Imsak}</span><span className="tabular-nums">{day.timings.Subuh}</span><span className="tabular-nums">{day.timings.Maghrib}</span>
                                </div>
                            ))}
                            {!calendarData.length && <p className="py-12 text-center text-sm opacity-50">{t.hijriCalendarNoData}</p>}
                        </div>
                    </section>
                )}

                {!loading && !error && activeHijriMonth && (
                    <HijriMonthCard
                        key={activeHijriMonth}
                        month={activeHijriMonth}
                        days={calendarData}
                        madzhab={madzhab}
                        moment={dayTapped ? null : monthMoment}
                        onAction={setTool}
                        className="mt-4"
                    />
                )}

                {(historyEvents.length > 0 || activeHijriMonth === 9) && (
                    <section className={cn("mt-4 rounded-2xl border p-4 shadow-[var(--shadow-card)]", surface)}>
                        <h2 className="flex items-center gap-2 text-sm font-bold">
                            <BookOpen className="h-4 w-4 text-[rgb(var(--color-primary-strong))]" />
                            {t.hijriHistoryTitle}
                        </h2>
                        <ul className="mt-3 space-y-3">
                            {activeHijriMonth === 9 && <li><NuzululQuranNote /></li>}
                            {historyEvents.map(event => (
                                <li key={event.slug} className="rounded-2xl bg-[rgb(var(--color-surface-subtle))] p-3">
                                    <p className="text-xs font-bold text-[rgb(var(--color-primary-strong))]">
                                        {event.date && formatHistoryDate(event.date, locale)}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold">{locale === "en" ? event.titleEn : event.titleId}</p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[rgb(var(--color-text-muted))]">{locale === "en" ? event.introEn : event.introId}</p>
                                    <Link href={`/sirah/history/${event.slug}`} className="mt-2 inline-block text-xs font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline">
                                        {t.hijriHistoryReadMore}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {tool === "lailatulQadrGuide" && <LailatulQadrGuideModal open onOpenChange={open => { if (!open) setTool(null); }} />}
                {tool === "zakatCalculator" && <ZakatFitrahCalculatorModal open onOpenChange={open => { if (!open) setTool(null); }} />}
            </main>
        </div>
    );
}
