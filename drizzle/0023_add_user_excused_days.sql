-- Udzur (haid/nifas) mode: the local dates a woman was excused from prayer. They bridge a gap in the streak without
-- adding to it (see src/lib/habits/progression.ts). Dates only: no reason, type or times are stored, because that would be
-- health data. Kept apart from user_streak_days so an undone award on an excused day cannot remove the excuse.
--
-- Apply this BEFORE deploying the code that reads the table (the sync and pull routes and the streak reminder use it).
-- Safe to run twice.
CREATE TABLE IF NOT EXISTS "user_excused_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"local_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_excused_days_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_excused_days_user_date_unique" ON "user_excused_days" USING btree ("user_id","local_date");
