# Home Page Audit Plan

## Purpose

Audit the home page section by section as its feature count grows. The audit should produce evidence-backed findings and a prioritized remediation backlog across UI/UX, accessibility, performance, perceived speed, reliability, and data correctness.

This document plans the audit; it does not record findings or prescribe fixes before evidence is collected.

## Current Home Page Boundary

The `/` route is an ISR server shell (`src/app/page.tsx`, revalidated hourly) whose visible experience is rendered by the client-side `HomeClient`. Most data and personalized states appear after hydration. Below-fold widgets are dynamically imported and start loading after an idle callback.

Review these sections in the order users encounter them:

| ID | Section | Primary implementation | Important dependencies and states |
| --- | --- | --- | --- |
| H0 | Page shell and shared chrome | `src/app/page.tsx`, `src/app/layout.tsx` | ISR, providers, fonts, global CSS, overlays, PWA, bottom navigation, error handling |
| H1 | Header and identity | `src/components/HomeHeader.tsx`, `src/components/StreakBadge.tsx` | Session, local profile, greeting time, theme, location refresh, prayer context |
| H2 | Hijri date card | `src/components/home/HomeClient.tsx` | Prayer API/cache, locale, calendar navigation, loading placeholder |
| H3 | Seasonal card | `HomeClient`, `RamadhanCountdown`, `EidCard` | Client clock, Hijri response, fixed seasonal dates, hydration |
| H4 | Intention journal | `src/components/intentions/IntentionJournalWidget.tsx` | Anonymous/auth identity, local cache, API reads/writes, optimistic updates, Hasanah |
| H5 | Quick-status grid | `NextPrayerWidget`, `LastReadWidget` | Prayer data, reading persistence, dynamic imports, fixed-height loading states |
| H6 | Prayer schedule | `PrayerTimesDisplay`, `PrayerTimesContext`, `usePrayerTimes` | Geolocation, reverse geocoding, AlAdhan, calculation method, cache, date rollover |
| H7 | Prayer check-in | `PrayerCheckInWidget` | Local/remote persistence, daily state, rewards, sync |
| H8 | Daily missions | `MissionsWidget`, `useFeaturePreset` | Preset visibility, mission persistence, rewards, guest/auth sync |
| H9 | Spiritual feed | `DailySpiritWidget`, `QuoteOfDay`, `useFeaturePreset` | Preset visibility, content loading, localization, dynamic imports |
| H10 | Persistent navigation | AI mentor entry point, `BottomNav` | Fixed positioning, safe areas, keyboard/focus, route loading, overlap |

Before each audit run, verify this inventory against `HomeClient` and `DeferredBelowFold`. Add newly rendered sections here before reviewing them. Do not include components that exist in the repository but are not reachable from `/`.

## Audit Outcomes

The completed audit must answer:

1. Can a first-time user understand the page hierarchy and complete each primary action without instruction?
2. Does every supported theme, locale, viewport, input method, identity state, preset, and data state remain usable?
3. What delays first content, useful content, and interaction readiness?
4. Does deferred loading improve initial delivery without causing blank areas, layout shifts, or delayed discovery?
5. What happens when permissions, storage, APIs, chunks, or synchronization fail?
6. Are prayer, Hijri, streak, mission, journal, and reward states correct across time and identity boundaries?
7. Can production monitoring reveal regressions by section and user journey?

## Test Matrix

Use the smallest matrix that exposes materially different behavior. Record any untested cell and why it was skipped.

### User and configuration states

- First visit with no local data and no session.
- Returning guest with populated local storage.
- Authenticated user with synced data.
- Login transition from guest data to account data.
- `lengkap` and `esensial` feature presets.
- Indonesian and English locales.
- Daylight and dark themes.
- Normal and reduced-motion preferences.

### Device and input states

- 320 px narrow mobile, representative 390 px mobile, and desktop width.
- iOS Safari 16+, Android Chrome, and one desktop Chromium/Firefox pass.
- Touch, keyboard-only, and screen-reader smoke test.
- Portrait plus one landscape/small-height pass to expose fixed-element overlap.

### Network, platform, and time states

