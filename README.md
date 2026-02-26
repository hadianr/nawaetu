# Nawaetu 🌙✨

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#license)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.8.17-blue)](https://github.com/hadianr/nawaetu/releases)

---

### 🎯 Track Your Niat, Build Your Legacy
**Nawaetu** (derived from "Niat" or Intention) is the **world's first Intention-First Islamic habit tracker**. While most apps focus on the ritual mechanics (calculating times, counter digits), Nawaetu focuses on the **spiritual heart** of worship: **The Intention.**

[**🚀 Explore Live Demo**](https://nawaetu.com) | [**📖 Baca dalam Bahasa Indonesia 🇮🇩**](README.id.md)

---

## 📑 Table of Contents
- [🎯 What Makes Nawaetu Different?](#-what-makes-nawaetu-different)
- [✨ Visual Showcase](#-visual-showcase)
- [🌟 Core Pillars & Features](#-core-pillars--features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)

> [!IMPORTANT]
> **Nawaetu is Dual Licensed.** Free for Open Source (AGPLv3), but requires a **Commercial License** for proprietary/closed-source use.

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

**Every Islamic app has prayer times, Quran, and Qibla. But almost none focus on the *why* behind your worship.**

### The Nawaetu Uniqueness:
1.  🎯 **The Intention-First Pioneer**: We treat "Niat" as a trackable habit, moving spiritual growth from the fingers (counters) to the heart.
2.  🤖 **Tanya Nawaetu**: Specialized Islamic Q&A backed by Quran, Sunnah, and authenticated Hadith.
3.  📔 **The Muhasabah Loop**: Seamlessly bridges the gap between morning intentions and evening reflections.
4.  🎮 **Spiritual XP**: Replaces generic gamification with meaningful Islamic milestones and "Istiqamah Streaks."
5.  ️ **Enterprise Ready**: Built from day one with dual-licensing, whitelabel support, and a scalable Next.js architecture.

---

## ✨ Visual Showcase

| Intention Journal | Tanya Nawaetu | Digital Quran (Mushaf) |
| :---: | :---: | :---: |
| ![Intention Journal](./public/images/readme/intention_journal.png) | ![Tanya Nawaetu](./public/images/readme/tanya_nawaetu.png) | ![Digital Quran](./public/images/readme/digital_quran.png) |

---

## 🌟 Core Pillars & Features

### 1. 🎯 Intention-First Cultivation
*   **Intention Journal**: Set your "Niat" every morning and reflect in the evening (Soul-Muhasabah).
*   **Tanya Nawaetu**: Your 24/7 Islamic assistant providing answers based on the Quran, Sunnah, and Hadith—not just AI opinions.
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

### 5. 🌙 Ramadhan Central (Seasonal)
*   **Ramadhan Guide**: Specialized Fiqh, FAQ, and practice guides for the holy month.
*   **Sunnah Foods & Tips**: Curated Sahur and Iftar recommendations based on the Sunnah.
*   **Ramadhan Countdown**: Precision tracking for moon sighting and daily countdown.

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

### 💖 Donation Platforms
| Platform | Link |
| :--- | :--- |
| **GitHub Sponsors** | [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=flat-square&logo=github)](https://github.com/sponsors/hadianr) |
| **Trakteer** | [![Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=flat-square&logo=ko-fi&logoColor=white)](https://trakteer.id/hadianr) |
| **Ko-fi** | [![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-F16061?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/hadianr) |
| **Buy Me a Coffee** | [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/hadianr) |

### 🏢 Commercial Licensing
*For businesses, white-labeling, or proprietary use cases.*

| Tier | Pricing | Benefits |
| :--- | :--- | :--- |
| **Standard** | **$500** / year | 1 Product, Private Source, Regular Updates |
| **Perpetual** | **$1,500** once | Lifetime License, Whitelabel, Priority Support |

👉 [**Get Started via GitHub Sponsors**](https://github.com/sponsors/hadianr)

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
