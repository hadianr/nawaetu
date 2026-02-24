DO $$ BEGIN
    CREATE TYPE "public"."archetype" AS ENUM('beginner', 'striver', 'dedicated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."gender" AS ENUM('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."niat_type" AS ENUM('daily', 'prayer', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'settlement', 'expired', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"title" text,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"date" date NOT NULL,
	"quran_ayat" integer DEFAULT 0,
	"tasbih_count" integer DEFAULT 0,
	"prayers_logged" jsonb DEFAULT '[]'::jsonb,
	"last_updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_completed_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"mission_id" text NOT NULL,
	"xp_earned" integer DEFAULT 0,
	"completed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_reading_state" (
	"userId" text PRIMARY KEY NOT NULL,
	"surah_id" integer,
	"surah_name" text,
	"verse_id" integer,
	"last_read_at" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
    DROP INDEX IF EXISTS "transaction_status_idx";
EXCEPTION
    WHEN undefined_table THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "intention" ALTER COLUMN "niat_type" SET DEFAULT 'daily'::"public"."niat_type";--> statement-breakpoint
ALTER TABLE "intention" ALTER COLUMN "niat_type" SET DATA TYPE "public"."niat_type" USING "niat_type"::"public"."niat_type";--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "status" SET DATA TYPE "public"."transaction_status" USING "status"::"public"."transaction_status";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "gender" SET DATA TYPE "public"."gender" USING "gender"::"public"."gender";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "archetype" SET DATA TYPE "public"."archetype" USING "archetype"::"public"."archetype";--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "bookmark" ADD COLUMN "translation_text" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "push_subscription" ADD COLUMN "latitude" real;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "push_subscription" ADD COLUMN "longitude" real;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "push_subscription" ADD COLUMN "city" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "user_completed_missions" ADD CONSTRAINT "user_completed_missions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "user_reading_state" ADD CONSTRAINT "user_reading_state_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "chat_sessions_user_id_idx" ON "chat_sessions" USING btree ("userId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "chat_sessions_updated_at_idx" ON "chat_sessions" USING btree ("updated_at");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "da_user_id_idx" ON "daily_activities" USING btree ("userId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "da_user_id_date_unique" ON "daily_activities" USING btree ("userId","date");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ucm_user_id_idx" ON "user_completed_missions" USING btree ("userId");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ucm_mission_id_idx" ON "user_completed_missions" USING btree ("mission_id");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "ucm_user_mission_unique" ON "user_completed_missions" USING btree ("userId","mission_id");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "urs_surah_id_idx" ON "user_reading_state" USING btree ("surah_id");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "ps_city_idx" ON "push_subscription" USING btree ("city");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS "transaction_status_created_at_idx" ON "transaction" USING btree ("status","created_at");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;