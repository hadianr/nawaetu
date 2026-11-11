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
