# Nawaetu 🌙✨

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#license)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.13.1-blue)](https://github.com/hadianr/nawaetu/releases)

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
> **Nawaetu is Dual Licensed.** Free for Open Source under **AGPLv3**, but requires a **Commercial License** for proprietary or closed-source use. See [License Section](#-license) for details.

---

## 🎯 What Makes Nawaetu Different?

Most Islamic apps (such as Muslim Pro or Muslim Muna) focus primarily on **mechanical utilities**—calculating prayer schedules, counting tasbih digits, or displaying banner ads. **Nawaetu is built around the spiritual heart of worship: The Intention (Niat).**

### ⚔️ Nawaetu vs. Mainstream Islamic Apps (e.g. Muslim Pro)

| Feature / Aspect | 🕌 Mainstream Apps (Muslim Pro, etc.) | 🌙 Nawaetu.com |
| :--- | :--- | :--- |
| **Core Philosophy** | **Utility-First**: Mechanical counters & static schedules | **Intention-First**: Focuses on the *why* behind your worship |
| **User Experience & Ads** | Cluttered with pop-up ads, paywalls & heavy tracking | **100% Ad-Free**, clean, distraction-free & privacy-respecting |
| **Spiritual Growth** | Basic counter numbers & passive reminders | **Muhasabah Journal**: Morning intentions + Evening reflections |
| **Islamic Q&A & Support** | Static articles or basic text search | **Tanya Nawaetu**: 24/7 AI mentor grounded in Quran & authentic Hadith |
| **Gamification** | Generic numbers or simple counters | **Hasanah System**: Rank progression (Mubtadi → Muhsinin) & Istiqamah Streaks |
| **Tilawah & Dhikr** | Standard audio & basic counter | **Focus Mode**: Screen wake lock, Basmallah anchor, OLED Zen Tasbih |
| **Openness & Licensing** | Closed-source, proprietary app | **Open Source (AGPLv3)** + Commercial License options |

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
*   **Tasbih 2.0**: Advanced counter with Sequential (Berantai), Custom readings, and OLED Zen Mode.
*   **Prayer Check-in**: High-precision ritual tracker with mosque/solo options.
*   **Ibadah Dashboard**: Lifetime statistics, milestones, and Hasanah trend visualizers.

### 5. 🗓️ Fasting & Seasonal Companion
*   **Sunnah & Voluntary Fasting**: Track Monday/Thursday (Senin-Kamis), Ayyamul Bidh, and custom fasting with fiqh-based statuses and Hasanah rewards.
*   **Seasonal & Hijri Events**: Precision tracking for Islamic calendar milestones, moon sightings, and seasonal spiritual guides.
*   **Ramadhan Mode**: Specialized Fiqh guides, Sahur/Iftar Sunnah recommendations, and countdown timers dynamically activated during the Holy Month.

---

## 🛠️ Tech Stack

Built with bleeding-edge technology for maximum performance and reliability:

### Core Framework
*   **Next.js 16.2** (App Router + Turbopack)
*   **TypeScript 5.9** - Strict type-safe architecture
*   **React 19.2** - Latest concurrent features & Server Components

### Backend & Database
*   **Drizzle ORM 0.45** - Type-safe SQL database queries
*   **PostgreSQL (NeonDB)** - Serverless auto-scaling database
*   **NextAuth v5** - Secure authentication layer
*   **Upstash Redis & Rate Limiting** - Distributed API protection
*   **Firebase Admin SDK** - Push notification infrastructure
*   **Vercel Cron** - Scheduled background tasks

### AI & External APIs
*   **Google Gemini 2.5 Flash-Lite** (`@google/generative-ai`)
*   **Groq Llama 3.3 70B** - High-speed LLM inference
*   **Aladhan API** (GPS Prayer Times)
*   **Quran.com API** (Uthmani Mushaf & Audio Recitations)

### UI, Styling & Experience
*   **Tailwind CSS v4** & **Shadcn UI** (Radix UI primitives)
*   **Framer Motion 12** - Smooth animations & micro-interactions
*   **Recharts 3.7** - Dynamic analytics & Hasanah trends
*   **Lucide React** & **Sonner** - Iconography & toast notifications
*   **Next PWA (`@ducanh2912/next-pwa`)** - Installable Progressive Web App

### Monitoring & Quality
*   **Sentry 10** - Real-time error tracking & performance monitoring
*   **Vercel Speed Insights** - Real User Performance Monitoring
*   **Vitest** - Unit and integration testing

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
