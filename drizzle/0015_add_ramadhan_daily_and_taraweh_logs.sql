CREATE TYPE "public"."prayer_location" AS ENUM('masjid', 'rumah', 'keduanya');--> statement-breakpoint
CREATE TYPE "public"."taraweh_choice" AS ENUM('8', '20');--> statement-breakpoint
CREATE TYPE "public"."taraweh_location" AS ENUM('masjid', 'rumah');--> statement-breakpoint
CREATE TABLE "ramadhan_daily_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"hijri_year" integer NOT NULL,
	"hijri_day" integer NOT NULL,
	"fardhu_location" "prayer_location",
	"fajr_at_masjid" boolean,
	"dhuhr_at_masjid" boolean,
	"asr_at_masjid" boolean,
	"maghrib_at_masjid" boolean,
	"isha_at_masjid" boolean,
	"dhuha" boolean DEFAULT false,
	"rawatib_qabl" boolean DEFAULT false,
	"rawatib_bad" boolean DEFAULT false,
	"witir" boolean DEFAULT false,
	"istikharah" boolean DEFAULT false,
	"hajat" boolean DEFAULT false,
	"taubat" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ramadhan_taraweh_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"hijri_year" integer NOT NULL,
	"hijri_day" integer NOT NULL,
	"choice" "taraweh_choice",
	"location" "taraweh_location",
	"is_qiyamul_lail" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ramadhan_daily_log" ADD CONSTRAINT "ramadhan_daily_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ramadhan_taraweh_log" ADD CONSTRAINT "ramadhan_taraweh_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rdl_user_year_day_unique" ON "ramadhan_daily_log" USING btree ("userId","hijri_year","hijri_day");--> statement-breakpoint
CREATE INDEX "rdl_user_id_idx" ON "ramadhan_daily_log" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "rtl_user_year_day_unique" ON "ramadhan_taraweh_log" USING btree ("user_id","hijri_year","hijri_day");--> statement-breakpoint
CREATE INDEX "rtl_user_year_idx" ON "ramadhan_taraweh_log" USING btree ("user_id","hijri_year");