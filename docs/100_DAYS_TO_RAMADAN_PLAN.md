# 100 Days to Ramadan: Feature Plan

**Status:** Product planning (no code yet)
**Prepared:** 9 November 2026
**Goal:** Turn the run-up to Ramadan into a daily-use journey that builds habits which outlast the fasting month. Ramadan is the peak. It must not be the only reason to open Nawaetu.

## 1. Why this feature

Ramadan is the one time of year when Muslim-app usage jumps. Muslim Pro reports that Indonesian usage roughly doubles during Ramadan ([Kontan](https://industri.kontan.co.id/news/pengguna-aplikasi-muslim-pro-naik-dua-kali-lipat-saat-ramadan)). Most apps get that spike and then lose those users in Shawwal.

Nawaetu's opportunity is to own the **100 days before**. Users who arrive in Ramadan with a working routine (Fajr, Quran pages, dhikr, intention) stay for the other 11 months. Users who first meet the app on 1 Ramadan are tourists.

**Success definition:** a user finishes the journey having kept 2 or 3 small habits, and keeps using Nawaetu after Eid.

## 2. Dates (important, and the first constraint)

- Ramadan 1448 AH is expected around **8 February 2027**. It is astronomical and approximate, and Indonesia's official start may differ by a day or so.
- 100 days before that is about **31 October 2026**. Today is 9 November, so the countdown is already at roughly **day 10 of 100 (about 91 days left)**.

**Decision (owner):** combine both sources, then let the user adjust.

- **Calculation method (existing setting):** the journey follows the method the user already picked in Settings: Umm Al-Qura (Makkah), Kemenag RI, MWL, ISNA, Egyptian, Karachi (Kemenag RI is the app's default). `src/hooks/useHijriCalendar.ts` already passes this method to the AlAdhan calendar call, so the journey should read Hijri dates through that hook or its data, not call AlAdhan separately. **Verify first** that the method actually changes the Hijri dates AlAdhan returns, not only prayer times. If it doesn't, the Hijri offset below is the only lever, and the Settings copy must not imply otherwise.
- **Default target:** the Ramadan start from that method, shown as "expected".
- **Calendar basis setting:** the user can count down against the **Gregorian** date or the **Hijri** date.
- **Hijri offset setting:** the user can shift the Hijri date up or down by days, to match their local announcement (Kemenag or their own country). The app already has this offset (`parseHijriAdjustment` and `adjustHijriDate` in `src/lib/hijri-date.ts`), so the journey must read it, not add a second one.
- The countdown, phase boundaries and "Day N of 100" all recompute when either setting changes.

Design consequences:

1. **Never hardcode a date.** Compute the target from the Hijri calendar (`src/lib/hijri-date.ts`, `src/app/hijri-calendar`) and honor the settings above. This also makes the feature work every year with no rewrite.
2. **Join-anywhere.** A user who starts on day 40 gets day 40's content and a "catch-up" card, never a feeling of having failed.
3. The feature must show a live countdown and must not break if the start date shifts by one day.

## 3. Competitors

Evidence below comes from search results. Several sources are marketing roundups, so this is directional, not a measured benchmark.

| Competitor | What they do well | Gap Nawaetu can use |
| --- | --- | --- |
| **Muslim Pro** (the big one) | Huge reach. Ran "40 Days of Deen" for Ramadan 2025, with daily fasting, prayer, reflection and sunnah logging, plus Deen Mode countdowns ([Bisnis](https://teknologi.bisnis.com/read/20250212/84/1839012/jelang-ramadan-muslim-pro-luncurkan-40-days-of-deen), [Kontan](https://momsmoney.kontan.co.id/news/muslim-pro-luncurkan-40-days-of-deen-dukung-perjalanan-spiritual-pengguna-di-ramadan)) | It starts at Ramadan, so it is a campaign, not a long runway. It is generic and ad/subscription heavy. Nobody owns "before Ramadan" |
| **Athan / Athan Pro** | Prayer-time accuracy and regional settings | Utility only, little habit or accountability design |
| **Pillars** | Beautiful UI for prayer and Quran, but a review calls it limited in habit-building and accountability ([ar-pay roundup](https://ar-pay.com/blog/en/?p=32135)) | Emotional design, but no journey |
| **Muslim Mode** | Ramadan mode with suhoor/iftar countdown and a Quran reading tracker ([roundup](https://muslimmode.vercel.app/blog/best-muslim-apps-2025)) | Countdown is to meals, not to preparation |
| **Quranly** | Personalised Quran reading goals for Ramadan and beyond | Quran only, one habit |
| **AyoMuslim** (ID) | Yaumiyah tracker for prayer, tilawah, dhikr and doa, with reminders ([App Store](https://apps.apple.com/ml/app/ayomuslim/id6478108245)) | Checklist, no guided arc |
| **Amalanku** (ID) | Privacy-first, no login, sunnah-fasting tracker, achievements ([Product Hunt](https://www.producthunt.com/products/amalanku-daily-islamic-habit-tracker/launches/amalanku)) | No community or AI guidance |
| **Muslim Daily** (ID) | Wide all-in-one content library ([App Store](https://apps.apple.com/us/app/-/id1015223705)) | Content breadth, weak habit loop |
| **Generic countdown apps** | Days, hours, minutes, seconds to Ramadan | A number with nothing to do |
| **Habit List and other generic trackers** | Strong streak and graph mechanics | No Islamic context |

**Not verified:** Daily Deen, Sahabat Muslim, Salaku and Hafalan returned nothing useful. Check them by hand before using this table in any pitch.

### Positioning

> The other apps count the days. Nawaetu gives you something to do on each one.

Nawaetu already has what the competitors split across separate apps: intentions (niyyah) as the core, Hasanah and levels, streaks with freezes, missions, prayer tracking, Quran, dhikr, fasting log, qadha tracking, an AI mentor, bilingual EN/ID, and guest mode with offline sync. The feature stitches them into one guided arc.

## 4. The experience

### 4.1 Three phases, aligned to the Hijri calendar

| Phase | Approx. Hijri window | Theme | Daily ask |
| --- | --- | --- | --- |
| **1. Reset** | Days 100 to 71 (Dhul Qa'dah / early Dhul Hijjah) | Niyyah, clear the backlog | Set your intention. Pick one habit. Optionally log qadha fasts owed |
| **2. Build** | Days 70 to 31 (Rajab and Sha'ban) | Habits with real repetition | Daily micro-habit plus a weekly challenge |
| **3. Sharpen** | Days 30 to 1 (late Sha'ban) | Rehearse Ramadan itself | Taraweh trial, suhoor timing, Quran pace plan, last-day checklist |

Phase boundaries should be computed from Hijri month starts, not fixed day numbers, so they remain correct if the start date moves. Exact dates must come from the Hijri code, not this document.

### 4.2 The daily loop (the daily-app part)

Each day the user sees one card on Home:

1. **Countdown:** "Day 12 of 100 · 88 days to Ramadan."
2. **Today's micro-habit:** under 3 minutes (for example "read one page", "10x istighfar after Fajr", "drink water before bed to prepare for suhoor"). One tap to complete.
3. **Your 2 or 3 chosen habits:** pick from a short menu on day 1 (Fajr on time, Quran pages, dhikr, Duha, sunnah fasting Mon/Thu, charity). Use the existing missions system, not a new one.
4. **One-line reflection** (optional), saved to the existing journal.

A daily open that takes 30 seconds is the goal. Anything longer is a feature nobody keeps.

### 4.3 Progress mechanics (reuse, do not invent)

- **Ramadan Readiness meter:** a simple 0 to 100% built from consistency of the user's chosen habits over the last 14 days. Visible, honest, and never negative.
- **Streak (decision: sync with the existing streak):** the journey does not keep its own streak. Completing the day's journey habit counts as a qualifying day in the canonical streak (`userStreakDays`, `userStreakState`), so one number, one set of freezes, one reminder. A missed day uses a freeze or resets softly, with gentle copy. The journey feature itself does not exist yet, so the streak hook is the first integration to trace (`streak.repository.ts`, `streak-utils.ts`) before building.
- **Hasanah:** the existing engagement score. Journey completion earns a badge. No cash or reward value, consistent with `docs/HASANAH_LEVELS_AND_REWARDS_PLAN.md`.
- **Milestone moments:** day 100 (start), 75, 50, 30 (Sha'ban begins), 10, and eve of Ramadan. Each has a share card.
- **Weekly check-in with the AI mentor:** "How did week 3 go? Which habit should we adjust?" This is the competitor-proof differentiator because it adapts the plan instead of presenting a fixed checklist.

### 4.4 Beyond Ramadan (the whole point)

- **Day 1 of Ramadan:** the journey hands off to the existing `/ramadhan` experience. The user's habits carry over.
- **After Eid:** a "Keep it going" screen. Offer Shawwal six-day fasting (the app already knows this event in `src/data/hijri-events.ts`) and ask which 1 or 2 habits to keep.
- **Off-season:** the same engine runs as "Habit Sprint" for other windows (Dhul Hijjah first 10 days, Muharram, Ayyamul Bidh). This is how it becomes a year-round product and not a one-time campaign. **Treat this as a later phase.**

### 4.5 Notifications

Extend `src/lib/notifications/push-copy.ts` and the streak-reminder route, with at most one journey push per day. Keep the existing warm, casual copy style, in both ID and EN. Allow the user to mute the journey separately from prayer alerts.

### 4.6 Gen Z engagement and Lottie animation

The audience is Gen Z, so the journey should feel like something they want to open, not a worksheet. Use animation for feedback moments and keep the rest calm and fast. Free animations from [LottieFiles](https://lottiefiles.com/) are the asset source.

**Where animation earns its place (one per moment, short, skippable):**

| Moment | Animation idea |
| --- | --- |
| Day 1 start / opt-in | Crescent moon rising with stars |
| Daily card | Small looping idle, e.g. a lantern (fanous) that glows brighter as readiness grows |
| Habit tap-to-complete | Quick check burst or sparkle, under 1 second |
| Streak kept / freeze used | Flame or shield |
| Milestones (75, 50, 30, 10, eve) | Full-screen celebration that doubles as the share card |
| Countdown under 10 days | Lantern string or mosque skyline filling in |
| Empty or catch-up states | Friendly character, no guilt tone |

**Other Gen Z levers, kept small:**

- Share cards sized for Stories and WhatsApp status (day number, readiness, one line), with no worship detail exposed unless the user picks it.
- Short, casual copy in the existing push-copy voice, EN and ID. Emoji sparingly.
- A visible "Ramadan Readiness" ring that fills, which is more rewarding than a bare percentage.
- Haptic tap on completion on mobile if the platform allows it.

**Licensing (checked):** LottieFiles says free public animations fall under the Lottie Simple License, which allows commercial use in apps and websites without required attribution, with credit encouraged ([licensing basics](https://help.lottiefiles.com/animation-licensing-basics-), [attribution](https://help.lottiefiles.com/hc/en-us/articles/900002475966-how-do-i-give-attribution-for-a-lottie-animation-i-ve-used)). Their "Commercial Use Policies" page reads ambiguously, so confirm with LottieFiles support before launch if there is any doubt. Premium and marketplace items follow different terms, so only use animations whose own page shows the free license.

**Rules for using them:**

1. **License ledger.** Keep a small `public/lottie/CREDITS.md` (title, creator, URL, license, date checked) for every animation used, and credit creators in the About page. Credit is optional, but it costs nothing and is good practice.
2. **Self-host, never hotlink.** Download into `public/` so the app works offline and the service worker can cache them. Prefer `.lottie` (dotLottie) over raw JSON for size.
3. **Performance budget.** Lazy-load animation code and files only where they show (not on first paint of Home), cap each file at roughly 50 KB, and avoid heavy multi-layer scenes on low-end Android.
4. **Respect `prefers-reduced-motion`.** Show a static frame instead of playing. Add alt text or an aria-label for anything meaningful.
5. **Theme fit.** Check each animation against every supported theme. Pick simple palettes or recolor the file so it does not clash.
6. **Content fit.** Islamic-appropriate imagery only: no figures of people or animals that conflict with the app's tone, and no music or sound baked in.
7. **Reuse before adding.** The repo already has `framer-motion` for simple transitions. Use it for small UI motion (cards, progress ring) and reserve Lottie for the celebratory and illustrative moments.

**Dependency note:** the repo has no Lottie library yet. Adding one is a new dependency, which the repo convention says to justify. The justification is that Lottie files cannot be played by `framer-motion`. Pick the current official player package (check its docs and bundle size before choosing) and load it dynamically.

### 4.7 Copy voice: speak like Gen Z, stay respectful

The journey's copy should sound like a friend who gets it, not a lecturer. Match the casual voice already in `src/lib/notifications/push-copy.ts` ("Lock in bareng Subuh", "Gas wudhu"), in both ID and EN.

**Themes young people relate to (use these as hooks):**

| Theme | Why it lands | Angle for Ramadan prep |
| --- | --- | --- |
| Burnout | Common among students and early-career users | Ramadan prep as a gentle reset, not another grind. "Small and steady beats all-or-nothing" |
| Mental health, "healing", self-care | Open conversation among Gen Z | Dhikr, salah and journaling as a calm pause. Frame as support for wellbeing, never as treatment |
| Overstimulated, doomscrolling, screen time | Daily reality | "Swap 5 minutes of scrolling for 1 page" |
| Productivity, "lock in", main character energy | Aspirational | Habits as a glow-up for the heart |
| Consistency, small wins, "tiny habits" | Fits the streak | Micro-habits under 3 minutes |
| Sleep, energy, routine | Suhoor prep is real | Sleep schedule rehearsal in the Sharpen phase |
| FOMO and comparison | Social media pressure | "Your pace, your journey." No leaderboards |
| Money and generosity | Student budgets | Small sadaqah, even a tiny amount |
| Friends and community | Group identity | Share a day-card with a friend, optional |

**Sample lines (draft, to be reviewed by a native ID speaker and for religious tone):**

| Moment | ID | EN |
| --- | --- | --- |
| Day 1 | "100 hari menuju Ramadan. Bukan buat jadi sempurna, tapi buat siap. Yuk mulai pelan-pelan." | "100 days to Ramadan. Not about being perfect, just getting ready. Start small." |
| Burnout-aware | "Lagi capek banget? Gak apa-apa. Hari ini cukup 1 halaman. Itu juga sudah menang." | "Running on empty? That's okay. One page today still counts." |
| Mental health | "Hati lagi berisik? Tarik napas, dzikir 1 menit. Kamu gak sendirian." | "Mind loud today? Breathe, one minute of dhikr. You're not alone." |
| Screen time | "Tukar 5 menit scroll dengan 5 ayat. Deal?" | "Trade 5 minutes of scrolling for 5 ayat. Deal?" |
| Streak kept | "Streak aman. Konsisten itu keren." | "Streak safe. Consistency looks good on you." |
| Missed day | "Kemarin kelewat? Santai, lanjut hari ini. Allah tidak menghitung dengan galak." | "Missed yesterday? No stress. Pick it back up today." |
| Late joiner | "Baru gabung di hari ke-40? Telat itu lebih baik daripada gak sama sekali." | "Joining on day 40? Better late than never. Welcome in." |
| Sleep prep | "Latihan sahur dimulai. Tidur lebih awal malam ini, ya." | "Suhoor training starts. Early night tonight?" |
| 10 days left | "10 hari lagi. Kamu sudah sejauh ini. Tinggal finishing." | "10 days left. Look how far you came." |

**Rules for trendy copy:**

1. **Respect over slang.** Never joke about Allah, the Quran, prayer, or hadith. Casual tone applies to the app's own voice, not to religious texts or rulings. Arabic and references stay untouched.
2. **Mental health claims need care.** Use "calm", "pause", "wellbeing". Do not say or imply that dhikr or salah cures anxiety or depression, or replace professional care. If the AI mentor meets distress or self-harm signals, it should point to professional help and local crisis resources rather than act as a therapist. Add a short note in the mentor prompt.
3. **Trend terms expire.** Keep slang in a small copy file (the same place as push copy), not scattered in components, so it can be refreshed each season. Prefer evergreen words (burnout, reset, small wins) over memes that age in a month.
4. **No guilt, no shame, no pressure.** Avoid "don't waste your time", "you're falling behind", or streak-loss threats.
5. **Inclusive and gender-neutral wording.** Do not assume the user's gender, life stage or prayer-ability (for example during menstruation).
6. **Cap the cringe.** One casual hook per message, a maximum of one emoji, no stacking of slang. Read aloud before shipping.
7. **Both languages are written, not translated.** ID copy should sound like how Indonesians actually talk, with natural English loanwords ("gas", "lock in", "deal"). EN copy should not just be a literal translation.

## 5. Religious and trust guardrails

- **Framing:** "100 days" is a training program, not a religious obligation or an act of worship with its own reward. Copy must say "a way to prepare", never imply a special merit for the number 100.
- **No unsourced claims.** Any hadith, dua, or ruling in daily content goes through the same review used in `docs/HADITH_DUA_AUDIT_ACTION_PLAN.md`. Preserve Arabic text and references.
- **No guilt mechanics.** Missed days are met with encouragement. No public leaderboards of worship (matches the rewards plan non-goals).
- **Privacy:** worship data is personal. Nothing shared unless the user explicitly taps share.
- **Moon-sighting honesty:** show "expected" next to the Ramadan date, and update when the official announcement lands.
- **Fiqh sensitivity:** qadha and fasting content should respect the madhhab settings that `src/data/fasting/fiqh-rules.ts` already handles.

## 6. Technical approach (smallest complete version)

Trace before building. These are the places the feature touches, based on the current repo layout:

| Need | Reuse | New |
| --- | --- | --- |
| Countdown and phase | `src/lib/hijri-date.ts`, hijri adjustment setting | A small pure function: `getRamadanJourney(today, adjustment)` returning day, total, phase, target date. **Needs unit tests** |
| Daily micro-habit content | `src/data/missions/seasonal.ts`, `daily.ts` | A `src/data/ramadhan-journey/` content file, EN and ID, one entry per day or per rotating pool |
| Habit completion | Missions and the activity repository | None if journey habits are missions |
| Streak and Hasanah | `streak.repository.ts`, `progression.ts` | None |
| Home surface | `src/components/home/` (e.g. `DailySpiritWidget`) | One `JourneyCard` component using existing UI primitives and theme variables |
| Animation | `framer-motion` (already installed) for UI motion | A Lottie player dependency (lazy-loaded), self-hosted `.lottie` files in `public/lottie/`, and `CREDITS.md` (section 4.6) |
| Notifications | `push-copy.ts`, streak-reminder route | New copy pairs |
| Reflection | Intentions and journal | None |
| AI weekly check-in | `mentor-ai` | A prompt template that receives readiness and habit stats |
| Persistence | Existing user settings | Journey opt-in and chosen habits (settings JSON first) |

**Persistence rule:** the user's journey day is derived from today's date, so no per-day rows are needed. Only the opt-in, the chosen habits, and the start choice are stored. Start in guest local storage and sync through the existing guest and user sync path. **Do not add a new table in the MVP.** Add one only if the readiness meter needs history that missions and streak days cannot supply. Any schema change needs its migration reviewed with it, and applying it to a shared database needs explicit authorization.

**Non-negotiables from the repo conventions:** English and Indonesian parity, guest and offline behavior preserved, API ownership checks and rate limiting on any new route, accessible UI across themes and mobile.

## 7. Rollout

| Step | Scope | Exit check |
| --- | --- | --- |
| **0. Decide** | Confirm Ramadan 1448 start source, phase boundaries, habit menu, and tone | Written sign-off |
| **1. MVP (target: about 2 weeks)** | Journey function plus tests, JourneyCard on Home with countdown, daily micro-habit, and join-anywhere. Reuse missions and streak. EN and ID | Day number correct across timezones and Hijri adjustments |
| **2. Engagement** | Readiness meter, milestone share cards, journey push notifications, mute control | Push opt-out rate stays low |
| **3. AI and depth** | Weekly mentor check-in, phase-specific content, Taraweh and suhoor rehearsal | Mentor usage per journey user |
| **4. Retention** | Eid hand-off, Shawwal "Keep it going", Habit Sprint engine for other seasons | Post-Eid retention |

Given the countdown is already underway, **ship the MVP first and label it "Day N"**. Late joiners are still the largest audience, because most Ramadan interest peaks in the final weeks.

## 8. Metrics

Track through the existing analytics routes, with no new tooling.

- Journey opt-in rate among active users
- Daily active rate for opted-in users versus non-opted-in users (the core question: does it make Nawaetu a daily app?)
- Habit completion rate by phase, and drop-off day
- Readiness score distribution on the eve of Ramadan
- **Day-30 after Eid retention**, journey users versus others. This is the number that decides whether the feature worked.

Baseline from last year's Ramadan usage should be measured first, so this year has something to compare against.

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Start date off by a day | Compute from Hijri code, show "expected", honor adjustment |
| Starting late feels like failure | Join-anywhere, catch-up card, warm copy |
| Notification fatigue | One journey push per day maximum, separate mute |
| Content burden (100 days, 2 languages) | Rotating pool of about 30 micro-habits, repeated with variations, not 100 unique essays |
| Religious accuracy | Source and review process before any text ships |
| Becomes a one-season gimmick | Phase 4 (Habit Sprint engine) is part of the plan, not an afterthought |
| Animations slow the app or ignore license terms | Size budget, lazy load, reduced-motion fallback, per-asset license ledger (section 4.6) |
| CI coverage gate | The repo fails PRs below 80% line coverage, so the pure journey function and content selectors need tests in the same PR |

## 10. Open questions for the owner

1. ~~Which source defines the Ramadan start?~~ **Resolved:** combine both, with a Gregorian/Hijri basis setting and a Hijri up/down offset (section 2).
2. Is the habit menu fixed (about 6 habits) or can users define their own?
3. Should the journey be opt-in, or shown to everyone with a dismiss option?
4. Is any sponsor tie-in wanted? If so, hold it until the rewards plan pilot, and keep it out of this feature.
