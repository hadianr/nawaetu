# Home Page Next Action Plan

> Implementation status (2026-09-01): Workstreams A-C are complete. Focused tests, typecheck, production build, standalone smoke checks, source checks, and live browser request validation pass. The remaining measurement is a production cold-load comparison under the original throttled browser profile.

## Outcome

Fix the two verified S1 home-page problems:

1. Stop unrelated Quran data and route prefetching during home-page startup.
2. Keep the server-rendered application visible while client-side onboarding state is resolved.

This is the smallest change set that materially improves startup cost and failure resilience. Blank location states, fixed-control overlap, localization, PWA registration, and verification-tool failures remain separate follow-up work.

## Why This Comes First

The production audit measured:

- 93 resources and approximately 1.19 MB transferred during a cold home-page load.
- Quran API requests for chapters 2–10 without Quran navigation or user intent.
- A full load event at 9.24 seconds under the throttled profile, despite LCP passing at 768 ms.
- Useful server-rendered markup hidden by a full-screen client gate until JavaScript and local storage completed.

Both issues affect every home-page visitor and originate in shared startup code. Fixing downstream widgets first would leave the largest page-wide cost and failure mode intact.

## Scope

### Included

- Remove global Quran chapter prefetch from application startup.
- Prevent bottom navigation from prefetching non-active routes on home-page load.
- Render application children visibly before onboarding detection completes.
- Preserve first-visit onboarding, returning-user behavior, and restricted-storage fallback.
- Add the smallest focused regression check for entry-gate behavior.
- Repeat the production network, responsive, accessibility, and JavaScript-failure checks.

### Excluded

- No redesign of Quran fetching after the user opens Quran.
- No new prefetch scheduler, network heuristics, feature flag, or caching abstraction.
- No changes to journal, prayer, mission, streak, sync, authentication, or reward behavior.
- No fix for blank location-dependent widgets or fixed mobile controls in this batch.
- No new test or performance dependency.

## Current Ownership Trace

```text
RootLayout
├── AppOverlays
│   └── initializeQuranOptimizations(locale)
│       └── prefetchPopularSurahs(locale)
│           └── 12 staggered getKemenagVerses(...) requests
├── ClientEntryGate
│   ├── full-screen connection gate
│   └── children: opacity 0 + visibility hidden while checking
└── BottomNav
    └── every Link uses prefetch={true}
```

The responsible layers are already clear. The change should remove the global behaviors rather than add guards to individual home widgets.

## Required Invariants

These must remain true after implementation:

1. Loading `/` does not request Quran verse data before Quran intent.
2. Loading `/` does not prefetch bottom-navigation route payloads before user intent.
3. Server-rendered home content is visible when JavaScript is delayed or unavailable.
4. A first-time visitor still receives onboarding after hydration.
5. A returning visitor does not see onboarding.
6. Blocked local storage does not block or crash the application.
7. Onboarding completion dismisses the overlay without reloading the page.
8. Quran navigation still works and loads its own required data.
9. LCP and CLS do not regress beyond the plan targets.
10. No product data, persistence format, or public API changes.

## Implementation Plan

### Workstream A — Remove startup prefetch

#### A1. Remove the global Quran initialization effect

In `src/components/AppOverlays.tsx`:

- Remove the `initializeQuranOptimizations` import.
- Remove the mount effect that reads locale and invokes it.
- Keep cache cleanup, PWA prompts, version handling, and other overlays unchanged.

Reason: `AppOverlays` is global UI infrastructure; it should not initiate feature-specific content downloads for every route.

#### A2. Delete the unused optimization wrapper

In `src/lib/quran/optimize-quran.ts`:

- Delete the file if all exports remain unused after A1.

Current search shows no consumers other than the removed `AppOverlays` call; its locale debounce and adaptive helpers are also unused. Deletion is preferable to retaining dead “optimization” code.

#### A3. Remove the unused popular-Surah prefetch function

