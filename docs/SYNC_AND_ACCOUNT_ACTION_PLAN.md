# Sync and Account Action Plan

**Prepared:** 11 November 2026
**Status (11 November 2026):** Everything except the items under "Still open" is built and tested on branch `fix/sync-account-hardening`. Nothing is pushed or released. Owner decisions are recorded in section 12. Section 14 records the performance work.
**Source:** audit of guest mode, logged-in mode, multi-device sync, payments, push notifications, Ramadan trackers, the service worker, and `ONBOARDING_AND_MOTION_REVAMP_PLAN.md`.

## 1. Summary

- **Sign-up currently destroys guest progress.** A guest who signs in with Google has Hasanah and streak reset to 0. This is the first fix.
- **Multi-device sync does not work yet.** A device pulls account data once per login, the server overwrites instead of merging, and deletes never reach the server.
- **Several routes trust the caller too much.** Test push is open to anyone, intention routes accept a device token as identity, and no sync route is rate-limited.
- **The service worker caches account data by URL only**, so one account's data can be served to the next account on the same device.
- **The server ledger for Hasanah and streak is sound.** The plan keeps it and moves everything else onto it.
- **Release gates:** phases 0 and 1 before the Play Store release. Phases 2 and 3 before telling users that the app works across devices.

Evidence labels: **R** = reproduced with a test during the audit, **C** = confirmed by reading the code only.

## 2. Priority order

| Phase | Goal | Size | Who is affected today |
| --- | --- | --- | --- |
| 0 | Stop data loss | Small | Every new sign-up; every user active before 07:00 WIB; streaks over 30 days |
| 1 | Close abuse, security and payment gaps | Medium | All users, through one abusive caller; donors |
| 2 | Make points survive a sync | Medium | Every logged-in user, on every sync |
| 3 | Real multi-device sync | Large | Anyone using two devices |
| 4 | Account hand-over, guest intentions, notifications | Medium | Shared devices; guests who write intentions; anyone who enabled push before logging in |
| 5 | Plan document and housekeeping | Small | Maintainers |

## 3. Shared pieces and what depends on them

These are the places where one change reaches several features. Check this table before starting any item.

| Shared piece | Features that depend on it | Gap today | Plan items | Order constraint |
| --- | --- | --- | --- | --- |
| **Day boundary** (client local date vs server UTC) | Missions, prayer check-in, intentions, daily activity, streak, streak-reminder push, hydrate | Server files early-morning activity under yesterday | 0.5 | Before 2.3 and 1.2, which both reason about dates |
| **Hasanah total** (local `USER_HASANAH` vs server ledger) | 12 callers of `addHasanah`: missions, prayer, dhikr, Quran time, sirah quiz, fasting, taraweh, khataman, Lailatul Qadr, intentions, streak milestones; levels, stats, share cards, Wrapped | Ledger counts missions only; sync overwrites the rest | 2.1, 2.2 | Before 3.2 (undo needs every source in the ledger) |
| **Streak** (local repository vs server state) | Streak badge, celebration, journey card, share card, streak-reminder push | Display capped at 30; rebuild over-counts; offline activity ignored | 0.4, 2.3 | 0.5 first |
| **Gender** (`localStorage`, `users.gender`, JWT `token.gender`) | Missions list, prayer reward, fasting statuses, theme suggestion, copy | The JWT copy goes stale on other devices; the server does not check gender when accepting a reward | 5.3 | Server must read `users.gender`, not the token |
| **Device identity token** (`fcm_token`, `nawaetu_anonymous_id`) | Intention widget, journal page, push subscription, notification preferences | Used as a login substitute; survives logout | 1.4, 4.6 | 1.4 before 4.3 |
| **Push subscription row** | Prayer alerts, streak reminders, intention identity, push copy language, timezone | Never re-linked at login or logout | 4.6 | After 1.4 |
| **`users.settings` JSON** | Theme, locale, calculation method, adhan preferences, `guestSyncEligible`, `streakReminderEnabled`, push language | Any key can be written; guest import replaces the whole object | 1.3, 0.3 | — |
| **Service worker cache** | Every same-origin GET under `/api/` | Cached 24 h by URL, served after a 10 s timeout, never cleared at logout | 1.8 | Before 3.3 (pull must never read a stale cache) |
| **Reload on reconnect** (`reloadOnOnline: true`) | Any unsent in-memory state: fasting pending set, intention text, optimistic UI | Page reloads the moment the connection returns | 4.9 | After 3.1 gives that state a durable queue |
| **Single database connection** | Every route; both push cron loops | One slow request blocks all others in that instance | 1.1, 3.1 | — |
| **Muhsinin status** (`users.isMuhsinin`, JWT, `IS_MUHSININ` in storage) | Premium themes, AI mentor tier | Stale on other devices; not cleared at logout | 4.8 | After 1.9 |
| **Logout key list** and **`DataSyncer` key list** | Every stored feature | Both lists are maintained by hand and miss keys | 4.1, 4.2 | — |

