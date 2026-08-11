# 📦 Release Workflow & Versioning Guide

This document outlines the standard release procedure for Nawaetu maintainers.

## 🚀 How to Execute a Release

Releases are fully automated using the [`./scripts/release.sh`](../scripts/release.sh) script.

### Step 1: Checkout & Update Main Branch
Ensure you are on the `main` branch and synced with remote:
```bash
git checkout main
git pull origin main
```

### Step 2: Run the Release Script
Execute the release script with your target version:
```bash
./scripts/release.sh v1.X.Y
```

> **Note**: Always use `./scripts/release.sh v1.X.Y` directly. Do not use generic npm tools alone, because `release.sh` handles cross-file version synchronization across `package.json`, `package-lock.json`, `src/config/app-config.ts`, `README.md` badges, and `CHANGELOG.md`.

---

## 🤖 What the Release Script Does Automatically

1. **Version Validation**: Verifies semantic versioning format (`vX.Y.Z`) and confirms the tag does not already exist.
2. **File Version Synchronization**:
   - Updates version in `package.json` & `package-lock.json`
   - Updates `version` and `lastUpdated` date in `src/config/app-config.ts`
   - Updates release version badge in `README.md`
3. **Changelog Generation**: Auto-generates structured `CHANGELOG.md` entries from git commit messages since the last release tag.
4. **Git Commit & Tagging**: Creates an annotated git tag `vX.Y.Z` and commits release changes.
5. **Push & CI/CD Trigger**: Pushes commits and tags to GitHub, triggering Vercel deployment and GitHub Actions workflows.

---

## 📝 Recommended Commit Message Conventions

For the best auto-generated changelog entries, format commit messages as:
```text
<type>: <title> - <description>
```

**Supported Types:**
- `feat`: New features (categorized under **Added**)
- `fix`: Bug fixes (categorized under **Fixed**)
- `perf`: Performance optimizations (categorized under **Performance**)
- `improve` / `refactor` / `chore` / `style`: Code structure & maintenance (categorized under **Improved**)