In `src/lib/quran/kemenag-api.ts`:

- Remove `prefetchPopularSurahs` after confirming no remaining callers.
- Do not alter `getKemenagVerses` or the Quran reader's normal cache/deduplication behavior.

#### A4. Disable bottom-navigation prefetch

In `src/components/BottomNav.tsx`:

- Change both seasonal and normal navigation links from `prefetch={true}` to `prefetch={false}`.

Reason: removing the explicit `true` alone would allow framework-default viewport prefetching. The acceptance condition requires no off-route payload before intent, so the desired behavior must be explicit.

#### A5. Confirm intent-time loading

- Open Quran from bottom navigation.
- Verify navigation succeeds and the Quran page requests only the data it needs.
- Record the navigation delay as the tradeoff for eliminating unconditional startup cost.

### Workstream B — Make the entry gate progressive

#### B1. Remove whole-application visibility gating

In `src/components/ClientEntryGate.tsx`:

- Remove `isChecking` state.
- Remove the full-screen “Menghubungkan ke Nawaetu...” gate.
- Remove the four-second timeout effect.
- Remove the wrapper styles that set application children to `opacity: 0` and `visibility: hidden`.
- Render `children` normally on the server and client.

Reason: a client effect cannot recover a page when JavaScript itself fails. The existing timeout does not protect that failure mode.

#### B2. Preserve onboarding detection

- Keep `showOnboarding` initially false.
- After mount, read `STORAGE_KEYS.ONBOARDING_COMPLETED`.
- Set `showOnboarding` only when the key is absent.
- If storage access throws, preserve the current behavior: skip onboarding and keep the app usable.
- Keep `handleOnboardingComplete` as an in-memory overlay dismissal.

The first visit may show the home shell briefly before onboarding mounts. Accept this as the minimal progressive behavior. Do not add cookies or server-side onboarding state unless that brief reveal is later proven harmful.

#### B3. Preserve overlay ownership

- Keep `OnboardingOverlay` inside `ClientEntryGate`.
- Do not move providers or change layout nesting.
- Confirm the overlay still covers the viewport and traps interaction as designed once mounted.

### Workstream C — Focused regression proof

#### C1. Add one entry-gate component test

Add `src/components/ClientEntryGate.test.tsx` using existing Vitest and Testing Library:

- Children render when onboarding status is unresolved.
- Completed onboarding leaves children visible without the overlay.
- Missing onboarding status shows the overlay after the effect.
- Storage failure leaves children visible and does not show a permanent gate.

Keep these cases in one file. Do not add a browser-test framework for this change.

#### C2. Use production browser evidence for network behavior

Automated component tests cannot prove startup transfer behavior. Repeat the same production trace used by the audit:

- Isolated guest profile.
- 390×844 viewport.
- Cold browser cache and service-worker bypass.
- Approximately 1.6 Mbps down, 750 Kbps up, and 150 ms latency.
- Twelve-second observation window.

Compare the result with the recorded baseline.

## Acceptance Criteria

### Functional

- First visit: server-rendered home shell appears, then onboarding opens.
- Returning visit: home shell remains visible and no onboarding opens.
- Storage blocked: home remains visible and usable.
- Onboarding completion closes the overlay without a reload.
- Quran, Sirah, Tasbih/Ramadhan, Settings, and Home navigation still work.

### Network and performance

- Zero `api.quran.com/.../verses/by_chapter` requests before Quran intent.
- Zero automatic RSC fetches for bottom-navigation destinations before intent.
- Startup request count and transfer size are lower than the 93-request/~1.19 MB baseline; record exact before/after deltas rather than inventing a target.
- LCP remains at or below 2.5 seconds.
- CLS remains at or below 0.1.
- No new long task, console error, or unhandled rejection.
- JavaScript-disabled/delayed load exposes useful content rather than a permanent connection screen.

### Repository gates