- Warm cache, cold cache, slow connection, offline, and reconnection.
- Geolocation allowed, denied, unavailable, slow, and previously cached.
- Local storage available, empty, malformed, quota-limited, and blocked.
- API success, timeout, non-2xx response, malformed response, and stale cached response.
- Before/after midnight, timezone other than Jakarta, prayer boundary, Ramadan boundary, and first three days of Shawwal.
- Service-worker first load, controlled repeat load, and update to a new deployment.

## Method for Every Section

Complete one audit record per section. Keep findings local to the section unless the root cause belongs to a shared provider, layout, or persistence layer.

### 1. Define the contract

- State the user need and primary action.
- List inputs, data owners, side effects, navigation targets, and visibility rules.
- Enumerate empty, loading, ready, stale, error, optimistic, and success states.
- Identify invariants, especially values that must agree across multiple widgets.

### 2. Review UI/UX and accessibility

- Check visual hierarchy, copy clarity, information density, discoverability, and consistency with adjacent sections.
- Confirm responsive layout, text wrapping, localization expansion, touch target size, safe-area spacing, and no fixed-element collisions.
- Trace pointer, keyboard, and assistive-technology flows; verify focus order, visible focus, semantic names, headings, live feedback, and modal focus management.
- Check contrast in both themes, zoom/reflow, reduced motion, skeleton legibility, and whether color or animation is the only status signal.
- Count the decisions and taps required for the primary action; flag repeated or competing calls to action.

### 3. Measure performance and perceived speed

- Capture cold and warm production-build traces at mobile and desktop profiles.
- Record LCP, INP, CLS, TTFB, first-load JavaScript, main-thread time, request count, transferred bytes, and long tasks.
- Identify the LCP element and any render-blocking font, CSS, script, provider, or third-party work.
- Compare server HTML, hydration, the 100–200 ms idle gate, dynamic import arrival, data arrival, and final interactive state.
- Verify skeleton dimensions against final content and watch for cumulative shifts as conditional sections appear.
- Attribute bundle and request cost to the section that introduces it; do not optimize a shared dependency from a single isolated trace.

Working release targets for representative mobile runs:

| Measure | Target |
| --- | --- |
| LCP | at or below 2.5 s |
| INP | at or below 200 ms |
| CLS | at or below 0.1 |
| Unexpected section movement | none during loading or conditional reveal |
| Primary action feedback | visible within 100 ms |
| Unhandled browser errors/rejections | zero |

Treat these as audit gates, not proof of user satisfaction. Compare lab results with Vercel Speed Insights field data when enough traffic exists.

### 4. Exercise reliability and correctness

- Force each dependency to be slow, unavailable, stale, malformed, and recovered.
- Verify timeouts terminate, retries are bounded, cached data is labeled or safely used, and actions cannot silently disappear.
- Confirm optimistic writes roll back completely and duplicate taps, refreshes, multiple tabs, and reconnects do not duplicate rewards or records.
- Verify guest/auth identity precedence and sync direction; no user should see another identity's cached data.
- Test clock, timezone, date rollover, prayer calculation method, Hijri adjustment, and seasonal visibility as one coherent system.
- Check that a section failure is isolated and that navigation, other widgets, and recovery controls continue to work.
- Confirm errors are actionable for users and observable in production without exposing private content or tokens.

### 5. Record evidence and decide

For every issue, capture:

- Section ID and scenario.
- Expected versus observed behavior.
- Reproduction steps and frequency.
- Screenshot/video plus console, network, trace, or test evidence as appropriate.
- Root-cause owner: section, shared component, provider, API, storage/sync, layout, or infrastructure.
- User impact, affected population, severity, and confidence.
- Smallest credible remediation and a verification criterion.

Do not create a fix ticket for an unverified preference. Group duplicate symptoms under the shared root cause.

## Section-Specific Questions

### H0 — Page shell and shared chrome

- Is useful server-rendered content present before JavaScript, or is the cached ISR shell mostly an empty client boundary?
- What code and providers hydrate for all visitors before they use a feature?
- Do fonts, overlays, analytics, authentication, PWA registration, global error handling, and bottom navigation compete with home content?
- Does the service worker ever serve an incompatible shell/chunk combination after deployment?
- Are metadata, canonical URL, structured data, document language, viewport, and crawlable content accurate?

