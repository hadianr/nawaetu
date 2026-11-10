# 100 Days to Ramadan: Streak Revamp Plan

Status: proposal. No code changed yet.
Scope: the streak part of `src/components/home/JourneyCard.tsx`. The ring, daily habit, dalil and phases stay as they are.

Related: `100_DAYS_TO_RAMADAN_PLAN.md` (decision: one streak, no journey streak) and `100_DAYS_UI_DESIGN.md` (no guilt, slice 3 onward).

## 1. Where it overlaps today

The card already calls `getStreakRepository().updateStreak()` and builds its 7-day strip from `useStreakDates()`. So the *number* is shared, but the card still keeps a second, private idea of "done":

| # | Overlap | Where | Symptom |
| --- | --- | --- | --- |
| 1 | Separate done state: `JOURNEY_DONE_DATES` (localStorage, last 30, never synced) vs the streak's `lastActiveDate` / canonical days | `JourneyCard` `doneToday`, `lateJoin`; `JourneyMilestoneDialog` welcome check | User finishes a mission first: streak is active, but the card still says "I did it". New device or cleared storage: streak survives, card asks again. |
| 2 | Duplicate 7-day strip: card strip vs the week grid in `StreakBadge` | `getRecentDays()` vs `week` in `StreakBadge.tsx` | Two implementations of the same thing. The card ignores `protectedDates`, so a freeze day (Hari Jeda) shows as empty on the card and as a snowflake in the dialog. |
| 3 | No streak number or risk state on the card | Count lives only in the header badge | The card says "Streak safe" even when the streak was already safe, and says nothing when it is at risk. |
| 4 | Two celebration systems | Journey milestones (100/75/50/30/10/1 days left) vs streak milestones (3/7/14/30/60/100 days) | A streak toast (from `useStreakCelebration`) and the journey dialog can land in the same session. |
| 5 | Copy | `journeyDone` ("Streak safe...") is true only when the button was pressed, not when the streak is actually safe | Misleading |

**Observed in the app (day 90, logged in, synced):** the card shows "Done for today. Streak safe, consistency looks good on you." with "0 of last 7 days", while the streak dialog shows a 0-day streak, "Your streak ended", longest 8, and all 7 dots empty. The card claims a safe streak that the streak system says does not exist. The likely cause is that today is in `JOURNEY_DONE_DATES` but not in the streak (for example the streak was rebuilt from canonical progression after the button was pressed). Not verified yet; reproduce before step 2 in section 7 and add it as a test case.

This case also sets a rule for the new design: "Streak safe" copy may only appear when `activeDates` contains today. If the card's button is pressed and the streak still does not count the day, the card must not show the done row.

Not an overlap, deliberately kept apart: the intention streak (`IntentionStreak`, `/api/intentions/*`, `intentionStreakCurrent` in the DB). It counts days with an intention, not qualifying days. The risk is two flames with two different numbers on Home; see section 5.

## 2. Principle

**The card shows the streak. It does not keep one.** The streak (`StreakRepository` and `useStreakDates`) is the only source of "did today count". The journey habit is the nudge, and "I did it" is one more way to qualify the day.

## 3. Changes

### 3.1 Derive "done today" from the streak (fixes #1, #5)

- `doneToday = activeDates.has(DateUtils.today())` from `useStreakDates()`.
- "I did it" keeps calling `updateStreak()`. Remove the `JOURNEY_DONE_DATES` read and write.
- `lateJoin` becomes "no streak history yet" (`activeDates.size === 0`, also checking `longestStreak === 0`) instead of `doneDates.length === 0`.
- `JourneyMilestoneDialog`: replace the `doneBefore` check with the same streak-history check.
- Leave `STORAGE_KEYS.JOURNEY_DONE_DATES` defined for one release so old installs are not surprised, then delete it. Stale values are harmless because nothing reads them.
- Two done states:
  - Done through the button: confirmation row with the flame, as now.
  - Done through something else (a mission, dhikr, etc.): same row with softer copy. The habit line stays visible as a suggestion with no button. We do not track whether the tiny habit itself was done; that is the cost of having one source of truth, and it matches "no guilt".

### 3.2 One week component, with freezes (fixes #2)

- Extract the week logic from `StreakBadge.tsx` into `src/components/streak/StreakWeek.tsx` (props: `size`, `showLabels`). It renders active, frozen (snowflake), today and empty days from `useStreakDates()`.
- `StreakBadge` dialog uses it (same look, no behaviour change).
- `JourneyCard` uses the compact variant. Delete the inline `<ul>` strip. `getRecentDays` and its tests go away if nothing else imports it (grep first).
- Reuse the existing a11y strings (`streakLastSevenDays`, `streakCompleted`, `streakProtectedDay`) instead of `journeyStrip*` and `journeyDay*`.

