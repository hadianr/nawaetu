"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MapPin,
    Moon,
    Settings2,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { usePrayerTimesContext } from "@/context/PrayerTimesContext";
import { useTheme } from "@/context/ThemeContext";
import { getHijriEvents, type HijriEventId } from "@/data/hijri-events";
import {
    useHijriCalendar,
    type HijriCalendarDay,
    type HijriCalendarViewMode,
} from "@/hooks/useHijriCalendar";
import { getHijriMonthName } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";

interface HijriCalendarPageContentProps {
    initialView?: HijriCalendarViewMode;
}

const EVENT_LABELS: Record<HijriEventId, string> = {
    mondayThursday: "hijriEventMondayThursday",
    ayyamulBidh: "hijriEventAyyamulBidh",
    muharram: "hijriEventMuharram",
    tasua: "hijriEventTasua",
    ashura: "hijriEventAshura",
    muharramPair: "hijriEventMuharramPair",
    shawwalSix: "hijriEventShawwalSix",
    arafah: "hijriEventArafah",
    eidFitrProhibited: "hijriEventEidFitrProhibited",
    eidAdhaProhibited: "hijriEventEidAdhaProhibited",
    tashreeqProhibited: "hijriEventTashreeqProhibited",
};

export default function HijriCalendarPageContent({ initialView = "month" }: HijriCalendarPageContentProps) {
    const { locale, t } = useLocale();
    const { currentTheme } = useTheme();
    const { data: prayerData } = usePrayerTimesContext();
    const isDaylight = currentTheme === "daylight";
    const [selectedDay, setSelectedDay] = useState<HijriCalendarDay | null>(null);
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

    useEffect(() => {
        if (!calendarData.length) return;
        setSelectedDay(calendarData.find(day => day.isToday) || calendarData[0]);
    }, [calendarData]);

    const handleView = (mode: HijriCalendarViewMode) => {
        if (mode !== viewMode || !calendarData.length) void fetchCalendar(mode, new Date());
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
    const selectedEvents = selectedDay ? getHijriEvents({
        hijriDay: selectedDay.hijriDay,
        hijriMonth: selectedDay.hijriMonthNumber,
        gregorianWeekday: selectedDay.gregorianWeekday,
    }) : [];
    const dateFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const firstWeekday = viewMode === "month" && calendarData[0]
        ? calendarData[0].gregorianWeekday
        : 0;
    const showRamadanView = initialView === "ramadan" || prayerData?.hijriMonthNumber === 9;
    const surface = isDaylight
        ? "border-slate-200 bg-white text-slate-900"
        : "border-white/10 bg-white/5 text-white";

    return (
        <div className={cn(
            "min-h-screen bg-[rgb(var(--color-background))] px-4 py-4 pb-nav font-sans sm:px-6 sm:py-6",
            isDaylight ? "text-slate-900" : "text-white",
        )}>
            <main className="mx-auto w-full max-w-5xl">
                <header className="mb-4 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 sm:flex sm:items-start sm:gap-4">
                    <Link
                        href="/"
                        aria-label={t.hijriCalendarBackHome}
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                            isDaylight ? "border-slate-200 bg-white hover:bg-slate-50" : "border-white/10 bg-white/5 hover:bg-white/10",
                        )}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[rgb(var(--color-primary))] sm:h-5 sm:w-5" />
                            <h1 className="truncate text-lg font-bold sm:text-2xl">{t.hijriCalendarTitle}</h1>
                            {monthTitle && (
                                <span className="hidden shrink-0 rounded-full bg-[rgb(var(--color-primary))]/15 px-2 py-1 text-xs font-medium text-[rgb(var(--color-primary))] sm:inline-flex">
                                    {monthTitle}
                                </span>
                            )}
                        </div>
                        <p className={cn("mt-0.5 flex items-center gap-1 truncate text-[11px] sm:mt-1 sm:text-xs", isDaylight ? "text-slate-500" : "text-white/50")}>
                            <MapPin className="h-3 w-3 shrink-0" />
                            {prayerData?.locationName || t.hijriCalendarYourLocation}
                        </p>
                    </div>
                    <Link
                        href="/settings#hijri-date"
                        aria-label={t.hijriCalendarAdjustDate}
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[rgb(var(--color-primary))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))] sm:w-auto sm:border-transparent sm:px-2 sm:text-xs sm:font-semibold sm:hover:underline",
                            isDaylight ? "border-slate-200 bg-white hover:bg-slate-50" : "border-white/10 bg-white/5 hover:bg-white/10 sm:bg-transparent",
                        )}
                    >
                        <Settings2 className="h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline">{t.hijriCalendarAdjustDate}</span>
                    </Link>
                </header>

                {showRamadanView && (
                    <div className={cn("mb-4 grid grid-cols-2 rounded-xl border p-1", surface)}>
                        <button
                            type="button"
                            onClick={() => handleView("month")}
                            className={cn(
                                "min-h-11 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                viewMode === "month" ? "bg-[rgb(var(--color-primary))] text-white" : isDaylight ? "text-slate-500 hover:bg-slate-100" : "text-white/50 hover:bg-white/5",
                            )}
                        >
                            {t.hijriCalendarMonthView}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleView("ramadan")}
                            className={cn(
                                "flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                viewMode === "ramadan" ? "bg-[rgb(var(--color-primary))] text-white" : isDaylight ? "text-slate-500 hover:bg-slate-100" : "text-white/50 hover:bg-white/5",
                            )}
                        >
                            <Moon className="h-3.5 w-3.5" />
                            {t.hijriCalendarRamadanView}
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className={cn("flex min-h-96 flex-col items-center justify-center gap-3 rounded-3xl border", surface)}>
                        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
                        <p className={cn("text-sm", isDaylight ? "text-slate-500" : "text-white/50")}>{t.hijriCalendarLoading}</p>
                    </div>
                ) : error ? (
                    <div className={cn("flex min-h-96 flex-col items-center justify-center gap-3 rounded-3xl border px-6 text-center", surface)}>
                        <AlertTriangle className="h-7 w-7 text-amber-500" />
                        <p className={cn("text-sm", isDaylight ? "text-slate-600" : "text-white/60")}>
                            {error === "location_required" ? t.hijriCalendarLocationRequired : t.hijriCalendarLoadFailed}
                        </p>
                        <button type="button" onClick={() => void fetchCalendar(viewMode)} className="min-h-11 text-sm font-semibold text-[rgb(var(--color-primary))] underline">
                            {t.hijriCalendarRetry}
                        </button>
                    </div>
                ) : viewMode === "month" ? (
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)] md:items-start">
                        <section className={cn("rounded-3xl border p-3 sm:p-5", surface)}>
                            <div className="mb-3 flex items-center justify-between">
                                <button type="button" onClick={() => void navigateMonth(-1)} aria-label={t.hijriCalendarPreviousMonth} className={cn("flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]", isDaylight ? "hover:bg-slate-100" : "hover:bg-white/10")}>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <strong className="text-sm sm:text-base">{monthTitle}</strong>
                                <button type="button" onClick={() => void navigateMonth(1)} aria-label={t.hijriCalendarNextMonth} className={cn("flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]", isDaylight ? "hover:bg-slate-100" : "hover:bg-white/10")}>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthTitle}>
                                {weekdays.map(day => <div key={day} className={cn("py-1 text-center text-[9px] font-bold uppercase sm:text-[10px]", isDaylight ? "text-slate-400" : "text-white/35")}>{day}</div>)}
                                {Array.from({ length: firstWeekday }, (_, index) => <div key={`empty-${index}`} />)}
                                {calendarData.map(day => {
                                    const events = getHijriEvents({ hijriDay: day.hijriDay, hijriMonth: day.hijriMonthNumber, gregorianWeekday: day.gregorianWeekday });
                                    const prohibited = events.some(event => event.kind === "prohibited");
                                    const selected = selectedDay?.gregorianIso === day.gregorianIso;
                                    const eventNames = events.map(event => t[EVENT_LABELS[event.id]]).join(", ");
                                    return (
                                        <button
                                            type="button"
                                            role="gridcell"
                                            key={day.gregorianIso}
                                            onClick={() => setSelectedDay(day)}
                                            aria-label={`${day.hijriDay} ${getHijriMonthName(day.hijriMonthNumber, locale)} ${day.hijriYear}H, ${dateFormatter.format(new Date(`${day.gregorianIso}T12:00:00`))}${eventNames ? `, ${eventNames}` : ""}`}
                                            aria-current={day.isToday ? "date" : undefined}
                                            aria-pressed={selected}
                                            className={cn(
                                                "relative flex min-h-14 flex-col items-center justify-center rounded-xl border text-center transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]",
                                                selected ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white" : day.isToday ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10" : isDaylight ? "border-slate-100 hover:bg-slate-50" : "border-white/5 hover:bg-white/5",
                                            )}
                                        >
                                            <span className="text-sm font-bold">{day.hijriDay}</span>
                                            <span className={cn("text-[9px]", selected ? "text-white/75" : isDaylight ? "text-slate-400" : "text-white/35")}>{day.gregorianDay}</span>
                                            {events.length > 0 && <span className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", prohibited ? "bg-red-500" : selected ? "bg-white" : "bg-[rgb(var(--color-accent))]")} />}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className={cn("mt-3 flex flex-wrap gap-3 text-[10px]", isDaylight ? "text-slate-500" : "text-white/45")}>
                                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-accent))]" />{t.hijriCalendarRecommended}</span>
                                <span className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-red-500" />{t.hijriCalendarProhibited}</span>
                            </div>
                        </section>

                        {selectedDay && (
                            <section className={cn("rounded-3xl border p-4 md:sticky md:top-4", surface)} aria-live="polite">
                                <p className={cn("text-[10px] font-bold uppercase tracking-wider", isDaylight ? "text-slate-400" : "text-white/35")}>{t.hijriCalendarSelectedDate}</p>
                                <p className="mt-1 text-base font-bold">
                                    {selectedDay.hijriDay} {getHijriMonthName(selectedDay.hijriMonthNumber, locale)} {selectedDay.hijriYear}H
                                    {selectedDay.isToday && <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">{t.hijriCalendarToday}</span>}
                                </p>
                                <p className={cn("text-xs", isDaylight ? "text-slate-500" : "text-white/50")}>{dateFormatter.format(new Date(`${selectedDay.gregorianIso}T12:00:00`))}</p>
                                <div className="mt-4 space-y-2">
                                    {selectedEvents.length ? selectedEvents.map(event => (
                                        <div key={event.id} className={cn(
                                            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium",
                                            event.kind === "prohibited" ? isDaylight ? "bg-red-50 text-red-700" : "bg-red-500/10 text-red-300" : isDaylight ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-dark))]" : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-light))]",
                                        )}>
                                            {event.kind === "prohibited" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                                            {t[EVENT_LABELS[event.id]]}
                                        </div>
                                    )) : <p className={cn("text-xs", isDaylight ? "text-slate-400" : "text-white/35")}>{t.hijriCalendarNoEvents}</p>}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <section className={cn("overflow-hidden rounded-3xl border p-3 sm:p-5", surface)}>
                        <div className="overflow-x-auto">
                            <div className="grid min-w-[430px] grid-cols-5 border-b border-current/10 py-2 text-center text-[10px] font-bold uppercase opacity-60">
                                <span>{t.hijriCalendarHeaderHijri}</span><span>{t.hijriCalendarHeaderDate}</span><span>{t.hijriCalendarHeaderImsak}</span><span>{t.hijriCalendarHeaderFajr}</span><span>{t.hijriCalendarHeaderIftar}</span>
                            </div>
                            {calendarData.map(day => (
                                <div key={day.gregorianIso} className={cn("grid min-w-[430px] grid-cols-5 py-3 text-center text-xs", day.isToday && "bg-[rgb(var(--color-primary))]/15 font-bold")}>
                                    <span>{day.hijriDay}</span><span className="opacity-60">{day.gregorianDay}</span><span className="font-mono">{day.timings.Imsak}</span><span className="font-mono">{day.timings.Subuh}</span><span className="font-mono">{day.timings.Maghrib}</span>
                                </div>
                            ))}
                            {!calendarData.length && <p className="py-12 text-center text-sm opacity-50">{t.hijriCalendarNoData}</p>}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