## 4. Phase 0: stop data loss

Each item is independent and ships on its own. Each lands with the audit reproduction turned into a permanent test.

| # | Work | Impact when done | Where | Evidence |
| --- | --- | --- | --- | --- |
| 0.1 **Done** | `checkServerProgress` must not count the profile name as progress. Never overwrite local Hasanah or streak with an empty server value | New sign-ups keep their points, streak and chosen name. The guest-import path becomes reachable | `src/components/auth/GuestSyncManager.tsx` | R |
| 0.2 **Done** | Fix the guest-import mismatches: `activity.hasanahGained` is required but never sent; `quranLastRead: null` and a null name or gender are rejected. Fixed on the server so older cached clients also work | Guest import returns 200 instead of 400 | `src/app/api/user/sync-guest/route.ts` | R |
| 0.3 **Done** | Guest import writes missions through the same path as normal sync (canonical reward, `completedDate`, ledger entry) and merges settings instead of replacing them | Imported missions count at once, with no duplicate rows later; settings written earlier are kept | `sync-guest/route.ts`, `db-sync.repository.ts` | C |
| 0.4 **Done** | Streak display uses the server's `currentDays`, not a count rebuilt from the last 30 days | Streaks over 30 days show correctly | `src/hooks/useStreak.ts`, `StreakBadge.tsx`, `useStreakDates.ts` | R (arithmetic), C (hook) |
| 0.5 **Done** | Use the client's local date for day bucketing: missions, intentions (sync and `/api/intentions/daily`), and today's activity on hydrate | Activity between 00:00 and 07:00 WIB is filed under the right day; intention earns 10, not 5 | `db-sync.repository.ts`, `intentions/daily/route.ts`, `GuestSyncManager.tsx` | R (missions), C (rest) |
| 0.6 **Done** | Fasting log: persist the pending set, clear an entry only after a 2xx response, retry on next load | Offline fasting and qadha edits reach the server | `src/hooks/useFastingTracker.ts` | C |

| 0.7 **Done, see limit below** | Server prayer alerts also go to guest subscriptions (decision 5). The cron query skips rows without an owner today. Guests have no stored language, so the subscription needs to carry the locale | Guests receive adhan notifications, the core feature of the app | `src/app/api/notifications/prayer-alert/route.ts`, `subscribe/route.ts` | C |

**Limit of 0.7:** guest subscriptions have no stored language, so guests get the default notification language until a locale column is added (needs a migration, which needs your approval).

**Known limit of 0.1 until phase 2:** after a guest import, the next regular sync still replaces the local total with the server's mission-only total, so non-mission points drop then instead of at sign-up. Item 2.1 closes this.

**Rollout note for 0.5:** existing rows filed under the wrong day stay as they are (decision 4).

## 5. Phase 1: abuse, security and payments

