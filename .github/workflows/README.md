# GitHub Actions Workflows

## Active Workflows

### `quality.yml`
Runs lint, TypeScript checks, unit tests, and an 80% minimum coverage gate on
pull requests and pushes to `main`.

### `reviewdog.yml`
Posts ESLint findings as review comments on changed lines in pull requests.

### `codeql.yml`
Runs GitHub CodeQL security analysis on pull requests, pushes to `main`, and
weekly on Mondays.

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
`Quality Gate / Lint, typecheck, tests, and coverage`. For stronger review and
security enforcement, also require `PR Code Review / ESLint review comments`
and `CodeQL / Analyze JavaScript and TypeScript`.

---

**Last Updated**: 2026-07-27
