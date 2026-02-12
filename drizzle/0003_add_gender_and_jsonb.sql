DO $$ BEGIN
 ALTER TABLE "push_subscription" ALTER COLUMN "prayer_preferences" SET DATA TYPE jsonb USING prayer_preferences::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscription" ALTER COLUMN "user_location" SET DATA TYPE jsonb USING user_location::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscription" ALTER COLUMN "last_notification_sent" SET DATA TYPE jsonb USING last_notification_sent::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ALTER COLUMN "settings" SET DATA TYPE jsonb USING settings::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD COLUMN "gender" text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookmark_key_idx" ON "bookmark" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookmark_user_key_unique_idx" ON "bookmark" USING btree ("userId","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_subscription_user_id_idx" ON "push_subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("userId");