| # | Work | Impact when done | Where | Evidence |
| --- | --- | --- | --- | --- |
| 1.1 **Done** | Rate-limit `/api/user/sync`, `/sync-guest`, `/full-data`, the intention routes and `/api/payment/create` with the existing `src/lib/rate-limit.ts` | One account can no longer hold the single database connection or spam payment links | the routes above | C |
| 1.2 **Done (server window, warnings, local keep)** | Accept completion dates from 30 days back to 1 day forward, and cap missions per request. Warn the user before data ages out (see below) | Hasanah and streaks cannot be farmed with past or future dates, and no user loses data silently | `db-sync.repository.ts`, `src/lib/validations/sync.ts`, a sync status notice | C |
| 1.3 **Done** | Allow-list setting keys in `syncSetting`, reusing the list in `sync-guest` | Clients cannot write arbitrary keys such as `guestSyncEligible` | `db-sync.repository.ts` | C |
| 1.4 **Done except the token in the URL** | Intention identity: remove the shared `anon_fallback` and `anon_mem_*` tokens; stop resolving an FCM token to a real account; stop creating a user row for any token without a limit; move the token out of the URL | Guests cannot land in a shared journal; a logged-out device cannot read the previous user's journal; no unbounded user rows | `IntentionJournalWidget.tsx`, `src/app/journal/page.tsx`, `src/app/api/intentions/*` | C |
| 1.5 | Confirm `assetlinks.json` is served for the Android wrapper. None was found in `public/` or `src/app/` | The Play Store app opens full screen without a browser bar | hosting or `public/.well-known/` | C |
| 1.6 **Done** | `/api/notifications/test-push` accepts any caller, any token, any title and body. Require the cron secret or remove the route | Nobody can send arbitrary notifications through Nawaetu's Firebase project | `src/app/api/notifications/test-push/route.ts`, `src/proxy.ts` | C |
| 1.7 **Done** | `/api/notifications/preferences` has no session check. For a subscription that has an owner, require that owner's session; a guest subscription stays editable by its token, because guests must keep prayer alerts (decision 5) | A stranger with a token cannot change a signed-in user's prayer alerts or location | `src/app/api/notifications/preferences/route.ts` | C |
| 1.8 **Done** | Service worker: do not cache account-specific GETs (`/api/user`, `/api/intentions`, `/api/ramadhan`, `/api/payment`, `/api/mentor-ai`, `/api/notifications`). Clear the `apis` cache at logout | Account B is never served account A's cached data; sync never reads a stale total | `next.config.ts` (`workboxOptions.runtimeCaching`), `UserProfileDialog.tsx` | C |
| 1.9 **Done** | Payments: settle in one guarded step shared by the webhook and `/api/payment/sync` | A donation is counted exactly once | `src/app/api/payment/webhook/route.ts`, `sync/route.ts` | C |
| 1.10 **Done** | Payments: validate `amount` as a whole number with an upper limit; map status names the same way in both routes; stop returning debug details to the caller | No orphaned payment links; a paid donation is not marked failed by one route and paid by the other | `payment/create`, `webhook`, `sync` | C |

**Detail for 1.2 (decision 2).** The window is 30 days back. To keep the user aware and avoid loss:

- Show an "unsynced since {date}" notice when the device holds unsent activity older than 7 days.
- Raise it to a warning at 23 days: "sync within 7 days to keep this history".
- When the server refuses an entry for age, keep it on the device, mark it as local-only, and tell the user once. Never delete it.

**Status of 1.9:** the sync check now claims the settlement before adding the amount, so the webhook and the sync check can no longer both credit one donation. The webhook still marks the transaction and credits the user in two steps; making that one database transaction means reworking four test files and is left open.

**Detail for 1.9.** Today `/api/payment/sync` adds the amount to `totalInfaq` without checking whether the webhook already settled the same transaction, so the two can both count it. The webhook also updates the transaction and the user in two separate steps; if the second fails, the donation is marked paid and never credited.

## 6. Phase 2: make points survive a sync

**Decision 1: every point source goes into the server ledger.**

| # | Work | Impact when done | Where |
| --- | --- | --- | --- |
| 2.1 **Done: server-priced events, no migration** | Add ledger sources and stable ids for streak milestones, dhikr, Quran reading time, sirah quiz, fasting, taraweh, khataman and Lailatul Qadr | Points no longer drop after a sync; the same total on every device. Toggling a taraweh night on and off no longer pays 15 each time | `progression.repository.ts`, `db-sync.repository.ts`, the components that call `addHasanah` |
| 2.2 **Partly done: intention points only** | Intention routes write ledger and streak evidence | An intention-only day counts toward the server streak, and its 10 points survive | `src/app/api/intentions/daily/route.ts`, `reflect/route.ts` |
| 2.3 **Partly done: deterministic rebuild; frozen days are still not stored** | Make the streak rebuild deterministic: do not seed it with the current freeze count; store frozen days | The same history always gives the same streak. Today the server over-counts in about 1 of 5 random histories (R) | `src/lib/habits/progression.ts`, `progression.repository.ts` |

2.1 may need a migration for the source enum. Applying it to a shared database needs explicit approval.

## 7. Phase 3: real multi-device sync

