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
    "streak"
  ]),
  action: z.enum(["create", "update", "delete"]),
  data: z.any().optional(),
});

/** Settings a client may write through sync. Anything else (for example guestSyncEligible) is server-owned. */
export const SYNCABLE_SETTING_KEYS = ['theme', 'reciter', 'muadzin', 'calculationMethod', 'locale', 'hijriAdjustment', 'adhanPreferences'] as const;

/** Keeps only allowed keys with short primitive values, or a small adhanPreferences object. */
export function sanitizeSyncedSettings(input: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    for (const key of SYNCABLE_SETTING_KEYS) {
        const value = input[key];
        if (typeof value === 'string' || typeof value === 'number') {
            if (value.toString().length < 500) clean[key] = value;
        } else if (key === 'adhanPreferences' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (Object.keys(value).length < 20) clean[key] = value;
        }
    }
    return clean;
}
