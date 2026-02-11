# Nawaetu 🌙✨

[![Release](https://github.com/hadianr/nawaetu/actions/workflows/release.yml/badge.svg)](https://github.com/hadianr/nawaetu/releases)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://nawaetu.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Dual Licensed](https://img.shields.io/badge/Dual_Licensed-Commercial_Available-purple.svg)](#license)
[![GitHub Issues](https://img.shields.io/github/issues/hadianr/nawaetu)](https://github.com/hadianr/nawaetu/issues)
[![GitHub Stars](https://img.shields.io/github/stars/hadianr/nawaetu)](https://github.com/hadianr/nawaetu)
[![Version](https://img.shields.io/badge/Version-v1.5.0-blue)](https://github.com/hadianr/nawaetu/releases)

> *"Innama al-a'malu bin-niyyat" - Indeed, actions are judged by intentions.*

**Current Version: v1.5.0** | [Read in Indonesian 🇮🇩](README.id.md) | [See Changelog](CHANGELOG.md) | [View Roadmap](ROADMAP.md)

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

## 🌟 Key Features (v1.4.0)

### 1. 🔔 iOS & Background Notifications (New)
*   **Reliable Alerts**: Notifications work perfectly using Vercel Cron & Firebase Admin SDK.
*   **Hybrid Sync System**: Smart combination of server-side daily sync and client-side real-time checks.
*   **APNS Optimized**: Custom payloads designed for iOS background delivery.

### 2. 🤖 Nawaetu AI - Your 24/7 Spiritual Mentor
*   **Smart Assistant**: Powered by Google Gemini 2.5 Flash-Lite & Groq Llama 3 for fast, accurate Islamic guidance.
*   **Dalil-Backed**: All answers include references from the Quran & Sahih Hadith.
*   **Chat History**: Continue your spiritual conversations across sessions.

### 3. 📖 Digital Quran
*   **Verse-by-Verse Audio**: Listen to individual verses by Mishary Rashid and others.
*   **Tajweed Support**: Color-coded Tajweed guidance.
*   **Mushaf Mode**: Authentic reading experience with Uthmani script.
*   **Smart Bookmarks**: Save verses with personal notes.

### 4. 🕌 Prayer Times & Qibla
*   **Accurate Schedule**: GPS-based prayer times for any location worldwide.
*   **Adhan Notifications**: Customizable alerts for every prayer time.
*   **Qibla Compass**: Precise direction finder using device sensors.

### 5. 🎮 Gamification - Make Worship Fun
*   **Intention-First Missions**: Setting your intention ("Niat") is the primary daily mission.
*   **Daily Missions**: Curated missions (e.g., Sunnah fasting, Dhuha prayer).
*   **Streak System**: Visual progress tracker to maintain consistency.
*   **XP & Leveling**: Level up from "Newbie" to "Spiritual Warrior".

### 6. 🌍 Internalization (i18n)
*   **Multi-Language**: Fully supports **English** and **Indonesian**.
*   **Dynamic Theming**: Dark mode and customizable accent colors.

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
- 📩 Contact: **license@nawaetu.com** for pricing and details.

See the [LICENSE](LICENSE) file for the full AGPLv3 text.

---

## 👤 Author

**Hadianr**
- GitHub: [@hadianr](https://github.com/hadianr)

---

**"Start with intention, end with blessings."**

Let's make worship easier, one intention at a time. 🚀🌙
