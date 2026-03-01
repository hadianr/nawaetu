-- drizzle/0009_add_country_to_push_subscriptions.sql

-- Gunakan IF NOT EXISTS agar tidak error jika kolom sudah ada
ALTER TABLE "push_subscription" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "push_subscription" ADD COLUMN IF NOT EXISTS "country_code" text;
ALTER TABLE "user_completed_missions" ADD COLUMN IF NOT EXISTS "completed_date" date;

-- Untuk index, jika error "already exists", Drizzle biasanya menangani secara internal 
-- tapi pastikan statement lainnya aman.
DROP INDEX IF EXISTS "ucm_user_mission_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "ucm_user_mission_unique" ON "user_completed_missions" USING btree ("userId","mission_id","completed_date");
