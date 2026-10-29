# Nawaetu: Aplikasi Pelacak Kebiasaan Islami 🌙

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#lisensi)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.15.7-blue)](https://github.com/hadianr/nawaetu/releases)

---

**Nawaetu** adalah aplikasi pelacak kebiasaan Islami gratis yang berangkat dari niat. Aplikasi ini menggabungkan jurnal niat harian dengan jadwal sholat, kiblat, Al-Qur'an digital dengan tajwid, hadits dan doa bersumber, Sirah, alat puasa dan Ramadhan, dzikir, serta asisten AI (**Tanya Nawaetu**) yang dirancang untuk menyertakan rujukan. Berjalan sebagai aplikasi web di [nawaetu.com](https://nawaetu.com), dapat dipasang sebagai PWA dengan Android wrapper di repositori ini, dalam bahasa Indonesia dan Inggris.

[**Buka Nawaetu**](https://nawaetu.com) | [**Read in English**](README.md)

## Fakta Singkat

| | |
| :--- | :--- |
| **Nama** | Dari kata *niat* |
| **Harga** | Gratis |
| **Bahasa** | Indonesia, Inggris |
| **Platform** | Web (PWA yang dapat dipasang), Android wrapper |
| **Lisensi** | AGPLv3, dengan lisensi komersial tersedia |
| **Situs** | [nawaetu.com](https://nawaetu.com) |

**Jelajahi:** [Al-Qur'an](https://nawaetu.com/quran) · [Hadits](https://nawaetu.com/hadith) · [Doa](https://nawaetu.com/dua) · [Sirah](https://nawaetu.com/sirah) · [Tanya Nawaetu (AI)](https://nawaetu.com/mentor-ai) · [Kiblat](https://nawaetu.com/qibla) · [Kalender Hijriah](https://nawaetu.com/hijri-calendar) · [Panduan Ramadhan](https://nawaetu.com/ramadhan) · [Tentang](https://nawaetu.com/about)

---

## 📑 Daftar Isi
- [Apa yang Membuat Nawaetu Berbeda?](#apa-yang-membuat-nawaetu-berbeda)
- [Galeri Visual](#-galeri-visual)
- [Pilar Utama & Fitur](#-pilar-utama--fitur)
- [FAQ](#faq)
- [Tech Stack](#️-tech-stack)
- [Lisensi](#-lisensi-dual-licensing)

> [!IMPORTANT]
> **Nawaetu menggunakan dual licensing.** Gratis untuk open source (AGPLv3), dengan **Lisensi Komersial** untuk penggunaan proprietary atau closed-source. Lihat bagian [Lisensi](#-lisensi-dual-licensing).

---

## Apa yang Membuat Nawaetu Berbeda?

Banyak aplikasi Islam berfokus pada utilitas seperti jadwal sholat dan penghitung tasbih. Nawaetu mempertahankan alat-alat itu dan membangun di sekitar niat di balik setiap ibadah. Jika Anda mencari alternatif Muslim Pro yang berfokus pada niat dan refleksi harian, beginilah perbedaannya:

| Aspek | Aplikasi utilitas (cth. Muslim Pro) | Nawaetu |
| :--- | :--- | :--- |
| **Fokus utama** | Jadwal sholat, penghitung, pengingat | **Niat lebih dulu**: alasan di balik ibadahmu |
| **Refleksi** | Penghitung dan pengingat pasif | **Jurnal Muhasabah**: niat pagi, refleksi malam |
| **Tanya jawab Islami** | Artikel dan pencarian teks | **Tanya Nawaetu**: asisten AI yang dirancang menyertakan rujukan Al-Qur'an dan hadits, dan menyatakan bila sumber belum dapat dipastikan |
| **Motivasi** | Penghitung dan streak | **Sistem Hasanah**: progres rank (Mubtadi → Muhsinin) dan streak Istiqamah |
| **Al-Qur'an dan dzikir** | Audio standar dan tasbih biasa | **Mode Fokus**: screen wake lock, jangkar Basmalah, tasbih Zen OLED |
| **Iklan** | Bervariasi menurut aplikasi dan paket | Tanpa iklan |
| **Kode sumber** | Umumnya closed-source | Open source (AGPLv3) |

---

## ✨ Galeri Visual

| Jurnal Niat | Tanya Nawaetu | Al-Qur'an (Mushaf) |
| :---: | :---: | :---: |
| ![Jurnal Niat](./public/images/readme/intention_journal.png) | ![Tanya Nawaetu](./public/images/readme/tanya_nawaetu.png) | ![Al-Qur'an Mushaf](./public/images/readme/digital_quran.png) |

---

## 🌟 Pilar Utama & Fitur

### 1. 🎯 Pembinaan Berbasis Niat
*   **Jurnal Niat**: Tetapkan "Niat" setiap pagi dan refleksi di malam hari (Muhasabah Jiwa).
*   **Tanya Nawaetu**: Asisten Islami yang dirancang mendasarkan jawaban pada Al-Qur'an, Sunnah, dan Hadits beserta rujukan, serta mengakui batasnya bila sumber belum dapat dipastikan.
*   **Gamifikasi Ibadah**: Kumpulkan Niat Points melalui misi harian yang bermakna.

### 2. 📖 Konten Spiritual Terpadu
*   **Al-Qur'an Digital**: Mode Mushaf & List dengan audio per ayat, pewarnaan Tajwid, dan standar Mushaf Kemenag RI.
*   **Hub Hadits & Doa**: Konten pilihan harian dengan terjemahan Bahasa Indonesia dan Inggris.
*   **Feed Spiritual**: Widget Daily Spirit, Quote of the Day, dan Hadits harian.

### 3. 🕌 Presisi Ritual
*   **Adzan Presisi Tinggi**: Jadwal sholat berbasis GPS dengan akurasi notifikasi < 60 detik.
*   **Kompas Kiblat**: Penunjuk arah presisi berbasis sensor perangkat.
*   **Kalibrasi Hijriah**: Penyesuaian tanggal yang fleksibel sesuai dengan pengamatan hilal lokal.

### 4. 📈 Alat Konsistensi (Istiqamah)
*   **Tasbih 2.0**: Penghitung canggih dengan mode Berantai (Sequential), bacaan Kustom, dan Mode Zen OLED.
*   **Check-in Sholat**: Pelacak ritual presisi tinggi dengan opsi jamaah/sendiri.
*   **Dashboard Ibadah**: Statistik seumur hidup, milestone, dan visualisasi tren Hasanah.

### 5. 🗓️ Pendamping Puasa & Amalan Musiman
*   **Puasa Sunnah & Sukarela**: Pelacak puasa Senin-Kamis, Ayyamul Bidh, dan puasa kustom dengan status berbasis fiqih dan reward Hasanah.
*   **Peristiwa Hijriah & Musiman**: Pelacakan presisi untuk milestone kalender Islam, pengamatan hilal, dan panduan amalan musiman.
*   **Mode Ramadhan**: Panduan Fiqh khusus, rekomendasi Sahur & Buka Puasa sesuai Sunnah, serta hitung mundur yang aktif secara dinamis di Bulan Suci.

---

## ⚡ Performance & Optimization

**PageSpeed Insights Score: 88-93/100** 🚀

Kami obsessed sama performa karena ibadah gak boleh distracted sama lag:

### 🎨 Core Web Vitals (Audit 2026-03-05)
- ⚡ **First Contentful Paint**: 1.8s (Improved!)
- 🖼️ **Largest Contentful Paint**: 2.9s (Improved!)
- 📊 **Cumulative Layout Shift**: 0.042 (Excellent!)
- ⏱️ **Total Blocking Time**: 40ms (Improved!)

### 🛠️ Technical Optimizations
- ✅ **Fully Static / ISR**: Halaman Surat Al-Qur'an (114 surah) sekarang fully static via `generateStaticParams`.
- ✅ **Zero Runtime Middleware CPU**: Header keamanan (CSP, HSTS, dll) dipindahkan ke konfigurasi statis Next.js.
- ✅ **JWT Session Strategy**: Menghilangkan lookup database per-request untuk validasi sesi.
- ✅ **Advanced Code Splitting**: Main chunk dioptimasi, unused code di-tree-shake secara agresif.
- ✅ **Image Optimization**: AVIF/WebP dengan lazy loading dan minimum TTL 1 tahun.
- ✅ **Crawl Efficiency**: Sitemap & Robots dioptimasi untuk melewatkan halaman private.

### 📱 Accessibility: 100/100
- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Reader Friendly**: Semantic HTML & ARIA labels
- ✅ **Color Contrast**: All text meets contrast ratio requirements
- ✅ **Focus Management**: Clear focus indicators

### 🔒 Best Practices: 100/100
- ✅ **HTTPS Everywhere**
- ✅ **No Console Errors**
- ✅ **Modern Image Formats**
- ✅ **Secure Dependencies**
- ✅ **CSP Headers**

### 🔍 SEO: 100/100
- ✅ **Meta Tags Optimized**
- ✅ **Semantic HTML5**
- ✅ **Open Graph & Twitter Cards**
- ✅ **Sitemap & Robots.txt**
- ✅ **Structured Data (JSON-LD)**
- ✅ **Mobile-Friendly**

---

## FAQ

**Apa itu Nawaetu?**
Aplikasi pelacak kebiasaan Islami gratis yang berangkat dari niat, dengan Al-Qur'an, alat ibadah, hadits dan doa bersumber, Sirah, alat puasa dan Ramadhan, dzikir, serta asisten AI.

**Apakah Nawaetu gratis?**
Ya. Aplikasi dapat digunakan gratis, dan kode sumbernya terbuka di bawah AGPLv3.

**Apakah bisa dipakai tanpa internet?**
Beberapa fitur dapat diakses tanpa koneksi internet.

**Bagaimana Tanya Nawaetu menjawab pertanyaan agama?**
Dirancang untuk menyertakan rujukan pada jawaban agama dan mengakui batasnya bila sumber belum dapat dipastikan. Ini tidak menggantikan ulama yang kompeten.

**Bahasa apa yang didukung?**
Indonesia dan Inggris.

---

## 🛠️ Tech Stack

Versi dikunci di [`package.json`](package.json).

### Core Framework
*   **Next.js** (App Router) - Meta-framework React utama
*   **TypeScript** - Arsitektur type-safe yang ketat
*   **React** - Fitur concurrent & Server Components terbaru

### Backend & Database
*   **Drizzle ORM** - Type-safe SQL database query
*   **PostgreSQL (Supabase)** - Database serverless melalui transaction pooler
*   **NextAuth v5** - Sesi autentikasi aman
*   **Upstash Redis & Rate Limiting** - Proteksi dan pembatasan rate API terdistribusi
*   **Firebase Admin SDK** - Infrastruktur push notification
*   **cron-job.org** - Penjadwalan prayer-alert dan streak reminder

### AI & External APIs
*   **Google Gemini** (`@google/generative-ai`)
*   **Groq (Llama)** - Inferensi LLM kecepatan tinggi
*   **Aladhan API** (Jadwal Sholat GPS)
*   **Quran.com API** (Mushaf Uthmani & Audio Murottal)

### UI, Styling & Experience
*   **Tailwind CSS v4** & **Shadcn UI** (Primitif Radix UI)
*   **Framer Motion** - Animasi mulus & mikro-interaksi
*   **Recharts** - Analitik dinamis & grafik tren Hasanah
*   **Lucide React** & **Sonner** - Ikonografi & notifikasi toast
*   **Next PWA (`@ducanh2912/next-pwa`)** - Progressive Web App yang dapat diinstal

### Monitoring & Kualitas
*   **Sentry** - Pelacakan error real-time & pemantauan performa
*   **Vercel Speed Insights** - Real User Performance Monitoring
*   **Vitest** - Pengujian unit dan integrasi

---

## 🚀 Deployment

### Live Demo
- 🌐 **Production**: [nawaetu.com](https://nawaetu.com)
- 📊 **Vercel Dashboard**: [Vercel Console](https://vercel.com)

### Auto-Deployment Pipeline

**Trigger Events:**
```
Push ke main branch
    ↓
Vercel: Auto-Build & Test
    ↓
Vercel: Auto-Deploy (production)
    ↓
Live pada nawaetu.com ✅
```

**Deployment Flow:**
1. Code pushed ke GitHub `main` branch
2. Vercel automatically triggers build & test
3. Jika build success ✅
4. Vercel automatically deploy to production (~2-5 min)
5. Deploy logs bisa dilihat di Vercel dashboard

### Deployment Status

| Environment | URL | Status |
|---|---|---|
| **Production** | https://nawaetu.com | 🟢 Active |
| **Preview** | Each PR → Vercel preview URL | 🟢 Auto-generated |

### Preview Deployments

Setiap Pull Request otomatis mendapat **preview URL**:

```
PR #123 → https://nawaetu-pr-123.vercel.app

Gunakan untuk testing sebelum merge!
```

### Monitoring & Performance

- **Vercel Analytics**: Response time, error tracking, performance metrics
- **Vercel Build Logs**: Real-time build output dan error tracking
- **Automatic Rollback**: Jika issue, mudah di-revert via Vercel dashboard

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Recommended: 20.x)
- npm/yarn/pnpm

### Installation

```bash
# Clone repo
git clone https://github.com/hadianr/nawaetu.git
cd nawaetu

# Install dependencies
npm ci

# Copy environment variables
cp .env.example .env.local

# Fill in your API keys in .env.local
# - GEMINI_API_KEY
# - GROQ_API_KEY
# - SENTRY_AUTH_TOKEN (optional)
# - NEXT_PUBLIC_GA_MEASUREMENT_ID (optional)

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Or deploy to Vercel (recommended)
vercel deploy
```

---

## 📱 PWA Installation

Nawaetu bisa diinstall kayak native app:

**Android:**
1. Buka nawaetu.com di Chrome
2. Tap menu (3 titik) → "Install app"
3. Done! Icon muncul di home screen

**iOS:**
1. Buka nawaetu.com di Safari
2. Tap Share button → "Add to Home Screen"
3. Done! Launch dari home screen

---

## 🤝 Contributing

Kami sangat menyambut kontribusi dari seluruh komunitas global! Baik berupa perbaikan bug, fitur baru, dokumentasi, maupun terjemahan.

## 🤝 Kontribusi

Kami sangat menyambut kontribusi dari seluruh komunitas global! Baik berupa perbaikan bug, fitur baru, dokumentasi, maupun terjemahan.

Harap pelajari [Code of Conduct](CODE_OF_CONDUCT.md) kami sebelum berkontribusi.
Untuk melaporkan bug atau mengajukan ide fitur baru, silakan gunakan [GitHub Issue Templates](https://github.com/hadianr/nawaetu/issues/new/choose). Panduan kontribusi lengkap dapat dibaca di [CONTRIBUTING.id.md](CONTRIBUTING.id.md) (Bahasa Indonesia) atau [CONTRIBUTING.md](CONTRIBUTING.md) (English).

**Cara Berkontribusi:**
1. **Fork** repositori ini
2. **Buat branch fitur** (`git checkout -b feature/amazing-feature`)
3. **Commit perubahan** (`git commit -m 'feat: add amazing feature'`)
4. **Push ke branch** (`git push origin feature/amazing-feature`)
5. **Buat Pull Request**

---

## 📄 License

Open Source untuk tujuan dakwah & edukasi.
Developed with ❤️ by **Antigravity** for the ummah.

---

## 🎨 Brand Assets

### Hashtags
`#NiatAjaDulu` `#Nawaetu` `#BuildHabits` `#IslamicGamification` `#IbadahHabits` `#StreakKeeper` `#DailyMissions` `#LevelUpIman` `#IstiqomahDaily` `#HabitTracker` `#MuslimTech`

### Social Media
- Website: [nawaetu.com](https://nawaetu.com)
- Instagram: [@nawaetuapp](https://instagram.com/nawaetuapp) (coming soon)
- Twitter: [@nawaetuapp](https://twitter.com/nawaetuapp) (coming soon)
- GitHub: [hadianr/nawaetu](https://github.com/hadianr/nawaetu)

---

## 🚀 Getting Started

### For Users
1. Visit [nawaetu.com](https://nawaetu.com)
2. Allow location permission untuk fitur jadwal sholat
3. Mulai complete daily missions!
4. Optional: Install as PWA (add to home screen)

### For Developers

**Prerequisites:**
- Node.js 24.x
- npm (repositori memakai `package-lock.json`)
- Git

**Installation:**
```bash
# Clone repository
git clone https://github.com/hadianr/nawaetu.git
cd nawaetu

# Install dependencies
npm ci

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan konfigurasi Anda

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

**Available Scripts:**
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

## 📦 Alur Rilis (Release Workflow)

Maintainer dapat melakukan rilis versi baru menggunakan script otomatis:
```bash
./scripts/release.sh v1.X.Y
```
Script ini akan secara otomatis memperbarui versi pada `package.json`, `package-lock.json`, `src/config/app-config.ts`, badge `README.md`, serta memperbarui `CHANGELOG.md`.

Untuk panduan lengkap dan troubleshooting, baca [Panduan Alur Rilis](docs/RELEASE_WORKFLOW.md).

---

**Note:** Vercel handles all build & test automation. GitHub Actions hanya untuk release management.

---

## 🤝 Contributing

Contributions adalah welcome! Berikut cara contribute:

1. **Fork** repository ini
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

**Commit Message Convention:**
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

**Code Standards:**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- React best practices

---

## 📋 Project Structure

```
nawaetu/
├── src/
│   ├── app/              # Next.js app pages
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── data/             # Static data & translations
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions & helpers
│   └── instrumentation.ts
├── public/               # Static assets
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── .env.example          # Environment variables template
├── CHANGELOG.md          # Version history
├── package.json
└── README.md
```

---

## 💬 Support

Punya pertanyaan atau feedback? Reach out:
- 📧 Email: support@nawaetu.com
- 💬 In-app: Tanya Nawaetu (Asisten Muslim AI)
- 🐛 Issues: [GitHub Issues](https://github.com/hadianr/nawaetu/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/hadianr/nawaetu/discussions)

---


## ☕ Dukung Misi Nawaetu

Nawaetu adalah proyek open-source untuk umat. Dukungan Anda membantu menutupi biaya server (database, hosting) dan mempercepat pengembangan fitur baru.

### ☁️ Sponsor Infrastruktur
Kami sangat berterima kasih atas dukungan dari **[Biznet Gio Cloud](https://www.biznetgio.com/)**, yang telah bermurah hati menyediakan infrastruktur server cloud berkinerja tinggi untuk menenagai Nawaetu.com.

[![Biznet Gio Cloud](https://img.shields.io/badge/Supported_by-Biznet_Gio_Cloud-00529B?style=for-the-badge&logo=icloud&logoColor=white)](https://www.biznetgio.com/)

*Apakah perusahaan Anda tertarik mendukung teknologi open-source Islami? Jadilah sponsor untuk menampilkan logo/brand Anda di sini dan bantu kami mengembangkan aplikasi Nawaetu untuk umat global! Hubungi [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com).*

### 💖 Platform Donasi
| Platform | Link |
| :--- | :--- |
| **GitHub Sponsors** | [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=flat-square&logo=github)](https://github.com/sponsors/hadianr) |
| **Trakteer** | [![Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=flat-square&logo=ko-fi&logoColor=white)](https://trakteer.id/hadianr) |
| **Ko-fi** | [![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-F16061?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/hadianr) |
| **Buy Me a Coffee** | [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/hadianr) |

### 🏢 Lisensi Komersial
*Untuk kebutuhan bisnis, white-label, atau penggunaan closed-source.*

| Tingkat | Harga | Keuntungan |
| :--- | :--- | :--- |
| **Standar** | **$500** / tahun | 1 Produk, Source Code Privat, Update Reguler |
| **Perpetual** | **$1,500** sekali bayar | Lisensi Selamanya, Whitelabel, Priority Support |

👉 [**Mulai via GitHub Sponsors**](https://github.com/sponsors/hadianr)

Semoga Allah membalas kebaikan Anda dengan keberkahan. Jazakumullah Khairan Katsiran! 🤲

---

<a name="lisensi"></a>
## 📄 Lisensi (Dual Licensing)

**Nawaetu** menerapkan model **Dual Licensing** untuk menjaga keberlanjutan proyek dan melindungi komunitas:

### 1. Edisi Komunitas (Gratis & Open Source)
Berlisensi di bawah **AGPLv3 (GNU Affero General Public License v3)**.
- ✅ Gratis digunakan, dimodifikasi, dan didistribusikan.
- ⚠️ Jika Anda memodifikasi dan mendistribusikan (termasuk menjalankannya sebagai layanan SaaS), **Anda WAJIB membuka source code Anda** di bawah lisensi AGPLv3.
- **Cocok untuk**: Individu, komunitas, belajar, dan kontribusi open source.

### 2. Lisensi Komersial (Berbayar/White Label)
Untuk perusahaan atau individu yang ingin menggunakan Nawaetu untuk **tujuan komersial**, **white-label**, atau **tanpa membuka source code**.
- ✅ Source code tetap privat (tidak perlu open source).
- ✅ Boleh rebranding (White Label).
- ✅ Priority support & fitur enterprise.
- 📩 Kontak: **hadian.rahmat@gmail.com** untuk harga dan detail.
- 📖 Baca ketentuan lengkap: [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md)

Lihat file [LICENSE](LICENSE) untuk teks lengkap AGPLv3.

---

## 👤 Author

**Hadian Rahmat**
- GitHub: [@hadianr](https://github.com/hadianr)
- Email: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)

---

## 🙏 Acknowledgments

- Murattal by Mishary Rashid Al-Afasy
- Quran API by [Quran.com](https://quran.com)
- Prayer times calculation by [Aladhan API](https://aladhan.com)
- Icons by [Lucide Icons](https://lucide.dev)
- UI Components by [shadcn/ui](https://ui.shadcn.com)
- AI powered by [Google Gemini](https://gemini.google.com) & [Groq](https://groq.com)

----

**"Innama al-a'malu bin-niyyat" - Start with intention, end with blessings.**

**#LuruskanNiat #BuildHabits #IstiqomahDaily #HasanahPoints**

Let's make ibadah easier, one niat at a time. 🚀🌙

---

*Last updated: March 15, 2026*
