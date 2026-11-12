# How sync works

For maintainers. The action plan (`SYNC_AND_ACCOUNT_ACTION_PLAN.md`) says what was fixed and why; this says how the
parts fit now, and what to check when you change them.

## The idea

The app works fully offline from `localStorage`. A signed-in user's changes are also sent to the server, and
changes made on other devices are pulled back. Guests never sync; their data is imported once when they sign up.

```
screen edits storage ──▶ tracker ──▶ queue (localStorage) ──▶ drain ──▶ POST /api/user/sync ──▶ database + ledger
                                          ▲                                                           │
                              sync_queue_changed                                                      │
   award helpers (points, trackers) ──────┘                                                           │
                                                                                                      ▼
   screens read storage ◀── merge ◀── pull ◀── GET /api/user/pull ◀──────────────────────────── other devices
```

## Client

| File | Job |
| --- | --- |
| `lib/sync-queue.ts` | The outbox. One entry per thing changed (`entityKey`), saved to localStorage, stamped with the account, never drops unsent work |
| `lib/sync/tracker.ts` | Listens to `nawaetu_storage_change` and turns edits to missions, bookmarks, activity, settings, sirah into queue entries (diffing against a snapshot). `withoutTracking` hides writes that come from the server |
| `lib/sync/award.ts` | `queueHasanahEvent` and `queueSyncEntry` for points and trackers that do not go through storage |
| `lib/sync/drain.ts` | Sends the queue 50 entries at a time, one drain at a time, removes what the server accepted |
| `lib/sync/pull.ts` | Asks `/api/user/pull` for the parts it needs and applies them |
| `lib/sync/merge.ts` | Pure merge rules for missions, bookmarks, activity, fasting (the part to read before changing a pull) |
| `lib/sync/engine.ts` | Timers and triggers: debounce a send, pull on return to the app and on reconnect. Loaded on demand by `components/DataSyncer.tsx` |
| `lib/sync/claim.ts` | Hands a guest's intention journal to the account that just signed in |
| `components/auth/GuestSyncManager.tsx` | Decides at login: restore from the server, import the guest's data, or keep what is on the device. Announces `sync_login_settled` |
| `lib/account-data.ts` | The list of keys that belong to one account; cleared at logout and when a different account signs in |
| `lib/utils/stored-json.ts` | `parseStored`: the storage layer parses JSON when reading, so a value written with `JSON.stringify` comes back as an object |

## Server

| File | Job |
| --- | --- |
| `api/user/sync/route.ts` | Accepts queue entries. Mission completions and bookmark saves are written as batches, everything else one at a time. Limited to 200 entries and 30 requests a minute per account (memory only) |
| `api/user/pull/route.ts` | Returns only the parts asked for: `progress`, `missions`, `activity`, `bookmarks` (or a fingerprint), `profile`, `fasting` |
| `core/repositories/db-sync.repository.ts` | One method per entity. Applies the sync window, prices prayers by gender, validates points events |
| `core/repositories/progression.repository.ts` | The ledger and streak days (qualified, and frozen where a freeze protected a missed day). `processProgressionEvidenceBatch` records many awards in one transaction; `reverseProgressionEvidence` takes one back; `raiseProgressionEvidence` grows an award during the day |
| `lib/hasanah-events.ts` | The server's price list for points that do not come from a mission. A client reports what happened, never the amount |
| `api/user/sync-guest/route.ts` | One-time import of a guest's data into a new account |

## Rules that keep data safe

1. **The queue is the source of truth for what is unsent.** A pull never overwrites a key that is pending or failed in the queue (`pendingKeys`).
2. **Server data written locally is not the user's change.** Wrap those writes in `withoutTracking`, then call `resetTrackerSnapshot`.
3. **Every ledger id ends with `:<local date>`**, except lifetime awards (milestones). Undo relies on this to find out whether a day still has any activity.
4. **The day is the user's, not the server's.** Clients send `completedDate` and `timezone`; the server only falls back to a timezone, never to UTC by accident.
5. **30 days back, 1 day forward.** Older records are refused, never deleted: they stay on the device and the user is warned (`lib/sync-warning.ts`).
6. **An entry is never sent for another account.** The queue is stamped; `discardOtherAccounts` runs when the engine starts.
7. **The server decides amounts.** Missions use the catalogue reward (and the gender rule for prayers); other points go through `hasanah-events.ts`.
8. **Reading storage back:** use `parseStored` for any value written with `JSON.stringify`.
9. **A change made while its entry is on the way is not lost.** Each merge into a queued entry bumps `rev`; the drain remembers what it sent and `acknowledge` keeps an entry whose `rev` moved. The drain also marks entries as attempted before sending, so an undo is never cancelled against a completion that may already have arrived.
10. **Clearing an account is not the user undoing it.** `clearAccountData` removes records inside `withoutTracking` and empties the queue last.
11. **Only sendable work holds a pull back.** An entry that failed for good keeps a drain from reporting "all sent", but it cannot be retried and a pull never overwrites it, so the engine still pulls.

