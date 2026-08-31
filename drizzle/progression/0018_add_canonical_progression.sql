CREATE TYPE "public"."streak_day_status" AS ENUM('qualified', 'frozen', 'repaired');
--> statement-breakpoint
CREATE TYPE "public"."progression_origin" AS ENUM('server', 'guest_import', 'backfill');
--> statement-breakpoint
CREATE TYPE "public"."hasanah_source" AS ENUM('mission', 'prayer', 'quran', 'dhikr', 'intention', 'streak_milestone', 'reversal', 'adjustment');
--> statement-breakpoint
CREATE TABLE "user_streak_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"local_date" date NOT NULL,
	"status" "streak_day_status" DEFAULT 'qualified' NOT NULL,
	"source" "hasanah_source" NOT NULL,
	"source_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"origin" "progression_origin" DEFAULT 'server' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_streak_days_source_id_not_empty" CHECK (length("user_streak_days"."source_id") > 0),
	CONSTRAINT "user_streak_days_timezone_not_empty" CHECK (length("user_streak_days"."timezone") > 0)
);
--> statement-breakpoint
CREATE TABLE "user_streak_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"current_days" integer DEFAULT 0 NOT NULL,
	"longest_days" integer DEFAULT 0 NOT NULL,
	"last_streak_date" date,
	"freezes_available" integer DEFAULT 0 NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_streak_state_current_days_nonnegative" CHECK ("user_streak_state"."current_days" >= 0),
	CONSTRAINT "user_streak_state_longest_days_valid" CHECK ("user_streak_state"."longest_days" >= "user_streak_state"."current_days"),
	CONSTRAINT "user_streak_state_freezes_nonnegative" CHECK ("user_streak_state"."freezes_available" >= 0)
);
--> statement-breakpoint
CREATE TABLE "hasanah_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"source" "hasanah_source" NOT NULL,
	"source_id" text NOT NULL,
	"amount" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"origin" "progression_origin" DEFAULT 'server' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hasanah_ledger_source_id_not_empty" CHECK (length("hasanah_ledger"."source_id") > 0)
);
--> statement-breakpoint
CREATE TABLE "user_progress_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"hasanah_total" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"level_rule_version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_state_hasanah_nonnegative" CHECK ("user_progress_state"."hasanah_total" >= 0),
	CONSTRAINT "user_progress_state_level_positive" CHECK ("user_progress_state"."level" >= 1),
	CONSTRAINT "user_progress_state_rule_version_positive" CHECK ("user_progress_state"."level_rule_version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "user_streak_days" ADD CONSTRAINT "user_streak_days_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_streak_state" ADD CONSTRAINT "user_streak_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hasanah_ledger" ADD CONSTRAINT "hasanah_ledger_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_progress_state" ADD CONSTRAINT "user_progress_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_streak_days_user_date_unique" ON "user_streak_days" USING btree ("user_id","local_date");
--> statement-breakpoint
CREATE INDEX "user_streak_days_user_date_idx" ON "user_streak_days" USING btree ("user_id","local_date");
--> statement-breakpoint
CREATE UNIQUE INDEX "hasanah_ledger_user_source_unique" ON "hasanah_ledger" USING btree ("user_id","source","source_id");
--> statement-breakpoint
CREATE INDEX "hasanah_ledger_user_occurred_at_idx" ON "hasanah_ledger" USING btree ("user_id","occurred_at");
