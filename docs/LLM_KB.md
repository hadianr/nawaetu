# Nawaetu LLM Knowledge Base

Tujuan: sumber ringkas untuk prompt LLM agar akurat, konsisten, dan sesuai standar proyek.

## 1) Produk Singkat
- Aplikasi Muslim fokus niat dan habit tracking (AI mentor, Quran, jadwal sholat, kiblat, gamifikasi).
- Branding: Nawaetu, #NiatAjaDulu, #StartWithIntention.

Sumber utama: [README.md](README.md), [README.id.md](README.id.md)

## 2) Stack & Platform
- Next.js App Router + React 19 + TypeScript strict.
- Tailwind CSS v4 + shadcn/ui + Framer Motion.
- Drizzle ORM + PostgreSQL (NeonDB).
- Firebase Admin untuk push notifications.
- PWA via next-pwa + service worker.

Sumber: [next.config.ts](next.config.ts), [components.json](components.json)

## 3) Struktur Proyek
- App Router: [src/app](src/app)
- Komponen: [src/components](src/components)
- Hooks: [src/hooks](src/hooks)
- Data statis & i18n: [src/data](src/data)
- Config & konstanta: [src/config](src/config), [src/lib](src/lib)
- DB schema: [src/db](src/db)
- Core infra (storage): [src/core](src/core)

Alias import: gunakan @/* (lihat [tsconfig.json](tsconfig.json)).

## 4) Design System & UI
- Token warna/typography via CSS variables di [src/app/globals.css](src/app/globals.css).
- Gunakan class merging `cn` di [src/lib/utils.ts](src/lib/utils.ts).
- Font utama: Geist (sans/mono), Arabic: Amiri/Lateef di [src/app/layout.tsx](src/app/layout.tsx).

Aturan:
- Gunakan var tokens `rgb(var(--color-*))`.
- Hindari hardcoded colors kecuali kebutuhan spesifik.
- Untuk komponen baru, prefer shadcn/ui style.

## 5) Bahasa & i18n
- Locale context: [src/context/LocaleContext.tsx](src/context/LocaleContext.tsx).
- Translations settings: [src/data/settings-translations.ts](src/data/settings-translations.ts).
- Default locale: id.

Aturan:
- Teks UI baru wajib masuk ke translation (id/en).
- Akses string via `useLocale()`/`useTranslations()`.

## 6) Storage
- Storage service menggunakan adapter pattern: [src/core/infrastructure/storage](src/core/infrastructure/storage).
- Storage keys adalah single source: [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts).

Aturan:
- Jangan hardcode key baru, tambah di storage-keys.

## 7) Notifications & Cron
- Dokumen terkait:
  - [docs/HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md)
  - [docs/IOS_NOTIFICATION_SETUP.md](docs/IOS_NOTIFICATION_SETUP.md)
  - [docs/VERCEL_CRON_WORKAROUND.md](docs/VERCEL_CRON_WORKAROUND.md)
  - [docs/EXTERNAL_CRON_SETUP.md](docs/EXTERNAL_CRON_SETUP.md)

Ringkasan:
- Cron harian untuk token sync.
- Notifikasi real-time via client ketika app terbuka.
- External cron opsional untuk presisi tinggi.

## 8) Release & Deployment
- Release workflow otomatis: [docs/RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md).
- Deploy ke Vercel: [.github/VERCEL_DEPLOYMENT.md](.github/VERCEL_DEPLOYMENT.md).

## 9) Testing
- Vitest config: [vitest.config.ts](vitest.config.ts).
- Test setup & mocks: [src/__tests__/setup.ts](src/__tests__/setup.ts).

## 10) Konvensi & Best Practices
- TypeScript strict + ESLint core web vitals.
- Conventional Commits (lihat [CONTRIBUTING.md](CONTRIBUTING.md)).
- i18n wajib diupdate ketika menambah teks UI.
- Update changelog jika release-eligible.

## 11) Prompting Checklist (LLM)
Saat membuat prompt untuk perubahan:
- Tujuan dan scope jelas (1-3 kalimat).
- File/fitur yang diubah disebutkan.
- Batasan: i18n, storage keys, theme tokens.
- Kriteria selesai 2-4 poin.

Contoh ringkas:
```
Tujuan: Tambah opsi tema baru di settings
Scope: src/components/NotificationSettings.tsx, src/data/settings-translations.ts
Batasan: gunakan token CSS, update id/en
Kriteria selesai: opsi tema muncul, tersimpan di storage, tampil konsisten
```

## 12) File Kunci
- App config: [src/config/app-config.ts](src/config/app-config.ts)
- Global styles: [src/app/globals.css](src/app/globals.css)
- Entry layout/page: [src/app/layout.tsx](src/app/layout.tsx), [src/app/page.tsx](src/app/page.tsx)
- Locale context: [src/context/LocaleContext.tsx](src/context/LocaleContext.tsx)
- Storage keys: [src/lib/constants/storage-keys.ts](src/lib/constants/storage-keys.ts)
- Notif docs: [docs/HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md)

## 13) Batasan Umum
- Hindari hardcoded string UI tanpa i18n.
- Hindari hardcoded colors tanpa token.
- Jangan menulis storage key di luar single source.
