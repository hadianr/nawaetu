# Home Page Audit Implementation Status

**Updated:** 2026-09-01
**Source:** `HOME_PAGE_AUDIT_REPORT.md` and `HOME_PAGE_NEXT_ACTION_PLAN.md`

## Status summary

| Finding / workstream | Status | Evidence / note |
| --- | --- | --- |
| H0-01 — Global Quran startup prefetch | Done | Startup Quran requests reduced to zero before Quran intent; global prefetch code removed. |
| H0-02 — Full-page JavaScript entry gate | Done | Shell remains visible; onboarding is progressive. Focused regression tests pass. |
| H2-01 — Hijri blank loading state | Done | Terminal location-required state implemented and browser-validated. |
| H5-01 — Next-prayer blank loading state | Done | Terminal location-required state implemented and browser-validated. |
| H7-01 — Prayer check-in blank region | Done | Section omitted when schedule is unavailable; no indefinite pulse remains. |
| H10-01 — AI CTA / BottomNav collision | Done | CTA remains floating, sits above BottomNav, and follows centered desktop content width. |
| H0-04 — Document language | Done | `html.lang` synchronizes with the active locale. |
| H9-01 — Raw spiritual category keys | Done | Legacy aliases normalize to canonical translation keys; invariant test passes. |
| QA-01 — ESLint dependency crash | Done | Override scoped to ESLint's `minimatch@3.1.5`; lint now runs. |
| QA-02 — Focused Vitest execution | Done for focused proof | Focused test exits with a passing result; full-suite health is not yet audited. |
| Audit-touched lint cleanup | Partial | `AppOverlays`, `BottomNav`, `HomeClient`, `DeferredBelowFold`, and spiritual-content files pass focused lint; `PrayerCheckInWidget` reduced to 11 legacy `any` findings. |
| H0-03 — Service-worker registration/offline | Implemented / external verification pending | Production build emits `/sw.js`, Workbox registration bootstrap, and manifest; deployed HTTPS registration/offline reload still requires validation. |
| H4-01 — Journal date control size | Implemented / physical QA pending | Date selector now has a minimum 44px touch target; typecheck passes. Physical viewport/keyboard verification remains recommended. |
| Full repository lint debt | Pending | `npm run lint` reports legacy findings (854 errors, 378 warnings). |
| Authenticated journey | Blocked | Local auth session endpoint returned HTTP 500; credentials were not available. |
| Production cold-load comparison | Pending | Local request ownership is validated; original throttled production byte/timing comparison remains. |

## Verified gates

- `npm run typecheck`: passed.
- `npm run build`: passed in the prior production validation.
- Focused Vitest category and entry-gate tests: passed.
- Focused ESLint for audit-touched files: passed for the files listed above.
- `git diff --check`: passed.
- `graphify update .`: completed after code changes.

## Impact delivered

- Lower startup network cost by removing unrelated Quran and route prefetches.
- Better resilience when JavaScript, storage, or location data is delayed or unavailable.
- No unexplained blank loading regions after terminal prayer/location states.
- Floating Ask Nawaetu CTA remains usable on mobile and centered desktop layouts.
- Spiritual feed labels resolve correctly in Indonesian and English.
- Lint/test tooling now exposes real code findings instead of failing before execution.

## Next implementation order

1. Verify service-worker control and offline reload on deployed HTTPS (external acceptance, not a repository implementation gap).
2. Continue lint cleanup in bounded file batches, starting with audit-adjacent files (legacy debt, not an audit remediation gap).
3. Repeat the production cold-load comparison and update measured before/after numbers (measurement follow-up).
4. Revisit authenticated journey once a working local auth session is available (environment blocked).

## Closure decision

All in-scope repository remediations from the home-page audit are implemented. The remaining items are environment-dependent verification or pre-existing repository debt and must not be marked as product fixes without new evidence.
