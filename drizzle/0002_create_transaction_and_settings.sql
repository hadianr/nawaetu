-- ============================================================================
-- Migration: 0002_create_transaction_and_settings.sql
-- Date Created: 2026-02-12
-- Description: Add payment/infaq system and user settings synchronization
-- Changes:
--   NEW TABLE:
--     - transaction (Payment transactions via Mayar.id)
--   NEW COLUMNS:
--     - push_subscription.last_notification_sent (JSON: track last sent per prayer)
--     - user.is_muhsinin (Boolean: Muhsinin premium tier status)
--     - user.muhsinin_since (Timestamp: when user became Muhsinin)
--     - user.total_infaq (Integer: total donation amount in rupiah)
--     - user.settings (JSON: theme, muadzin, locale, notificationPreferences, etc)
-- ============================================================================

CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"amount" integer NOT NULL,
	"status" text NOT NULL,
	"mayar_id" text,
	"payment_link_id" text,
	"payment_url" text,
	"customer_name" text,
	"customer_email" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transaction_mayar_id_unique" UNIQUE("mayar_id"),
	CONSTRAINT "transaction_payment_link_id_unique" UNIQUE("payment_link_id")
);
--> statement-breakpoint
ALTER TABLE "push_subscription" ADD COLUMN "last_notification_sent" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_muhsinin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "muhsinin_since" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_infaq" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "settings" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;