ALTER TYPE "public"."niat_type" RENAME TO "intention_type";--> statement-breakpoint
ALTER TABLE "intention" RENAME COLUMN "niat_text" TO "intention_text";--> statement-breakpoint
ALTER TABLE "intention" RENAME COLUMN "niat_type" TO "intention_type";--> statement-breakpoint
ALTER TABLE "intention" RENAME COLUMN "niat_date" TO "intention_date";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "niat_streak_current" TO "intention_streak_current";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "niat_streak_longest" TO "intention_streak_longest";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "last_niat_date" TO "last_intention_date";--> statement-breakpoint
DROP INDEX "intention_user_id_date_idx";--> statement-breakpoint
CREATE INDEX "intention_user_id_date_idx" ON "intention" USING btree ("userId","intention_date");