-- ============================================================================
-- Migration: 0001_create_intention_and_streaks.sql
-- Date Created: 2026-02-09
-- Description: Add mission/journal (niat) tracking and tasbih streak system
-- Changes:
--   NEW TABLE:
--     - intention  (User journal entries with niat, type, reflection, rating)
--   NEW COLUMNS:
--     - push_subscription.prayer_preferences (JSON: which prayers are enabled)
--     - push_subscription.user_location (JSON: user's location for prayer times)
--     - push_subscription.timezone (Timezone string for accurate scheduling)
--     - user.niat_streak_current (Current streak count)
--     - user.niat_streak_longest (Longest streak achieved)
--     - user.last_niat_date (Last date niat was recorded)
-- ============================================================================

CREATE TABLE "intention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"niat_text" text NOT NULL,
	"niat_type" text DEFAULT 'daily',
	"niat_date" date NOT NULL,
	"reflection_text" text,
	"reflection_rating" integer,
	"reflected_at" timestamp,
	"is_private" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "push_subscription" ADD COLUMN "prayer_preferences" text;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD COLUMN "user_location" text;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "niat_streak_current" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "niat_streak_longest" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_niat_date" date;--> statement-breakpoint
ALTER TABLE "intention" ADD CONSTRAINT "intention_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;