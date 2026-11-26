# Gender Personalization: Udzur (Haid/Nifas) Mode Plan

**Status:** Implemented on `feat/udzur-mode` (26 November 2026) with every recommended option in §11. Differences from this plan in §13
**Prepared:** 26 November 2026
**Goal:** Let a woman who is on her period (haid) or bleeding after birth (nifas) use Nawaetu without the app treating her as someone who skipped prayer. Her streak must not break, her obligatory prayer missions must count as fulfilled by udzur (a valid excuse), and the app must keep offering worship she *can* do. It must also stay discreet and private, and never claim more than the fiqh sources support.

## 1. What happens today

Gender is stored as `male | female | null` (`src/data/missions/types.ts:19`, `users.gender` in `src/db/schema.ts:89`, `STORAGE_KEYS.USER_GENDER` locally). It already changes some behaviour:

| Area | Male | Female | File |
| --- | --- | --- | --- |
| Prayer reward | 25 alone / 75 congregation (choice sheet) | 75, praying at home on time | `resolveRitualForGender` in `src/data/missions/daily.ts`; `PrayerCheckInWidget.tsx:291` |
| Friday | Jumat replaces Dzuhur | Dzuhur as usual | `src/lib/mission-resolver.ts:49`, `useWidgetMissions.ts:58` |
| Extra missions | `friday_prayer` | `makeup_fasting_tracker`, `menstruation_dhikr`, `salawat_100x` | `FEMALE_MISSIONS` / `MALE_MISSIONS` in `daily.ts` |
| Fasting tracker | — | Can log haid, nifas, pregnant, breastfeeding per Ramadan day | `src/data/fasting/fiqh-rules.ts`, `ramadhan_fasting_log` |

What goes wrong for a woman on her period:

| # | Problem | Cause in code |
| --- | --- | --- |
| 1 | **Streak risk.** A day counts toward the streak when at least one mission is completed (`updateStreak()` on the first completion of the day: `PrayerCheckInWidget.tsx:236`, `MissionsWidget.tsx:131`). For many users, prayer check-in is the only daily action. During 6–15 days of haid there is nothing to check in, and the streak resets after one missed day. The single freeze (`STREAK_FREEZE_CAP = 1`, earned at 7 days, `src/lib/habits/progression.ts`) covers only a one-day gap. | Streak rules know about activity only, not about udzur. |
| 2 | **Prayer missions look missed.** The five `*_prayer` missions stay unchecked, and the widget shows e.g. `3/10 selesai` while she has done everything required of her. The "all done" state (`MissionsWidget.tsx:245`) can never be reached. | The mission list and the progress counter have no idea of udzur. |
| 3 | **Stats show gaps.** The prayer heatmap and `{todayPrayerCount}/5` (`src/components/stats/PrayerConsistency.tsx:70`) and `recentPrayerCount` (`src/app/stats/page.tsx:121`) count haid days as missed. "Consistency" drops every month. | Same as #2. |
| 4 | **Wrong nudges.** Adhan / prayer push alerts keep arriving (`/api/notifications/prayer-alert`), and the streak reminder fires. Sunnah-fast suggestions (Mon/Thu mission, `JourneyFasting`) keep appearing, though she may not fast. | Notifications and fasting suggestions have no udzur state. |
| 5 | **Always-on female missions.** `menstruation_dhikr` ("Dzikir Saat Haid") shows every day, even when she is not on her period. `makeup_fasting_tracker` ("Qadha Puasa") shows every day, even with zero qadha owed. | `FEMALE_MISSIONS` are unconditional. |
| 6 | **Ramadan double entry.** In Ramadan she has to mark every haid day in the fasting tracker by hand, separately from anything she tells the prayer side of the app. | No shared udzur state. |

Pre-existing data issue found while researching: `fiqh-rules.ts` cites the "does she not leave prayer and fasting" hadith as *Muslim no. 334*. In Muslim that wording is usually numbered 79/80; 334/335 is the qadha hadith. Check it against HadeethEnc and fix it in the same PR as Phase 3.

## 2. Fiqh rules the feature encodes

