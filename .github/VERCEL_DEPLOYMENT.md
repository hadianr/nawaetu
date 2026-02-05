# 🚀 Vercel Deployment Guide

Panduan lengkap untuk auto-deployment Nawaetu ke Vercel.

## 📋 Overview

Nawaetu menggunakan **Vercel** untuk:
- ✅ Auto-deploy setiap push ke `main` branch
- ✅ Preview deployments untuk setiap PR
- ✅ Automatic rollback jika ada issue
- ✅ Performance monitoring & analytics
- ✅ SSL/HTTPS automatically
- ✅ CDN global untuk fast loading

## 🔧 Setup (Sudah Aktif!)

### Vercel Integration

Repository ini sudah connected ke Vercel:

```
GitHub hadianr/nawaetu
    ↓
Vercel Auto-Deploy
    ↓
nawaetu.com (Production, aliased via Vercel)
```

### Environment Variables

Production environment variables sudah setup di Vercel dashboard:

```
GEMINI_API_KEY=***
GROQ_API_KEY=***
SENTRY_AUTH_TOKEN=***
NEXT_PUBLIC_GA_MEASUREMENT_ID=***
```

Jika perlu update:
1. Buka https://vercel.com/dashboard
2. Select project "nawaetu"
3. Settings > Environment Variables
4. Edit & save

## 🔄 Deployment Flow

### 1. Push to Main

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 2. GitHub Actions Triggers

```
Push to main branch detected
    ↓
GitHub Actions: Build & Test
  - npm install
  - npm run build
  - TypeScript check
  - All checks PASS ✅
    ↓
Vercel receives webhook
```

### 3. Vercel Auto-Deploy

```
Vercel detects GitHub push
    ↓
1. Build optimization (Turbopack)
2. Install dependencies
3. Build project
4. Run tests
5. Deploy to CDN
    ↓
Production URL: nawaetu.com ✅
```

### 4. Deployment Complete

```
✅ Build successful
✅ Deployed to https://nawaetu.com
✅ Performance analyzed
✅ Logs available in dashboard
```

## 📊 Monitoring Deployments

### Vercel Dashboard

Open: https://vercel.com/dashboard

```
Projects > nawaetu
    ↓
    ├─ Deployments (lihat history)
    ├─ Analytics (performance metrics)
    ├─ Settings (environment, domains)
    └─ Logs (deployment logs)
```

### Latest Deployment Info

**Production:**
```
URL: https://nawaetu.com
Status: 🟢 Live
Last Deploy: Feb 5, 2026 - 14:32 UTC
Commit: abc1234 (feat: new feature)
```

### Preview Deployments

Setiap PR otomatis mendapat preview:

```
Pull Request #123
    ↓
Vercel creates preview deployment
    ↓
Preview URL: https://nawaetu-pr-123.vercel.app
    ↓
Comment automatically di PR dengan link
```

## 🔍 Deployment Details

### Build Settings (Vercel)

```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Node.js Version: 20.x
```

### Performance

**Core Web Vitals:**
- ⚡ First Contentful Paint: 2.1s
- 🖼️ Largest Contentful Paint: 3.2s
- 📊 Cumulative Layout Shift: 0.064

**Lighthouse Score:**
- Performance: 88-93/100
- Accessibility: 100/100
- Best Practices: 100/100
- SEO: 100/100

## 🚨 Rollback Procedure

Jika ada issue setelah deploy:

### Option 1: Revert di GitHub

```bash
# Cari commit yang problematic
git log --oneline

# Revert
git revert <commit-sha>
git push origin main

# Vercel automatically re-deploy dengan revert
```

### Option 2: Rollback di Vercel

1. Buka https://vercel.com/dashboard
2. Pilih "nawaetu" project
3. Tab "Deployments"
4. Cari deployment sebelumnya yang stable
5. Click "..." menu → "Promote to Production"

### Option 3: Manual Rollback via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Rollback
vercel rollback
```

## 📈 Monitoring & Analytics

### Real-Time Monitoring

1. Buka Vercel Dashboard
2. Tab "Analytics"
3. Monitor:
   - Request count
   - Response time
   - Error rate
   - Server load

### Performance Metrics

```
Dashboard > Analytics > Web Vitals
    ↓
View real-time metrics dari production:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - First Input Delay (FID)
```

### Error Tracking

1. Vercel > Settings > Monitoring
2. Sentry integration already configured
3. View errors: https://sentry.io/dashboard

## 🔐 Security

### SSL/HTTPS

- ✅ Auto-enable HTTPS
- ✅ Free SSL certificate (Vercel managed)
- ✅ Auto-renew before expiration

### Environment Variables

- ✅ Encrypted at rest
- ✅ Not exposed in browser
- ✅ Only available at build time (NEXT_PUBLIC_ prefix for client)

### Access Control

- ✅ Only maintainers can edit settings
- ✅ Deployment logs protected
- ✅ Production environment read-only untuk contributors

## 📝 Deployment Checklist

Sebelum push ke main:

```
☑ Code tested locally
☑ npm run build successful
☑ No console errors/warnings
☑ TypeScript strict mode passing
☑ Environment variables checked
☑ CHANGELOG updated
☑ Commit message conventional
☑ PR review passed
```

Saat push ke main:

```
☑ GitHub Actions trigger
☑ Build & test pass
☑ Vercel receives webhook
☑ Vercel build starts
☑ Preview URL generated
☑ Production deploy starts
```

Setelah deploy:

```
☑ Check Vercel dashboard
☑ Verify https://nawaetu.com loads
☑ Test critical features
☑ Monitor analytics for errors
☑ Announce di social media (jika major release)
```

## 🎯 Best Practices

### 1. Always Test Locally

```bash
npm run build
npm start
# Test at http://localhost:3000
```

### 2. Use Preview Deployments

```bash
# Create PR
git push origin feature/new-feature

# Wait for Vercel preview URL in PR comments
# Click preview link & test
# Merge after verification
```

### 3. Monitor After Deploy

```bash
# Check Vercel dashboard
# Monitor errors in Sentry
# Check performance metrics
# Watch real-time traffic
```

### 4. Quick Rollback if Needed

```bash
# Use Vercel dashboard or:
git revert <commit-sha>
git push origin main
# Auto-deploy with revert
```

## 🔗 Useful Links

- 🌐 **Production**: https://nawaetu.com
- 📊 **Vercel Dashboard**: https://vercel.com/dashboard
- 🐛 **Error Tracking**: https://sentry.io/dashboard
- 📈 **Analytics**: https://vercel.com/analytics
- 📚 **Docs**: https://vercel.com/docs

## 📞 Troubleshooting

### ❌ Build Failed

```
1. Check Vercel build logs
2. Verify npm run build works locally
3. Check environment variables set
4. Look at GitHub Actions output
```

### ❌ Deployment Stuck

```
1. Refresh Vercel dashboard
2. Check GitHub Actions status
3. Cancel & retry deployment
4. Reach out to Vercel support if persistent
```

### ❌ Performance Issue

```
1. Check Core Web Vitals
2. Review images optimization
3. Check bundle size
4. Monitor API response times
```

---

**"Niyyah jelas, deployment lancar!"** 🚀

**Questions?** Open issue or check Vercel docs.
