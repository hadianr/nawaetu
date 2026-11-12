-- A guest's hidden account (the "@nawaetu.local" user) used to be reachable by anyone who knew the device token.
-- The device now also holds a random secret and sends it with every request; only its hash is stored here.
-- NULL means no device has bound a secret yet (an account from before this, or one never used since): the first
-- request that carries a secret binds it.
--
-- ORDER MATTERS: apply this BEFORE deploying the code that reads the column. Routes that select the whole user row
-- are unaffected, but the journal routes read and write "guest_secret_hash". The statement is safe to run twice.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "guest_secret_hash" text;
