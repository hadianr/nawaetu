# Home Page Audit Report — Pass 1

**Date:** 2026-08-31  
**Scope:** Home page guest journey, first and returning visits, production delivery, narrow responsive layouts, basic accessibility, reduced motion, cold-load performance, and offline behavior.  
**Reference plan:** `docs/HOME_PAGE_AUDIT_PLAN.md`

## Conclusion

The home page is functional and its measured paint/layout metrics are within the plan's working targets, but it is not yet reliable or efficient enough to close the audit. The highest-value work is to stop global Quran prefetching, remove the JavaScript-only visibility gate, provide terminal states for location-dependent widgets, and prevent fixed controls from covering content on short mobile viewports.

The existing audit plan remains structurally sound. It needs two explicit gates added: verification commands must be runnable before UI testing begins, and every startup request must be attributable to content visible on the current route or an immediate user action.

**Implementation closure — 2026-09-01:** All repository-level remediations identified in this pass are implemented and documented. Remaining checklist items are external validation (deployed HTTPS PWA/offline, physical browser QA, production cold-load measurement) or pre-existing technical debt/auth environment blockers.

#### Prayer request deduplication — 2026-09-01

- Added an in-flight request guard keyed by coordinates and local date in `usePrayerTimes`.
- Repeated location/prayer update events now reuse the active request instead of starting duplicate API work.
- **Validation:** TypeScript and diff checks pass.

#### Latest local production smoke — 2026-09-01

- `/` returned HTTP 200; local response measured ~6 ms TTFB / ~6 ms total and 31,341 bytes.
- Initial HTML referenced 10 JavaScript and 2 CSS assets.
- `/sw.js` and `/manifest.webmanifest` both returned HTTP 200.
- **Caveat:** Deployed HTTPS browser metrics and offline control remain required for final acceptance.

## Verification Environment

- Production build served with `next start` on localhost.
- Isolated Chromium profile with no account, location, or existing application data.
- English locale, dark theme.
- 320×568 and 390×844 emulated mobile viewports.
- Cold-cache mobile run throttled to approximately 1.6 Mbps down, 750 Kbps up, and 150 ms latency.
- Keyboard focus traversal, accessibility tree inspection, reduced-motion emulation, and offline reload.
- Source tracing used only to establish ownership after runtime behavior was reproduced.

This is a focused first pass, not completion of every H0–H10 matrix cell.

## Result Summary

| Area | Result | Evidence |
| --- | --- | --- |
| Type safety | Pass | `npm run typecheck` exited 0 |
| Production build | Pass | 176 static pages generated; `/` prerendered with 1-hour revalidation |
| HTTP delivery | Pass | `/` returned 200 with ISR cache hit and `s-maxage=3600` |
| Working performance targets | Pass with concern | LCP 768 ms, CLS 0.077, no observed long tasks; full load event at 9.24 s |
| Responsive width | Pass | No horizontal overflow at 320 or 390 px |
| Reduced motion | Pass | No running CSS animations after `prefers-reduced-motion: reduce` was applied |
| First-visit onboarding | Pass | Primary card and Skip/Next actions fit at 320×568 |
| Keyboard/accessibility smoke test | Partial pass | Primary controls were named and keyboard reachable; active document language was wrong for English |
| Location-denied/absent journey | Fail | Three loading/blank regions persisted after 7–12 seconds |
| Small-height fixed controls | Fail | AI entry point and bottom navigation covered home content at 320×568 |
| Startup network efficiency | Fail | 93 resources and about 1.19 MB transferred on the cold throttled run |
| Offline reload | Fail, deployment confirmation required | No service-worker registration was present after an online production load; offline document load failed |
| Lint gate | Fail | ESLint crashed before analysis due to incompatible `minimatch`/`brace-expansion` resolution |
| Focused unit tests | Unavailable | Vitest remained running without results and required termination |
| Authenticated journey | Blocked | Local production `/api/auth/session` returned 500; no user credentials were used |

## Findings

### [H0-01] Global startup prefetch downloads unrelated Quran content