### H1 — Header and identity

- Are greeting, user name, streak, and location stable during session and local-storage resolution?
- Is the location button's action and permission consequence clear in every state?
- Can long names and locations coexist at 320 px without hiding controls?
- Are location denial and session-loading states recoverable without misleading defaults?

### H2 — Hijri date card

- Does the placeholder reserve the exact final space, and does delayed data remain understandable?
- Do Gregorian/Hijri labels, locale formatting, manual Hijri adjustment, and calendar destination agree?
- Is stale or default-location data distinguishable when accuracy matters?

### H3 — Seasonal card

- Is one source of truth used for Ramadan/Eid boundaries, timezone, and Hijri fallback?
- Can the fixed Gregorian dates disagree with API-derived Hijri dates or remain stale across midnight?
- Does inserting/removing the card shift the primary journal action or trap stale UI in a long-lived tab?

### H4 — Intention journal

- Is the journal unmistakably the primary home action despite surrounding widgets?
- Are anonymous identifiers, session identity, cached entries, and backdated entries isolated correctly?
- Do optimistic create/reflection flows prevent duplicate submission and restore the exact previous state on every failure?
- Are errors, loading, cache freshness, Hasanah awards, modal focus, date selection, and unsaved text handled accessibly?

### H5 — Quick-status grid

- Are next prayer and last read the right paired priorities, with meaningful empty states?
- Are both cards usable with long translations and large text in a two-column 320 px layout?
- Does the idle gate or client-only import delay information already available in cache?
- Are countdown and last-read values refreshed after midnight, route return, storage events, and cross-tab changes?

### H6 — Prayer schedule

- Does one shared request/cache serve all prayer widgets without inconsistent loading or duplicate calls?
- Are coordinate validation, location naming, calculation method, tuning, date format, cache invalidation, and next-day Fajr correct?
- What remains useful when geolocation, reverse geocoding, or the prayer API fails?
- Do refresh and recovery paths communicate permission denial, default location, stale data, and current progress?

### H7 — Prayer check-in

- Can a user understand what is checked in, undo mistakes if allowed, and see persistence status?
- Are daily boundaries, reward grants, rapid taps, offline writes, sync, and multi-tab updates idempotent?
- Does its state agree with missions, streak, stats, and prayer schedule?

### H8 — Daily missions

- Does preset-based hiding occur without a flash of content or unexplained gap?
- Are progress, completion, reward, reset, guest/auth sync, and concurrent updates consistent?
- Is the widget's height and interaction cost justified on the home page, or should detail remain on `/missions`?

### H9 — Spiritual feed

- Is the feed useful, fresh, attributable, localized, and readable without overwhelming higher-priority actions?
- Do hidden presets avoid downloading and executing hidden content code?
- Are empty/error states distinct from delayed loading, and do content cards preserve layout?

### H10 — Persistent navigation

- Do the AI control and bottom navigation overlap content, toasts, dialogs, browser chrome, or each other?
- Is every fixed control reachable and named by keyboard/screen reader, with a predictable tab order?
- Does disabling mentor prefetch materially help initial load, and is route feedback still immediate?
- Are safe-area insets and small-height landscape layouts correct?

## Execution Plan

### Phase 0 — Baseline and instrumentation

1. Freeze the audit reference: commit, production-like build, browser/device versions, locale, theme, account state, cache state, and timestamp.
2. Run typecheck, lint, focused tests, and the production build. Record each as pass, fail, blocked, or unavailable; do not silently omit a broken verification gate.
3. Capture a page-wide filmstrip, accessibility tree, console/network log, bundle report, and cold/warm performance traces.
4. Attribute every startup request to visible home content or immediate user intent. Flag unrelated feature/API prefetch even when paint metrics pass.
5. Review existing Vercel Speed Insights and Sentry data for `/`; note gaps in section-level attribution.
6. Create the findings ledger using the template below.

Exit: the baseline is reproducible and every later comparison uses the same conditions.

