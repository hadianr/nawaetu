# GitHub Actions Workflows

## Active Workflows

### `quality.yml`
Runs lint, TypeScript checks, unit tests, and an 80% minimum coverage gate on
pull requests and pushes to `main`.

### `release.yml`
Handles automated releases when a new version tag is pushed.

To block production merges/deployments until quality passes, configure the
GitHub `main` branch protection rule with the required check:
`Quality Gate / Lint, typecheck, tests, and coverage`.

---

**Last Updated**: 2026-07-27
