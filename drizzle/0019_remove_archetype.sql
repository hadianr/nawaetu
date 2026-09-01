-- Remove retired archetype data after the all-features client rollout.
ALTER TABLE "user" DROP COLUMN IF EXISTS "archetype";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."archetype";