Every reference must be checked against HadeethEnc or the existing library (`src/data/hadiths/index.ts`, `src/data/fasting/fiqh-rules.ts`) before shipping, and existing licensed translations reused rather than rewritten. Name the Prophet as "Nabi Muhammad SAW" / "Prophet Muhammad SAW" in Nawaetu's own text (`src/data/honorific.test.ts`).

### 2.1 Agreed rules (shown as plain facts)

1. **No prayer and no fasting during haid or nifas.** *HR. Bukhari no. 304.*
2. **Prayers missed during haid/nifas are not made up; fasts are.** Aisyah RA: "We were ordered to make up the fasts, and we were not ordered to make up the prayers." *HR. Bukhari no. 321, Muslim no. 335.* This is the basis for marking prayer missions **fulfilled by udzur** instead of "missed" or "owed".
3. **Nifas follows the rules of haid.** Already worded in `fiqh-rules.ts` (`postpartum`).
4. **Dhikr, dua and salawat are allowed.** *HR. Bukhari no. 305* (already in the library as `hadith_haid_dzikir`, used by `menstruation_dhikr`).
5. **Istihadah (bleeding outside haid) is not udzur.** She prays and fasts. *HR. Bukhari no. 228, Muslim no. 333* (Fatimah binti Abi Hubaisy). The app must say this and not offer udzur mode for it.
6. **Qadha of Ramadan can be delayed until before the next Ramadan.** Aisyah RA made hers up in Sya'ban. *HR. Bukhari no. 1950, Muslim no. 1146.*

### 2.2 Disputed points (always worded "ulama berbeda pendapat", never as a ruling)

