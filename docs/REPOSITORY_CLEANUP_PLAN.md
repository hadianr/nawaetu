# Repository Cleanup & Maintainability Plan

Date: 2026-09-08

Related audit: [`REPOSITORY_AUDIT_2026-09-03.md`](./REPOSITORY_AUDIT_2026-09-03.md)

## Objective

Finish the remaining maintainability work without changing product behavior, notification delivery, authentication, payments, database migrations, or content data.

## Current baseline

- Checkout baseline: ~1.1 GB without generated output; `.next/dev` may be recreated by an active Next development process, and generated PWA workers remain absent between builds.
- Runtime source: ~5.1 MB; no large tracked media or build artifacts remain.
- Dependencies: `npm ls --depth=0` is clean; 38 runtime and 14 development dependencies remain.
- Typecheck: passed.
- Tests: 195 passed, 2 skipped, with one pre-existing timezone-sensitive failure.
- Production build: passed; 177 static pages generated and `/sw.js` generated with the Firebase worker import.
- ESLint before the first Tier A slice: 1,078 findings — 761 errors, 317 warnings; 7 errors were auto-fixable.
- ESLint after the first Tier A slice: 1,071 findings — 754 errors, 317 warnings.
- ESLint after the second Tier A slice: 1,061 findings — 754 errors, 307 warnings.
- ESLint after the third Tier A slice: 1,039 findings — 732 errors, 307 warnings.
- ESLint after the fourth Tier A slice: 1,029 findings — 732 errors, 297 warnings.
- ESLint after the fifth Tier A slice: 1,002 findings — 705 errors, 297 warnings.
- ESLint after the isolated analytics typing pilot: 994 findings — 697 errors, 297 warnings.
- ESLint after the isolated `GamificationStats` typing pilot: 971 findings — 674 errors, 297 warnings.
- ESLint after the low-risk `SettingsPageContent` cleanup: 940 findings — 672 errors, 268 warnings.
- ESLint after the low-risk `VerseList` cleanup: 899 findings — 672 errors, 227 warnings.
- ESLint after the `OnboardingOverlay` typing cleanup: 854 findings — 629 errors, 225 warnings.
- ESLint after the `MentorAIClient` typing cleanup: 828 findings — 605 errors, 223 warnings.
- ESLint after the `RamadhanWrappedCard` typing cleanup: 811 findings — 590 errors, 221 warnings.
- ESLint after the safe `GuestSyncManager` unused-symbol cleanup: 798 findings — 590 errors, 208 warnings.
- ESLint after the safe `GuestSyncManager` storage/translation typing cleanup: 752 findings — 544 errors, 208 warnings.
- ESLint after the safe `GuestSyncManager` data/payload/hydration typing cleanup: 742 findings — 534 errors, 208 warnings.
- ESLint after the safe `GuestSyncManager` hook cleanup: 736 findings — 530 errors, 206 warnings; `GuestSyncManager` is lint-clean.
- ESLint after the safe `VerseItem` cleanup: 727 findings — 528 errors, 199 warnings; `VerseItem` is lint-clean.
- ESLint after the safe seasonal-loading cleanup: 717 findings — 524 errors, 193 warnings; `RamadhanCountdown` and `HomeClient` are lint-clean.
- ESLint after the safe seasonal API cleanup: 704 findings — 519 errors, 185 warnings; `/api/ramadhan/insight` is lint-clean.
- ESLint after the safe `MentorAIClient` cleanup: 691 findings — 506 errors, 185 warnings; `MentorAIClient` has no errors and retains 3 reviewed quota-effect dependency warnings.
- ESLint after the test-only `sync-guest/route.test.ts` cleanup: 678 findings — 498 errors, 180 warnings; the sync guest route test is lint-clean.
- ESLint after the test-only notification/security cleanup: 660 findings — 480 errors, 180 warnings; `prayer-alert/route.test.ts` and `sync-guest/security.test.ts` are lint-clean.
- ESLint after the batched test-only API/PWA/payment cleanup: 630 findings — 450 errors, 180 warnings; six additional test files are lint-clean without changing assertions or fixtures.
- ESLint after the safe unused-catch and notification error-boundary cleanup: 569 findings — 430 errors, 139 warnings; 39 unused catch bindings and 3 additional low-risk bindings were removed without changing error handling or FCM send behavior.
- ESLint after the safe Stats/Sirah/Missions UI cleanup: 517 findings — 411 errors, 106 warnings; confirmed dead UI helpers/imports and 10 explicit `any` usages were removed or typed without changing rendered data or interactions.
- ESLint after the safe Stats/Ramadhan contract cleanup: 506 findings — 401 errors, 105 warnings; 11 explicit `any` usages and one unused Stats prop were removed or typed without changing rendered values or controls.
- Working-tree exception: the `package-lock.json` `fast-uri` update is preserved in separate commit `388b7d9`.

