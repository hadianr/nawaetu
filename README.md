# Nawaetu 🌙✨

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#license)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.8.17-blue)](https://github.com/hadianr/nawaetu/releases)

> *"Innama al-a'malu bin-niyyat" - Indeed, actions are judged by intentions.*

**Current Version: v1.8.17** | [Read in Indonesian 🇮🇩](README.id.md) | [See Changelog](CHANGELOG.md) | [View Roadmap](ROADMAP.md)

> [!IMPORTANT]
> **Nawaetu 100% gratis untuk proyek Open Source (Lisensi AGPLv3).** Namun, jika perusahaan Anda ingin membuat aplikasi menggunakan source code Nawaetu secara tertutup (SaaS berbayar, Whitelabel tanpa mempublikasikan kode Anda), Anda **wajib** membeli **Lisensi Komersial**.

### 🚀 Recent Highlights (v1.8.x)
- **Intention & Reflection Journal**: Align your heart every morning and muhasabah every evening.
- **Improved FCM Notifications**: High-precision Adhan alerts (< 60s delay) with iOS "Killed State" reliability.
- **Enhanced Spiritual Feed**: Daily Spirit, Quote of the Day, and interactive Prayer Check-in widgets.
- **Modern Bilingual Support**: Full English-Indonesian localization for all content, including Hadith and Duas.
- **Ramadhan 2026 Ready**: Smart Hijri adjustment, countdowns, and specialized Fiqh guides.


**Nawaetu** (derived from "Niat" or Intention) is the **only Islamic app** that helps you build lasting spiritual habits by starting with pure intention—combining AI mentorship, gamification, and intention tracking to make istiqamah feel natural, not forced.

### 🎯 "Track Your Niat, Build Your Legacy"

