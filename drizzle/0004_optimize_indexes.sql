CREATE INDEX IF NOT EXISTS "intention_user_id_idx" ON "intention" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "intention_user_id_date_idx" ON "intention" USING btree ("userId","niat_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_user_id_idx" ON "transaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_status_idx" ON "transaction" USING btree ("status");