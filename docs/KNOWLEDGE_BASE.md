# Nawaetu Knowledge Base

Dokumen ini merangkum standar, design system, best practice, struktur proyek, bahasa, dan hal penting lain sebagai rujukan pengembangan.

## 1) Ringkasan Produk
- Aplikasi Muslim fokus niat dan habit tracking dengan AI mentor, Quran, jadwal sholat, kiblat, dan gamifikasi.
- App config dan metadata terpusat di [src/config/app-config.ts](src/config/app-config.ts).

## 2) Tech Stack Utama
- Next.js App Router + React 19 + TypeScript strict.
- Tailwind CSS v4 + shadcn/ui + Framer Motion.
- Drizzle ORM + PostgreSQL (NeonDB) untuk data persisten.
- Firebase Admin untuk push notifications.
- PWA via next-pwa dan service worker.

Sumber:
- [README.md](README.md)
- [next.config.ts](next.config.ts)
- [components.json](components.json)

## 3) Struktur Proyek
Top-level:
- App Router dan UI di [src/app](src/app).
- Komponen UI reusable di [src/components](src/components).
- Hooks di [src/hooks](src/hooks).
- Data statis dan translations di [src/data](src/data).
- Konfigurasi dan konstan di [src/config](src/config) dan [src/lib](src/lib).
- Database schema di [src/db](src/db).
- Core infrastructure (storage, adapters) di [src/core](src/core).