- **Severity:** S1 High
- **Track:** Performance / Speed / Reliability
- **Observed:** A cold home-page load initiated 93 resources and approximately 1.19 MB of transfer. The trace included Quran API requests for chapters 2–10 during the 12-second observation window, despite no Quran navigation or interaction.
- **Impact:** Consumes bandwidth, prolongs the load event to 9.24 seconds under the test profile, competes with home-page requests, and scales unnecessary API traffic per visit.
- **Root cause:** `AppOverlays` calls `initializeQuranOptimizations(locale)` on global application startup. That immediately calls `prefetchPopularSurahs`, which queues 12 chapter requests. `BottomNav` also forces route prefetching for every navigation item.
- **Adjustment:** Remove the global chapter prefetch. Load Quran data on Quran intent/navigation; allow default route prefetch behavior or disable it for non-immediate destinations on constrained networks.
- **Verification:** A cold `/` load makes no Quran verse API request before Quran intent and stays within an agreed request/transfer budget.

### [H0-02] The server-rendered home page is hidden until JavaScript runs

- **Severity:** S1 High
- **Track:** Reliability / Performance / Accessibility
- **Observed:** The production HTML contains useful home markup, but `ClientEntryGate` renders a full-screen “Menghubungkan ke Nawaetu...” overlay and wraps the application in `opacity: 0; visibility: hidden`. Several client-only components render bailout boundaries.
- **Impact:** First useful content depends on hydration and local-storage execution. If JavaScript fails or a critical chunk cannot load, the timeout effect also cannot run and the user can remain on the gate indefinitely.
- **Root cause:** Global onboarding detection owns visibility of the entire application instead of only the onboarding overlay.
- **Adjustment:** Keep the server-rendered shell visible. Resolve onboarding progressively and overlay it after hydration without hiding the whole application.
- **Verification:** With JavaScript blocked, the home shell remains readable and navigable; with JavaScript enabled, onboarding appears without a full-page blank/gate transition.

### [H0-03] Production PWA did not register a service worker in the audit run

- **Severity:** S1 High, medium confidence
- **Track:** Reliability
- **Observed:** After an online production-mode load and six-second settle period, `navigator.serviceWorker.getRegistrations()` returned zero registrations and the page was uncontrolled. The subsequent offline reload failed with `ERR_INTERNET_DISCONNECTED`.
- **Impact:** Installed/repeat users may not receive the offline behavior implied by the PWA configuration.
- **Adjustment:** Verify registration on the deployed HTTPS origin. If reproduced, fix registration before auditing cache/update policy.
- **Verification:** A fresh online visit registers and controls the app; a repeat offline reload produces a defined usable shell rather than a browser network error.

### [H2-01] Hijri date remains an unlabeled blank placeholder without location data

- **Severity:** S2 Medium
- **Track:** UI/UX / Reliability
- **Observed:** The 64 px Hijri slot remained an animated blank block after the page had otherwise settled.
- **Impact:** Users cannot distinguish loading from permission dependency or failure.
- **Root cause:** `HomeClient` renders a skeleton whenever `hijriLabel` is absent, with no terminal empty/error state.
- **Adjustment:** Stop animation when prayer context finishes without data and show a concise location-required or unavailable state.
- **Verification:** Location denied, blocked storage, API failure, and offline scenarios settle into named, non-animated states.

### [H5-01] Next-prayer card remains an unlabeled blank card without prayer data

- **Severity:** S2 Medium
- **Track:** UI/UX / Reliability
- **Observed:** The left half of the quick-status grid remained a 128 px blank pulse while the Last Read card became usable.
- **Root cause:** `NextPrayerWidget` returns a pulse placeholder whenever prayer data is absent, regardless of whether loading has completed or failed.
- **Adjustment:** Consume `loading` and `error` from the shared prayer context and render distinct loading, permission-required, stale, and unavailable states.
- **Verification:** Every prayer-context terminal state produces explanatory content and no indefinite animation.

### [H7-01] Prayer check-in region remains blank when prayer data is unavailable

