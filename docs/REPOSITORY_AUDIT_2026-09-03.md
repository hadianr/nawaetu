# Nawaetu repository audit

Date: 2026-09-03  
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

- Archived the one-shot Sirah ETL/migration scripts under `scripts/archive/sirah/`; they remain recoverable without cluttering the active tooling directory.
- Untracked generated PWA workers; `next-pwa` regenerates them during deployment, while the authored Firebase worker remains tracked.

## Ranked findings

### P0 — reclaim local disk immediately

`delete:` Remove `.next` after stopping local Next processes; it is entirely generated, and its 5.2 GB includes stale Next 16.3.0 and 16.3.2 cache trees. Rebuild with `npm run build` or restart development afterward. [`/.gitignore`](../.gitignore) already ignores it.

`delete:` Recreate `node_modules` with `npm ci` when dependencies need refreshing instead of retaining the 1.0 GB install indefinitely. Review the existing `package-lock.json` modification first; it changes `fast-uri` from 3.1.5 to 3.1.7 and predates this audit.

`delete:` Remove old dated `graphify-out/2026-*` snapshots if graph history is not needed; there are 19 snapshots at roughly 2.6–3.3 MB each. Keep the root `graph.json`, `manifest.json`, `GRAPH_REPORT.md`, and any cache/history explicitly required by the repository tooling. Add retention rather than allowing every refresh to accumulate forever.

### P1 — high-confidence repository cleanup

`delete:` Delete `src/components/intentions/IntentionHistory.tsx` (245 lines) after product confirmation; no production or test reference was found outside the file itself.

`delete:` Delete `src/components/ramadhan/TakbiranZenMode.tsx` (125 lines) after product confirmation; no production or test reference was found outside the file itself.

`delete:` Remove the five unreferenced Next starter assets: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, and `public/window.svg`. `public/noise.svg` was also checked but has references and should be retained.

`delete:` Remove `public/apple-touch-icon-precomposed.png` if legacy precomposed iOS support is not a requirement; it is byte-identical to both `public/icon.png` and `public/apple-touch-icon.png`, saving about 35 KB and one duplicate asset.

`delete:` Remove direct dependency declarations with no direct source/config use, then regenerate the lockfile and run validation: `@next/third-parties`, `@radix-ui/react-visually-hidden`, `@tailwindcss/typography`, `@types/pg`, and `@vitejs/plugin-react`. These are small disk savings by themselves, but reduce dependency graph and maintenance noise. Some may remain transitively required, so remove only the direct declarations, not arbitrary `node_modules` folders.

`shrink:` Remove stale names from `experimental.optimizePackageImports` in `next.config.ts`: `date-fns`, `lodash`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `react-markdown`, and `sentry` are not installed or imported directly. Review the `@prisma/instrumentation` and `@opentelemetry/instrumentation` `serverExternalPackages` entries similarly; only `isomorphic-dompurify` is a direct application dependency in that list.

### P2 — dead code and maintenance debt

`delete:` Prune unused symbols reported by ESLint, starting with `createFallbackVerse` in `src/lib/quran/kemenag-api.ts:292`, `wasRecentlyNotified` in `src/app/api/notifications/prayer-alert/route.ts:143`, `INITIAL_BATCH` in `src/app/hadith/page.tsx:28`, `HADITH_THEMES` in `src/app/mentor-ai/components/MentorAIClient.tsx:65`, unused state/navigation code in `src/components/quran/VerseList.tsx:322-411`, and unused imports in `src/app/api/user/sync/route.ts:21-23` and `src/app/api/intentions/today/route.ts:22`.

`delete:` Archive or remove `scripts/add-license.mjs` (75 lines) if mass license-header insertion is complete; it is not referenced by `package.json`, CI, or another script. Keep it only if this repository still performs that operation.

`archive:` The one-shot Sirah ETL/migration scripts now live under `scripts/archive/sirah/`. They are retained for possible content regeneration; `ingest-sirah.py` still contains machine-specific `/Users/hadianr/Downloads/...` input paths and is not a portable rebuild path.