Catatan pola:
- Akses module menggunakan alias path @/* (lihat [tsconfig.json](tsconfig.json)).
- App Router entry ada di [src/app/layout.tsx](src/app/layout.tsx) dan [src/app/page.tsx](src/app/page.tsx).

## 4) Standar Coding dan Konvensi
- TypeScript strict mode aktif (lihat [tsconfig.json](tsconfig.json)).
- ESLint config berbasis Next.js core web vitals (lihat [eslint.config.mjs](eslint.config.mjs)).
- Konvensi commit: Conventional Commits (lihat [CONTRIBUTING.md](CONTRIBUTING.md)).
- Gunakan alias @ untuk import internal (lihat [tsconfig.json](tsconfig.json)).

Best practice internal:
- Storage keys harus memakai single source of truth di [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts).
- Translations wajib ada di file translation dan diakses via context (lihat bagian i18n).

## 5) Design System dan UI
### 5.1 Tailwind + CSS Variables
- Tailwind v4 dengan CSS variables untuk theme tokens di [src/app/globals.css](src/app/globals.css).
- Token warna dan radius diset via :root dan .dark, dipetakan ke --color-* di @theme inline.
- Utility tambahan seperti pb-nav dan scrollbar-hide juga didefinisikan di globals.

### 5.2 Komponen
- shadcn/ui dipakai sebagai basis komponen (lihat [components.json](components.json)).
- Gunakan helper class merging di [src/lib/utils.ts](src/lib/utils.ts) via fungsi `cn`.

### 5.3 Tipografi
- Font utama di-load di layout: Geist untuk sans/mono, Amiri dan Lateef untuk teks Arab (lihat [src/app/layout.tsx](src/app/layout.tsx)).

### 5.4 Pola Styling
- Gunakan var color tokens: contoh bg dan text yang mengacu ke var CSS (lihat [src/app/page.tsx](src/app/page.tsx)).
- Hindari hardcoded color kecuali kebutuhan spesifik (selaras dengan guideline di [CONTRIBUTING.md](CONTRIBUTING.md)).

## 6) Bahasa dan i18n
- Locale context ada di [src/context/LocaleContext.tsx](src/context/LocaleContext.tsx).
- Translations utama settings ada di [src/data/settings-translations.ts](src/data/settings-translations.ts).
- Locale default: id, disimpan ke storage key SETTINGS_LOCALE.

Aturan praktis:
- Jika menambah teks UI baru, tambahkan key di file translation terkait.
- Gunakan `useLocale()` atau `useTranslations()` untuk akses string.

## 7) Storage dan Data
### 7.1 Storage Service
- Service storage memakai adapter pattern di [src/core/infrastructure/storage](src/core/infrastructure/storage).
- Akses service via `getStorageService()` dan key dari [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts).

### 7.2 Database dan ORM
- Schema utama di [src/db/schema.ts](src/db/schema.ts).
- Drizzle ORM dipakai, dan testing memmock layer db (lihat [src/__tests__/setup.ts](src/__tests__/setup.ts)).

## 8) Notifikasi dan Cron
- Dokumentasi pendekatan hybrid dan iOS ada di:
  - [docs/HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md)
  - [docs/IOS_NOTIFICATION_SETUP.md](docs/IOS_NOTIFICATION_SETUP.md)
  - [docs/VERCEL_CRON_WORKAROUND.md](docs/VERCEL_CRON_WORKAROUND.md)
  - [docs/EXTERNAL_CRON_SETUP.md](docs/EXTERNAL_CRON_SETUP.md)

Ringkasannya:
- Cron harian untuk refresh token atau sync.
- Notifikasi real-time dilakukan client-side saat app terbuka.
- Alternatif cron eksternal disediakan untuk presisi lebih tinggi.

## 9) Release dan Deployment
- Release workflow otomatis via script dan changelog (lihat [docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md)).
- Deployment Vercel dijelaskan di [\.github/VERCEL_DEPLOYMENT.md](.github/VERCEL_DEPLOYMENT.md).

## 10) Testing
- Vitest config di [vitest.config.ts](vitest.config.ts).
- Setup test mocks di [src/__tests__/setup.ts](src/__tests__/setup.ts).

## 11) Performance dan SEO
- Optimasi build dan bundle di [next.config.ts](next.config.ts).
- SEO metadata lengkap di [src/app/layout.tsx](src/app/layout.tsx).
- PWA config termasuk service worker dan cache headers di [next.config.ts](next.config.ts).

## 12) Checklist Saat Menambah Fitur
- Tambahkan teks ke translation file yang sesuai.
- Gunakan storage keys dari single source di [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts).
- Ikuti pola styling (CSS vars, Tailwind utilities).
- Update changelog jika release-eligible.
- Tambahkan atau update test bila ada logic penting.

## 13) Panduan Context Prompting
Tujuan bagian ini adalah membuat prompt yang konsisten, cepat dipahami, dan mengarahkan perubahan ke area yang benar.

Prinsip:
- Sertakan tujuan, scope, dan batasan dalam 1-3 kalimat.
- Cantumkan file/fitur yang relevan jika sudah diketahui.
- Nyatakan definisi selesai (acceptance criteria) secara ringkas.
- Untuk UI, sebutkan target device (mobile/desktop) dan komponen yang ingin diubah.
- Untuk data/logic, sebutkan data source, key storage, atau schema terkait.

Template singkat (fitur):
```
Tujuan: <hasil yang diinginkan>
Scope: <file/fitur utama>
Batasan: <aturan/larangan penting>
Kriteria selesai: <2-4 poin>
```

Template singkat (UI):
```
Tujuan UI: <perubahan visual/UX>
Target: <mobile/desktop>
Komponen: <nama komponen atau page>
Constraints: gunakan theme tokens, i18n key baru jika ada
```

Template singkat (bugfix):
```
Masalah: <gejala>
Repro: <langkah ringkas>
Ekspektasi: <yang seharusnya>
Lokasi dugaan: <file/feature>
```

Catatan praktis:
- Jika menyentuh teks UI, sebutkan bahasa yang perlu diupdate (id/en).
- Jika menyentuh storage, pastikan key berada di [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts).
- Jika menyentuh cron/notification, rujuk dokumen di [docs/HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md).

## 14) Referensi Utama
- Produk dan arsitektur: [README.md](README.md)
- Kontribusi dan coding style: [CONTRIBUTING.md](CONTRIBUTING.md)
- Release: [docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md)
- Deployment: [\.github/VERCEL_DEPLOYMENT.md](.github/VERCEL_DEPLOYMENT.md)
- Notifikasi: [docs/HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md)
