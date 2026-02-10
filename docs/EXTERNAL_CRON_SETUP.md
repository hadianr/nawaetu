# Panduan Setup Cron Eksternal (Reliable 100%)

GitHub Actions (Gratis) sering mengalami antrian/delay, dan Vercel Cron (Hobby) hanya bisa 1x sehari. Solusi terbaik untuk aplikasi sholat adalah menggunakan layanan cron pihak ketiga gratis seperti **cron-job.org**.

## Langkah-langkah Setup

1.  **Daftar Akun**
    *   Buka [console.cron-job.org](https://console.cron-job.org/)
    *   Sign up (Gratis).

2.  **Buat Cron Job Baru**
    *   Klik **"Create Cronjob"**.
    *   **Title**: `Nawaetu Prayer Alert` (atau bebas).
    *   **URL**: `https://nawaetu.com/api/notifications/prayer-alert?mode=alert`
    *   **Execution Schedule**:
        *   Pilih **"Every 10 minutes"**.
        *   Atau Custom: `*/10 * * * *`

3.  **Konfigurasi Header (PENTING)**
    *   Di bagian **Advanced** / **Headers**:
    *   Tambahkan Header baru:
        *   **Key**: `Authorization`
        *   **Value**: `Bearer <CRON_SECRET_ANDA>`
    *   *(Ganti `<CRON_SECRET_ANDA>` dengan value yang sama yang ada di Vercel Environment Variables)*.

4.  **Simpan & Test**
    *   Klik **Create**.
    *   Coba **"Run Now"** atau tunggu 10 menit.
    *   Cek tab **History** di cron-job.org untuk melihat apakah statusnya `200 OK`.
    *   Jika `200 OK`, berarti sukses! ✅

## Kenapa Ini Lebih Baik?
*   **Akurasi Tinggi**: Trigger tepat setiap 10 menit, tidak peduli antrian server lain.
*   **Gratis**: cron-job.org selamanya gratis untuk penggunaan wajar.
*   **Monitoring**: Anda bisa melihat history gagal/sukses dengan mudah.