## Priority and safety policy

The next work is ranked by maintenance impact, confidence in the change, and rollback cost. “High impact” here means less code noise, fewer CI blockers, and a smaller future failure surface; it does not promise a user-visible speed increase.

| Tier | Work | Expected impact | Risk | Decision |
|---|---|---:|---:|---|
| A | Generated/dead artifact cleanup | High | Low | Already completed |
| A | Reviewed mechanical lint fixes: `prefer-const`, unused symbols, justified `@ts-expect-error`, and the 7 auto-fix candidates | High | Low | Do first |
| A | Test-only cleanup with no assertion or fixture-behavior change | Medium | Low | Do after production lint batch |
| B | `any` to `unknown`/existing types in isolated library code, then one API boundary at a time | High | Medium | Do with focused tests |
| B | Source-map policy change | Medium | Medium | Only after Sentry proof |
| C | React effect/memoization findings | Medium | High | Defer until each flow has a regression test |
| C | FCM, auth, payment, sync, migration, and PWA runtime behavior changes | High | High | Never bundle into cleanup; separate task |

The first implementation slice is therefore limited to Tier A production files that do not touch FCM, authentication, payment, sync, database migrations, public content, or PWA registration. It may delete an unused symbol or make a variable immutable, but it must not change branching, request/response shapes, persistence, side effects, or dependency behavior.

## Work order

### Phase 0 — establish a safe baseline

