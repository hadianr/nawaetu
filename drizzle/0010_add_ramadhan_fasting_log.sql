CREATE TYPE "public"."fasting_consequence" AS ENUM('none', 'qadha', 'fidyah', 'choice');--> statement-breakpoint
CREATE TYPE "public"."fasting_status" AS ENUM('fasting', 'not_fasting', 'sick', 'traveling', 'menstruation', 'postpartum', 'pregnant', 'breastfeeding', 'elderly');--> statement-breakpoint
CREATE TABLE "ramadhan_fasting_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hijri_year" integer NOT NULL,
	"hijri_day" integer NOT NULL,
	"status" "fasting_status" DEFAULT 'fasting' NOT NULL,
	"consequence" "fasting_consequence" DEFAULT 'none' NOT NULL,
	"madzhab" text,
	"note" text,
	"qadha_done" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ramadhan_fasting_log" ADD CONSTRAINT "ramadhan_fasting_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rfl_user_year_day_unique" ON "ramadhan_fasting_log" USING btree ("user_id","hijri_year","hijri_day");--> statement-breakpoint
CREATE INDEX "rfl_user_year_idx" ON "ramadhan_fasting_log" USING btree ("user_id","hijri_year");