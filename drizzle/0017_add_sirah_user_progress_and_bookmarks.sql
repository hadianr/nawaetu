-- Sirah Nabawiyah User State Migration
-- Migration 0017: Adds sirah_user_progress and sirah_bookmarks tables

CREATE TABLE IF NOT EXISTS "sirah_user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"section_id" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sirah_user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sirah_user_section_unique" ON "sirah_user_progress" USING btree ("user_id","section_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sirah_user_progress_user_idx" ON "sirah_user_progress" USING btree ("user_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "sirah_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"section_id" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sirah_bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sirah_user_bookmark_unique" ON "sirah_bookmarks" USING btree ("user_id","section_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sirah_bookmarks_user_idx" ON "sirah_bookmarks" USING btree ("user_id");