1. Preserve the current working-tree changes; do not stage the pre-existing `package-lock.json` update with cleanup work.
2. Record the current gates and lint output:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:run`
   - `npm run build`
3. Save the lint result by rule and file so progress is measurable.

Exit criteria: baseline numbers are recorded and no unrelated working-tree changes are included.

### Phase 1 — low-risk lint fixes

Handle rules that do not alter control flow:

- `prefer-const`: convert variables that are never reassigned.
- unused imports, parameters, locals, and caught errors: remove them or use intentional names such as `_error` only where the configured rule allows it.
- `ban-ts-comment`: replace valid `@ts-ignore` uses with `@ts-expect-error` and retain the reason.
- The 7 ESLint auto-fix candidates: inspect with a dry run first, then apply only reviewed hunks.

Execution order:

1. Generate a dry-run lint report grouped by rule and file.
2. Apply only mechanical findings outside high-risk paths, beginning with library and test-adjacent files.
3. Review every hunk for accidental control-flow, import-order, or side-effect changes.
4. Run typecheck, the nearest tests, and lint before moving to the next small batch.

Do not use `eslint-disable`, lower a rule’s severity, or include FCM/auth/payment/sync/PWA files merely to reduce the count.

Completed Tier A slices: 3 non-notification library `prefer-const` fixes, 2 justified `@ts-expect-error` annotations in a security test, 10 unused imports/locals in data, test, and Ramadhan UI files, 49 escaped JSX text entities in static/presentational files, and 10 unused destructured values in layout/presentational components. Typecheck, 192 tests, production build, and `git diff --check` passed; the 2 notification-route `prefer-const` findings were intentionally deferred.

Completed first Tier B pilot: replaced 8 analytics `any` casts with one explicit `AnalyticsWindow` contract shared by the event helper and loader. Typecheck, 192 tests, production build, and `git diff --check` passed; no FCM, auth, payment, sync, or PWA runtime code changed.

Completed second Tier B pilot: replaced 23 translation `any` casts in `GamificationStats` with the inferred `TranslationTree` type. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; no FCM, auth, payment, sync, or PWA runtime code changed.

Completed next Tier A batch: removed confirmed dead imports, locals, catch bindings, and JSX entities from `SettingsPageContent`. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; payment synchronization and notification settings effects were not changed.

Completed next Quran UI Tier A batch: removed 41 confirmed dead imports/locals/catch bindings from `VerseList`. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; Quran audio, autoplay, bookmarks, infinite scroll, and reading tracking were not changed.

Completed next Tier B batch: replaced 43 onboarding translation/storage `any` usages with the shared translation type and native string-key contract. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; onboarding persistence, profile sync, location detection, and analytics behavior were not changed.

Completed next Mentor AI typing batch: replaced 24 clear translation/storage/timer/error `any` usages and one unused session binding with explicit types. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; prompts, quota, chat history, retry behavior, and server sync were not changed.

Completed next Ramadhan UI typing batch: replaced 15 clear stats/storage/translation `any` usages and removed two unused calculations. Typecheck, 192 tests, production build, lint recount, and `git diff --check` passed; summary display, insight cache, and image sharing were not changed.

Completed first safe GuestSyncManager cleanup: removed 13 confirmed unused imports/state bindings. Typecheck, the focused sync/security tests, lint recount, Graphify update, and `git diff --check` passed; sync requests, local storage, auth flow, FCM, and PWA behavior were not changed.

Completed second safe GuestSyncManager cleanup: replaced 46 redundant storage-key and translation `any` casts with existing contracts. Typecheck, the full test suite, lint recount, Graphify update, and `git diff --check` passed; sync payloads, hook behavior, local storage, auth flow, FCM, and PWA behavior were not changed.

Completed third safe GuestSyncManager cleanup: replaced 10 data/payload/hydration `any` usages with explicit local contracts and `unknown` values. Typecheck, the full test suite, lint recount, Graphify update, and `git diff --check` passed; sync requests, local storage, auth flow, FCM, and PWA behavior were not changed.

Completed fourth GuestSyncManager cleanup: moved sync helpers to stable module-level functions and added the correct storage/translation effect dependencies. Typecheck, the full test suite, production build, lint recount, Graphify update, and `git diff --check` passed; sync branch behavior, local storage, auth flow, FCM, and PWA behavior were not changed.

Completed safe VerseItem cleanup: removed 7 unused icon/prop bindings and replaced 2 Quran word `any` callbacks with a guarded `VerseWord` type. Typecheck, the full test suite, lint recount, Graphify update, and `git diff --check` passed; Quran audio, bookmarks, tafsir, and rendering behavior were not changed.

Completed safe seasonal-loading cleanup: lazy-loaded `RamadhanCountdown` and `EidCard` from `HomeClient`, and removed/narrowed unused and explicit-`any` values in `RamadhanCountdown`. Outside Ramadan/Eid, seasonal client code is no longer part of the initial HomeClient load; during the season, both components remain available. Focused lint, typecheck, production build, Graphify update, and `git diff --check` passed. The full suite still has one pre-existing timezone-sensitive `useWidgetMissions` failure and is otherwise passing.

Completed safe seasonal API cleanup: validated the Ramadhan insight payload with Zod, removed unused prompt fields, and narrowed LLM provider errors to `unknown`. The seasonal insight route stays server-only and is invoked only by the dynamically loaded Wrapped card; provider fallback behavior is unchanged. Focused lint, typecheck, production build, Graphify update, and `git diff --check` passed.

Completed safe `MentorAIClient` cleanup: removed mutable session updates, isolated event-handler timestamps, deferred quota initialization state updates with unmount cleanup, and fixed one JSX entity. Prompt generation, quota limits, retry behavior, local chat storage, and authenticated server sync were not changed. Focused lint, typecheck, production build, Graphify update, and `git diff --check` passed; 3 quota-effect dependency warnings remain intentionally reviewed.

Completed test-only `sync-guest/route.test.ts` cleanup: removed unused schema/mock bindings and replaced explicit `any` casts with inferred mock/request types. Bulk insert assertions and sync coverage were preserved. Focused lint, test, typecheck, Graphify update, and `git diff --check` passed.

Completed test-only notification/security cleanup: replaced explicit `any` casts with response, request, and mock contracts in `prayer-alert/route.test.ts` and `sync-guest/security.test.ts`. Notification alert/stringified-field tests and sync payload-limit tests were preserved. Focused lint, 5 focused tests, typecheck, Graphify update, and `git diff --check` passed.

Completed batched test-only cleanup: replaced 30 explicit `any` usages with typed response, request, query-builder, cache, and mock contracts in six API, PWA, and payment tests. Focused lint, 15 focused tests, and typecheck passed; the full suite retains only the pre-existing timezone-sensitive `useWidgetMissions` failure.

Completed safe mechanical lint cleanup: removed unused catch bindings across API, hook, utility, and UI paths, narrowed two notification error boundaries to `unknown`, and removed one unused AI provider binding. Typecheck, production build, Graphify update, and diff checks passed; FCM send/fallback behavior was preserved.

Completed safe Stats/Sirah/Missions UI cleanup: removed confirmed dead imports/helpers and replaced 10 explicit `any` usages with existing contracts for missions, bookmarks, translations, and journal stats. Typecheck, production build, Graphify update, and diff checks passed; hook timing findings remain deferred because they require behavior-level review.

Completed safe Stats/Ramadhan contract cleanup: replaced 11 explicit `any` props/storage/translation usages with existing contracts and removed one unused Stats prop. Typecheck, production build, Graphify update, and diff checks passed; seasonal initialization hook findings remain deferred because they require hydration/timing review.

Exit criteria: lint error count decreases, no blanket disable is added, and behavior-sensitive files receive tests before larger edits.

### Phase 2 — trust-boundary type cleanup

Replace `any` only where the correct type is understood. Prioritize in this order:

1. Authentication and user data:
   - `src/lib/auth.ts`
   - `src/app/api/user/**`
   - guest sync and account settings paths
2. Payments and webhooks:
   - `src/app/api/payment/**`
   - webhook security tests
3. Notifications and FCM:
   - `src/lib/notifications/**`
   - notification API routes and tests
4. Feedback/rewards and other API boundaries.

Rules:

- Parse external input with the existing Zod/domain validators where available.
- Use `unknown` for caught or untrusted values, then narrow with `instanceof`, predicates, or schema parsing.
- Use existing database/schema types instead of inventing duplicate interfaces.
- Do not weaken authorization, rate limits, payload limits, HTML escaping, or error handling to satisfy lint.
- Add or extend one regression test for each changed boundary.

Exit criteria: no `any` replacement relies on an unsafe blanket cast, and endpoint behavior remains covered.

### Phase 3 — React hook and effect cleanup

Address React rule findings separately from type cleanup. Candidate areas observed in lint output include:

- `src/hooks/useQuranTimeTracker.ts`
- `src/hooks/useRamadhanDailyLog.ts`
- `src/hooks/useTarawehTracker.ts`
- `src/hooks/useStreak.ts`
- components that synchronously set state inside effects.

For each file:

1. Identify whether the state is derived, initialized from storage, or synchronized with an external system.
2. Prefer lazy state initialization or derived values for purely local data.
3. Keep asynchronous fetch/subscription updates inside their callbacks.
4. Fix dependency arrays based on actual ownership; do not silence the rule just to preserve a warning-free count.
5. Preserve cleanup for timers, subscriptions, service workers, and event listeners.

Exit criteria: focused hook tests pass, no timer/listener leak is introduced, and behavior remains stable across mount, auth change, and unmount.

### Phase 4 — test and test-fixture cleanup

Clean test-only findings after production paths are stable:

- Remove unused mocks/imports.
- Replace test `any` with narrow mock types or `unknown` plus assertions.
- Replace `@ts-ignore` with justified `@ts-expect-error`.
- Keep security, race-condition, sync, payment, and notification tests intact.

Exit criteria: all existing tests pass; test coverage is not reduced to make lint easier.

### Phase 5 — production source-map decision

`productionBrowserSourceMaps: true` remains a deliberate decision point.

Before changing it:

1. Confirm Sentry receives browser source maps from the current `withSentryConfig` build.
2. Test a production-like build with source maps disabled.
3. Verify an intentionally captured client error is symbolicated in Sentry.
4. Confirm `.map` files are no longer publicly served if source exposure is the concern.

Rollback condition: restore the current setting immediately if client stack traces lose useful symbolication.

### Phase 6 — operational script decision

Keep `scripts/test-notification.sh` until its manual production-check workflow is explicitly retired. If retired, remove it in a separate commit and retain the endpoint tests as the automated safety net.

## Required gates for every change batch

```text
npm run typecheck
npm run test:run
npm run lint                 # error count decreases or stays equal only for a reviewed reason
npm run build                # required for PWA/config changes
git diff --check
```

For Tier A lint-only batches, the minimum proof is `typecheck`, the full test suite, lint, and `git diff --check`; run the production build before merging the final batch or whenever configuration/import resolution changes. Revert the focused commit if any gate regresses.

For FCM/PWA-related changes, additionally verify:

- `/sw.js` is generated at scope `/`.
- Generated `/sw.js` imports `/firebase-messaging-sw.js`.
- `public/firebase-messaging-sw.js` remains tracked and unchanged unless intentionally modified.
- `registerServiceWorkerAndGetToken()` still passes the active registration to Firebase `getToken()`.

## Commit strategy

Use one focused commit per phase or domain:

1. `chore(lint): fix low-risk findings`
2. `refactor(auth): type user boundary values`
3. `refactor(notifications): narrow FCM error types`
4. `refactor(react): stabilize effect state synchronization`
5. `chore(build): decide browser source-map policy`

Do not combine source-map, FCM, payment, and broad lint changes in one commit.

## Definition of done

- No generated output or known dead tooling is tracked.
- `npm ls --depth=0` remains clean.
- Typecheck, tests, and production build pass.
- ESLint findings trend downward without blanket rule suppression.
- Auth, payment, sync, notification, and migration behavior has focused regression proof.
- The final audit records remaining intentional exceptions and unresolved decisions.