- **Severity:** S2 Medium
- **Track:** UI/UX / Reliability
- **Observed:** An 88 px empty/loading region persisted below the location card after other deferred content loaded.
- **Impact:** Creates a broken-looking gap and obscures whether check-in is unavailable or still loading.
- **Adjustment:** Either render check-in with a defined no-schedule state or omit the section entirely until its prerequisite exists.
- **Verification:** The settled location-denied page contains no unexplained blank card.

### [H10-01] Fixed AI and bottom navigation controls cover content on short mobile screens

- **Severity:** S2 Medium
- **Track:** UI/UX / Accessibility
- **Observed:** At 320×568, the fixed AI entry point occupied the lower content band and the 65 px bottom navigation covered part of the location and following sections. The collision was visible in the rendered screenshot; no horizontal overflow occurred.
- **Impact:** Important headings/status content can be obscured until the user scrolls, and the two fixed layers compete for the same limited viewport.
- **Adjustment:** Keep the AI entry floating, but position it above the bottom navigation with a responsive fixed offset.
- **Verification:** At 320×568 and small-height landscape, no content or control intersects either fixed layer at any scroll position.

### [H0-04] Document language does not follow the active locale

- **Severity:** S2 Medium
- **Track:** Accessibility / SEO
- **Observed:** The visible UI was English while `<html lang="id">` remained Indonesian.
- **Impact:** Screen readers may apply incorrect pronunciation and search metadata does not represent the rendered language.
- **Root cause:** Root layout hard-codes `lang="id"`; locale is resolved client-side.
- **Adjustment:** Resolve the locale early enough to emit the matching document language, or synchronize the attribute when the active locale changes.
- **Verification:** Indonesian renders `lang="id"`; English renders `lang="en"` on initial load and after switching.

### [H9-01] Spiritual feed exposes an untranslated category key

- **Severity:** S2 Medium
- **Track:** UI/UX / Localization
- **Observed:** `spiritualCategoryCharacter` was visible in the English feed.
- **Root cause:** Hadith data uses English-shaped keys such as `spiritualCategoryCharacter`, while translation dictionaries define keys such as `spiritualCategoryAkhlak`.
- **Adjustment:** Use one canonical category-key vocabulary in content and translations.
- **Verification:** Assert that every spiritual item category exists in every supported translation dictionary.

#### H9-01 Remediation — 2026-09-01

- Normalized legacy hadith/dua category aliases in `src/data/spiritual-content.ts` to the canonical translation keys.
- Updated `SPIRITUAL_CATEGORIES` to use the same canonical keys, keeping filtering and rendering consistent.
- Added a Vitest invariant covering every adapted spiritual item's Indonesian and English category translation.
- **Result:** The home feed now resolves category labels instead of rendering raw `spiritualCategory*` aliases.

#### H0-03 Follow-up — 2026-09-01

- Restored the Ask Nawaetu CTA as a floating control.
- Positioned it at `bottom-24` and constrained its horizontal anchor to the centered `max-w-md` home container at every viewport width.
- **Result:** Floating behavior is preserved without placing the CTA in the document flow, underneath the bottom navigation, or at the desktop viewport edge.

### [H4-01] Journal date control is below the plan's target size

- **Severity:** S3 Low
- **Track:** Accessibility
- **Observed:** The overlaid native date input measured approximately 93×21.5 px; other inspected interactive controls met or exceeded 44 px height.
- **Adjustment:** Increase the date selector's interactive height without changing its compact visual treatment.
- **Verification:** The interactive box is at least the project's chosen minimum at 320 px and remains keyboard accessible.

### [QA-01] Lint verification is broken by dependency resolution

- **Severity:** S2 Medium
- **Track:** Reliability / Developer experience
- **Observed:** `npm run lint` crashed with `TypeError: expand is not a function` before checking source.
- **Root cause:** The global `brace-expansion` override resolves version 5.0.9 beneath older `minimatch` 3.x/5.x consumers that expect the older callable export.
- **Adjustment:** Scope or pin the security override to a compatible version/range rather than forcing one incompatible version through every dependency generation.
- **Verification:** `npm run lint` completes and reports source findings normally.

