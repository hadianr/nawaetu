export type HijriEventKind = "recommended" | "prohibited";

export type HijriEventId =
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
