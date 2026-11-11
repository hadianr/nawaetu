-- drizzle/0020_add_push_locale.sql
--
-- The language a device wants its notifications in. A signed-in user's language is read from their account
-- settings; a guest has no account, so their device says it when it subscribes.
--
-- ORDER MATTERS: apply this BEFORE deploying the code that reads the column. The prayer-alert job selects every
-- column of push_subscription, so code that expects "locale" fails against a database that does not have it yet.
-- The statement is safe to run twice.
ALTER TABLE "push_subscription" ADD COLUMN IF NOT EXISTS "locale" text;
