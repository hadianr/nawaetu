# Nawaetu: Islamic Habit Tracker 🌙

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#license)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.15.7-blue)](https://github.com/hadianr/nawaetu/releases)

---

**Nawaetu** is a free Islamic habit tracker that starts from intention (*niat*). It combines a daily intention journal with prayer times, Qibla, a digital Quran with tajweed, hadith and dua with source references, Sirah, fasting and Ramadan tools, dhikr, and an AI assistant (**Tanya Nawaetu**) designed to cite its sources. It runs as a web app at [nawaetu.com](https://nawaetu.com), installable as a PWA with an Android wrapper in this repository, in English and Indonesian.

[**Open Nawaetu**](https://nawaetu.com) | [**Baca dalam Bahasa Indonesia**](README.id.md)

## Quick Facts

| | |
| :--- | :--- |
| **Name** | From *niat*, the Arabic and Indonesian word for intention |
| **Price** | Free |
| **Languages** | English, Indonesian |
| **Platforms** | Web (installable PWA), Android wrapper |
| **License** | AGPLv3, with a commercial license available |
| **Website** | [nawaetu.com](https://nawaetu.com) |

**Explore:** [Quran](https://nawaetu.com/quran) · [Hadith](https://nawaetu.com/hadith) · [Dua](https://nawaetu.com/dua) · [Sirah](https://nawaetu.com/sirah) · [Tanya Nawaetu (AI)](https://nawaetu.com/mentor-ai) · [Qibla](https://nawaetu.com/qibla) · [Hijri calendar](https://nawaetu.com/hijri-calendar) · [Ramadan guide](https://nawaetu.com/ramadhan) · [About](https://nawaetu.com/about)

---

## Table of Contents
- [What Makes Nawaetu Different?](#what-makes-nawaetu-different)
- [Visual Showcase](#-visual-showcase)
- [Core Pillars & Features](#-core-pillars--features)
- [FAQ](#faq)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [Support the Mission](#-support-the-mission)
- [License](#-license)

> [!IMPORTANT]
> **Nawaetu is dual licensed.** Free for open source under **AGPLv3**, with a **Commercial License** for proprietary or closed-source use. See the [License section](#-license).

---

## What Makes Nawaetu Different?

Many Islamic apps centre on utilities such as prayer schedules and tasbih counters. Nawaetu keeps those tools and builds around the intention behind each act of worship. If you are looking for a Muslim Pro alternative focused on intention and daily reflection, this is how it differs:

| Aspect | Utility-first apps (e.g. Muslim Pro) | Nawaetu |
| :--- | :--- | :--- |
| **Core focus** | Prayer times, counters, reminders | **Intention first**: the reason behind your worship |
| **Reflection** | Counters and passive reminders | **Muhasabah journal**: morning intention, evening reflection |
| **Islamic Q&A** | Articles and text search | **Tanya Nawaetu**: AI assistant designed to cite Quran and hadith references and to say when a source cannot be confirmed |
| **Motivation** | Counters and streaks | **Hasanah system**: rank progression (Mubtadi to Muhsinin) and Istiqamah streaks |
| **Quran and dhikr** | Standard audio and counter | **Focus mode**: screen wake lock, Basmalah anchor, OLED Zen tasbih |
| **Ads** | Varies by app and plan | No advertising |
| **Source code** | Typically closed | Open source (AGPLv3) |

---

## ✨ Visual Showcase

| Intention Journal | Tanya Nawaetu | Digital Quran (Mushaf) |
| :---: | :---: | :---: |
| ![Intention Journal](./public/images/readme/intention_journal.png) | ![Tanya Nawaetu](./public/images/readme/tanya_nawaetu.png) | ![Digital Quran](./public/images/readme/digital_quran.png) |

---

## 🌟 Core Pillars & Features

### 1. 🎯 Intention-First Cultivation
*   **Intention Journal**: Set your "Niat" every morning and reflect in the evening (Soul-Muhasabah).
*   **Tanya Nawaetu**: An Islamic assistant designed to ground answers in the Quran, Sunnah, and Hadith with references, and to acknowledge its limits when a source cannot be confirmed.
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
*   **Tasbih 2.0**: Advanced counter with Sequential (Berantai), Custom readings, and OLED Zen Mode.
*   **Prayer Check-in**: High-precision ritual tracker with mosque/solo options.
*   **Ibadah Dashboard**: Lifetime statistics, milestones, and Hasanah trend visualizers.

### 5. 🗓️ Fasting & Seasonal Companion
*   **Sunnah & Voluntary Fasting**: Track Monday/Thursday (Senin-Kamis), Ayyamul Bidh, and custom fasting with fiqh-based statuses and Hasanah rewards.
*   **Seasonal & Hijri Events**: Precision tracking for Islamic calendar milestones, moon sightings, and seasonal spiritual guides.
*   **Ramadhan Mode**: Specialized Fiqh guides, Sahur/Iftar Sunnah recommendations, and countdown timers dynamically activated during the Holy Month.

---

## FAQ

**What is Nawaetu?**
A free Islamic habit tracker that starts from intention (*niat*), with a Quran, prayer tools, hadith and dua with sources, Sirah, fasting and Ramadan tools, dhikr, and an AI assistant.

**Is Nawaetu free?**
Yes. The app is free to use, and the source code is open under AGPLv3.

**Does it work offline?**
Some features are available without an internet connection.

**How does Tanya Nawaetu answer religious questions?**
It is designed to include references in religious answers and to acknowledge its limits when a source cannot be confirmed. It does not replace a qualified scholar.

**Which languages are supported?**
English and Indonesian.

---

## 🛠️ Tech Stack

Versions are pinned in [`package.json`](package.json).

### Core Framework
*   **Next.js** (App Router)
*   **TypeScript** - Strict type-safe architecture
*   **React** - Server Components and concurrent features

### Backend & Database
*   **Drizzle ORM** - Type-safe SQL database queries
*   **PostgreSQL (Supabase)** - Serverless database via the transaction pooler
*   **NextAuth v5** - Authentication layer
*   **Upstash Redis & Rate Limiting** - Distributed API protection
*   **Firebase Admin SDK** - Push notification infrastructure
*   **cron-job.org** - Scheduled prayer-alert and streak notifications

### AI & External APIs
*   **Google Gemini** (`@google/generative-ai`)
*   **Groq (Llama)** - High-speed LLM inference
*   **Aladhan API** (GPS Prayer Times)
*   **Quran.com API** (Uthmani Mushaf & Audio Recitations)

### UI, Styling & Experience
*   **Tailwind CSS v4** & **Shadcn UI** (Radix UI primitives)
*   **Framer Motion** - Animations & micro-interactions
*   **Recharts** - Analytics & Hasanah trends
*   **Lucide React** & **Sonner** - Iconography & toast notifications
*   **Next PWA (`@ducanh2912/next-pwa`)** - Installable Progressive Web App

### Monitoring & Quality
*   **Sentry** - Error tracking & performance monitoring
*   **Vercel Speed Insights** - Real User Performance Monitoring
*   **Vitest** - Unit and integration testing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 24.x
- npm (the repository uses `package-lock.json`)

### Installation

```bash
# Clone repository
git clone https://github.com/hadianr/nawaetu.git
cd nawaetu

# Install dependencies
npm ci

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Release Workflow

Maintainers can publish releases using the automated release script:
```bash
./scripts/release.sh v1.x.x
```
This updates `package.json`, `package-lock.json`, `src/config/app-config.ts`, badges, and `CHANGELOG.md`. For full details, see the [Release Workflow Guide](docs/RELEASE_WORKFLOW.md).

---

## 🤝 Contributing

We welcome contributions from the global community! Whether it's bug fixes, new features, or translations.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to ensure a welcoming and inclusive environment.
To report bugs or suggest new features, please submit an issue using our [Issue Templates](https://github.com/hadianr/nawaetu/issues/new/choose). For complete guidelines, read [CONTRIBUTING.md](CONTRIBUTING.md).

1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

> 💡 **AI Assistant Note**: This repository supports local rules, workflows, and skills for AI coding assistants (Google Antigravity, Cursor, Claude Code) under `.agents/`.


## ☕ Support the Mission

Nawaetu is an open-source project built for the Ummah. Your support helps cover server costs (database, hosting) and fuels further development.

### ☁️ Infrastructure Sponsor
We are incredibly grateful to be supported by **[Biznet Gio Cloud](https://www.biznetgio.com/)**, who generously provides the high-performance cloud server infrastructure powering Nawaetu.com.

[![Biznet Gio Cloud](https://img.shields.io/badge/Supported_by-Biznet_Gio_Cloud-00529B?style=for-the-badge&logo=icloud&logoColor=white)](https://www.biznetgio.com/)

*Is your company interested in supporting Islamic open-source tech? Become a sponsor to have your logo featured here and help us scale Nawaetu for the global Ummah! Reach out to [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com).*

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
