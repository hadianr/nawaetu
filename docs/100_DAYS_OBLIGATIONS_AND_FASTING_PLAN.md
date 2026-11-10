# 100 Days to Ramadan: Obligations First, Qadha, and Sunnah Fasts

Status: proposal. No code changed yet. **Nothing here ships before a trusted ustadz or hadith reviewer signs it off** (same gate as `100_DAYS_DALIL_REVIEW.md`).
Related: `100_DAYS_TO_RAMADAN_PLAN.md`, `100_DAYS_STREAK_REVAMP_PLAN.md`, `100_DAYS_DALIL_REVIEW.md`.

## 1. Goal and rules

Make the 100-day program serve the user's religious obligations instead of competing with them, and bring in the fasts the Sunnah recommends around this season, on the user's own Hijri calendar.

1. **Fard before nafl.** The program is optional preparation made by Nawaetu. It must never read as a substitute for the five prayers, for qadha, or for any other obligation.
2. **No rulings invented by the app.** Where scholars differ, the app shows the user's chosen madhhab (the existing `Madzhab` setting) and says that a difference exists. It does not pick a side silently.
3. **Sources are checked, not recalled.** Every new dalil goes through the hadith library and the reviewer. No hadith text is written from memory (rule already used in the dalil review).
4. **No guilt, no pressure.** A missed fast is never a red mark, never costs the streak, and never nags. Excuses (illness, travel, menstruation, nifas, pregnancy, old age, simply being unable) get a one-tap "not today".
5. **Calendar follows the user.** All Hijri logic uses the same adjusted Hijri date as the countdown (`getRamadhanJourney`, `adjustHijriDate`, the Hijri adjustment setting).

## 2. What the app already has (reuse, do not rebuild)

| Need | Already in the code |
| --- | --- |
| Qadha tracking (per Hijri year and day, synced, with madhhab-aware consequence) | `useFastingTracker`, `ramadhan_fasting_log`, `QadhaTracker`, `src/data/fasting/fiqh-rules.ts` |
| Mon/Thu, Ayyamul Bidh, Muharram, Shawwal, Arafah and prohibited days (Eid, Tashriq) | `src/data/hijri-events.ts` (`getHijriEvents`), used by the Hijri calendar page |
| Madhhab choice and adjusted Hijri date | `Madzhab` type, `parseHijriAdjustment`, `adjustHijriDate` |
| Seasonal fasting missions | `makeup_fasting`, `qadha_puasa`, `sunnah_fasting_ramadan_prep`, `syaban_fasting` in `src/data/missions/seasonal.ts` |
| Hadith library entries | `hadith_puasa_senin_kamis`, `hadith_syaban_puasa`, `hadith_sahur`, `hadith_puasa_perisai` |

`getHijriEvents` already hides the "recommended" labels on Eid and Tashriq days. That covers 13 Dhul Hijjah (a Tashriq day, so it is not an Ayyamul Bidh day to fast). Dhul Hijjah never falls inside the 100-day window, so no extra work is needed there for this feature.

## 3. Problems found in the current content

| # | Problem | Where | Why it matters |
| --- | --- | --- | --- |
| 1 | The card is not linked to qadha, though Phase 1 says "start paying your fasts" | `journeyPhaseReset`, dalil review item 5 | The one obligation the program mentions has no action behind it |
| 2 | **Nothing shows pending qadha outside the Ramadan hub.** If the user never logged last year's Ramadan, pending = 0 and the app implies "nothing owed" | `useFastingTracker` stats | False reassurance about a wajib |
| 3 | Habit 4 says "Pray one prayer on time... Just one." | `journeyHabit4` (en, id) | Can be read as "one prayer is enough". Needs wording that adds to the five prayers |
| 4 | Phase 3 and the `syaban_fasting` mission encourage voluntary fasts through Sha'ban with no condition | `journeyPhaseSharpen`, `SYABAN_MISSIONS` | Shafi'i scholars restrict *starting* a new voluntary fast after mid-Sha'ban (see section 5). Most users in the target market follow Shafi'i |
| 5 | Qadha missions cite `hadith_ramadhan_diampuni` (reward for fasting Ramadan) | `makeup_fasting`, `qadha_puasa` | Wrong dalil for the ruling. The relevant sources need verifying (section 8) |
| 6 | `hadith_nisfu_syaban` (Ibn Majah 1390) is marked "Hasan" | `src/data/hadiths/index.ts` | I recall this hadith being widely graded weak. Reviewer to check; it also points the opposite way from item 4 |
| 7 | `hadith_puasa_senin_kamis` is cited as Muslim 1162 but the wording is about deeds being presented on Monday and Thursday | hadith library, `sunnah_fasting_ramadan_prep` cites "Tirmidzi 747" | Source and number may not match the text. Reviewer to check |
| 8 | No guard for the 1-2 days before Ramadan | nothing | A voluntary fast then is discouraged (section 5). The countdown makes it easy to suggest fasting on days 1-2 |
| 9 | Seasonal qadha mission awards Hasanah for a manual tick | `qadha_puasa` (100 Hasanah) | Rewarding an obligation as a game currency is a tone question for the reviewer |

