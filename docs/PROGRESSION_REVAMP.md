# Progression Revamp: Levels, Stages and the Stats Page

**Status:** Implemented on `feat/journey-stages`, 27 November 2026.
**Scope:** How level and progress are named, explained and shown on `/stats` and in the profile (settings). The Hasanah award amounts and the level curve are unchanged; see `HASANAH_LEVELS_AND_REWARDS_PLAN.md` for the v2 economy.

## 1. Problem

| Finding | Where |
|---|---|
| Two naming systems for one level. Level 7 was "Pencari Rahmat" in stats and "Fase 7: Salik" in the profile. "Salik" meant level 25–39 in one and 1–10 in the other. | `stats.ranks`, `gamificationLevelTitle_*` |
| "Fase 7" labelled a level as a phase. There were only five phases. | Profile |
| Names promised what was not measured. "Pejuang Subuh" was reached with Hasanah from any worship; its text read like a Subuh-only requirement. | Stats |
| Titles named states of the heart: Mukhlis (ikhlas), Muhsin (ihsan), Muttaqin (taqwa), awarded from points. | Both |
| Outdated copy: "Misi Niat & Ramadhan Tracker menambah Hasanah". All missions and prayer check-ins do. | Profile |
| Hasanah could read as a count of pahala. | Both |
| A lapsed streak showed a large "0". | Stats, profile |

## 2. Research

### 2.1 Islamic guidance

- **Do not claim purity.** QS An-Najm 53:32 and QS An-Nisa 4:49. The Prophet Muhammad SAW renamed Barrah ("pious") to Zainab, saying "do not hold yourselves to be pious" (Muslim 2142, checked on hadithunlocked.com). An app awarding "Muttaqin" from points does what this forbids.
- **Constancy over volume.** "The most beloved deed to Allah is the most constant, even if little" (Bukhari 6464).
- **Self-accounting is legitimate.** "Hold yourselves to account before you are held to account", attributed to Umar (Ahmad, al-Zuhd; the chain has a gap). Private tracking as muhasabah is sound; public ranking invites riya.
- No fatwa was found that rules directly on gamifying ibadah. The design therefore follows the principles above rather than a specific ruling.

### 2.2 Other apps

Every app reviewed rewards consistency (streaks, goals, heatmaps): Muslim Pro, Pillars (with a menstruation mode that protects streaks), Quran.com, Tarteel, Quranly, YouVersion, Duolingo. None uses a spiritual-rank title. Quranly's hasanat counter and "hasanat per year" paywall calculator are the pattern to avoid. A review of 11 Islamic apps found most lack support for autonomy, competence and relatedness (Kabir et al. 2024, arXiv 2402.02061).

### 2.3 Habit and motivation research

| Finding | Design implication |
|---|---|
| Habits form in a median of 66 days; one missed day does not matter (Lally et al. 2010) | The stage that says "the habit is forming" starts around day 60. Forgive single misses |
| Autonomy, competence, relatedness drive engagement (Self-Determination Theory) | Focus is a suggestion, not a requirement. Show progress clearly. Community without ranking |
| Rewards for doing a task can crowd out intrinsic motivation (Deci, Koestner and Ryan 1999) | Hasanah is feedback, never payment, and is said not to be pahala |
| Broken streaks lower later engagement, less so when people can repair them (Silverman and Barasch 2023) | No big "0"; udzur days and the freeze already protect the streak |
| Fresh-start landmarks help people restart (Dai, Milkman and Riis 2014) | Follow-up: invite restarts on Monday, Jumu'ah, Muharram and Ramadan |

### 2.4 Audience and persona

Evidence: Google Analytics (889 active users, 1 January to 23 November 2026, led by Bandung and Jakarta, mostly direct links, Google, Instagram and Threads), the database (285 accounts, 59 with missions), the product's Gen Z tone rules, and Muslim Pro's Indonesian figures (more than half of users under 35).

**Target audience:** Indonesian Muslims aged about 18–35, urban, on mobile web and budget Android, who want to practise more regularly and value sources and privacy. Most are early in their practice.

The personas below are hypotheses drawn from that data, not interviews.