## Numbers

| Setting | Value | Where |
| --- | --- | --- |
| Send after the last change | 2 s, at most 15 s while changes keep coming | `lib/sync/engine.ts` |
| Pull on return to the app | at most once a minute; forced pulls (login, reconnect) at most every 5 s | `lib/sync/engine.ts` |
| Entries per request / per queue | 50 / 1,000 | `drain.ts`, `sync-queue.ts` |
| Retries before an entry counts as failed | 5 | `sync-queue.ts` |
| Sync window | 30 days back, 1 day forward | `lib/utils/timezone.ts` |
| Warnings about unsynced work | notice after 7 days, warning from day 23 | `lib/sync-warning.ts` |
| Limits | sync and pull 30/min (memory); intention 20/min (memory); payment link 5 per 10 min; anonymous accounts 10/hour/IP; AI chat 10/min and 20 per 24 h | `lib/rate-limit.ts` |

Redis (Upstash free tier, 500k commands a month) is used for the session check cache, AI chat, payment links and anonymous
accounts. The sync limiters stay in memory on purpose.

## Housekeeping

Guests come and go, and nothing else removes what they leave behind. `POST /api/maintenance/cleanup` (`lib/maintenance/cleanup.ts`)
deletes push rows that FCM gave up on (`active = 0`, untouched for 30 days) and the hidden accounts (`@nawaetu.local`) of guests
whose journal has not been written to for 180 days; the journal goes with the account (cascade). It only counts unless called
with `?apply=1`, works in batches of 500 within a time budget, and is safe to run repeatedly. Schedule it on cron-job.org like
the push jobs (`Authorization: Bearer $CRON_SECRET`), daily, after a dry run looks right. Active push rows are never deleted
here: FCM marks a token dead after about 270 days, and the senders already deactivate it. A guest account with no journal row
is left alone, because it may be one being created.

## Adding something that syncs

1. Add the type to `SyncEntityType` (`lib/sync-queue.ts`) and `SyncEntrySchema` (`lib/validations/sync.ts`).
2. Give it an `entityKey` so a newer change replaces an older unsent one.
3. Queue it: add a case in `tracker.ts` if it lives in storage, or call `queueSyncEntry` / `queueHasanahEvent`.
4. Handle it in `db-sync.repository.ts` and the `switch` in `api/user/sync/route.ts`. Validate input, apply the window, make it idempotent.
5. If it gives points, add a kind to `lib/hasanah-events.ts` with its exact amount.
6. If it should appear on other devices, add a part to `api/user/pull/route.ts`, a merge rule in `merge.ts`, and apply it in `pull.ts`.
7. Add the key to `ACCOUNT_STORAGE_KEYS` so logout clears it.
8. Test the merge as a pure function, and test the storage round trip with the real storage layer, not a hand-made mock.

## Tests

- `npm run test:run`: unit tests. Read `src/lib/sync/engine.test.ts` first; it drives the tracker, queue, drain and pull together.
- Integration tests against real Postgres (`src/__tests__/sync-progression.integration.test.ts`): the unit tests mock the
  database, so the SQL itself (upserts, `GREATEST`, jsonb union, the frozen-day conversion, cascades) is only proven here.
  They are skipped unless `INTEGRATION_DB=1`, and refuse any host that is not localhost. Run them on a throwaway database:

  ```bash
  docker run -d --name nawaetu-it-pg -e POSTGRES_USER=ci -e POSTGRES_PASSWORD=ci -e POSTGRES_DB=ci -p 127.0.0.1:55432:5432 postgres:16
  for f in drizzle/*.sql; do docker exec -i nawaetu-it-pg psql -U ci -d ci -q < "$f"; done
  DATABASE_URL=postgresql://ci:ci@127.0.0.1:55432/ci INTEGRATION_DB=1 npx vitest run src/__tests__/sync-progression.integration.test.ts
  docker rm -f nawaetu-it-pg
  ```
- `npm run test:anoa`: the real client in a headless browser against the production build, with the backend faked inside the
  page. See `scripts/anoa/README.md`. Run it after changing anything in `lib/sync/`, `DataSyncer`, `GuestSyncManager` or the
  storage layer.
- `npm run analyze`, or `scripts/analyze-bundle.mjs` on a build: size of the home page's initial JavaScript. The sync engine
  should stay out of it.

## Known gaps

See "Still open" in `SYNC_AND_ACCOUNT_ACTION_PLAN.md`.

The engine listens for `sync_login_settled` until it has started, not once: a failed login attempt announces it too.

Guest push subscriptions store the language the device chose (`push_subscription.locale`, migration 0020); the prayer-alert job uses an account's own language first.

The old full-state upload (the whole local state in one body) is gone. `api/user/sync/route.ts` answers it with 410
`outdated_client`; the app reloads itself onto the new version and the data on the device is untouched.