## 4. Proposal

### 4.1 One small pure function: the fasting guide

`src/lib/fasting-guide.ts`, no UI, no storage:

```ts
getFastingGuide({ hijriDay, hijriMonth, weekday, daysLeft, pendingQadha, madzhab }): {
  today: "qadha" | "sunnah" | "none" | "avoid";
  sunnahKinds: ("mondayThursday" | "ayyamulBidh" | "syaban")[];
  reason: "preRamadan" | "doubtDay" | "afterMidSyaban" | "friday" | null;
}
```

It builds on `getHijriEvents` instead of duplicating it. Decision table (the reviewer confirms every row):

| Situation | Result |
| --- | --- |
| `pendingQadha > 0` and today is Mon/Thu or 13-15 Hijri | Suggest **qadha** on that day. The day also carries the Mon/Thu or Ayyamul Bidh timing, so the user loses nothing. Whether one intention covers both is a scholars' difference, so the copy says "ask your ustadz" and does not promise a double reward |
| `pendingQadha > 0`, any other day | Qadha is allowed on any day except the prohibited ones. The guide only offers it; it does not nag |
| `pendingQadha === 0` and today is Mon/Thu or 13-15 Hijri | Suggest the **sunnah** fast |
| 1-2 days before Ramadan (`daysLeft` 1-2) | No voluntary fast suggestion, except a Mon/Thu habit the user already keeps and qadha (reason `preRamadan`) |
| 30 Sha'ban or day of doubt | Same as above (reason `doubtDay`) |
| After 15 Sha'ban and madhhab is Shafi'i | No *new* voluntary fast suggestion. Qadha, and a Mon/Thu habit the user already keeps, stay allowed (reason `afterMidSyaban`). Other madhhabs: not restricted |
| Friday only | Never suggest a fast on a Friday on its own (reason `friday`). Mon/Thu never hits this |
| Eid or Tashriq | Existing prohibited result |
| Any user-marked exemption | Suggestion hidden, no message |

### 4.2 Card changes (builds on the streak revamp)

- **Qadha row** shown only when `pendingQadha > 0`: "You owe N fasts from before. About X days remain before Ramadan." Links to the existing fasting hub (`QadhaTracker`). No red, no countdown pressure.
- **Today's habit** becomes the fasting suggestion on Mon/Thu and 13-15 Hijri (qadha first if owed). On other days the rotating habit is unchanged. This breaks the "same habit for everyone on the same day" property on those days; that is acceptable and should be noted in the code.
- **"Not today"** link next to the fasting habit for any excuse. It writes nothing against the streak.
- **Streak:** fasting is one qualifying activity like any other. A skipped voluntary fast never puts the streak "at risk" on its own. The existing at-risk copy stays generic ("complete one activity today").
- **About dialog** gets one plain line: the program adds to the obligations and never replaces them, with a link to the qadha tracker.

### 4.3 Closing the qadha data gap (problem 2)

Do not add a table. Add one optional step to the one-time welcome dialog: "Do you owe fasts from past Ramadans?" leading to the existing `FastingCalendar` year navigation, where the user logs the missed days. Verify the calendar can open previous Hijri years and works for guests (localStorage is the source of truth, sync follows login). If a user owes fasts from several years, the same calendar handles each year. Skipping the question must stay easy and silent.

### 4.4 Capacity check (a helpful number, not a deadline scare)

`daysAvailable` = count of days from today until 1 Ramadan on the user's Hijri calendar that are not prohibited for this madhhab. Show the pace as "if you fast on Mondays and Thursdays you have about N slots" using the real calendar, not a fixed estimate (very roughly 28 Mon/Thu slots plus the Ayyamul Bidh days still ahead). If `pendingQadha` exceeds what fits, show a calm line: "Do as many as you can; ask a trusted ustadz about the rest", because the rulings on delayed qadha differ by madhhab (section 5). The app shows what the user's chosen madhhab says, using the existing `fiqh-rules` data, and does not state a ruling of its own.

### 4.5 Copy fixes (en and id together)

- `journeyHabit4` becomes "Pray on time today, phone away. Start with the prayer you tend to delay." Reviewer to approve.
- `journeyPhaseReset` and `journeyPhaseSharpen`: add that obligatory fasts (qadha) come before voluntary ones, and that Sha'ban voluntary fasts follow the user's madhhab.
- Swap the dalil on the two qadha missions for the verified qadha sources (section 8).
- Hold `hadith_nisfu_syaban` out of any journey surface until reviewed.

### 4.6 Notifications (later slice)

Any journey or fasting push reuses the streak-reminder route, is capped at one per day, never lands near an adhan alert, and is never sent on a day the guide says `avoid`. Not part of the first build.

## 5. Points where scholars differ (show, do not decide)

