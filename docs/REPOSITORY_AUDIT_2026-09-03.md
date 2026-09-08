# Nawaetu repository audit

Initial audit: 2026-09-03  
Audit rerun: 2026-09-08

Scope: repository tree, generated artifacts, dependencies, static references, source graph, and local validation  
Method: disk-usage inspection, current graphify AST graph, import/reference search, duplicate-byte search, dependency inspection, ESLint, TypeScript, and Vitest

## Executive result

The application source is not 2.3 GB. Before cleanup, the checkout measured **6.3 GB**, of which **6.2 GB was rebuildable local state**:

| Area | Size | Assessment |
|---|---:|---|
| `.next` | 5.2 GB | Safe to regenerate; contains 3.5 GB cache and 1.6 GB dev output |
| `node_modules` | 1.0 GB | Safe to regenerate from the lockfile |
| `graphify-out` | 73 MB | Ignored analysis output; 19 dated snapshots retain history |
| `.git` | 20 MB | Normal repository metadata |
| `src` | 5.1 MB | Application source and content |
| `public` | 1.1 MB | Small asset set; no large media problem |

The highest-value cleanup was local artifact removal, followed by dependency/config and dead-code pruning. Before cleanup, the tracked application was comparatively compact: 510 graph corpus files, 447 files under `src`, and about 70,556 tracked TypeScript/TSX source lines.

## Actions applied — 2026-09-03

- Removed `.next`, 18 historical graph snapshots, and the old `node_modules` install; reinstalled dependencies with `npm ci`. The checkout is now about 1.1 GB, dominated by the clean `node_modules` install.
- Removed the two unreferenced components, five unused Next starter SVGs, the duplicate precomposed icon, and the unused license-header script.
- Removed confirmed dead locals/imports and the unused prayer-notification dedup helper.
- Removed five unused direct dependency declarations and stale package names from `next.config.ts`.

## Follow-up actions — 2026-09-07