### Phase 1 — First viewport and core action

Audit H0–H4. These sections define first impression, data trust, and the journal's primary action. Resolve any blocker that invalidates later measurements, such as repeated global errors, unusable navigation, or an unstable test identity.

Exit: first content, hierarchy, identity/location, calendar/season state, and journal flows have evidence for every critical state.

### Phase 2 — Daily status and habit loop

Audit H5–H8. Cross-check shared prayer data, date rollover, rewards, missions, streak, local persistence, and account synchronization as a single journey rather than isolated widgets.

Exit: the daily loop is correct under cold/warm, offline/reconnect, guest/auth, and boundary-time scenarios.

### Phase 3 — Secondary content and persistent controls

Audit H9–H10, then repeat the full page at narrow width, large text, keyboard-only, screen reader, reduced motion, offline, and slow-network conditions.

Exit: secondary content does not delay or obstruct primary tasks, and fixed controls remain accessible.

### Phase 4 — Consolidate and prioritize

1. Deduplicate findings by root cause.
2. Rank remediation using severity, reach, frequency, confidence, and effort.
3. Separate quick fixes from shared architectural fixes; never patch every widget when a provider or repository owns the invariant.
4. Define a measurable acceptance check for each accepted item.
5. Re-run the baseline matrix after fixes and attach before/after evidence.

Exit: no unresolved critical issue, accepted high-severity issues have owners, and performance/reliability regressions have repeatable checks.

## Severity and Priority

| Severity | Meaning | Response |
| --- | --- | --- |
| S0 Critical | Data exposure/loss, wrong-user data, corrupt rewards, or primary page unavailable | Stop release; fix and verify immediately |
| S1 High | Primary action blocked, materially incorrect prayer/date data, inaccessible core flow, repeated crash, or severe performance regression | Fix before the next release |
| S2 Medium | Recoverable failure, confusing state, significant friction, layout issue, or localized performance cost | Schedule with the owning section |
| S3 Low | Polish, minor inconsistency, or low-frequency edge case with a clear workaround | Backlog only if value exceeds maintenance cost |

Prioritize correctness and trust over cosmetic scoring. A high Lighthouse score does not lower the severity of incorrect prayer time, lost journal data, duplicate rewards, or an inaccessible action.

## Findings Ledger Template

```md
### [H#-NN] Short finding title

- Severity: S0 | S1 | S2 | S3
- Track: UI/UX | Accessibility | Performance | Speed | Reliability | Correctness
- Scenario:
- Expected:
- Observed:
- Evidence:
- Root-cause owner:
- Affected users:
- Reproduction frequency:
- Proposed remediation:
- Verification:
- Status/owner:
```

## Deliverables

- `docs/HOME_PAGE_AUDIT_REPORT.md`: scope, baseline, executive summary, and findings ledger.
- Evidence folder or linked artifact store organized by section ID and scenario; avoid committing sensitive user data.
- Prioritized remediation backlog with one owner and acceptance check per accepted issue.
- Before/after performance comparison for changes claimed to improve speed.
- A short regression checklist for release smoke tests; automate only stable, high-value paths after the audit reveals them.

## Completion Criteria

The audit is complete when:

- H0–H10 each has an audit record, including an explicit “no issue found” result where applicable.
- Every required test-matrix category has evidence or a documented omission.
- Critical user journeys work for first-time guest, returning guest, authenticated user, offline/reconnect, and location-denied states.
- Page-wide and section-attributed performance evidence exists for cold and warm loads.
- Accessibility covers automated checks plus keyboard, zoom/reflow, reduced-motion, and screen-reader smoke tests.
- All S0/S1 findings have an owner, remediation decision, and runnable or repeatable verification.
- Duplicate symptoms have been consolidated under the responsible shared layer.

## Tooling Rule

Start with the browser's accessibility, performance, network, storage, and coverage tools; the existing production build, bundle analyzer, Vercel Speed Insights, Sentry, and Vitest are already sufficient for the first audit. Add an end-to-end or synthetic-monitoring dependency only when the final regression set is stable and recurring manual verification has become the measurable bottleneck.