| Persona | Situation | What progression must do |
|---|---|---|
| **The beginner** (largest group) | Wants to fix their prayers. Opens the app once or twice, then drifts. 14 of 23 users with streak data were active on one day only; 17 of 22 accounts with progress are at level 1 | Give a near, honest next step in the first week. Never shame a lapse |
| **The builder** | Keeps five prayers, wants to add sunnah, Quran and dhikr | Name the next thing to practise. Count every kind of worship |
| **The Muslimah in udzur** | Cannot pray or fast some days each month | Udzur days never count as missed (shipped in PR #324 and #326) |

Typical pace from real data: median 25 Hasanah per active day, mean 78.

## 3. Principles

1. **Name the practice, never the person.** No title that is also a virtue.
2. **One system everywhere.** The same card and wording on `/stats` and in the profile.
3. **Every worship counts.** No stage depends on one prayer or one feature.
4. **Suggest, never require.** Focus is optional; leveling stays based on Hasanah.
5. **Hasanah is feedback, not pahala.** Say it where levels are explained.
6. **Near goals for beginners.** The first stage change comes within days.
7. **No shame.** A lapsed streak reads "Mulai hari ini", with the record kept.
8. **Private by default.** No leaderboard; the community card shows totals only.

## 4. Design

### 4.1 Seven stages

Level comes from Hasanah as before (`LEVEL_THRESHOLDS`, unchanged). The stage comes from the level:

| Stage | Levels | Approx. day at 78 Hasanah/day | Practises | Reminder |
|---|---|---|---|---|
| 1. Memulai | 1–2 | 0 | Setting the intention, starting to log | Bukhari 1 |
| 2. Membiasakan | 3–5 | 4 | Logging every day | Bukhari 6464 |
| 3. Menjaga Waktu | 6–9 | 19 | Praying early in the time, Subuh included | Bukhari 527 |
| 4. Menambah | 10–14 | 58 | Adding sunnah | Bukhari 6502 |
| 5. Memperdalam | 15–24 | 122 | Khusyuk, tilawah, dhikr | QS Al-Mu'minun 1–2 |
| 6. Meneguhkan | 25–39 | 250 | Keeping it going when busy | QS Fussilat 30 |
| 7. Menebar Manfaat | 40+ | 440 | Bringing others to good | Muslim 1893 |

Stage 4 starts near day 60, when habit research says the routine has formed. All hadith numbers were checked against fawazahmed0/hadith-api or hadithunlocked.com.

### 4.2 Screens

- **StageCard** (`src/components/progress/StageCard.tsx`), used on `/stats` and in the profile: stage n of 7, stage name and meaning, level, progress bar with "N Hasanah lagi ke Level X", a suggested focus, the next stage and its level, and "Cara kerja level".
- **StageGuide** (`StageGuide.tsx`): three rules (every worship adds Hasanah; Hasanah raises the level; the stage names the practice and its focus is optional), all seven stages with "Kamu di sini" and the current reminder, and "Tentang Hasanah" with QS An-Najm 32.
- Donors are called "Pendukung Nawaetu" ("Nawaetu Supporter") instead of "Muhsinin", the same virtue-title problem tied to payment. The `is_muhsinin` columns keep their names; renaming them needs a migration and changes nothing users see.
- Removed: the rank modal on `/stats`, the duplicate "Lv" chip in its header, the profile phase list and its outdated copy, and the unused "Muhsinin Nawaetu" role label.

### 4.3 Code

- `progression.ts`: `STAGES`, `getStageIndex`, `getStageKey`; `PlayerStats.stageKey` replaces `rankKey`. Stage keys are not stored anywhere, so no data migration is needed.
- Translations: `stats.journey` and `stats.stages` replace `stats.level`, `stats.ranks` and the `gamificationLevel*` keys.

## 5. Follow-ups, not in this change

- **Fresh starts.** Restart prompts on Monday, Jumu'ah, 1 Muharram and Ramadan.
- **Niat as a plan.** Let the intention journal capture when and where (implementation intentions).
- **The v2 economy.** Award caps and the longer curve in `HASANAH_LEVELS_AND_REWARDS_PLAN.md` need 4–8 weeks of baseline data first. Stage boundaries are expressed in levels, so they move with the curve.