`yagni:` Review `scripts/test-notification.sh` as an operational utility. It is not wired into an npm script, but it may still be useful for manual production checks; delete only if that workflow is no longer used.

`done:` Generated PWA outputs are no longer source-controlled. `next-pwa` regenerates them during deployment, and the authored `public/firebase-messaging-sw.js` remains tracked.

`shrink:` Consider disabling `productionBrowserSourceMaps` in `next.config.ts:39` unless client-side production debugging requires it. This is not a major local-disk fix, but it can reduce build/deployment artifact volume and source exposure. Coordinate with the Sentry source-map workflow before changing it.

## Dependency assessment

`package.json` declares 40 runtime dependencies and 17 development dependencies. Direct usage search found five declarations with no direct import/config usage:

| Package | Evidence | Recommendation |
|---|---|---|
| `@next/third-parties` | only `package.json`/lockfile references | Remove direct declaration unless a future route imports it |
| `@radix-ui/react-visually-hidden` | only `package.json`/lockfile references; may be transitive elsewhere | Remove direct declaration; retain transitive copy if required |
| `@tailwindcss/typography` | no `@plugin` or source use | Remove direct declaration |
| `@types/pg` | no `pg` driver or type import; app uses `postgres` | Remove direct declaration |
| `@vitejs/plugin-react` | Vitest config has `plugins: []`; no import | Remove direct declaration |

Removing these will not materially shrink a clean install by itself. The largest installed packages are used runtime/tooling dependencies such as `next`, Firebase, Sentry, and `lucide-react`; the correct way to reclaim the full 1.0 GB is reinstalling from a clean lockfile, not deleting selected transitive directories.

## Files that should not be removed as “dead”

- `drizzle/*.sql` migrations and `drizzle/meta/_journal.json` are migration history and must remain reproducible.
- `src/data/sirah/sections.json` (~1.0 MB), `src/data/hadiths/index.ts` (~115 KB), and `public/fonts/LPMQ.ttf` (~297 KB) are content/assets, not accidental build bloat.
- `src/app/manifest.ts` and `src/app/manifest.json/route.ts` serve different manifest URLs; retain both unless the URL contract is intentionally consolidated.
- `public/firebase-messaging-sw.js` is referenced by `next.config.ts` and is an authored Firebase worker, unlike generated PWA output.
- English/Indonesian translations, bilingual README/contributor/roadmap files, and the browser extension are intentional product surfaces rather than duplicate dead files.
- `.env.local` contains local configuration/secrets and should not be deleted as a size cleanup.

## Validation evidence

- `rtk graphify update .`: passed; current graph matches commit `d93920e5`, with 2,802 nodes and 5,988 edges. Graphify reported 4 JSON files with zero AST nodes and 20 SQL files skipped because the optional `tree_sitter_sql` dependency is absent; this affects analysis coverage, not application runtime.
- `npm run typecheck`: passed.
- `npm run test:run`: passed — 51 test files, 192 passed tests, 2 skipped.
- `npm run build`: passed with network access; Next.js and `next-pwa` compiled successfully. The generated `.next` output was removed again after validation.
- `npm run lint`: failed — 1,080 findings (763 errors, 317 warnings), primarily `no-explicit-any`; the cleanup removed the targeted unused-symbol warnings. This remaining debt should be handled separately from artifact cleanup.
- The pre-existing `package-lock.json` `fast-uri` update was preserved; the additional lockfile edits remove the five unused direct dependencies.

## Recommended cleanup order

1. Review and commit the validated cleanup diff.
2. Archive or remove the notification test script if that workflow is no longer needed.
3. Treat the remaining ESLint errors as a separate correctness/maintainability pass; do not bulk-disable the rules merely to make the count disappear.

## Net opportunity

Immediate local reclaim: **about 6.2 GB** (`.next` + `node_modules`, plus optional graph snapshots).  
Tracked cleanup opportunity: **at least 370 source/script lines**, five direct dependency declarations, five unreferenced starter assets, and one duplicate icon, subject to the product confirmations above.
