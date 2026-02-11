# Nawaetu Release Process

This document outlines the automated release process for Nawaetu using the `scripts/release.sh` utility.

## 🚀 The "One-Command" Release

We have automated the entire release workflow into a single script. This script handles validation, version bumping (package.json, config, etc.), git tagging, and pushing.

### How to Release

1.  **Ensure you are on the `main` branch** and your working directory is clean.
2.  **Run the release command**:

    ```bash
    npm run release v1.6.0
    ```

    *(Replace `v1.6.0` with your desired version number)*

### What the Script Does Automatically

1.  **Validation**: Checks if the version format is correct (`vX.Y.Z`) and if the tag already exists.
2.  **Version Bump**:
    *   Updates `version` in `package.json`.
    *   Updates `APP_CONFIG.version` and `lastUpdated` date in `src/config/app-config.ts`.
3.  **Git Operations**:
    *   Commits the version bump changes with message `chore: release vX.Y.Z`.
    *   Creates an **Annotated Tag** (`vX.Y.Z`) including the relevant section from `CHANGELOG.md`.
    *   Pushes the commit and the tag to `origin/main`.
4.  **Deployment Trigger**:
    *   Pushing the tag automatically triggers the **Release Workflow** in GitHub Actions.
    *   Vercel automatically detects the new tag/commit and deploys to **Production**.

## 📝 Pre-Release Checklist

Before running the command, ensure:

1.  **Changelog Updated**: You have manually added the release notes for the new version in `CHANGELOG.md` under a `## [vX.Y.Z] - YYYY-MM-DD` header.
    *   *The script reads this section to create the tag message!*
2.  **Tests Pass**: Verify `npm run test` passes locally.
3.  **Build Check**: Verify `npm run build` succeeds locally.

## 🛠️ Troubleshooting

If the script fails (e.g., due to uncommitted changes):

1.  **Reset**: `git reset --hard HEAD` (be careful!) to undo partial changes.
2.  **Manual Tagging**: If needed, you can tag manually:
    ```bash
    git tag -a v1.6.0 -m "Release v1.6.0"
    git push origin v1.6.0
    ```