> ⚠️ **Note:** This project is **Dual Licensed**. It is free for open-source use under **AGPLv3**, but requires a **Commercial License** for proprietary/closed-source use. See [License Section](#license) for details.

---

## 🎯 What Makes Nawaetu Different?

**Every Islamic app has prayer times, Quran, and qibla. But none focus on the *why* behind your worship.**

Nawaetu is built on the Hadith: *"Innama al-a'malu bin-niyyat"* - **Actions are judged by intentions.**

### The Nawaetu Difference:

- 🎯 **Intention-First Approach** - Track not just *what* you do, but *why* you do it
- 🤖 **AI Niat Coach** - Personal spiritual mentor, not just a Q&A bot
- 🎮 **Meaningful Gamification** - Niat Points & Islamic milestones, not generic XP
- 📔 **Reflection Loop** - Daily intention setting + evening reflection (coming soon)
- 🚀 **Built for Istiqamah** - Designed to help you stay consistent, not just start strong
- 💯 **100% Ad-Free** - Your spiritual journey, uninterrupted

---

## 🌟 Core Pillars & Features

### 1. 🎯 Intention-First Cultivation
*   **Intention Journal**: Set your "Niat" every morning and reflect in the evening (Soul-Muhasabah).
*   **AI Niat Coach**: Your 24/7 Spiritual Mentor powered by Google Gemini 2.5 & Llama 3 for personalized Islamic guidance.
*   **Gamified Growth**: Earn Niat Points through intention-based missions.

### 2. 📖 Spiritual Content Engine
*   **Digital Quran**: Mushaf & List mode with verse-by-verse audio, Tajweed colors, and authentic Kemenag standards.
*   **Hadith & Dua Hub**: Curated daily content with English and Indonesian translations.
*   **Spiritual Feed**: Daily Spirit, Quote of the Day, and Hadith-of-the-day widgets.

### 3. 🕌 Ritual Precision
*   **High-Precision Adhan**: GPS-based prayer times with < 60s notification accuracy.
*   **Qibla Compass**: Sensor-based high-accuracy direction finder.
*   **Hijri Calibration**: Flexible date adjustments to align with local moon sightings.

### 4. 📈 Consistency (Istiqamah) Tools
*   **Tasbih Counter**: Digital counters with customizable presets.
*   **Prayer Check-in**: Track your daily ritual performance in real-time.
*   **Activity Stats**: Visualized progress of your spiritual journey over time.

---

## 🛠️ Tech Stack

Built with bleeding-edge technology for the best developer experience:

### Core Framework
*   **Next.js 16.1.6** (App Router + Turbopack)
*   **TypeScript** - Type-safe development
*   **React 19** - Latest concurrent features

### Backend & Infrastructure
*   **Drizzle ORM** - Type-safe database queries
*   **PostgreSQL** (NeonDB) - Serverless database
*   **Firebase Admin SDK** - Push notifications
*   **Vercel Cron** - Scheduled tasks

### AI & APIs
*   **Google Gemini 2.5 Flash-Lite**
*   **Groq Llama 3.3 70B**
*   **Aladhan API** (Prayer Times)
*   **Quran.com API**

### UI & Styling
*   **Tailwind CSS v4**
*   **Shadcn UI**
*   **Framer Motion**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm / yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/hadianr/nawaetu.git
cd nawaetu

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Release Management

### Quick Release

**The fastest way to safely release a new version:**

```bash
# 1. Ensure you are on the main branch & have the latest code
git checkout main
git pull origin main

# 2. Use the release script (fully automated)
npm run release -- v1.2.0
# Or run directly: ./scripts/release.sh v1.2.0
```

**What happens automatically:**
1. ✅ Validates version format (`vX.Y.Z`)
2. ✅ Updates version files (`package.json`, `app-config.ts`)
3. ✅ Auto-generates changelog from git commits
4. ✅ Commits release changes automatically
5. ✅ Creates an annotated git tag
6. ✅ Pushes commits and new tag to origin
7. ✅ Triggers GitHub Actions workflows & Vercel deployment

### Detailed Release Guide

For a complete guide and troubleshooting, see [RELEASE_WORKFLOW.md](docs/RELEASE_WORKFLOW.md).

---

## 🤝 Contributing

We welcome contributions from the global community! Whether it's bug fixes, new features, or translations.

1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**


## ☕ Support the Mission

Nawaetu is an open-source project built for the Ummah. Your support helps cover server costs (database, hosting) and fuels further development.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github)](https://github.com/sponsors/hadianr)
> **Commercial Licensing via GitHub Sponsors:**
> - **$500/year**: Standard Commercial License for 1 Product.
> - **$1,500 one-time**: Perpetual Commercial License + Whitelabel Support.
[![Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=for-the-badge&logo=ko-fi&logoColor=white)](https://trakteer.id/hadianr)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/hadianr)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/hadianr)

May Allah reward your generosity with goodness. Jazakumullah Khairan Katsiran! 🤲

---


<a name="license"></a>
## 📄 License

**Nawaetu** adopts a **Dual Licensing** model to ensure sustainability and protect the open-source community:

### 1. Community Edition (Free & Open Source)
Licensed under **AGPLv3 (GNU Affero General Public License v3)**.
- ✅ Free to use, modify, and distribute.
- ⚠️ If you modify and distribute (or run as a service), **you must open-source your code** under AGPLv3.
- Best for: Individuals, non-profits, and open-source contributions.

### 2. Commercial License (Proprietary)
For companies or individuals who wish to use Nawaetu for **commercial purposes**, **white-label**, or **without open-sourcing their code**.
- ✅ Private source code (no open-source requirement).
- ✅ White labeling allowed.
- ✅ Priority support & enterprise features.
- 📩 Contact: **hadian.rahmat@gmail.com** for pricing and details.
- 📖 Read the full terms: [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md)

See the [LICENSE](LICENSE) file for the full AGPLv3 text.

---

## 👤 Author

**Hadian Rahmat**
- Email: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)
- GitHub: [@hadianr](https://github.com/hadianr)

---

**"Start with intention, end with blessings."**

Let's make worship easier, one intention at a time. 🚀🌙
