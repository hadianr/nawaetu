# Vercel Cron Job Workaround for Hobby Plan

## Problem
Vercel Hobby plan membatasi cron jobs hanya **1x per hari**, sedangkan kita butuh check setiap 5 menit untuk notifikasi waktu sholat.

## Solution Options

### Option 1: Single Daily Cron (Hobby Plan Compatible) ✅

Jalankan cron **1x per hari** di waktu Subuh (paling pagi), lalu di dalam endpoint kita check semua waktu sholat untuk hari itu dan schedule notifikasi menggunakan browser API.

**Pros**:
- ✅ Gratis (Hobby plan)
- ✅ Tidak perlu upgrade

**Cons**:
- ⚠️ Notifikasi hanya jalan kalau user buka app minimal 1x per hari
- ⚠️ Tidak bisa kirim notifikasi kalau app tertutup total

**Implementation**:
```json
{
    "crons": [
        {
            "path": "/api/notifications/prayer-alert",
            "schedule": "0 4 * * *"
        }
    ]
}
```
Schedule: `0 4 * * *` = Setiap hari jam 4 pagi (UTC) = 11 pagi WIB

---

### Option 2: Upgrade ke Vercel Pro Plan ($20/month) 💰

Upgrade ke Pro plan untuk mendapatkan akses ke cron jobs dengan interval lebih sering.

**Pros**:
- ✅ Cron bisa jalan setiap 1 menit (per-minute precision)
- ✅ Notifikasi jalan otomatis tanpa user buka app
- ✅ Lebih reliable untuk production

**Cons**:
- 💰 Biaya $20/bulan

**Vercel Pro Features**:
- Cron interval: **Once per minute**
- 100 cron jobs per project
- Better performance

---

### Option 3: Hybrid Approach (Recommended) ⭐⭐⭐

Kombinasi server-side (1x/day) + client-side (browser notifications):

1. **Server Cron (1x/day)**: Sync prayer times ke database setiap hari
2. **Client-side**: Browser menggunakan `Notification API` + `setTimeout` untuk trigger notifikasi di waktu yang tepat

**Pros**:
- ✅ Gratis (Hobby plan)
- ✅ Notifikasi tetap akurat (selama app dibuka minimal 1x)
- ✅ Fallback ke server notification jika memungkinkan

**Cons**:
- ⚠️ User harus buka app minimal 1x per hari
- ⚠️ iOS background limitation tetap berlaku

**Implementation**:
- Cron: `0 4 * * *` (daily sync)
- Client: `useAdhanNotifications` hook (sudah ada)

---

## Recommendation

Untuk **production** dengan budget terbatas, saya sarankan **Option 3 (Hybrid)**:

1. **Ubah `vercel.json`** ke daily schedule
2. **Endpoint tetap sama**, tapi fungsinya berubah jadi "daily sync"
3. **Client-side** yang handle notifikasi real-time (sudah ada di `useAdhanNotifications.ts`)

Ini sudah cukup untuk mayoritas use case, karena:
- User biasanya buka app minimal 1x per hari
- Client-side notification sudah handle foreground dengan baik
- Gratis dan sustainable

---

## Next Steps

Pilih salah satu opsi:

1. **Option 1/3**: Update `vercel.json` ke daily schedule
2. **Option 2**: Upgrade Vercel plan ke Pro
3. **Alternative**: Gunakan service lain (Cloudflare Workers, Railway, dll.) yang support frequent cron jobs di free tier

Mana yang Mas pilih?