- Removed the one-shot Sirah ETL/migration scripts; the application’s runtime Sirah data and pages remain intact, and the scripts remain recoverable from Git history.
- Untracked generated PWA workers; `next-pwa` regenerates them during deployment, while the authored Firebase worker remains tracked.
- Applied the first Tier A lint batch: 3 `prefer-const` fixes in non-notification libraries and 2 justified `@ts-expect-error` annotations in a security test.
- Applied the second Tier A lint batch: removed 10 unused imports/locals from data, test, and Ramadhan UI files.
- Applied the third Tier A lint batch: escaped 22 JSX text entities in static and presentational files.
- Applied the fourth Tier A lint batch: removed 10 unused destructured values from layout and presentational components while preserving their public prop interfaces.
- Applied the fifth Tier A lint batch: escaped 27 remaining JSX text entities in static and presentational files.
- Applied the first isolated Tier B typing batch: replaced 8 analytics `any` casts with an explicit shared `AnalyticsWindow` contract.
- Applied the second isolated Tier B typing batch: replaced 23 translation `any` casts in `GamificationStats` with the shared `TranslationTree` type.
- Applied the next Tier A batch: removed 29 lint warnings from confirmed dead imports/locals/catch bindings and 2 JSX entity errors from `SettingsPageContent` without changing its effects or payment flow.
- Applied the next Quran UI Tier A batch: removed 41 dead imports/locals/catch bindings from `VerseList` while preserving its audio, autoplay, bookmark, infinite-scroll, and reading-tracking flows.
- Applied the next Tier B typing batch: replaced 43 onboarding translation/storage `any` usages with the shared translation type and native string-key contract, while preserving onboarding persistence, profile sync, and location flow.
- Applied the next Mentor AI typing batch: replaced 24 clear translation/storage/timer/error `any` usages and one unused session binding without changing prompts, quota, history, or server sync behavior.
- Applied the next Ramadhan UI typing batch: replaced 15 clear stats/storage/translation `any` usages and removed 2 unused calculations without changing summary, cache, insight, or image-sharing behavior.
- Applied the first safe GuestSyncManager cleanup: removed 13 confirmed unused imports/state bindings without changing sync requests, local storage, auth flow, or FCM code.
- Applied the second safe GuestSyncManager cleanup: replaced 46 redundant storage-key and translation `any` casts with existing string and `TranslationTree` contracts; sync payload and hook behavior were unchanged.
- Applied the third safe GuestSyncManager cleanup: replaced the remaining 10 data/payload/hydration `any` usages with explicit local contracts and `unknown` values, preserving existing guards and merge behavior.
- Applied the fourth GuestSyncManager cleanup: moved sync helpers to stable module-level functions and declared the storage/translation effect dependencies, removing all remaining findings in the component without changing sync branch behavior.
- Applied a safe VerseItem cleanup: removed 7 unused icon/prop bindings and replaced 2 Quran word `any` callbacks with a guarded `VerseWord` type without changing audio, bookmark, tafsir, or rendering behavior.
- Applied a safe seasonal-loading cleanup: changed `HomeClient` to lazy-load `RamadhanCountdown` and `EidCard`, so their client chunks load only when the seasonal card is shown; Ramadan/Eid behavior remains available.
- Applied a safe `RamadhanCountdown` lint cleanup: removed unused imports/locals, narrowed event and mission-progress values, stabilized the target date constant, and preserved countdown, adjustment, and mission-progress behavior.
- Applied a safe seasonal API cleanup: validated `/api/ramadhan/insight` input with the existing Zod dependency, kept only stats used in the prompt, and narrowed provider errors from `any` to `unknown`; the Gemini → Groq → OpenRouter fallback order remains unchanged.
- Applied a safe `MentorAIClient` cleanup: removed session object mutation, moved event-handler timestamps behind a stable helper, deferred quota initialization state updates with cleanup, and fixed one JSX entity; prompt, quota limits, retries, chat storage, and server sync behavior were preserved.
- Applied a test-only sync proof cleanup: removed unused schema/mock bindings and replaced explicit `any` casts in `sync-guest/route.test.ts` with inferred mock/request types; bulk-insert assertions and sync coverage were unchanged.
- Applied a test-only notification/security cleanup: replaced explicit `any` casts in `prayer-alert/route.test.ts` and `sync-guest/security.test.ts` with response, request, and mock contracts; alert success/stringified-field coverage and sync payload-limit coverage were unchanged.
- Applied a batched test-only typing cleanup across six API, PWA, and payment tests: replaced 30 explicit `any` usages with response, request, query-builder, cache, and mock contracts; assertions and fixtures were unchanged.
- Applied a safe lint batch across API, hook, utility, and UI paths: removed 39 unused catch bindings, one unused provider binding, and two notification error `any` boundaries; error handling, logging, fallback, and FCM send behavior were preserved.
- Applied a safe Stats/Sirah/Missions UI cleanup: removed confirmed dead imports/helpers and replaced 10 UI `any` usages with existing mission, bookmark, translation, and journal-stat contracts; rendered data and interaction behavior were preserved.
- Applied a safe Stats/Ramadhan contract cleanup: replaced 11 explicit `any` props/storage/translation usages with existing `PlayerStats`, `TranslationTree`, and storage contracts, and removed one unused Stats prop; rendered values and controls were preserved.

## Audit rerun — 2026-09-08

Current measured footprint:

| Area | Current size | Status |
|---|---:|---|
| `node_modules` | 1.0 GB | Expected local dependency install; rebuildable with `npm ci` |
| `src` | 5.1 MB | Runtime source and content; retained |
| `public` | 1.0 MB | Includes locally generated PWA workers after the production build; authored assets remain small |
| `graphify-out` | 23 MB | Ignored analysis output; not shipped as application code |
| `.git` | 20 MB | Normal repository metadata |
| `.next` | 2.0 GB | Generated by the active dev/build processes; safe to remove when those processes stop, never tracked |

Current repository inventory is 535 tracked files, including 444 TypeScript/TSX files and 70,608 TypeScript/TSX lines. No large media or tracked build output remains.

Current proof:

