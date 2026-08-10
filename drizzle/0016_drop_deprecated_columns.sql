-- Migration 0016: Drop deprecated columns (ponytail audit cleanup)
--
-- push_subscription.user_location: deprecated in favor of separate latitude/longitude columns.
--   Added in 0009, superseded immediately. Zero active query references.
--
-- ramadhan_taraweh_log.is_qiyamul_lail: speculative column, never written or read.
--
-- ramadhan_daily_log.fardhu_location: redundant with individual fajr/dhuhr/asr/maghrib/isha_at_masjid
--   boolean columns on the same table. Never read by any query.

ALTER TABLE "push_subscription" DROP COLUMN IF EXISTS "user_location";
ALTER TABLE "ramadhan_taraweh_log" DROP COLUMN IF EXISTS "is_qiyamul_lail";
ALTER TABLE "ramadhan_daily_log" DROP COLUMN IF EXISTS "fardhu_location";