| Topic | What the app says | Madhhab-aware? |
| --- | --- | --- |
| Reading Quran without touching the mushaf | The majority of scholars forbid touching the mushaf; reading from memory or a screen is disputed. Listening, tafsir and translation are open to her. The Quran reader is **not** blocked. | No |
| Haid starts after a prayer time began, before she prayed | Many scholars (incl. Syafi'i) say that prayer is owed after she becomes pure, if there was enough time to pray it. Shown as an info line, never auto-added as debt. | Reuses the madhhab setting |
| Purity comes before a prayer time ends | That prayer is owed. Syafi'i and Hanbali also require the earlier prayer it can be combined with (Dzuhur if pure in Ashar time, Maghrib if pure in Isya time); Hanafi only the current one. Source: athar of Ibn Abbas and Abdurrahman bin Auf RA (verify the reference). | Yes |
| Longest haid / nifas | Haid: 15 days (Syafi'i, Hanbali, Maliki), 10 days (Hanafi). Nifas: commonly 40 days (*HR. Abu Dawud no. 311*), 60 days in Syafi'i/Maliki. Used only to **ask** "sudah suci?" and to point to istihadah guidance, never to end the mode on its own. | Yes |
| Reward for prayers she could not do | The hadith on the sick and the traveller (*HR. Bukhari no. 2996*) is applied to haid by some scholars only. The app does **not** promise "pahala sholat tetap tercatat". It says that leaving prayer during haid is obedience to Allah, not negligence. | No |

The madhhab comes from the existing `STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB`. If unset, show the "ulama berbeda pendapat" wording with both views.

### 2.3 What the app must not do

- No cycle prediction, fertility window, symptom or flow tracking. That is medical, sensitive and out of scope.
- No reward (hasanah) for a prayer that was not prayed (see §11, decision 1).
- No mention of haid in notifications, share cards, the lock screen, analytics events or AI-mentor prompts.

## 3. Product design

### 3.1 Names

The user-facing name is discreet and generic. Indonesian: **"Sedang berhalangan"** (mode: *Mode Udzur*). English: **"Excused (period)"** / *Excused mode*. Inside the sheet she picks **Haid** or **Nifas**; that choice is stored on the device only (§6). Icon: an existing calm icon such as `moon` or `sparkles` (the fasting rules already use `sparkles` for haid). No blood-drop icon.

### 3.2 Who sees it

Only when `gender === 'female'`. Users with no gender set already get the "select gender" hint (`home_mission_select_gender_hint`). If the gender changes to male while the mode is on, the mode ends.

### 3.3 Starting the mode

Entry points, all opening the same bottom sheet:

1. **Prayer check-in widget** header: a small "Sedang berhalangan?" link (female only).
2. **Profile → Ibadah settings**: a row "Mode Udzur" with the current state.
3. **Fasting tracker**: picking `menstruation` or `postpartum` for today offers "Aktifkan juga untuk sholat?".

The sheet asks:

- Type: Haid / Nifas.
- Started: default **now**; can be moved back up to 7 days (she forgot to switch it on).
- One line of reassurance (copy in §8) and a link to the fiqh guide (§3.8).

Effect: prayers whose time starts **after** the start time are excused. The prayer whose time is current stays as it is, with the disputed-point info line from §2.2. Moving the start back excuses earlier prayers and repairs the streak for those days (§4).

### 3.4 While the mode is on

**Prayer check-in widget** (`PrayerCheckInWidget.tsx`): each excused prayer shows a muted "Udzur" chip instead of the empty check circle. Tapping it opens a sheet: "Sholat ini gugur karena udzur dan tidak perlu diqadha" (cite Bukhari 321 / Muslim 335), with one action: **"Dzikir di waktu ini"**, which opens the dhikr counter (`/dhikr`). The sunnah prayers (rawatib, dhuha, witir) are hidden for excused times. Backdated dates (`selectedDate`) that fall inside a period show the same state.

**Missions** (`useWidgetMissions.ts`, `MissionsWidget.tsx`, `/missions`):

- The five obligatory prayer missions move into a collapsed group "Gugur karena udzur (5)". They are **left out of the denominator**, so `completedCount/missions.length` reaches "all done" on what she can do. No completion record is written, so hasanah and stats stay honest.
- `menstruation_dhikr` and a small "amalan saat udzur" set appear **only** in this mode (§3.6).
- `sunnah_fasting` and fasting-related seasonal missions are hidden.
- Sunnah prayer missions (`SUNNAH_PRAYER_MISSIONS`) are hidden.

**Streak**: never breaks (§4). The flame shows a paused state, "Streak dijeda — udzur", on days she does nothing; on days she does something, it grows as normal.

**Stats** (`src/app/stats/page.tsx`, `PrayerConsistency.tsx`, `StatsOverview.tsx`): excused days get their own hatched/muted cell (with a text label, not colour only) and are left out of the denominator of prayer consistency and "active days" consistency. `todayPrayerCount/5` shows "Udzur" instead of `0/5`.

**Fasting** (`JourneyFasting`, fasting card): no sunnah-fast suggestions. In Ramadan, see §5.

**Notifications**: prayer alerts and the streak reminder pause (§7).

### 3.5 Ending the mode

A daily banner on the home screen: "Sudah suci?" with one tap. The sheet asks the end time (default now) and then shows a short checklist:

1. Mandi wajib (ghusl) — link to a short guide (new content, §3.8).
2. The prayer whose time is current, if time remains, is now **due** and reappears unchecked.
3. The combined-prayer note from §2.2, worded by madhhab.

Prompts so the mode is never forgotten:

- From day 7 of haid: banner moves to the top of home.
- At the madhhab's maximum (10 or 15 days haid; 40 or 60 nifas): a sheet explains that bleeding past this is treated as istihadah by that madhhab, so prayer is due, and suggests asking a trusted ustadzah. The mode stays on until she ends it — the app does not decide for her.
- Server hard cap: a period cannot exceed 60 days (§6.2).

### 3.6 Worship she can do: "Amalan saat udzur"

Shown as a small set of missions while the mode is on, reusing content that already exists. Each mission pays hasanah as today.

| Mission | Reuses | Hasanah |
| --- | --- | --- |
| Dzikir di waktu sholat (once per prayer time, up to 5) | Dhikr counter, `menstruation_dhikr` | 30 each |
| Shalawat 100x | `salawat_100x` | 40 |
| Doa harian | `/dua` | existing |
| Luruskan niat | `daily_intention` (already universal) | 50 |
| Dengarkan murottal | Quran audio player | new, 30 |
| Baca sirah / hadits hari ini | Sirah reader, hadith library | new, 30 |
| Sedekah / kebaikan kecil | manual | new, 30 |

This replaces about 200–300 of the 375 hasanah a day she would earn from prayers, so her level does not stall for a third of every month. It is not meant to be equal to prayer, and the copy does not say it is.

### 3.7 Mentor AI

Do not send the mode or its type to any AI provider. The streak value sent today (`prayerStreak` in `src/app/mentor-ai/ai-action.ts`) is already correct because the streak no longer breaks. If she asks the mentor about haid, the system prompt already forbids assumptions by gender (`src/lib/llm-providers/system-instruction.ts:19`); no change.

### 3.8 Content: "Panduan Haid & Nifas"

One short guide page in `src/data/` (en/id), linked from the start and end sheets: what is excused, what is made up (fasting only), what she can do, ghusl steps, istihadah, and the disputed points from §2.2. Each point carries its reference, checked as in §2.

## 4. Streak rules

### 4.1 Today

`advanceStreak` (`src/lib/habits/progression.ts`): gap of 1 day → +1; gap of 2 days with a freeze → +1 and freeze used; otherwise reset to 1. The server rebuilds the same state from `user_streak_days` rows with `status = 'qualified'` and stores freezes as `frozen` rows (`src/core/repositories/progression.repository.ts`).

### 4.2 New rule: excused days bridge the gap

An **excused day** is a local date that falls inside an udzur period (any part of the day).

1. A day with qualified activity counts as today (+1), excused or not. She can keep growing the streak with dhikr.
2. Excused days with no activity **do not add** to the streak and **do not use** a freeze. They are skipped when measuring the gap.
3. After skipping excused days, the old rules apply to what remains (1-day gap +1, 2-day gap uses a freeze, otherwise reset).
4. `getDisplayStreakForData` (`streak.repository.ts`) treats a run of excused days up to today as "not lost", so the flame does not drop to 0 during the period.

Example: streak 20, haid from Mon to Sat, no activity on those days, a dhikr on Sun → streak 21. With one dhikr on Wed as well → 21 on Wed, 22 on Sun.

### 4.3 Code changes

- `advanceStreak(state, localDate, excused?: ReadonlySet<string>)`: count the missing days between `lastStreakDate` and `localDate` that are not in `excused`; use that count where `dayDifference - 1` is used today. Same change in `rebuildStreakState`, `rebuildStreakDetailed`, `rebuildStreakFromHistory`.
- `LocalStreakRepository.updateStreak` and `getDisplayStreak` read the local excused set (§6.1).
- `useStreak` (`src/hooks/useStreak.ts`) passes the excused days from the canonical projection (status `excused`) into the rebuild.
- Server: `processProgressionEvidenceBatch` and `reverseProgressionEvidence` load `excused` rows and pass them into `rebuildStreakDetailed`. An `excused` row is replaced by a `qualified` row on the same date, the same way `frozen` rows are today (`setWhere: status = 'frozen'`).
- Backfilling a period (start moved back) re-runs the rebuild, which repairs a streak that broke during those days.

## 5. Ramadan and qadha

- When the mode covers a Ramadan day, the fasting log for that day is set to `menstruation` / `postpartum` (consequence `qadha`), through the existing local store (`RAMADHAN_FASTING_LOG`, pending queue `RAMADHAN_FASTING_PENDING`) and `/api/ramadhan/fasting`. A day she already logged by hand is not overwritten.
- `makeup_fasting_tracker` shows only when the qadha count from `/api/ramadhan/fasting/qadha` (or the local log for guests) is above zero, and not while the mode is on.
- Qadha reminder: from 1 Rajab, if qadha is still owed, a gentle home card "Masih ada X hari qadha sebelum Ramadhan" citing Bukhari 1950 / Muslim 1146. Monday/Thursday and Ayyamul Bidh suggestions mention that a qadha fast can be done on those days.
- Lailatul Qadr content (`src/data/ramadhan/lailatul-qadr-guide.ts`): add one line on what a woman in haid can do in the last ten nights (dhikr, dua, `Allahumma innaka 'afuwwun`, listening to the Quran). Check the source as in §2.

## 6. Data and privacy

Menstruation data is health data, a "specific" category of personal data under Indonesia's UU PDP (No. 27/2022). Collect as little as possible.

### 6.1 On the device (guests and signed-in users)

New key `STORAGE_KEYS.UDZUR_PERIODS` (`nawaetu_udzur_periods`) in `src/lib/constants/storage-keys.ts`:

```ts
interface UdzurPeriod {
  id: string;           // uuid, for idempotent sync
  kind: 'haid' | 'nifas';
  startedAt: string;    // ISO timestamp, local offset
  endedAt: string | null;
}
```

Keep the last 12 months only; older periods are pruned on read. Per-prayer excuse is derived from these timestamps plus the prayer times the app already computes; nothing per prayer is stored. A `useUdzur()` hook (in `src/hooks/`) exposes `isActive`, `isPrayerExcused(prayerKey, date)`, `excusedDates`, `start()`, `end()`, and emits an app event so widgets refresh, like `streak_updated` today.

### 6.2 On the server (signed-in users only)

Store **dates only, no reason, no type, no times**:

- Add `'excused'` to `streakDayStatusEnum` (`src/db/schema.ts:27`) with a Drizzle migration. One `user_streak_days` row per excused local date: `source = 'adjustment'`, `sourceId = 'excuse:<periodId>:<date>'`, `origin = 'server'`.
- New endpoint `POST /api/user/excused-days` with `{ periodId, dates: string[] }` (add) and `DELETE` (remove, for a cancelled or shortened period). Auth, ownership, Zod validation, rate limit, at most 60 dates per period, no future dates beyond today, idempotent on `periodId + date`. Queue it through the existing sync queue (`src/lib/sync-queue.ts`) so it survives offline use and retries.
- Pull (`/api/user/pull`, `full-data`) already returns streak days; other devices read `excused` days from there and show whole-day udzur for those dates. Exact start/end times stay on the device that recorded them (see §10).
- Global stats (`/api/stats/global`) and any query on `user_streak_days` must keep filtering `status = 'qualified'` — check each one.
- Guest import (`/api/user/sync-guest`): send local periods as excused dates on first sign-in.
- Account deletion already cascades. Data export (`full-data`) includes the excused dates.

### 6.3 Other privacy rules

- The privacy policy gets one paragraph: what is stored (dates only on the server), why (streak), how to delete.
- "Hapus riwayat udzur" in settings deletes local periods and calls `DELETE` for all excused dates.
- No analytics event carries the mode or its type. If a usage count is wanted, one event with no properties (§11, decision 5).

## 7. Notifications

- Prayer alerts: add `pausedUntil: string | null` to the push preferences sent through `/api/notifications/preferences`. `/api/notifications/prayer-alert` skips a subscription while `pausedUntil` is in the future. The client sets it to start + 16 days (haid) or + 61 days (nifas) and clears it when the mode ends, so a forgotten mode does not mute alerts forever. The server never learns why. Optional toggle in the start sheet: "Tetap ingatkan di waktu sholat (untuk dzikir)", which leaves alerts on.
- Streak reminder (`/api/notifications/streak-reminder`): skip when today's `user_streak_days` row is `excused`.
- Local Android/web reminders: the same check against `useUdzur().isActive`.
- Notification text never mentions haid or udzur.

## 8. Copy (both locales, via `src/data/translations/`)

| Key idea | Indonesian | English |
| --- | --- | --- |
| Start sheet title | Sedang berhalangan? | On your period? |
| Reassurance | Meninggalkan sholat saat haid adalah ketaatan kepada Allah, bukan kelalaian. Sholat yang gugur tidak perlu diqadha. | Leaving prayer during your period is obedience to Allah, not neglect. These prayers are not made up later. |
| Excused chip | Udzur | Excused |
| Mission group | Gugur karena udzur | Excused today |
| Streak paused | Streak dijeda — udzur | Streak paused — excused |
| End banner | Sudah suci? | Period ended? |
| Istihadah note | Darah yang keluar lebih dari {days} hari menurut mazhab {madhhab} dihukumi istihadah: sholat dan puasa tetap wajib. Tanyakan kepada ustadzah yang kamu percaya. | Bleeding beyond {days} days is treated as istihadah in the {madhhab} school: prayer and fasting are due. Please ask a scholar you trust. |

Final wording goes through the same review as other religious copy.

## 9. Implementation phases

Each phase is one PR, works on its own, and keeps guest/offline behaviour.

### Phase 1 — Local udzur mode (no server change)

1. `UDZUR_PERIODS` key, `useUdzur()` hook, pruning, app event.
2. Start/end sheets using `src/components/ui/` primitives; entry from the prayer widget and profile.
3. Prayer widget excused state; sunnah prayers hidden for excused times.
4. `getMissionsForGender` gets an `udzurActive` flag (or the hook filters its result): prayer missions → excused group out of the denominator; `menstruation_dhikr` and the new amalan missions only when active; `sunnah_fasting` hidden. `makeup_fasting_tracker` only with qadha owed.
5. Streak: `advanceStreak` with excused set, local repository and display.
6. Stats: excused cells and denominators.
7. Local notifications respect the mode.

### Phase 2 — Sync and server streak

1. Migration adding `'excused'` to `streak_day_status`; review the SQL together with `schema.ts`. Applying it to the shared database needs explicit authorization.
2. `/api/user/excused-days` (POST/DELETE) + sync-queue entry + guest import.
3. Server rebuild uses excused rows; `useStreak` canonical projection reads them.
4. `pausedUntil` for prayer alerts; streak-reminder skip.
5. Privacy policy paragraph; delete-history action.

### Phase 3 — Fasting, content and polish

1. Ramadan auto-fill of the fasting log; qadha card from Rajab.
2. "Panduan Haid & Nifas" guide (en/id) with checked references; fix the Muslim 334 citation (§1).
3. Lailatul Qadr line for women in haid.
4. Madhhab-aware end-of-period prompts.

## 10. Known limits

- On a second device, a partly excused day (haid started at Ashar) shows as fully excused, because only dates are synced. Acceptable; syncing exact times would store more health data.
- The app trusts what she enters. A user could switch the mode on to protect a streak. Streaks are self-tracking with no leaderboard, so the 60-day cap is the only guard.
- Prayer times differ by method and location, so "which prayer was current at the start" follows the device's prayer times.

## 11. Owner decisions needed

1. **Hasanah for excused prayers.** Recommended: **0**, with the amalan set (§3.6) as the way to keep earning. Alternative: a fixed small amount, which risks implying a reward the sources do not promise.
2. **Streak during udzur.** Recommended: **pause** (bridge without growing, §4.2). Alternative: grow the streak on excused days with no activity — simpler for the user, but the streak stops meaning "days I did something".
3. **Server sync.** Recommended: sync excused **dates only** (§6.2). Alternative: keep everything on the device; then the server streak breaks during haid for signed-in users, unless she logs one amalan a day.
4. **Naming.** "Mode Udzur" / "Sedang berhalangan" (recommended, discreet) vs. "Mode Haid" (clearer, less discreet).
5. **Analytics.** Recommended: no event. Alternative: one property-free `udzur_mode_started` count.
6. **Prayer alerts during udzur.** Recommended: paused by default, with the toggle to keep them for dhikr.

## 12. Tests and validation

Unit (Vitest, next to the code):

- `progression.test.ts`: excused gaps bridge without growth and without using a freeze; activity on an excused day grows the streak; mixed excused + one missed day uses the freeze; mixed excused + two missed days resets; rebuild order independence.
- `streak.repository` display: a run of excused days up to today is not "lost".
- `useUdzur`: per-prayer excuse at period start/end boundaries, across midnight, backdating, pruning after 12 months, gender change ends the mode.
- `missions.test.ts` / `useWidgetMissions.test.ts`: prayer missions excluded from the denominator while active; `menstruation_dhikr` only while active; `makeup_fasting_tracker` only with qadha owed; male and null-gender lists unchanged.
- `PrayerCheckInWidget` / `PrayerTimeCard` tests: excused chip, sheet, backdated dates.
- Route tests for `/api/user/excused-days`: auth, ownership, validation (future dates, >60 dates, bad format), idempotency, `DELETE`, qualified row wins over excused.
- `honorific.test.ts` passes with the new copy; both locales have every new key.

Integration (disposable PostgreSQL, `.github/workflows/integration.yml`): server rebuild with excused rows; guest import of periods; global stats ignore excused rows.

CI: `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`; coverage stays above the 80% line threshold.

Manual: female user starts haid at Ashar, checks Dzuhur done, Ashar/Maghrib/Isya show "Udzur"; does dhikr each day; ends the mode at Dzuhur six days later; streak grew only on dhikr days and never reset; stats show excused cells; no prayer alerts while active; notification text says nothing about haid. Repeat as guest, offline, and on a second device.

## 13. Implementation notes (where the build differs)

Owner decisions: all six §11 recommendations were taken (no hasanah for excused prayers, streak pauses, dates-only sync, "Mode Udzur" / "Sedang berhalangan", no analytics event, alerts paused by default).

| Plan | Built | Why |
| --- | --- | --- |
| New `'excused'` value in `streak_day_status` (§6.2) | Separate table `user_excused_days` (`drizzle/0023_add_user_excused_days.sql`) | A qualified row overwrites the day. Undoing that day's only award deleted the row, so the excuse was lost and the streak could break. A separate table keeps the excuse whatever happens to the activity, and global stats never see it. |
| New endpoint `/api/user/excused-days` (§6.2) | New sync-queue entry type `excused_day`, applied in one batch by `/api/user/sync` → `applyExcusedDays` | Reuses the existing offline queue, retries and auth. `src/lib/sync/excused.ts` queues only the difference from what this device sent, so a second device never deletes another device's dates. |
| Qadha card from 1 Rajab (§5) | The existing Journey fasting card (`JourneyFasting`, from 100 days before Ramadan) already shows owed fasts. It now hides fasting suggestions while udzur is on. | Avoids a second qadha card. |
| `pausedUntil` on the push subscription (§7) | `pausedUntil` inside `prayerPreferences` | Same column the job already reads; no migration. |
| Guide page "Panduan Haid & Nifas" (§3.8) | Six hadiths under a new hadith topic `women` (`src/data/hadiths/women-udzur.ts`), linked as `/hadith?topic=women` from the sheet and from the `udzur_learn` mission. Ghusl, istihadah and the madhhab rules on combining prayers are in the end-of-period checklist. | Reuses the hadith library and its HadeethEnc credit instead of a new page. |
| Android/web local reminders (§7) | Not needed | Prayer alerts are server-sent (FCM); the pause covers them. |

Hadiths added (§2, checked 26 November 2026): HadeethEnc 3449 (Bukhari 321 / Muslim 335), 3478 (Bukhari 297 / Muslim 301), 3029 (Bukhari 325 / Muslim 333), 10015 (Muslim 334), 10014 (Abu Dawud 307), copied unchanged; Bukhari 1950 / Muslim 1146 (qadha in Sya'ban) with Nawaetu's own translation. HadeethEnc 10008 (nifas, 40 days) has no Indonesian translation, so it was left out. The wrong "Muslim no. 334" in `fiqh-rules.ts` is now "HR. Bukhari no. 304".

Icons: flower, shower head, calendar heart and headphones from Hugeicons Free (paths copied into `NawaetuIcons.tsx`, credited in `THIRD_PARTY_NOTICES.md`). Animations reuse existing free LottieFiles files: `blossom.lottie` plays once when the mode is turned on, `stars.lottie` once when it ends; both fall back to a static icon with reduced motion.

Deploy order: apply `0023_add_user_excused_days.sql` before deploying the code (sync, pull, full-data and the streak reminder read the table).

