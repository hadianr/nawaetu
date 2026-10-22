# Working on Nawaetu

Nawaetu is an Islamic habit tracker with intentions, prayer tracking, Quran,
dhikr, fasting, and an AI mentor. Read `README.md` and `CONTRIBUTING.md` for
product context and contribution conventions. Use `package.json` and checked-in
configuration as the source of truth for dependencies and commands.

## Scope

This file applies to the entire repository. If a subdirectory has its own
`AGENTS.md`, its instructions take precedence for files in that directory.
Explicit user instructions take precedence over repository guidance.

## Setup and local tooling

- In the maintainer's Codex environment, read `/Users/hadianr/.codex/RTK.md`
  when available and follow its command guidance: prefix shell commands with
  `rtk`; use `rtk proxy <command>` when raw output is needed.
- Use Node.js 24.x and npm with `package-lock.json`.
- Install dependencies from the repository root with `npm ci`.
- Copy `.env.example` to `.env.local` for local setup. Never commit secrets or
  print credentials from local environment files.
- Check the working tree before editing and preserve unrelated changes.

## Where changes belong

- `src/app/`: Next.js App Router pages, layouts, server actions, and API routes.
- `src/components/`: shared and feature UI; reuse `src/components/ui/` primitives.
- `src/hooks/` and `src/context/`: client behavior and shared React state.
- `src/core/repositories/` and `src/core/infrastructure/storage/`: existing
  persistence boundaries. Trace these before changing stored data or syncing.
- `src/lib/`: shared logic, authentication, validation, rate limiting, and
  external integrations. Extend existing helpers where they own the behavior.
- `src/db/schema.ts` and `drizzle/`: database schema and migration history.
- `src/data/` and `src/data/translations/`: content and English/Indonesian locales.
- `public/`: static assets; `android/`: Android wrapper; `extension/`: browser extension.
- `scripts/` and `.github/workflows/`: maintenance and automation.

## Implementation conventions

- Trace the current behavior and its callers before editing. Make the smallest
  complete change in the layer that owns the behavior; reuse installed tools
  and existing patterns before adding dependencies or abstractions.
- Keep TypeScript strict and use the `@/` alias for imports from `src/`.
- Keep server credentials and database access on the server. Preserve API
  authentication, ownership checks, input validation, and rate limiting.
- Preserve guest data, offline behavior, and synchronization when changing
  persistence. Handle retries and duplicate requests without losing user data.
- Maintain both English (`en`) and Indonesian (`id`) text through the existing
  locale mechanisms. Preserve Arabic text and religious source references.
- Use existing theme variables and accessible UI primitives. Account for
  supported themes, keyboard access, and mobile layouts when changing UI.
- Follow nearby code conventions; avoid unrelated formatting or refactoring.

## Validation

Choose checks that cover the change and report what actually ran. Documentation
changes normally need only a diff review. For code changes, use the relevant
commands from `package.json`:

Commands below use plain npm so they work across agent environments. Apply the
`rtk` prefix when using the maintainer's local tooling described above.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript validation |
| `npm run test:run -- <test-file>` | Focused Vitest tests |
| `npm run test:run` | Full test suite |
| `npm run build` | Production build using webpack |

Vitest defaults to the Node environment with setup in `src/__tests__/setup.ts`.
Follow nearby tests for browser environment requirements. Database integration
tests require a disposable PostgreSQL database; see
`.github/workflows/integration.yml`. Never point tests at production.
Review `.github/workflows/quality.yml` for the lint, typecheck, and build checks
used in CI. Add or update focused tests when behavior changes.

## Database and releases

- Review `drizzle.config.ts` before database work. It loads `.env.local` and
  prefers `DATABASE_URL_UNPOOLED` over `DATABASE_URL` for migrations.
- Review schema changes and migration SQL together. Applying migrations or
  running `db:push` against a shared database requires explicit authorization;
  CI integration tests do not apply migrations.
- Use Conventional Commits, such as `fix(quran): ...` or `docs: ...`.
- For requested releases, follow `docs/RELEASE_WORKFLOW.md` and
  `scripts/release.sh` so version metadata stays consistent.
- Summarize the change, validation, and any remaining limitations when handing
  work back to the user.
