# 🚀 GitHub Release & CI/CD Guide

Panduan lengkap untuk automated release process Nawaetu ke GitHub.

## 📋 Overview

Nawaetu menggunakan **GitHub Actions** untuk:
- ✅ Automated build & test pada setiap push
- ✅ Automated release creation saat ada git tag
- ✅ Automatic changelog generation
- ✅ Release artifact management

## 🔧 Setup Requirements

### 1. GitHub Repository Settings

Pastikan beberapa hal sudah setup:

```
Settings > Actions > General
└─ Actions Permissions: ✅ Allow all actions and reusable workflows
   Workflow Permissions: ✅ Read and write permissions
```

### 2. Git Configuration (Local)

```bash
# Configure git user (untuk commit history)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Atau untuk project saja:
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## 📦 Release Workflow

### Step 1: Prepare Code

```bash
# Buat feature branch
git checkout -b feature/amazing-feature

# Commit changes dengan conventional commits
git add .
git commit -m "feat(missions): add new daily mission system"

# Push ke remote
git push origin feature/amazing-feature
```

### Step 2: Create Pull Request

1. Buka GitHub dan create PR dari `feature/amazing-feature` → `main`
2. GitHub Actions akan **automatically**:
   - ✅ Build project
   - ✅ Run linter
   - ✅ Check TypeScript errors
   - ✅ Upload build artifacts

3. Review & merge setelah semua checks pass

### Step 3: Update Version & Changelog

Setelah merge ke main, prepare untuk release:

```bash
# Buat branch release
git checkout -b release/v1.2.0

# Update CHANGELOG.md - ubah [Unreleased] ke version baru
# Example:
# ## [1.2.0] - 2026-02-10
# ### Added
# - New feature X
# - New feature Y
# ### Fixed
# - Bug fix for issue #123

# Update version di package.json
npm version minor
# Atau manual edit:
# {
#   "version": "1.2.0"
# }

# Commit changes
git add CHANGELOG.md package.json package-lock.json
git commit -m "chore: prepare v1.2.0 release"

# Push
git push origin release/v1.2.0

# Create PR & merge ke main
```

### Step 4: Create Git Tag

Ini adalah trigger untuk release workflow:

```bash
# Pastikan di main dan updated
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0"

# Push tag ke GitHub
git push origin v1.2.0

# Atau sekaligus:
git push origin --tags
```

### Step 5: Watch Automated Release

GitHub Actions akan **automatically**:

```
Trigger: git tag v1.2.0
    ↓
Run Release Workflow:
  1. ✅ Checkout code
  2. ✅ Validate version format (vX.Y.Z)
  3. ✅ Setup Node.js 20
  4. ✅ Install dependencies
  5. ✅ Build project
  6. ✅ Extract changelog dari CHANGELOG.md
  7. ✅ Create GitHub Release
  8. ✅ Upload artifacts
  9. ✅ Commit version update (auto-push)
    ↓
Hasil: Release muncul di GitHub Releases tab
```

## 📊 Workflow Files

### `.github/workflows/build.yml`
Berjalan pada:
- ✅ Setiap push ke `main` & `develop`
- ✅ Setiap PR ke `main` & `develop`

Melakukan:
- Build project
- Run linter
- TypeScript type check
- Upload artifacts

### `.github/workflows/release.yml`
Berjalan pada:
- ✅ Setiap git tag `v*.*.*`

Melakukan:
- Full build & test
- Extract changelog
- Create GitHub Release
- Upload release artifacts
- Auto-commit version update

## 🔍 Monitoring Releases

### View Workflow Runs

```
https://github.com/hadianr/nawaetu/actions
│
├─ Build & Test workflows
│  └─ See on every push/PR
│
└─ Release workflows
   └─ See only on tag push
```

### View Releases

```
https://github.com/hadianr/nawaetu/releases
│
├─ v1.2.0 (Latest)
│  ├─ Release notes (auto-extracted dari CHANGELOG)
│  ├─ Assets/Artifacts
│  │  ├─ package.json
│  │  ├─ CHANGELOG.md
│  │  └─ README.md
│  └─ Created: Feb 10, 2026
│
└─ v1.1.0
   ├─ Release notes
   └─ Assets
```

## ✨ Changelog Format

Workflow akan auto-extract changelog, format HARUS:

```markdown
# CHANGELOG.md

## [1.2.0] - 2026-02-10

### Added
- Feature 1
- Feature 2

### Changed
- Change 1

### Fixed
- Fix 1

## [1.1.0] - 2026-02-05
... (previous version)
```

**Rules:**
- Setiap version ada header `## [X.Y.Z] - YYYY-MM-DD`
- Sections: Added, Changed, Fixed, Removed, Deprecated
- Next version header marks end of changelog entry

## 🚨 Troubleshooting

### ❌ Workflow Failed: "Invalid version format"
```bash
# ❌ Wrong
git tag 1.0.0          # missing 'v'
git tag v1.0.0-rc      # wrong format (pre-release)

# ✅ Correct
git tag v1.2.0         # standard semantic versioning
```

### ❌ Release Not Created
```bash
# Check:
1. Workflow syntax error? → Review .github/workflows/release.yml
2. Tag format wrong? → Must be vX.Y.Z
3. Build failed? → Check build logs in Actions tab
4. Changelog format wrong? → Check CHANGELOG.md syntax
```

### ❌ Artifacts Missing
Artifacts auto-uploaded, tapi bisa missing jika:
```bash
# Solution:
1. Build harus successful
2. Files harus exist saat workflow run
3. Check permissions
```

## 📝 Version Numbering

Semantic Versioning: **MAJOR.MINOR.PATCH**

```
v1.2.3
│││└─ PATCH: bug fixes, no new features
││└──────── MINOR: new features, backward compatible
│└───────── MAJOR: breaking changes
└────────── Always starts with 'v'

Examples:
v1.0.0  → Initial release
v1.1.0  → Added new features
v1.1.1  → Bug fixes
v2.0.0  → Breaking changes
```

## 🎯 Complete Release Checklist

```bash
# Sebelum release, pastikan:
☑ Code di main sudah final
☑ CHANGELOG.md updated dengan detailed info
☑ package.json version match CHANGELOG version
☑ npm run build successful locally
☑ Semua tests pass

# Create release:
☑ Create git tag: git tag -a vX.Y.Z -m "Release vX.Y.Z"
☑ Push tag: git push origin vX.Y.Z
☑ Watch Actions tab
☑ Verify release di GitHub Releases
☑ Announce di social media!
```

## 📢 Announce Release

Setelah release berhasil:

```markdown
🚀 **Nawaetu v1.2.0 Released!**

📝 Changelog:
- Feature 1
- Feature 2
- Bug fixes

📦 Download: https://github.com/hadianr/nawaetu/releases/v1.2.0

🙏 Jazakallah untuk support!

#LuruskanNiat #Nawaetu
```

## 🔐 Security Notes

- ✅ GITHUB_TOKEN auto-generated, no manual setup needed
- ✅ Workflow file protected, only maintainers can modify
- ✅ Releases are public, code is secure
- ✅ No credentials stored in repo

## 📚 Useful Links

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**"Innama al-a'malu bin-niyyat" - With clear intention, releases are smooth!**
