# Nawaetu Roadmap 🗺️

> **"Track Your Niat, Build Your Legacy"**

This roadmap outlines our vision for making Nawaetu the **most meaningful Islamic habit tracker** in the world. We're building in public, and your support helps us move faster. 🚀

[🌟 Support the Mission](README.md#support-the-mission) | [📖 Read in Indonesian](ROADMAP.id.md)

---

## 🎯 Our Vision

**To help 1 million Muslims build unshakeable spiritual habits by focusing on the *why* behind their worship—starting with pure intention.**

---

## 📍 Where We Are Now (v1.15.6)

**Status key:** ✅ Shipped · 🔨 In progress · 📋 Planned · 💡 Concept · 🧪 Experimental

> Verified against the codebase on 15 Oct 2026 (`main`, commit `28b7cb1`). Items marked ✅ exist in code; "In progress" items have partial code.

### ✅ Shipped

- **Prayer Times & Notifications** - Accurate, reliable, iOS-optimized
- **Digital Quran** - Verse-by-verse audio, Tajweed support, Mushaf mode
- **Qibla Compass** - Precise direction finder
- **AI Mentor** - Islamic guidance with chat rate limiting (Gemini & Groq)
- **Gamification Core** - Daily missions, streaks, Hasanah (XP) ledger, rewards
- **Intention Journal (base)** - Daily intention and evening reflection with rating
- **Sirah Module** - Chapters, quiz, bookmarks, and reading progress
- **Ramadhan Tracking** - Fasting, daily, and Taraweh logs
- **Multi-language** - English & Indonesian
- **Infaq & Muhsinin Status** - Support the mission, earn the Muhsinin badge
- **Browser Extension v1.9.4** - Chrome/Edge wrapper (see Expansion section)
- **Dual Licensing** - AGPLv3 Community Edition + Commercial License

**Current Users:** 257 registered accounts (Oct 2026)
**Tech Stack:** Next.js 16, React 19, PostgreSQL (Supabase) with Drizzle ORM, Vercel

---

## 🚀 What's Next

### Q4 2026: The Intention Revolution (Refocused)

**Theme:** *Making Nawaetu the app that helps you keep your niat*

> The previous Q2 2026 plan was not completed on schedule. The items below are re-scoped against the current code.

#### 🆕 Intention Journal - Completion
**Status:** 🔨 In progress (base shipped)

The journal, daily intention, and evening reflection already exist. What remains:

- **Niat Streak**: a dedicated streak for consecutive days of intentional reflection. The database has a streak system, but the niat-specific streak is not yet visible in the UI.
- **Private by default**: confirm that reflections are private end-to-end, then document it in the privacy policy.
- **Fajr-time reminder**: morning intention reminder aligned with local Fajr time.

**Definition of done:** a user can complete a morning intention and evening reflection, see their Niat Streak, and no reflection is visible to anyone else.

**Impact:** This is our **category-defining feature**. No other Islamic app combines a niat journal with habit tracking.

---

#### 🤖 AI Mentor → Proactive Coach
**Status:** 📋 Planned (reactive AI Mentor is shipped)

Upgrade the existing reactive AI Mentor into a proactive coach. There is no proactive messaging, scheduled check-in, or personalized insight pipeline in the code yet.

**Scope, in order:**
1. Weekly summary generated from the user's own habit data (scheduled job, no chat required).
2. Opt-in gentle check-in (push notification, max 1 per day, user can disable).
3. Personalized insight (for example, "you pray Fajr more consistently after sleeping before 11pm"), shown only after enough data.

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

#### 🎮 Gamification Refresh
**Status:** 🔨 In progress (core shipped; terminology and badges pending)

The Hasanah ledger, streaks, and rewards already exist. Pending:

- **Terminology**: rename XP to Niat Points (NP) in the UI, keeping the existing ledger.
- **Islamic milestones**: level bands with titles (Mubtadi, Mutaqin, Muhsinin, Siddiqin). Current level is already tracked, so this is a presentation change plus copy review.
- **New badges**: "Sahur Champion" (30-day Ramadhan streak), "Night Warrior" (100 Qiyamul Lail), "Pure Intention" (40-day Niat Streak). Depends on the Niat Streak above.

**Why:** Gamification should inspire spiritual growth, not just dopamine hits.

---

### Q1 2027: Community & Connection

**Theme:** *You don't have to build habits alone*

#### 👥 Accountability Partners
**Status:** 💡 Concept (no code yet)

Find your intention buddy.

**Features:**
- Match with Muslims working on similar goals
- Share reflections (optional, private by default)
- Gentle accountability: "Your partner prayed Fajr today. Your turn!"
- Group challenges: "30 Days of Dhuha with 100 others"

**Privacy-first:** All sharing is opt-in. Your niat stays private unless you choose.

**Prerequisite:** Niat Streak and privacy controls must be shipped first.

---

#### 📖 Nawaetu Stories
**Status:** 💡 Concept (no code yet)

Real stories from real Muslims, published with the user's consent.

**Content:**
- "How I Finally Conquered Fajr" - User testimonials
- "From 0 to 100 Quran Pages" - Journey highlights
- "My Ramadhan Transformation" - Seasonal inspiration

**Why:** Seeing others succeed makes you believe you can too.

---

### 🌐 Expansion & Accessibility

#### 🧩 Nawaetu Browser Extension (Chrome/Edge)
**Status:** 🧪 Experimental (v1.9.4 in repository; store publication status to be confirmed)

Sidebar wrapper around the live web app.

**Features:**
- **Sidebar Companion:** Read Quran & check prayer times without leaving your current tab.
- **Focus Mode:** Block distracting sites during prayer times (optional). *Not yet implemented.*
- **Instant Niat:** Set intention for browsing sessions ("Study", "Work", "Research"). *Not yet implemented.*

**Technical Strategy:**
- **Single codebase:** Same web app is embedded in the extension (iframe to nawaetu.com).
- **Privacy first:** No tracking. Offline behaviour depends on the web app's cache and is not guaranteed.
- Architecture notes: `extension/README.md`

---

### Q1 2027: Premium & Sustainability

**Theme:** *Making Nawaetu sustainable for the long run*

#### 💎 Muhsinin Premium ($4.99/mo)
**Status:** 💡 Concept (no payment integration in code yet; Muhsinin badge already ships through Infaq)

Support the mission, unlock advanced features.

**Premium perks (proposed):**
- ✨ **Expanded AI Mentor usage** (free tier has a daily chat limit; exact limit to be confirmed in code before publishing)
- 📊 **Advanced Analytics** - "Your best prayer time is 6:15am"
- 🎨 **Custom Themes** - Personalize your experience
- 🎯 **Habit Templates** - Pre-built routines from scholars
- 🚀 **Priority Support** - Direct line to the team
- 🌟 **Early Access** - Try new features first

**Why Premium?**
- Server costs (AI, database, hosting) are real
- Premium users fund free features for everyone
- Transparent: costs are published in the Support section

**Free Forever Promise:**
- Core features (prayer times, Quran, basic AI) stay free
- No ads, ever
- Premium is optional, not required

---

## 🌍 Future Vision (2027+)

### Ideas We're Exploring

**🕌 Local Community Features**
- Find nearby Muslims for group prayers
- Masjid check-ins and events
- Local Islamic classes and halaqas

**📚 Structured Learning Paths**
- "40 Hadith in 40 Days"
- "Understand Quran in 3 Months"
- "Master Tajweed" interactive course

**🎙️ Audio Content**
- Daily spiritual reflections
- Scholar interviews
- Guided meditation (Islamic dhikr)

**🌐 Global Expansion**
- More languages (Arabic, Urdu, Turkish, Malay)
- Regional prayer calculation methods
- Local Islamic calendar integration

**🤝 Open Source Ecosystem**
- Plugin system for developers
- Community-built features
- White-label for Islamic organizations

---

## 💬 Your Voice Matters

**This roadmap is a living document.** We adjust based on:
- User feedback and requests
- Community votes
- Real-world usage data
- Islamic scholarship guidance

### How to Influence the Roadmap

1. **Vote on features:** [GitHub Discussions](https://github.com/hadianr/nawaetu/discussions)
2. **Request features:** [Open an Issue](https://github.com/hadianr/nawaetu/issues/new)
3. **Join beta testing:** Early access to new features
4. **Support the mission:** [Donate](README.md#support-the-mission) to speed up development

---

## 📊 Success Metrics (Public)

We measure success by **impact**, not just downloads.

| Metric | Current (Oct 2026) | Q4 2026 Goal | Q1 2027 Goal |
|--------|--------------------|--------------|--------------|
| **Registered users** | 257 | - | - |
| **Weekly Niat Setters** | Not yet tracked | Baseline set | +50% vs baseline |
| **7-Day Streak Retention** | To be re-measured | Baseline set | Set after baseline |
| **AI Mentor Engagement** | To be re-measured | Baseline set | Set after baseline |
| **Premium Conversion** | Not started | - | 3% (after launch) |
| **Community Contributors** | To be confirmed | - | - |

Previous targets were set before baselines were measured. They are replaced by baseline-first targets, to be set once the metrics are tracked.

**Transparency:** We'll share quarterly updates on progress.

---

## 🙏 Support the Mission

Building Nawaetu is a labor of love, but servers aren't free. Your support helps us:

- 💰 **Cover costs:** AI API, database, hosting
- ⚡ **Move faster:** Hire part-time developers
- 🌍 **Reach more Muslims:** Marketing and outreach
- 📚 **Create content:** Educational materials and guides

**Every contribution is sadaqah jariyah.** When someone benefits from Nawaetu, you get the reward too. 🤲

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

**Dual Licensed:**
- **Community Edition:** AGPLv3 (Free & Open Source)
- **Commercial License:** For businesses/white-label use

See [LICENSE](LICENSE) for details.

---

**"Innama al-a'malu bin-niyyat" - Actions are judged by intentions.**

Let's build something meaningful together. 🌙✨

---

*Last updated: October 15, 2026 (audited against `main` @ 28b7cb1)*
*Questions? Email: roadmap@nawaetu.com*
