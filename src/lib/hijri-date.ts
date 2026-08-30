export const HIJRI_MONTHS = [
    "Muharram",
    "Safar",
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    "Jumada al-Awwal",
    "Jumada al-Thani",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qi'dah",
    "Dhu al-Hijjah",
] as const;

const HIJRI_MONTHS_ID = [
    "Muharram",
    "Safar",
    "Rabiul Awal",
    "Rabiul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Syakban",
    "Ramadan",
    "Syawal",
    "Zulkaidah",
    "Zulhijah",
] as const;

export interface HijriDateInput {
    day: string | number;
    month: number;
    year: string | number;
}

export interface HijriDateValue {
    day: number;
    month: number;
    monthName: string;
    year: number;
}

export function parseHijriAdjustment(value: unknown, fallback = -1): number {
    const adjustment = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(adjustment) ? adjustment : fallback;
}

export function getHijriMonthName(month: number, locale = "en"): string {
    const names = locale === "id" ? HIJRI_MONTHS_ID : HIJRI_MONTHS;
    return names[month - 1] ?? HIJRI_MONTHS[month - 1] ?? "";
}

/**
 * Normalize one AlAdhan Hijri date. Monthly calendar data should prefer
 * `getAdjustedCalendarHijriDate`, which uses adjacent API records at boundaries.
 */
export function adjustHijriDate(input: HijriDateInput, adjustment = 0): HijriDateValue {
    let day = Number.parseInt(String(input.day), 10) || 1;
    let month = Number.parseInt(String(input.month), 10) || 1;
    let year = Number.parseInt(String(input.year), 10) || 1;

    day += adjustment;

    // AlAdhan's single-day response does not expose adjacent month length.
    // ponytail: 30-day boundary fallback; monthly data uses adjacent API records below.
    while (day < 1) {
        day += 30;
        month -= 1;
        if (month < 1) {
            month = 12;
            year -= 1;
        }
    }

    while (day > 30) {
        day -= 30;
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return { day, month, monthName: getHijriMonthName(month), year };
}

export function getAdjustedCalendarHijriDate(
    dates: HijriDateInput[],
    index: number,
    adjustment: number,
): HijriDateValue {
    const adjacent = dates[index + adjustment];
    return adjacent
        ? adjustHijriDate(adjacent)
        : adjustHijriDate(dates[index], adjustment);
}

export function formatHijriDate(date: HijriDateValue, locale = "en"): string {
    return `${date.day} ${getHijriMonthName(date.month, locale)} ${date.year}H`;
}
