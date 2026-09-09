# GitHub Actions Workflows

## Active Workflows

### `quality.yml`
Runs lint, TypeScript checks, commit message validation, and the production
build on pull requests targeting `main`.

### `coverage.yml`
Runs Vitest with an 80% minimum line coverage gate and comments coverage for
changed files directly on the pull request.

### `reviewdog.yml`
Posts ESLint findings as review comments on changed lines in pull requests.

### `codeql.yml`
Runs GitHub CodeQL security analysis on pull requests and weekly on Mondays.

### `dependency-review.yml`
Checks dependency changes in pull requests for known vulnerabilities and
unsupported licenses.

### Dependabot
`.github/dependabot.yml` opens weekly update pull requests for npm packages and
GitHub Actions.

### `release.yml`
Handles automated releases when a new version tag is pushed.

To block production merges/deployments until quality passes, configure the
GitHub `main` branch protection rule with the required check:
`Quality Gate / Lint, typecheck, and build`. Also require
`Coverage / Report Vitest coverage`, `PR Code Review / ESLint review comments`,
and `CodeQL / Analyze JavaScript and TypeScript`.

---

**Last Updated**: 2026-07-27