| # | Work | Impact when done | Where |
| --- | --- | --- | --- |
| 3.1 **Done** | Send changes, not the whole state. Every local change, including delete and undo, goes into the existing `syncQueue`; the queue is drained after a change, when the connection returns, and when the app regains focus | Sync cost stops growing with account age. Offline work is retried without the user editing something. The 200-entry dead end goes away | `src/lib/sync-queue.ts`, `src/hooks/useDataSync.ts`, `DataSyncer.tsx`, `PrayerCheckInWidget.tsx` |
| 3.2 **Done for missions** | Server handles mission undo with a reversing ledger entry, and bookmark delete | An undone prayer stays undone; deleted bookmarks stay deleted | `db-sync.repository.ts`, `progression.repository.ts` |
| 3.3 **Done** | Pull on app focus and merge into local storage: missions, bookmarks, today's activity, fasting, taraweh | A prayer checked on the phone appears on the laptop | `GuestSyncManager.tsx` or a new pull hook, `/api/user/full-data` |
| 3.4 **Done, see limit** | Merge daily activity on the server: union for prayers, highest value for counters | A second device can no longer erase the first device's prayers and tasbih | `syncDailyActivity` |
| 3.5 **Done for fasting, taraweh and daily log** | Move fasting, taraweh and the Ramadan daily log onto the same queue | One retry path for every tracker instead of four fire-and-forget requests | `useFastingTracker.ts`, `useTarawehTracker.ts`, `useRamadhanDailyLog.ts` |
| 3.6 **Left in place for one release on purpose** | Remove the full-state legacy upload once all clients send entries | Less code; the second sync fired by the prayer widget is gone | `src/app/api/user/sync/route.ts`, `useDataSync.ts` |

**Order inside the phase:** 3.4 first (small, server only), then 3.1 with 3.2, then 3.3, then 3.5, then 3.6 after one release so old cached clients keep working.

**Risk:** 3.1 changes the write path of every tracked action. Keep the current full upload as a fallback for one release.

## 8. Phase 4: account hand-over, guest intentions, notifications

| # | Work | Impact when done | Where |
| --- | --- | --- | --- |
| 4.1 **Done, logout flow has no automated test** | Logout syncs first, then clears every user key, including the sync queue, sirah and Ramadan logs, `IS_MUHSININ` and `fcm_token` | No unsynced work lost at logout; nothing left behind for the next user | `UserProfileDialog.tsx` |
| 4.2 **Done** | Stamp local data with the owner's user id; do not merge data owned by another account | A second Google account on a shared device does not inherit the first one's data | storage layer, `GuestSyncManager.tsx` |
| 4.3 **Done** | On sign-in, move a guest's intentions from the hidden token account to the real account | The journal is not empty after sign-up | `src/app/api/intentions/*`, `sync-guest/route.ts` |
| 4.4 **Done** | Save an intention locally first and queue it; show "saved" only when that is true | Intentions work offline, like the rest of the app | `IntentionJournalWidget.tsx`, `syncQueue` |
| 4.5 **Open** | Return fasting and qadha data in `/api/user/full-data` and hydrate it | Qadha history appears on a second device | `full-data/route.ts`, `useFastingTracker.ts` |
| 4.6 **Done** | Push subscription: set the owner when a user logs in, clear it at logout. Today the upsert never updates `userId` | A user who enabled notifications as a guest starts receiving prayer alerts after login. Streak reminders stop going to the previous account's device | `src/app/api/notifications/subscribe/route.ts`, `fcm-init.ts` |
| 4.7 **Open** | Taraweh: store the qiyam flag on the server or stop sending it; let "unselect" reach other devices; do not let the server copy overwrite an unsent local edit | The qiyam mark stops disappearing after a reload; a cleared night stays cleared | `src/app/api/ramadhan/taraweh/route.ts`, `useTarawehTracker.ts` |
| 4.8 **Done** | Refresh Muhsinin status from the server on app focus | A donation made on the phone unlocks premium themes on the laptop without logging in again | `InfaqContext.tsx`, session update |
| 4.9 **Left as is, see section 14** | Turn off reload-on-reconnect, or skip it while there is unsent input | Text being typed and unsent edits are not lost when the connection returns | `next.config.ts` |

4.3 and 4.4 depend on 1.4 and 3.1. 4.7 is covered by 3.5 if that ships first.

**Guests and prayer alerts.** Guests must receive them (decision 5); the work is item 0.7. Streak reminders stay account-only, because the server has no streak for a guest.