### [QA-02] Focused Vitest execution does not terminate

- **Severity:** S2 Medium
- **Track:** Reliability / Developer experience
- **Observed:** Both the full test script and a six-file home-relevant subset produced no result after bounded waits and required interruption.
- **Adjustment:** Diagnose open handles or worker startup independently of product fixes.
- **Verification:** The focused home suite exits deterministically with pass/fail output in CI and locally.

#### QA Tooling Remediation — 2026-09-01

- Scoped the `brace-expansion` override to ESLint's `minimatch@3.1.5`; modern `minimatch` consumers retain their compatible version.
- Refreshed `package-lock.json` and reinstalled dependencies.
- `npm run lint` now starts and reports source findings instead of crashing during dependency resolution. It remains red because of 854 pre-existing errors across the repository.
- `npm run test:run -- src/data/spiritual-content.test.ts` exits deterministically with 1 passing test.
- Removed the four unused-variable warnings in `AppOverlays.tsx`; the audit-touched overlay files now pass focused lint.
- Removed redundant `any` access for the Sirah label in `BottomNav.tsx` and moved Ramadan state updates to a microtask to avoid synchronous effect cascades; `BottomNav.tsx` and `HomeClient.tsx` now pass focused lint.

#### H0-03 Build Validation — 2026-09-01

- Production Webpack build emits `public/sw.js`, Workbox runtime, and the web manifest.
- Local production smoke checks return HTTP 200 for `/sw.js` and `/manifest.webmanifest`.
- The generated client bundle contains the Workbox registration bootstrap.
- **Remaining:** service-worker control and offline reload must be verified on the deployed HTTPS origin; localhost cannot serve as the final PWA acceptance environment.

#### H4-01 Remediation — 2026-09-01

- Increased the Journal date selector wrapper to a minimum 44×44px touch target while keeping its typography and visual treatment compact.
- Added `touch-manipulation` to improve mobile interaction responsiveness.
- **Validation:** TypeScript and diff checks pass; final physical viewport/keyboard measurement remains a browser QA follow-up.

#### PrayerCheckIn lint batch — 2026-09-01

- Removed unused mission/status variables and unused event error bindings.
- Replaced the broken `arguments[0]` Qobliyah check with an explicit `isQobliyah` parameter at each call site.
- Replaced the mount flag effect with `useSyncExternalStore` and deferred the gender hydration update to a microtask.
- **Validation:** TypeScript passes; remaining findings in this file are legacy explicit-`any` usages outside this batch.

## Verified Strengths

- Production build and TypeScript checks complete successfully.
- ISR and cache headers are configured and active for `/`.
- LCP and CLS met the current working gates in the local throttled run.
- No long tasks or runtime exceptions were observed in that measured run.
- Layout did not overflow horizontally at 320 or 390 px.
- Reduced-motion emulation stopped the observed CSS animations.
- The first onboarding card and its primary actions fit at 320×568.
- Primary home controls exposed useful accessible names and were keyboard reachable.
- The location-permission card itself clearly explains why location is needed.

## Plan Adjustments

1. Add a Phase 0 release gate: typecheck, lint, focused tests, and production build must each be recorded as pass, fail, blocked, or unavailable before UI conclusions.
2. Add a startup network invariant: no unrelated feature API may run before visible-route need or user intent; record request count and transfer size by owner.
3. Treat missing prerequisites as terminal UI states, not indefinite skeletons.
4. Add an explicit fixed-layer collision assertion for 320×568 and short landscape viewports.
5. Require deployed-origin service-worker registration and offline reload evidence before considering PWA reliability complete.

## Remaining Coverage

The following were not validated in this pass and must not be treated as passing:

- Authenticated and guest-to-account synchronization flows.
- Location allowed, stale cached location, prayer API failure, and date rollover.
- Indonesian client locale and daylight theme visual passes.
- Ramadan/Eid boundary behavior; the fixed Gregorian dates remain a source-level risk only.
- Real iOS Safari, Android Chrome, Firefox, and screen-reader sessions.
- Journal write/rollback and reward idempotency, because they mutate data.
- Production field data from Vercel Speed Insights and deployed-origin Sentry.

