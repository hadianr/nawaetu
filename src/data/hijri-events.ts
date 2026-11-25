/** `night` marks a night to seek, not a fast; it never blocks or suggests fasting. */
export type HijriEventKind = "obligatory" | "recommended" | "prohibited" | "night";

export type HijriEventId =
    | "ramadan"
    | "lailatulQadr"
    | "mondayThursday"
    | "ayyamulBidh"
    | "muharram"
    | "tasua"
    | "ashura"
    | "muharramPair"
    | "shawwalSix"
    | "arafah"
    | "eidFitrProhibited"
    | "eidAdhaProhibited"
    | "tashreeqProhibited";

export interface HijriEvent {
    id: HijriEventId;
    kind: HijriEventKind;
}

export interface HijriEventDate {
    hijriDay: number;
    hijriMonth: number;
    gregorianWeekday: number;
}

export function getHijriEvents(date: HijriEventDate): HijriEvent[] {
    const { hijriDay: day, hijriMonth: month, gregorianWeekday: weekday } = date;

    if (month === 10 && day === 1) return [{ id: "eidFitrProhibited", kind: "prohibited" }];
    if (month === 12 && day === 10) return [{ id: "eidAdhaProhibited", kind: "prohibited" }];
    if (month === 12 && day >= 11 && day <= 13) return [{ id: "tashreeqProhibited", kind: "prohibited" }];

    // Every day of Ramadan is an obligatory fast, so no voluntary fast is suggested on top of it.
    if (month === 9) {
        const events: HijriEvent[] = [{ id: "ramadan", kind: "obligatory" }];
        // Odd nights of the last ten (Bukhari 2017); the night of day N begins at Maghrib of day N-1.
        if (day >= 21 && day % 2 === 1) events.push({ id: "lailatulQadr", kind: "night" });
        return events;
    }

    const events: HijriEvent[] = [];
    if (weekday === 1 || weekday === 4) events.push({ id: "mondayThursday", kind: "recommended" });
    if (day >= 13 && day <= 15) events.push({ id: "ayyamulBidh", kind: "recommended" });

    if (month === 1) {
        events.push({ id: "muharram", kind: "recommended" });
        if (day === 9) events.push({ id: "tasua", kind: "recommended" });
        if (day === 10) events.push({ id: "ashura", kind: "recommended" });
        if (day === 11) events.push({ id: "muharramPair", kind: "recommended" });
    }

    if (month === 10 && day >= 2) events.push({ id: "shawwalSix", kind: "recommended" });
    if (month === 12 && day === 9) events.push({ id: "arafah", kind: "recommended" });
    return events;
}