### 3.3 A streak row that opens the existing details (fixes #3)

Replace the strip row with one tappable row under the button:

```
🔥 12-day streak      ● ● ● ❄ ● ● ◎        ›
   Streak at risk: one tiny habit keeps it
```

- Count and status from `useStreak().display`, with copy from existing keys: `streakCompletedToday`, `streakAtRisk`, `streakStart`. Lost streak uses `streakLostRestart`, with no red or X (design rule 3).
- Tapping opens the existing details dialog by rendering `StreakBadge` with `modalOnly` and `celebrate={false}`, the same way `StreakBadgeSummary` does. No new dialog, no new analytics. `surface_opened` already fires from the same path; confirm it fires here too.
- Keep the header `StreakBadgeSummary`. It is global across pages, so it is not removed while the journey is active.
- At 320px the row must not overflow; the dots shrink before the text wraps.

### 3.4 Milestones do not stack (fixes #4)

- Streak toasts stay owned by the header (`useStreakCelebration`). The card does not add its own.
- `JourneyMilestoneDialog` only auto-opens when no other dialog is open, and the streak details dialog counts. Simplest form: skip auto-open while the streak details dialog is open. If this gets complicated, ship without it and track as an open question.
- No shared milestone list. The two ladders measure different things (days left vs streak length).

## 4. Files

| File | Change |
| --- | --- |
| `src/components/home/JourneyCard.tsx` | Drop `doneDates` state, strip, `getRecentDays`; add streak row and the two done states |
| `src/components/home/JourneyMilestoneDialog.tsx` | Swap `JOURNEY_DONE_DATES` check for streak history |
| `src/components/streak/StreakWeek.tsx` | New, extracted from `StreakBadge.tsx` |
| `src/components/StreakBadge.tsx` | Use `StreakWeek` |
| `src/lib/ramadhan-journey.ts` | Remove `getRecentDays` and `JourneyStripDay` if unused |
| `src/data/translations/{en,id}/journey.ts` | Add `journeyDoneElsewhere`, `journeyStreakRowLabel`; remove `journeyStrip*`, `journeyDay*` if unused. Both locales together. |
| `src/lib/constants/storage-keys.ts` | Mark `JOURNEY_DONE_DATES` deprecated; delete in a later release |
| `*.test.tsx` / `*.test.ts` | See section 6 |

No schema change, no migration, no API change, no new sync path. The streak already syncs through canonical progression, so the card now follows it across devices for free.

## 5. Open decisions

1. **Intention streak on Home.** The Journal widget shows its own streak next to the header flame and the new card row. Recommended: leave the metric alone and label it as an intention streak (check `intention_streak_label` wording in en/id). Merging it into the main streak changes what counts and is a separate decision.
2. **Done-elsewhere state.** Recommended: no button, habit stays as a suggestion (section 3.1). Alternative: keep a local "habit done" flag purely for the confirmation row. That brings back a second state, so not recommended.
3. **Ramadan card.** `RamadhanCountdown` takes over during Ramadan and has no streak row. Out of scope here; decide separately whether it gets the same row.
4. **Journey push.** Slice 3 of the UI plan (journey push and mute) should reuse the streak-reminder route and send at most one push per day. Not part of this change.

## 6. Validation

- Update `JourneyCard.test.tsx`: done derived from streak (mission-first case), frozen day renders, at-risk and lost copy, no `JOURNEY_DONE_DATES` writes, "I did it" calls `updateStreak` once.
- New `StreakWeek` test: active, frozen, today, empty; canonical days vs local fallback.
- Update `JourneyMilestoneDialog.test.tsx` for the new welcome check.
- Check both locales, the supported themes, 320px width, keyboard focus on the new row, and reduced motion.
- `npm run lint`, `npm run typecheck`, `npm run test:run -- <files>`, then the full suite with coverage. CI fails PRs under 80% line coverage, so check before opening.
- Manual: guest user, logged-in user on two devices, a freeze day, and the first day after a lost streak.

## 7. Order

1. Extract `StreakWeek`, no visual change (safe on its own).
2. Derive done from the streak and drop `JOURNEY_DONE_DATES` reads.
3. Add the streak row and copy in both locales.
4. Milestone stacking guard, if still wanted.
