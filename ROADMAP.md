# Nawaetu Roadmap 🗺️

> **"Track Your Niat, Build Your Legacy"**

This roadmap outlines our vision for making Nawaetu the **most meaningful Islamic habit tracker** in the world. We're building in public, and your support helps us move faster. 🚀

[🌟 Support the Mission](README.md#-support-the-mission) | [💼 Business Model](README.md#business-model) | [📖 Read in Indonesian](ROADMAP.id.md)

---

## 🎯 Our Vision

**To help 1 million Muslims build unshakeable spiritual habits by focusing on the *why* behind their worship—starting with pure intention.**

---

## 📍 Where We Are Now (v1.16.0)

**Status key:** ✅ Shipped · 🔨 In progress · 📋 Planned · 💡 Concept · 🧪 Experimental

> Verified against the codebase on 23 Nov 2026 (`main`, commit `1ca675f`). Items marked ✅ exist in code; "In progress" items have partial code.

### ✅ Shipped

- **Prayer Times, Qibla & Push Notifications** - Prayer alerts and streak reminders, for guests too
- **Digital Quran** - Verse-by-verse audio, Tajweed support, Mushaf mode
- **Intention Journal** - Morning intention, evening reflection with Quran verses, and a Niat Streak; reflections are private to the account
- **Hadith & Dua** - Attribution and grade shown with each text, including a civic life topic from HadeethEnc
- **Sirah in Three Formats** - Shaykh Haytham Sarhan's concise sirah (English and Indonesian, with his written permission), the complete sirah, and a timeline of events
- **Hijri Calendar** - Recommended fasting days and sirah events for the month
- **100 Days to Ramadan** - A journey card with a fasting guide, dalil and streak
- **Hasanah & Streaks** - Daily missions, seven ranks from Mubtadi to Muhsin, and a free streak freeze every 7 days
- **Tanya Nawaetu (AI Mentor)** - Designed to cite references; 10 chats a day for everyone (Gemini, Groq and OpenRouter)
- **Guest Mode & Sync** - Use the app without an account; data follows the user on sign-in and across devices
- **Five Themes, All Free** - Daylight by default, Emerald as the dark theme
- **Infaq** - Voluntary in-app donation; it unlocks no features, so nothing is paywalled
- **Search & AI Search** - Server-rendered content pages, structured data and `llms.txt`
- **Multi-language** - English & Indonesian

**Current Users:** 277 registered accounts (20 Nov 2026)
**Tech Stack:** Next.js 16, React 19, PostgreSQL with Drizzle ORM (see the [README](README.md#️-tech-stack))

---

## 💼 How Nawaetu Is Funded

Worship stays free; Nawaetu charges only for services and work; support stays voluntary. The full model, its revenue streams and what Nawaetu will not do are in the [README](README.md#business-model). In short: no ads, no data sales, no paid spiritual reward, and no white-label versions.

---

## 🚀 What's Next

### Before Ramadan 1448 H (around February 2027)

**Theme:** *Ready for Ramadan, and a first organisation partner*

#### 🏢 Nawaetu for Organisations - Pilot
**Status:** 📋 Planned (no group features in code yet)

Co-branded programmes ("Nawaetu × your organisation") for companies, Islamic schools and pesantren. The first goal is **one pilot partner for Ramadan 1448 H**, ideally in Bandung or Jakarta, where most current users are.

**Pilot scope:**
- A group space that members join with an invite code
- Group intentions and a shared khatam
- A Ramadan challenge for the group
- An admin view with participation reports (aggregate only; personal reflections stay private)

**Principle:** co-branded, never white-labelled. Source credits and the Nawaetu name always stay.

---

#### 🌙 Ramadan 1448 H
**Status:** 📋 Planned

- Switch the Ramadan hub back on for the month (it was taken out until the season).
- Decide whether the taraweh tracker returns.
- Keep the 100 Days to Ramadan journey running into the month.

---

#### 🛠️ Foundations
**Status:** 📋 Planned unless noted

- **App stores:** publish the Android app (the wrapper is in [`android/`](android/)) and write store listings.
- **Hadith verification:** 🔨 check hadith numbers against [Sunnah.com](https://sunnah.com); waiting for API access.
- **Speed:** load the animation player after the first paint to cut mobile load time on the home page ([#299](https://github.com/hadianr/nawaetu/issues/299)).
- **Fajr-time intention reminder:** a morning intention reminder aligned with local Fajr time.
- **Measurement:** mark sign-up, intention set and prayer check-in as Google Analytics key events, find the source of untagged "general / (not set)" sessions, and set the retention baselines below.

---

### 2027

**Theme:** *You don't have to build habits alone*

#### 🤖 Tanya Nawaetu → Proactive Coach
**Status:** 📋 Planned (the reactive mentor is shipped)

There is no proactive messaging, scheduled check-in, or personalised insight pipeline in the code yet.

**Scope, in order:**
1. Weekly summary generated from the user's own habit data (scheduled job, no chat required).
2. Opt-in gentle check-in (push notification, max 1 per day, user can disable).
3. Personalised insight (for example, "you pray Fajr more consistently after sleeping before 11pm"), shown only after enough data.

**Principles:** opt-in only, Islamic guidance from sources the team can cite, never shame the user for missed prayers.

**Example interaction:**
```
AI: Assalamu'alaikum! I noticed you've missed Fajr 3 times this week.
    Want to talk about what's blocking you?

You: I just can't wake up...

AI: I understand. Let's try something small:
    1. Set your niat tonight: "Ya Allah, help me wake for Fajr"
    2. Sleep 15 minutes earlier
    3. Put your phone across the room

    Can you commit to trying this for 3 days?
```

---

#### 🎮 Badges & Hasanah Rewards
**Status:** 💡 Concept (ranks and streaks are shipped)

- **New badges:** "Sahur Champion" (30-day Ramadhan streak), "Night Warrior" (100 Qiyamul Lail), "Pure Intention" (40-day Niat Streak).
- **Sponsored rewards:** partners supply rewards that users reach through consistent practice. See [`docs/HASANAH_LEVELS_AND_REWARDS_PLAN.md`](docs/HASANAH_LEVELS_AND_REWARDS_PLAN.md).

**Principle:** Hasanah, ranks and streaks are never sold. No paid boosts or streak repairs.

---

#### 👥 Accountability Partners
**Status:** 💡 Concept (no code yet)

Find your intention buddy.

- Match with Muslims working on similar goals
- Share reflections (optional, private by default)
- Gentle accountability: "Your partner prayed Fajr today. Your turn!"

**Privacy-first:** all sharing is opt-in. Builds on the group features from the organisation pilot.

---

#### 💎 Nawaetu Plus
**Status:** 💡 Concept (no price set; no subscription code yet)

An optional subscription for services that cost money to run or are personal coaching. It never locks worship content.

**Proposed:**
- ✨ Tanya Nawaetu beyond the free daily limit
- 👨‍👩‍👧 A family plan (parents following their children's prayer and Quran progress)
- 📊 Deeper journal and habit insights
- 🤝 Pay it forward: each subscription funds a free Plus account for a student or someone in need

**Always free:** the Quran, hadith, prayer tools, dhikr, Sirah, intentions, streaks, ranks and themes.

---

#### 📖 Nawaetu Stories
**Status:** 💡 Concept (no code yet)

Real stories from real Muslims, published with the user's consent: "How I Finally Conquered Fajr", "From 0 to 100 Quran Pages", "My Ramadhan Transformation".

---

### 🌐 Expansion & Accessibility

#### 🧩 Nawaetu Browser Extension (Chrome/Edge)
**Status:** 🧪 Experimental (v1.9.4 in repository; store publication status to be confirmed)

Sidebar wrapper around the live web app.

- **Sidebar Companion:** read Quran & check prayer times without leaving your current tab.
- **Focus Mode:** block distracting sites during prayer times (optional). *Not yet implemented.*
- **Instant Niat:** set an intention for browsing sessions ("Study", "Work", "Research"). *Not yet implemented.*

**Technical strategy:** the same web app is embedded in the extension (iframe to nawaetu.com). No tracking. Architecture notes: `extension/README.md`.

---

## 🌍 Future Vision (2027+)

### Ideas We're Exploring

**🎓 Teacher Marketplace**
- Live tahsin, Arabic and study classes; teachers earn a fee and Nawaetu takes a commission

**🤲 Zakat & Infaq Channel**
- Pay zakat and infaq to a licensed amil (BAZNAS or a LAZ) inside the app; the funds go straight to the amil. Only after legal and sharia review

**🕌 Local Community Features**
- Masjid check-ins and events
- Local Islamic classes and halaqas

**📚 Structured Learning Paths**
- "40 Hadith in 40 Days"
- "Understand Quran in 3 Months"
- "Master Tajweed" interactive course

**🎙️ Audio Content**
- Daily spiritual reflections
- Scholar interviews

**🌐 Global Expansion**
- More languages (Arabic, Urdu, Turkish, Malay)
- Regional prayer calculation methods

**🤝 Open Source Ecosystem**
- Community-built features

---

## 💬 Your Voice Matters

**This roadmap is a living document.** We adjust based on:
- User feedback and requests
- Real-world usage data
- Islamic scholarship guidance

### How to Influence the Roadmap

1. **Request or upvote features:** [Open or react to an Issue](https://github.com/hadianr/nawaetu/issues)
2. **Join beta testing:** Early access to new features
3. **Support the mission:** [Donate](README.md#-support-the-mission) to speed up development

---

## 📊 Success Metrics (Public)

We measure success by **impact**, not just downloads.

| Metric | Current (Nov 2026) | Next goal |
|--------|--------------------|-----------|
| **Active users (Google Analytics)** | 889 in 2026 (tracking reliable from mid-August) | - |
| **Registered users** | 277 | - |
| **Weekly Niat Setters** | To be measured | Baseline set |
| **Retention (D1 / D7 / D30)** | To be measured | Baseline set |
| **Daily / monthly active users** | To be measured | Baseline set |
| **Tanya Nawaetu engagement** | To be measured | Baseline set |
| **Organisation pilots** | 0 | 1 by Ramadan 1448 H |
| **Plus conversion** | Not launched | Set after launch |
| **Community contributors** | To be confirmed | - |

Targets are set once a baseline is measured.

**Transparency:** We'll share quarterly updates on progress.

---

## 🙏 Support the Mission

Building Nawaetu is a labor of love, but servers aren't free. Your support helps us:

- 💰 **Cover costs:** AI API, database, hosting
- ⚡ **Move faster:** Hire part-time developers
- 🌍 **Reach more Muslims:** Marketing and outreach
- 📚 **Create content:** Educational materials and guides

We hope every contribution becomes *sadaqah jariyah*; its reward belongs to Allah alone. 🤲

[![Support on GitHub](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github)](https://github.com/sponsors/hadianr)
[![Support on Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=for-the-badge)](https://trakteer.id/hadianr)

---

## 🤝 Want to Contribute?

We welcome developers, designers, writers, and testers!

**Ways to help:**
- 💻 **Code:** Check [Good First Issues](https://github.com/hadianr/nawaetu/labels/good%20first%20issue)
- 🎨 **Design:** UI/UX improvements
- 📝 **Content:** Write guides, translate
- 🧪 **Test:** Beta test new features
- 🌍 **Spread the word:** Share with your community

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📜 License

**AGPLv3** (free and open source). The licence covers the code, not the Nawaetu name and logo. Content from other publishers stays under their own terms.

See [LICENSE](LICENSE) for details.

---

**"Innama al-a'malu bin-niyyat" - Actions are judged by intentions.**

Let's build something meaningful together. 🌙✨

---

*Last updated: November 23, 2026 (audited against `main` @ 1ca675f)*
*Questions? Email: roadmap@nawaetu.com*