## 9. Phase 5: plan document and housekeeping

| # | Work | Impact when done |
| --- | --- | --- |
| 5.1 | Fix the onboarding plan: sections 4.3, 7.2 and 7.3 contradict 7.0 on loading; record the baseline numbers; correct "no stored data or API changes" in 7.5 | The plan matches what was built, and the release gate can be checked |
| 5.2 | Rework uzur mode before G3: prayer pushes are sent by the server and the streak is server-owned, so "device only" cannot work as written | G3 has a design that can be built |
| 5.3 **Done** | Prayer reward is decided by the server from the user's gender and where the prayer was done (decision 3) | The same prayer has one value on every device |
| 5.4 **Done for the sync messages** | Move hard-coded Indonesian toasts in `DataSyncer.tsx`, `useDataSync.ts` and `GuestSyncManager.tsx` to the locale files | English users see English |
| 5.5 | Confirm Redis is configured in production for the session check | Authenticated requests do not each add a database lookup |
| 5.6 | Confirm where the push cron jobs are scheduled. Nothing in `vercel.json` or `.github/workflows/` calls them | A known owner for prayer alerts and streak reminders |
| 5.7 | Confirm the AI mentor's daily limit is enforced on the server. The audit found a per-minute server limit and a daily count kept on the device | The free tier cannot be exceeded by clearing storage or using a second device |

**Detail for 5.3.** The client sends the place (alone or congregation); the server reads `users.gender` and sets the amount:

| Gender | Place | Hasanah |
| --- | --- | --- |
| Female | any | 75 |
| Male | alone | 25 |
| Male | congregation | 75 |
| Male | Friday prayer | 200 |
| Not set | alone / congregation | 25 / 75 |

If the user changes the place later, the newer choice replaces the older one and the ledger is adjusted. This needs 3.2 (reversing entries). Until then the first value received is kept.

## 10. Scale notes

Not bugs today, but they set the ceiling:

- **Push cron loops send one notification at a time inside a 60 s limit.** Streak reminders will start missing users somewhere in the low thousands of subscriptions. Batch sends when that is near.
- **One database connection per server instance**, with sync writing one locked transaction per item. 3.1 removes most of this load.
- **`/api/user/full-data` returns all missions, intentions and bookmarks.** Add a "changed since" cursor with 3.3.

## 11. Validation

Per item: `npm run lint`, `npm run typecheck`, a focused test, coverage above the 80% CI threshold.

| Phase | Tests that must exist by the end |
| --- | --- |
| 0 | New Google account with guest data keeps Hasanah, streak and name. The client's guest-import payload returns 200. A 04:30 WIB completion is stored under the local date. A 45-day streak displays 45 |
| 1 | The request over the limit is refused. A completion dated next year is rejected and kept locally. An unknown setting key is dropped. Test push without the secret returns 401. Webhook and payment sync together add the amount once |
| 2 | Hasanah before a sync equals Hasanah after it, for each point source. Replaying the same history gives the same streak |
| 3 | Two simulated devices: a prayer on A appears on B after focus; B's sync does not reduce A's counts; undo on A removes the points on B |
| 4 | Logout while offline keeps the queue until it is sent, or warns. Account B does not receive account A's local data. A guest subscription gains an owner at login |

Manual pass before the Play Store release: phone and laptop on one account, each taken offline in turn, then both online; then a second Google account on the same phone.

## 12. Decisions

| # | Question | Decision (owner, 11 Nov 2026) |
| --- | --- | --- |
| 1 | Points model | Everything in the server ledger |
| 2 | Date window | 30 days back, with user warnings so nothing is lost silently (detail in section 5) |
| 3 | Prayer reward conflict | Reward follows gender and where the prayer was done; the server decides (detail in section 9) |
| 4 | Past days filed under the wrong date | Leave as they are |
| 5 | Do guests get server prayer alerts? | Yes. Prayer-time notification is an essential feature |
| 6 | Phase 0 as one release or item by item? | Item by item, starting with 0.1 and 0.2 |

## 13. Not covered

Not audited: Mayar's real webhook signature format and status names (1.10 assumes the two routes should agree), the Android wrapper beyond its manifest, the browser extension, the AI mentor's prompt and provider routing, and the feedback and analytics routes.

## 14. Performance and reliability results

Measured or counted on branch `fix/sync-account-hardening`. Counts of database statements come from reading the code, not from a run against a real database.