- `npm ls --depth=0`: no extraneous or invalid top-level packages.
- `npm run typecheck`: passed.
- Focused batch tests: passed — 6 test files, 15 passed tests. The full suite has 51 passing files, 195 passed tests, 2 skipped, and 1 pre-existing timezone-sensitive failure in `useWidgetMissions`.
- `npm run build`: passed; all 177 static pages generated, including Sirah routes and `/sw.js` at scope `/`.
- Generated `/sw.js` included `importScripts("/firebase-messaging-sw.js")`; the authored Firebase worker remains tracked.
- `npm run lint`: still fails with 497 findings — 394 errors and 103 warnings. The Kemenag Quran API adapter, batched test files, notification test endpoints, `ai-action`, Stats/Ramadhan/Sirah/Missions cleanup targets, and the previously cleaned components/routes are lint-clean; remaining findings are primarily explicit `any` contracts and behavior-sensitive React hook rules. `MentorAIClient` retains 3 reviewed quota-effect dependency warnings because forcing unstable context callbacks into dependencies could cause repeated refreshes. Seasonal UI components are route/dynamic-loaded, while the small seasonal mission data remains in the deferred mission chunk because the home mission widget uses Hijri-aware seasonal missions.
- `npm run test:run`: 53 test files passed, 198 tests passed, 2 skipped. The new Quran adapter regression tests pass; no test failures remain in this run.
- `npm run build`: passed after the seasonal dynamic imports; all 177 static pages generated. The only build warnings are the existing oversized source maps excluded from precaching.
- `rtk graphify update .`: passed; current graph has 2,840 nodes, 5,995 edges, and 245 communities. Graphify reported 4 JSON files with zero AST nodes and 20 SQL files skipped because the optional `tree_sitter_sql` dependency is absent; this affects analysis coverage, not application runtime.
- `git status`: the current lint batches, GuestSyncManager regression test, Ramadhan changes, and audit-note updates are organized into atomic commits; the lockfile update remains preserved in separate commit `388b7d9`.

Verdict: artifact, dependency, generated-file, dead-code, and Sirah-tooling cleanup is complete. The repository is not lint-clean yet; lint debt is a separate maintainability pass and should not be bulk-suppressed.

## Findings status

### Completed cleanup

`done:` Removed `.next`, refreshed `node_modules` with `npm ci`, and removed historical graph snapshots. Current local state is ~1.1 GB and rebuildable.

`done:` Removed the two unreferenced components, five unused Next starter assets, the duplicate precomposed icon, and the unused license-header script.

`done:` Removed five unused direct dependency declarations and stale `next.config.ts` package names; `npm ls --depth=0` is clean.

`done:` Pruned the confirmed unused symbols/imports identified in the original audit.

`done:` Replaced the 23 remaining translation `any` casts in `GamificationStats` with the inferred translation catalog type; typecheck, tests, build, and diff checks passed.

`done:` Removed confirmed dead imports, locals, catch bindings, and JSX entities from `SettingsPageContent`; its payment synchronization and notification settings effects were left unchanged.

`done:` Removed confirmed dead imports, locals, and catch bindings from `VerseList`; Quran audio, autoplay, bookmarks, infinite scroll, and reading tracking remain unchanged. Typecheck, tests, build, and diff checks passed.

`done:` Replaced onboarding translation/storage `any` usages with `TranslationTree` and string-key types; onboarding persistence, authenticated profile sync, geolocation, and analytics behavior remain intact. Typecheck, tests, build, and diff checks passed.

`done:` Replaced clear Mentor AI translation/storage/timer/error `any` usages with explicit types; prompts, quota accounting, chat history, retry behavior, and server sync remain intact. Typecheck, tests, build, and diff checks passed.

`done:` Replaced clear Ramadhan summary stats/storage/translation `any` usages with explicit types and removed two unused calculations; summary display, insight cache, and image sharing remain intact. Typecheck, tests, build, and diff checks passed.

`done:` The one-shot Sirah ETL/migration scripts were removed. Runtime Sirah data and pages remain; the scripts are recoverable from Git history if content regeneration is needed.

`yagni:` Review `scripts/test-notification.sh` as an operational utility. It is not wired into an npm script, but it may still be useful for manual production checks; delete only if that workflow is no longer used.

