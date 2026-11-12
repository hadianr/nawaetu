-- When the prayer-alert job next needs to look at a subscription. The job runs every minute and used to read EVERY active
-- subscription each time, although a prayer falls due only five times a day. It now reads only the rows whose time has come
-- (or that have never been scheduled), and writes the next time after it has handled them.
-- NULL means "not scheduled yet": a new subscription, or one whose location, timezone or preferences just changed.
--
-- ORDER MATTERS: apply this BEFORE deploying the code that reads the column. The prayer-alert job selects every column of
-- push_subscription, so code that expects "next_alert_at" fails against a database that does not have it yet.
-- Both statements are safe to run twice.
ALTER TABLE "push_subscription" ADD COLUMN IF NOT EXISTS "next_alert_at" timestamp;
CREATE INDEX IF NOT EXISTS "ps_next_alert_idx" ON "push_subscription" ("next_alert_at") WHERE "active" = 1;
