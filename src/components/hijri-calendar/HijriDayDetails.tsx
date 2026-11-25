"use client";

import { AlertTriangle, BookOpen, Info, Moon } from "@/components/ui/icons";
import LottieMoment from "@/components/ui/LottieMoment";
import { getTranslationText, useLocale } from "@/context/LocaleContext";
import type { Madzhab } from "@/data/fasting/types";
import { getHijriEvents, type HijriEventId } from "@/data/hijri-events";
import type { HijriPracticeAction } from "@/data/hijri-months";
import type { HijriCalendarDay } from "@/hooks/useHijriCalendar";
import { getFastingCautions, type FastingCaution } from "@/lib/fasting-guide";
import { fillTemplate, getOddNight, zakatTimingKey } from "@/lib/hijri-calendar-notes";
import { getHijriMonthName } from "@/lib/hijri-date";
import { cn } from "@/lib/utils";
import { Marker, markersFor } from "./markers";
import NuzululQuranNote from "./NuzululQuranNote";

export const EVENT_LABELS: Record<HijriEventId, string> = {
    ramadan: "hijriEventRamadan",
    lailatulQadr: "hijriEventLailatulQadr",
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

const CAUTION_LABELS: Record<FastingCaution, string> = {
    preRamadan: "hijriCautionPreRamadan",
    afterMidSyaban: "hijriCautionAfterMidSyaban",
    fridayAlone: "hijriCautionFridayAlone",
};

interface HijriDayDetailsProps {
    day: HijriCalendarDay;
    /** The days of the month shown, used for its length and for the Maghrib before an odd night. */
    monthDays: HijriCalendarDay[];
    madzhab: Madzhab | null;
    /** Play this day's animation: only after the user picks the day, so one player runs at a time. */
    animate: boolean;
    onAction: (action: HijriPracticeAction) => void;
}

export default function HijriDayDetails({ day, monthDays, madzhab, animate, onAction }: HijriDayDetailsProps) {
    const { locale, t } = useLocale();
    const text = (key: string) => getTranslationText(t, key, key);
    const dateFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" });
    const eveningFormatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short" });

    const { hijriDay, hijriMonthNumber: month, gregorianWeekday: weekday } = day;
    const events = getHijriEvents({ hijriDay, hijriMonth: month, gregorianWeekday: weekday });
    // Trust the count only when the whole month is loaded; otherwise assume 30 days.
    const loaded = monthDays.filter(item => item.hijriMonthNumber === month).length;
    const monthLength = loaded >= 29 ? loaded : 30;
    const cautions = getFastingCautions({ day: hijriDay, month, weekday, monthLength, madzhab });
    const ramadan = month === 9;
    const isLastDay = ramadan && hijriDay === monthLength;
    const oddNight = events.some(event => event.id === "lailatulQadr") ? getOddNight(monthDays, hijriDay) : null;
    const eid = events.some(event => event.id === "eidFitrProhibited" || event.id === "eidAdhaProhibited");
    const moment = oddNight ? "/lottie/stars.lottie" : eid ? "/lottie/mosque.lottie" : null;

    const notes: { text: string; guide?: boolean }[] = [];
    if (ramadan && hijriDay === 1) notes.push({ text: text("hijriDayFirstRamadan") });
    if (oddNight) {
        notes.push({
            text: fillTemplate(t.hijriDayOddNight, {
                night: hijriDay,
                date: eveningFormatter.format(new Date(`${oddNight.startDay.gregorianIso}T12:00:00`)),
                time: oddNight.startDay.timings.Maghrib,
            }),
            guide: true,
        });
    }
    if (ramadan && hijriDay >= 21) notes.push({ text: text("hijriDayLastTen") });
    if (ramadan && hijriDay > monthLength - 2) notes.push({ text: `${text("hijriDayZakat")} ${text(zakatTimingKey(madzhab))}` });
    if (isLastDay) notes.push({ text: text("hijriDayTakbir") });

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-[rgb(var(--color-text-muted))]">{t.hijriCalendarSelectedDate}</p>
                    <p className="mt-1 text-base font-bold">
                        {hijriDay} {getHijriMonthName(month, locale)} {day.hijriYear}H
                        {day.isToday && <span className="ml-2 text-xs text-[rgb(var(--color-primary-strong))]">{t.hijriCalendarToday}</span>}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">
                        {dateFormatter.format(new Date(`${day.gregorianIso}T12:00:00`))}
                        {ramadan && <> · {fillTemplate(t.hijriRamadanDay, { day: hijriDay, total: monthLength })}</>}
                    </p>
                </div>
                {animate && moment && <LottieMoment key={`${day.gregorianIso}-${moment}`} src={moment} quietLoad className="size-14 shrink-0" />}
            </div>

            <div className="mt-3 space-y-2">
                {events.map(event => {
                    const kind = markersFor([event])[0];
                    return (
                        <div key={event.id} className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                            event.kind === "prohibited" ? "bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]" : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-strong))]",
                        )}>
                            <span className="flex size-4 shrink-0 items-center justify-center">
                                {kind ? <Marker kind={kind} /> : <Moon className="size-4" />}
                            </span>
                            {text(EVENT_LABELS[event.id])}
                        </div>
                    );
                })}

                {notes.length > 0 && (
                    // One box for all of the day's notes keeps the panel short on a phone.
                    <ul className="space-y-1.5 rounded-xl bg-[rgb(var(--color-surface-subtle))] px-3 py-2 text-xs leading-relaxed">
                        {notes.map(note => (
                            <li key={note.text} className="flex gap-2">
                                <Info className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--color-primary-strong))]" />
                                <span>
                                    {note.text}
                                    {note.guide && (
                                        <button
                                            type="button"
                                            onClick={() => onAction("lailatulQadrGuide")}
                                            className="ml-1 inline-flex items-center gap-1 font-semibold text-[rgb(var(--color-primary-strong))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-primary))]"
                                        >
                                            <BookOpen className="size-3" />
                                            {t.hijriOpenGuide}
                                        </button>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {ramadan && hijriDay === 17 && <NuzululQuranNote />}

                {cautions.map(caution => (
                    <p key={caution} className="flex gap-2 rounded-xl bg-[rgb(var(--color-warning))]/10 px-3 py-2 text-xs leading-relaxed text-[rgb(var(--color-text))]">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-[rgb(var(--color-warning))]" />
                        {text(CAUTION_LABELS[caution])}
                    </p>
                ))}

                {!events.length && !notes.length && !cautions.length && (
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">{t.hijriCalendarNoEvents}</p>
                )}
            </div>
        </>
    );
}