`done:` Generated PWA outputs are no longer source-controlled. `next-pwa` regenerates them during deployment, and the authored `public/firebase-messaging-sw.js` remains tracked.

`generated:` `.next/dev` can reappear while a Next development process is active. Stop that process before removing the directory; deleting it while the process is running is temporary and it will be recreated.

`decision:` Consider disabling `productionBrowserSourceMaps` in `next.config.ts:39` unless client-side production debugging requires it. This can reduce deployment artifact volume and source exposure, but requires a Sentry verification before changing it.

## Dependency assessment

`package.json` now declares 38 runtime dependencies and 14 development dependencies. The five previously unused direct declarations were removed and their transitive packages were pruned from the lockfile where no longer needed.

| Package | Status |
|---|---|---|
| `@next/third-parties` | Removed; no direct source/config use |
| `@radix-ui/react-visually-hidden` | Removed; no direct source/config use |
| `@tailwindcss/typography` | Removed; no Tailwind plugin or source use |
| `@types/pg` | Removed; app uses `postgres` without `pg` types |
| `@vitejs/plugin-react` | Removed; no Vite plugin import |

Removing these will not materially shrink a clean install by itself. The largest installed packages are used runtime/tooling dependencies such as `next`, Firebase, Sentry, and `lucide-react`; the correct way to reclaim the full 1.0 GB is reinstalling from a clean lockfile, not deleting selected transitive directories.

## Files that should not be removed as “dead”

- `drizzle/*.sql` migrations and `drizzle/meta/_journal.json` are migration history and must remain reproducible.
- `src/data/sirah/sections.json` (~1.0 MB), `src/data/hadiths/index.ts` (~115 KB), and `public/fonts/LPMQ.ttf` (~297 KB) are content/assets, not accidental build bloat.
- `src/app/manifest.ts` and `src/app/manifest.json/route.ts` serve different manifest URLs; retain both unless the URL contract is intentionally consolidated.
- `public/firebase-messaging-sw.js` is referenced by `next.config.ts` and is an authored Firebase worker, unlike generated PWA output.
- English/Indonesian translations, bilingual README/contributor/roadmap files, and the browser extension are intentional product surfaces rather than duplicate dead files.
- `.env.local` contains local configuration/secrets and should not be deleted as a size cleanup.

## Validation evidence

- `rtk graphify update .`: passed; current graph has 2,817 nodes, 5,964 edges, and 259 communities. Graphify reported 4 JSON files with zero AST nodes and 20 SQL files skipped because the optional `tree_sitter_sql` dependency is absent; this affects analysis coverage, not application runtime.
- `npm run typecheck`: passed.
- `npm run test:run`: passed — 52 test files, 196 passed tests, 2 skipped.
- `npm run build`: passed with network access; Next.js and `next-pwa` compiled successfully. Generated `.next` and PWA workers remain local and untracked after validation; remove them after active dev/build processes stop if disk space is needed.
- `npm run lint`: failed — 727 findings (528 errors, 199 warnings), primarily `no-explicit-any`; this remaining debt should be handled separately from artifact cleanup.
- The `package-lock.json` `fast-uri` update is preserved in separate commit `388b7d9`; the earlier lockfile edits removed the five unused direct dependencies.

## Recommended cleanup order

1. Continue Tier A lint cleanup only in non-sensitive paths, with gates after each small batch.
2. Decide whether `scripts/test-notification.sh` remains an operational utility.
3. Verify the Sentry source-map workflow before deciding on `productionBrowserSourceMaps`.
4. Treat trust-boundary typing and React effect findings as separate correctness/maintainability work; do not bulk-disable rules merely to make the count disappear.

## Net opportunity

Immediate local reclaim: **about 6.2 GB** (`.next` + `node_modules`, plus optional graph snapshots).  
Completed tracked cleanup: **over 900 source/script lines**, five direct dependency declarations, five unreferenced starter assets, one duplicate icon, generated PWA workers, and historical Sirah tooling. Remaining work is limited to the decisions and lint debt listed above.