- `npm run typecheck` passes.
- `npm run build` passes.
- The new focused test passes once the existing Vitest-runner issue is resolved.
- `npm run lint` is reported separately until the existing dependency-resolution failure is fixed; it must not be misreported as a product-code failure.
- `git diff --check` passes.
- `graphify update .` runs after code changes.

## Expected Impact

### Users

| Impact | Expected result |
| --- | --- |
| First visible content | Home shell can appear without waiting for the onboarding storage effect |
| Slow/unreliable JavaScript | Users retain readable server-rendered content instead of an indefinite gate |
| Mobile data usage | Eliminates 12 unconditional chapter requests and off-route navigation payloads |
| Network contention | Home APIs and chunks no longer compete with unrelated Quran downloads |
| Quran entry | May be slightly slower on the first intentional navigation because content is loaded then |
| Returning visits | No intended behavior change beyond faster/quieter startup |
| First-time onboarding | Still appears, but progressively after the visible shell mounts |

### System

| Impact | Expected result |
| --- | --- |
| External Quran API load | Up to 12 fewer requests per application startup |
| Browser memory/cache | Less unused Quran data and code retained during non-Quran sessions |
| Application coupling | Global overlay layer no longer owns Quran feature initialization |
| Failure surface | Entry reliability no longer depends on a client timeout effect |
| Code ownership | Deletes unused optimization helpers instead of replacing them with another abstraction |
| Monitoring | Cleaner startup traces make remaining home-page costs easier to attribute |

Exact byte and timing improvements must come from the post-change trace. The baseline suggests a material reduction, but the plan does not promise a fixed percentage before measurement.

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| First Quran navigation becomes slower | Medium | Measure intentional navigation; optimize the Quran route itself only if it misses an agreed user-facing target |
| Brief home-shell reveal before first-visit onboarding | High, low impact | Accept for this minimal fix; consider a server-readable cookie only if testing shows a real problem |
| Onboarding overlay does not mount after refactor | Low | Focused component test plus fresh-profile browser check |
| Removing helpers breaks an unknown caller | Low | Repository-wide reference search before deletion, then typecheck/build |
| Framework still prefetches navigation | Low | Use explicit `prefetch={false}` and verify network trace |
| Performance result is distorted by warm cache | Medium | Use isolated profile, cache disabled, service-worker bypass, and the same throttle as baseline |

## Delivery Sequence

1. Capture the existing baseline identifiers and preserve the audit measurements.
2. Implement Workstream A and run typecheck/build.
3. Trace a cold home load; confirm Quran/API and route-prefetch requests are gone.
4. Implement Workstream B and its focused test.
5. Verify first visit, returning visit, blocked storage, and JavaScript-disabled behavior.
6. Repeat the complete cold-load trace and 320/390 visual checks.
7. Update `HOME_PAGE_AUDIT_REPORT.md` with before/after evidence and close only H0-01/H0-02.
8. Run `graphify update .`.

Workstreams A and B are independently reversible. If one fails acceptance, revert only that workstream rather than restoring both problems.

## Definition of Done

- All required invariants hold.
- H0-01 and H0-02 have reproducible before/after evidence.
- Startup contains no Quran verse or bottom-navigation route prefetch before intent.
- The server-rendered shell remains visible without JavaScript.
- First-time and returning onboarding states behave correctly.
- Production build and typecheck pass.
- Known lint/Vitest infrastructure issues are clearly separated from regressions introduced by this work.
- No unrelated homepage findings are bundled into the change.

## Follow-Up Order

After this action is complete:

1. Replace permanent blank location-dependent placeholders with terminal states.
2. Resolve AI/bottom-navigation overlap on short mobile viewports.
3. ~~Fix document language and spiritual-category localization.~~ Completed 2026-09-01.
4. ~~Repair lint and Vitest execution.~~ Tooling execution repaired 2026-09-01; existing lint debt remains.
5. Verify service-worker registration and offline behavior on the deployed HTTPS origin.