| Topic | Positions, as I understand them | App behaviour |
| --- | --- | --- |
| Delaying qadha past the next Ramadan without an excuse | Many scholars: sin, plus qadha, plus fidyah per day. Hanafi: qadha only | Use the existing per-madhhab data in `fiqh-rules.ts` |
| Voluntary fast while qadha is still owed | Views differ from "not valid or disliked" to "valid"; many prefer qadha first | Suggest qadha first, never block or invalidate a voluntary fast |
| One intention for qadha plus a Mon/Thu fast | Some scholars allow it and say the sunnah reward is also gained; others disagree | Say "ask your ustadz", promise nothing |
| Fasting after mid-Sha'ban | Shafi'i: restricted for a new voluntary fast, with exceptions (qadha, vow, an existing habit). Other madhhabs permit. The hadith used is itself debated | Madhhab-aware, section 4.1 |
| Which days are Ayyamul Bidh | 13, 14, 15 of each Hijri month, so the app's calendar and any adjustment decide the day | Follow the user's adjusted date |

## 6. Hijri calendar notes

- The count uses Umm al-Qura through `Intl`, shifted by the user's adjustment. The adjusted day changes at midnight, while the Islamic day changes at sunset. For Ayyamul Bidh and Mon/Thu the user fasts from Fajr, so the displayed date at Fajr is what matters. That is correct at Fajr but not in the evening; the card must not announce "tomorrow is Ayyamul Bidh" after Maghrib using today's date.
- Moon sighting differences: the adjustment setting exists for this. If Ramadan's start differs locally, the user changes the setting and everything follows.

## 7. Files (when built)

| File | Change |
| --- | --- |
| `src/lib/fasting-guide.ts` and test | New pure function, section 4.1 |
| `src/components/home/JourneyCard.tsx` | Qadha row, fasting habit, "not today" |
| `src/data/ramadhan-journey.ts` | Fasting habit override with verified dalil ids |
| `src/components/home/JourneyMilestoneDialog.tsx` | Optional qadha step in the welcome |
| `src/data/translations/{en,id}/journey.ts` | New copy and the section 4.5 fixes, both locales |
| `src/data/missions/seasonal.ts` | Dalil fix on two missions |
| `src/data/hadiths/index.ts` | New entries only after review; reviewer corrects items 6 and 7 |
| `src/data/hijri-events.ts` | Possibly add the pre-Ramadan and doubt-day cases if the guide is cleaner with them there |

No schema change, no migration, no new API.

## 8. Review checklist for the ustadz or hadith reviewer

Verify the text, number and grade in the hadith library before any entry is added. I list what to look up, not the wording.

1. Qadha obligation: QS. Al-Baqarah 184-185, and Aisha's report that she made up Ramadan fasts in Sha'ban (Bukhari 1950, Muslim 1146).
2. Mon/Thu: the Abu Hurairah and Aisha reports on deeds being presented (Tirmidhi, Nasa'i). Confirm which of Muslim 1162 / Tirmidhi 747 matches `hadith_puasa_senin_kamis`.
3. Ayyamul Bidh: the report of Abu Dharr (Nasa'i, Tirmidhi) and its grade.
4. Do not fast one or two days before Ramadan unless it matches a habitual fast (Bukhari, Muslim).
5. Day of doubt report attributed to Ammar.
6. "Do not fast once Sha'ban is half over" (Abu Dawud, Tirmidhi, Ibn Majah) and the dispute over its grade; the Shafi'i exceptions.
7. Not singling out Friday for a fast (Bukhari, Muslim).
8. `hadith_nisfu_syaban` (Ibn Majah 1390) grade.
9. Whether a habit line "Pray on time, start with the one you delay" is acceptable wording.
10. Whether awarding Hasanah for the manual qadha mission is acceptable.
11. Whether women's voluntary fasting needs any card wording about a husband's permission, and whether qadha is treated differently. I left it out of the first build.

## 9. Order of work

1. Reviewer pass on section 8 (blocks everything that quotes a source).
2. Copy and dalil fixes that need no new logic: items 3, 5 and the hadith corrections in section 3.
3. `fasting-guide.ts` with tests (Hijri adjustment, each madhhab, 1-2 days before Ramadan, 30 Sha'ban, Friday).
4. Card: qadha row, fasting habit, "not today", welcome step.
5. Push notifications, if wanted.

## 10. Validation

`npm run lint`, `npm run typecheck`, focused tests, then the full suite. CI fails PRs under 80% line coverage. Manual checks: a guest with owed fasts; a logged-in user on two devices; a Shafi'i user after 15 Sha'ban; a Hanafi user in the same week; a user with the Hijri adjustment at -1, 0 and +1; a Monday that is also 13 Hijri; both locales; reduced motion.

## 11. Not covered

- Fiqh rulings themselves: this plan routes them to the reviewer and the existing madhhab data. The positions in section 5 are my understanding and need confirming.
- Zakat, Eid, Lailatul Qadr and Shawwal fasts after Ramadan: separate work.
- Cycle tracking for women: the app does not track it, so the guide only offers "not today".
