# 🚀 Release Guide - Nawaetu

Panduan lengkap untuk melakukan release Nawaetu dengan aman dan konsisten.

## 📋 Table of Contents

- [Pengenalan](#pengenalan)
- [Pre-Release Checklist](#pre-release-checklist)
- [Release Process](#release-process)
- [Automated Workflow](#automated-workflow)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## 📍 Pengenalan

Nawaetu menggunakan **semantic versioning** (vX.Y.Z) dengan otomasi penuh:

```
v1.1.0
│││└─ Patch: Bug fixes (1.0.1)
││└── Minor: New features (1.1.0)
│└─── Major: Breaking changes (2.0.0)
```

**Alur Release:**
```
1. Update CHANGELOG.md
2. Run npm run release -- v1.2.0
3. GitHub Actions:
   - Build & Test
   - Create Release
   - Deploy to Vercel
```

## ✅ Pre-Release Checklist

Sebelum melakukan release, pastikan:

- [ ] Semua features sudah merge ke branch `main`
- [ ] Tidak ada failing tests di GitHub Actions
- [ ] CHANGELOG.md sudah update dengan fitur/fixes terbaru
- [ ] package.json version siap (akan auto-update)
- [ ] Tidak ada uncommitted changes
- [ ] Semua commits sudah di-push ke origin

### Verifikasi dengan Command:

```bash
# Cek branch
git branch

# Cek status
git status

# Cek log terbaru
git log --oneline -5

# Cek working directory clean
git diff-index --quiet HEAD -- && echo "✅ Clean" || echo "❌ Has changes"
```

## 🔄 Release Process

### Opsi 1: Menggunakan Release Script (RECOMMENDED)

**Paling aman dan konsisten:**

```bash
# Release v1.2.0
npm run release -- v1.2.0

# atau dengan bash langsung
bash scripts/release.sh v1.2.0
```

**Script akan:**
✅ Validate version format (vX.Y.Z)
✅ Check working directory clean
✅ Ensure all commits pushed
✅ Confirm action sebelum proceed
✅ Create annotated git tag
✅ Push tag to origin
✅ Show progress status

**Contoh Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Nawaetu Release: v1.2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current branch: main
Release version: v1.2.0

This will:
  1. Create annotated git tag: v1.2.0
  2. Push tag to origin
  3. Trigger GitHub Actions workflows
  4. Auto-create GitHub Release with changelog
  5. Auto-deploy to Vercel

Continue with release? (y/n) y
✅ Tag created: v1.2.0
✅ Tag pushed to origin

✨ Release v1.2.0 successfully created!

🔗 Resources:
  📊 Build Status: https://github.com/hadianr/nawaetu/actions
  📦 Release Page: https://github.com/hadianr/nawaetu/releases/tag/v1.2.0
  🌐 Live Demo: https://nawaetu.com
```

### Opsi 2: Manual Release (LEGACY)

Jika script tidak berfungsi:

```bash
# 1. Ensure main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0"

# 4. Push tag to origin
git push origin v1.2.0
```

### Opsi 3: GitHub Web UI (EXPERIMENTAL)

Jika menggunakan GitHub CLI:

```bash
# Install GitHub CLI
# https://cli.github.com

# Create release (auto-generates from CHANGELOG)
gh release create v1.2.0 --generate-notes
```

## 🤖 Automated Workflow

Setelah tag di-push, otomatis terjadi:

### 1️⃣ Release Workflow (`.github/workflows/release.yml`)

```yaml
Trigger: git push tags (v*.*.*)
├─ Validate version format
├─ Build project
├─ Extract changelog entry
├─ Create GitHub Release
├─ Update package.json
├─ Commit version update
└─ Status: ✅ Released
```

⏱️ Duration: ~4-7 minutes

**Release otomatis include:**
- ✅ GitHub Release page dengan changelog
- ✅ Package.json version auto-update
- ✅ Release notes dari CHANGELOG.md
- ✅ Attached files (package.json, CHANGELOG.md, README.md)

### 2️⃣ Vercel Deployment

```
Tag push → Vercel webhook
└─ Vercel auto-build & deploy
   ├─ Build & Test (~3-5 min)
   ├─ Deploy to CDN
   └─ Production: https://nawaetu.com
```

⏱️ Duration: ~3-5 minutes

**Note:** Vercel handles all build, test, dan deployment. GitHub Actions hanya untuk release management.

## 📊 Monitoring Release

### Real-time Status

1. **GitHub Actions:**
   ```
   https://github.com/hadianr/nawaetu/actions
   ```
   Lihat release workflow status

2. **Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```
   Lihat build & deployment progress
   Lihat build, release, dan deployment status

2. **GitHub Releases:**
2. **GitHub Releases:**
   ```
   https://github.com/hadianr/nawaetu/releases
   ```
   Lihat release notes dan downloaded files

3. **Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```
   Lihat build progress, deployment status, dan performance logs

### Check Release Success

```bash
# Verify tag exists
git tag | grep v1.2.0

# Show tag details
git show v1.2.0

# Check release created
gh release view v1.2.0
```

## ⚠️ Troubleshooting

### Issue: Script Permission Denied

```bash
# Fix: Make script executable
chmod +x scripts/release.sh

# Try again
npm run release -- v1.2.0
```

### Issue: Version Already Exists

```bash
Error: Tag v1.2.0 already exists

# Solution: Use different version
npm run release -- v1.2.1
```

### Issue: Not on Main Branch

```bash
Error: Must be on 'main' branch to create release

# Solution: Switch to main
git checkout main
git pull origin main

# Try again
npm run release -- v1.2.0
```

### Issue: Uncommitted Changes

```bash
Error: Working directory has uncommitted changes

# Solution 1: Commit changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Solution 2: Stash changes
git stash
# Then release...
```

### Issue: Unpushed Commits

```bash
Error: You have unpushed commits

# Solution: Push first
git push origin main

# Try again
npm run release -- v1.2.0
```

### Issue: Build Failed in GitHub Actions

```bash
# Check GitHub Actions logs
1. Go to https://github.com/hadianr/nawaetu/actions
2. Find failed workflow
3. Click and read error logs
4. Fix issue locally
5. Push to main
6. Delete tag and retry:
   git tag -d v1.2.0
   git push origin :refs/tags/v1.2.0
   npm run release -- v1.2.0
```

## ❓ FAQ

### Q: Berapa sering saya bisa melakukan release?
**A:** Sesering yang diperlukan! Semantik versioning memungkinkan:
- Patch (v1.0.1): Bug fixes - bisa setiap hari
- Minor (v1.1.0): Features - seminggu sekali
- Major (v2.0.0): Breaking changes - setiap bulan atau lebih

### Q: Apa yang terjadi jika release gagal?

**A:** Tidak masalah! Tidak ada data yang hilang:

```bash
# Delete tag lokal dan remote
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0

# Fix issue
# ... make changes ...
git push origin main

# Try release lagi
npm run release -- v1.2.0
```

### Q: Bisa buat release dari branch selain main?

**A:** Tidak disarankan, tapi bisa di-customize di release script:

```bash
# Current: only main allowed
# Edit scripts/release.sh baris ~70

# Uncomment untuk allow branch lain
# CURRENT_BRANCH="develop" # atau branch apapun
```

### Q: Bagaimana menggabungkan beberapa fitur dalam satu release?

**A:** Standard workflow:

```bash
# 1. Develop all features on branches
git checkout -b feature/new-feature
# ... develop ...
git push origin feature/new-feature

# 2. Create PR dan merge ke main
# https://github.com/hadianr/nawaetu/pulls

# 3. Once all merged, update CHANGELOG.md

# 4. Release everything bersama
npm run release -- v1.2.0
```

### Q: Bisa rollback release jika ada bug?

**A:** Ya! Ada dua cara:

**Cara 1: Hot fix + patch release**
```bash
# 1. Fix bug di code
git commit -m "fix: critical bug"
git push origin main

# 2. Release patch
npm run release -- v1.2.1
```

**Cara 2: Revert release**
```bash
# 1. Delete release
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0

# 2. Revert commits
git revert HEAD~n

# 3. Release lagi
npm run release -- v1.2.0
```

### Q: Apa role CHANGELOG.md?

**A:** Dokumentasi fitur & fixes untuk setiap release:

```markdown
## [1.2.0] - 2024-02-05

### Added
- New theme system with CSS variables
- Support for 30+ languages

### Fixed
- Bookmark edit dialog hydration error
- Prayer time calculation for edge cases

### Changed
- Updated all hardcoded colors to theme colors
```

**Script otomatis extract ini untuk GitHub Release notes!**

### Q: Gimana setup GitHub CLI untuk release?

**A:** Optional, tapi powerful:

```bash
# 1. Install GitHub CLI
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/install.sh | sh

# 2. Authenticate
gh auth login

# 3. Use untuk release
gh release create v1.2.0 --generate-notes
```

## 📚 Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Version history
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deployment docs
- [GitHub Actions Guide](./build.yml) - CI/CD configuration

## 🎯 Best Practices

1. **Always update CHANGELOG.md first**
   ```bash
   # Edit CHANGELOG.md dengan fitur & fixes
   git add CHANGELOG.md
   git commit -m "docs: update changelog for v1.2.0"
   git push origin main
   ```

2. **Use semantic versioning consistently**
   ```
   MAJOR.MINOR.PATCH
   v1.2.3
   ```

3. **Create release only from main branch**
   - Ensures all changes merged properly
   - Prevents accidental release dari WIP branches

4. **Use annotated tags (not lightweight)**
   ```bash
   # Good: Annotated tag
   git tag -a v1.2.0 -m "Release v1.2.0"

   # Avoid: Lightweight tag
   git tag v1.2.0
   ```

5. **Monitor GitHub Actions after release**
   - Check build succeeds
   - Verify release created
   - Confirm Vercel deployment

## 🎉 Success!

Setelah release berhasil:

```
✅ Tag created dan pushed
✅ GitHub Actions running
✅ Release page created
✅ Changelog documented
✅ Deployed to nawaetu.com
✅ Ready untuk users!
```

**Next step:** Announce release ke komunitas! 📢

---

**Need help?** Check GitHub Issues atau contact maintainers.

*Last updated: February 5, 2026*
