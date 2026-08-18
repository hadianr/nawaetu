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