## Commands and Outcomes

```text
npm run typecheck                         PASS
npm run build                             PASS
npm run lint                              FAIL (tool crashed before linting)
npm run test:run                          UNAVAILABLE (did not terminate)
focused vitest subset                     UNAVAILABLE (did not terminate)
production HTTP/ISR inspection            PASS
Chromium 320/390 responsive inspection    PASS width; FAIL fixed overlap
Chromium reduced-motion inspection        PASS
cold throttled production load            PASS CWV; FAIL request/transfer efficiency
production offline reload                 FAIL; deployed-origin confirmation needed
```

## H0 Remediation Validation — 2026-08-31

Implemented the first action batch for H0-01 and H0-02:

- Removed the global 12-chapter Quran prefetch and its unused wrapper.
- Disabled automatic prefetch for both bottom-navigation variants.
- Removed the full-screen client entry gate and its hidden-content wrapper.
- Preserved progressive onboarding and restricted-storage fallback behavior.

Validation results:

| Check | Result | Evidence |
| --- | --- | --- |
| Entry-gate regression test | Pass | 3/3 focused Vitest cases pass |
| TypeScript | Pass | `npm run typecheck` exits successfully |
| Source/reference check | Pass | No remaining startup-prefetch symbols, forced nav prefetch, or hidden entry-gate markup |
| Live browser content | Pass | Useful home content is visible; no hidden content elements found |
| Live browser startup network | Pass | 37 observed requests, zero Quran chapter requests, zero automatic RSC route fetches |
| Production build | Pass via Webpack | All 176 static pages generated; `/` and `/quran` return HTTP 200 from the standalone server |

The live browser ran against the development server, so its 1,193,590-byte transfer figure is not comparable to the earlier production byte baseline. Request ownership is still conclusive: the two targeted speculative request classes fell to zero. A production byte/timing comparison remains required under the original throttled browser profile.

### Build reliability follow-up — 2026-09-01

Webpack was bundling `isomorphic-dompurify` and rewriting its server-side jsdom stylesheet path during `/quran` prerendering. Treating the sanitizer as a server external preserves its native package-relative asset lookup. The production build now completes, the standalone trace includes jsdom's stylesheet, and both `/` and `/quran` pass production smoke requests.

### Location terminal-state remediation — 2026-09-01

Resolved H2-01, H5-01, and H7-01 by consuming the shared prayer context's `loading` state instead of treating every missing-data state as loading:

- The Hijri card now stops pulsing and explains that location is required.
- The next-prayer card now stops pulsing and displays a named location-required state.
- Prayer check-in keeps its skeleton only while prayer data is loading, then omits itself when no schedule is available.

Production browser validation with an empty location cache confirmed both explanatory messages, zero remaining 88 px prayer-check-in pulse placeholders, and no indefinite animation in the three audited regions. TypeScript, the focused terminal-state regression test, and the 176-page production build pass.

### Fixed-layer collision remediation — 2026-09-01

Resolved H10-01 by moving the Mentor AI CTA from a second fixed viewport layer into normal document flow at the end of the home feed. Bottom navigation remains the only fixed home control, and the existing `pb-nav` inset owns its content clearance.

At the audited 320×568 viewport and maximum scroll position, production browser measurement recorded the AI CTA at `406.3–456.3 px`, bottom navigation at `503–568 px`, and a 46.7 px gap. No overlap or horizontal overflow remained. TypeScript, focused regression tests, the 176-page production build, and diff checks pass.

### Document-language remediation — 2026-09-01

Resolved H0-04 in `LocaleProvider`. After hydration, the active `id`/`en` locale now synchronizes `document.documentElement.lang`, including subsequent locale changes. The root layout remains statically renderable, preserving ISR and avoiding a dynamic `cookies()` dependency. The default server markup remains `lang="id"` until client locale resolution; this is an intentional caching trade-off and the settled document is now correct.

The locale regression test passes, along with typecheck, the focused home tests, and the 176-page production build.
