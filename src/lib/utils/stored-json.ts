/**
 * The storage layer parses JSON text when it reads a value back, so a value written with
 * JSON.stringify() comes back as an object, not as the string that was written. Code that then calls
 * JSON.parse() on it throws and silently falls back to empty. Use this where either form can arrive.
 */
export function parseStored<T>(raw: unknown): T | null {
    if (raw === null || raw === undefined || raw === "") return null;
    if (typeof raw !== "string") return raw as T;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}