| Area | Before | After |
| --- | --- | --- |
| Request body for one change, account with 1,000 missions and 100 bookmarks | 128,473 bytes (the whole local state) | 237 bytes (one queue entry) |
| Requests per change | Full upload after every edit, plus a second one from the prayer widget, plus a download of the whole account to refresh points | One batched request after a short pause, and a read of points and streak only |
| Mission completions in one request | One locked transaction each, about 6 to 8 statements plus a streak rebuild per item | One transaction for the batch: one lock, one bulk insert per table, at most 7 statements |
| Streak update for a second item on the same day | Rebuilt from the whole history | Not touched |
| Streak update for a new day in order | Rebuilt from the whole history | Continues from the stored state; history is read only when an older day arrives late |
| Refreshing premium status | Downloaded the whole account (all missions, intentions, bookmarks, 365 activity rows) | Reads two columns |
| Pull on return to the app | Not available | At most once a minute, only the parts needed, bookmarks only when a fingerprint changed |
| localStorage access | A probe key written and removed before every read and write | Probed once |
| Quran reading timer | Two synchronous storage writes every second | Two writes every 10 seconds and on stop |
| Dhikr taps | A queue entry and a request every 10 taps that wrote a row of zeros | One activity entry, sent after a pause (at the latest every 15 seconds) |
| Queue | At most 100 entries, oldest silently dropped, never read | Merges changes to the same thing, 1,000 entries, only failed entries are ever discarded |

**Still open**

- **1.5:** `assetlinks.json` needs the Android signing fingerprint.
- **4.5 and 4.7:** qadha history in the pull, and the taraweh qiyam flag (the server has no column for it).
- **4.9:** reload on reconnect is left on. With the queue, no unsent change can be lost by it, but it still discards text being typed.
- **Reflection points:** the client adds 25 or 50, the server says 5. A decision is needed before it goes into the ledger.
- **Legacy upload (3.6):** the server still accepts the old full-state body so cached clients keep working. Remove it one release after this ships.
- **Guest alert language (0.7):** needs a locale column, which needs a migration.
- **Atomic donation (1.9):** the webhook still credits the user in a second step.
- **Frozen streak days (2.3)** are still not stored on the server.
- **5.6 answered:** prayer alerts and streak reminders are scheduled by cron-job.org (README and `docs/LLM_KB.md`), which is why nothing in the repo calls them.
- **5.7:** the AI mentor's daily limit of 10 is checked in the client (`MentorAIClient.tsx`); the server only limits 10 per minute. A second device or cleared storage gets a fresh allowance.
- **Non-mission points in the ledger use `mission`, `dhikr`, `quran` and `streak_milestone` sources with prefixed ids.** Proper source values would need a migration of the enum.

## 15. Browser validation with Anoa

`npm run test:anoa` (see `scripts/anoa/README.md`) runs the real client in a headless Anoa browser against the production build. The app is started with a database that cannot connect, and a fake backend inside the page answers every `/api` request, so no run can reach real data.

**Bugs the browser and the real storage layer found that unit tests with hand-made mocks had hidden**

| Bug | Effect | Fixed |
| --- | --- | --- |
| The storage layer parses JSON text when reading, so values written with `JSON.stringify` came back as objects and `JSON.parse` on them threw into an empty fallback | Fasting log empty after reload and then overwritten by the next edit; khataman progress, the stats history, the Wrapped fasting count and the AI chat sessions reset on reload; the tafsir cache never hit | Yes, with `parseStored` and tests on the real storage layer |
| Every `online` event started a full pull | A connection that keeps dropping and returning (common on mobile) fired several requests per event | Yes: single flight, 5 s gap for forced pulls, 60 s otherwise |
| The "your data was kept" case showed "Guest data has been replaced" | Told the user the opposite of what happened | Yes, new message |

**Things to know about Anoa**

- `set offline` flaps `navigator.onLine` between commands, so the sync checks use an offline switch inside the fake backend. The service worker check still uses the real network.
- The app removes service workers on `localhost` and `127.0.0.1`; the offline-first check uses `nawaetu.localhost`.
- next-auth ignores a visibility change when the client already knows it has no session; a sign-in in an open tab arrives on its broadcast channel.

**Measured in the browser** (1,000 missions and 100 bookmarks on the device): one change sent as a 235-byte request where the local state is 112,186 bytes; tracking that change took 0.7 ms.
