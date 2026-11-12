/** Returns the value if it is a real IANA timezone, otherwise "UTC". */
export function validTimezone(value: unknown): string {
    if (typeof value !== "string" || value.length > 100) return "UTC";
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
        return value;
    } catch {
        return "UTC";
    }
}

/** YYYY-MM-DD of an instant as seen in the given timezone (UTC if the timezone is not valid). */
export function localDateIn(instant: Date, timezone: unknown): string {
    return instant.toLocaleDateString("sv-SE", { timeZone: validTimezone(timezone) });
}

/** YYYY-MM-DD shifted by a number of days, computed on the calendar so DST and month ends cannot matter. */
export function addDays(date: string, days: number): string {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}

/** Days back and forward from the user's today that sync accepts. Older evidence stays on the device. */
export const SYNC_WINDOW_DAYS_BACK = 30;
export const SYNC_WINDOW_DAYS_FORWARD = 1;

/** The oldest day sync holds, counted from the user's today. The device and the server must agree on it exactly. */
export const syncWindowStart = (todayLocal: string): string => addDays(todayLocal, -SYNC_WINDOW_DAYS_BACK);

export function isInSyncWindow(localDate: string, todayLocal: string): boolean {
    return localDate >= syncWindowStart(todayLocal) && localDate <= addDays(todayLocal, SYNC_WINDOW_DAYS_FORWARD);
}
