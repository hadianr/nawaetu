import { z } from "zod";

export const SyncEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["bookmark", "intention", "mission_progress", "daily_activity", "setting", "reading_state"]),
  action: z.enum(["create", "update", "delete"]),
  data: z.any().optional(),
});
