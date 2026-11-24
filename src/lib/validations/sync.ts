import { z } from "zod";

export const SyncEntrySchema = z.object({
  id: z.string(),
  type: z.enum([
    "bookmark",
    "intention",
    "journal",
    "mission",
    "mission_progress",
    "daily_activity",
    "setting",
    "reading_state",
    "dhikr_stats",
    "ramadhan_fasting",
    "ramadhan_taraweh",
    "ramadhan_daily",
    "sirah_progress",
    "sirah_bookmark",
    "streak",
    "hasanah_event"
  ]),
  action: z.enum(["create", "update", "delete"]),
  data: z.any().optional(),
});

/** Settings a client may write through sync. Anything else (for example guestSyncEligible) is server-owned. */
export const SYNCABLE_SETTING_KEYS = ['theme', 'reciter', 'muadzin', 'calculationMethod', 'locale', 'hijriAdjustment', 'adhanPreferences'] as const;

/** The app has two languages; anything else is corrupt and must not spread. */
export const isLocale = (value: unknown): value is 'id' | 'en' => value === 'id' || value === 'en';

/**
 * Before 2026-08-16 the storage adapter JSON-encoded strings on every write, so a setting that went
 * back and forth with the server gained a layer of quotes each trip ("\"en\"", then "\"\\\"en\\\"\"").
 * Peel those layers off so the user's original choice survives.
 */
export function unwrapSetting(value: unknown): unknown {
    let current = value;
    for (let i = 0; i < 16 && typeof current === 'string' && current.startsWith('"'); i++) {
        try { current = JSON.parse(current); } catch { break; }
    }
    return current;
}

/** Keeps only allowed keys with short primitive values, or a small adhanPreferences object. */
export function sanitizeSyncedSettings(input: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const key of SYNCABLE_SETTING_KEYS) {
        const value = unwrapSetting(input[key]);
        if (key === 'locale' && !isLocale(value)) continue;
        if (typeof value === 'string' || typeof value === 'number') {
            if (value.toString().length < 500) clean[key] = value;
        } else if (key === 'adhanPreferences' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (Object.keys(value).length < 20) clean[key] = value;
        }
    }
    return clean;
}
