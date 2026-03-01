-- Migration: Refactor archetype enum → Niat Penggunaan
-- Mengubah nilai enum lama (beginner, striver, dedicated) ke sistem baru (esensial, seimbang, lengkap)
-- Data lama yang tidak dikenali di-reset ke NULL agar user melewati onboarding ulang

-- Step 1: Ubah kolom ke text sementara agar bebas dari constraint enum lama
ALTER TABLE "user" ALTER COLUMN "archetype" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Reset nilai lama yang tidak lagi valid ke NULL
-- User dengan archetype lama akan diarahkan ke onboarding tipe niat baru
UPDATE "user" SET archetype = NULL WHERE archetype IN ('beginner', 'striver', 'dedicated');--> statement-breakpoint

-- Step 3: Hapus enum lama
DROP TYPE "public"."archetype";--> statement-breakpoint

-- Step 4: Buat enum baru dengan nilai Niat Penggunaan
CREATE TYPE "public"."archetype" AS ENUM('esensial', 'seimbang', 'lengkap');--> statement-breakpoint

-- Step 5: Kembalikan kolom ke tipe enum baru (aman karena data sudah NULL atau valid)
ALTER TABLE "user" ALTER COLUMN "archetype" SET DATA TYPE "public"."archetype" USING "archetype"::"public"."archetype";
