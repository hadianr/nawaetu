# iOS Notification Setup Guide

## 🚀 Quick Start

Panduan lengkap untuk setup notifikasi iOS di Nawaetu menggunakan Vercel Cron + Firebase Admin SDK.

## 📋 Prerequisites

- [ ] Vercel account dengan project Nawaetu
- [ ] Firebase project dengan Admin SDK credentials
- [ ] Access ke Vercel environment variables

## 🔧 Setup Steps

### 1. Environment Variables

Add ke Vercel environment variables (Dashboard → Settings → Environment Variables):

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cron Security (Generate random string)
CRON_SECRET=your-random-secret-key-here

# Firebase Client (Browser) - Should already exist
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

**Generate CRON_SECRET**:
```bash
# On Mac/Linux
openssl rand -base64 32
```

### 2. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "feat: add iOS notification support with Vercel Cron"
git push origin main

# Vercel will auto-deploy
# Wait ~2-5 minutes for deployment
```

### 3. Verify Cron Job

1. Go to Vercel Dashboard
2. Select project → Settings → Cron Jobs
3. Verify cron job is listed:
   - Path: `/api/notifications/prayer-alert`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Status: Active ✅

### 4. Test Notification Endpoint

**Local Testing**:
```bash
# Start dev server
npm run dev

# In another terminal, test endpoint
./scripts/test-notification.sh local
```

**Production Testing**:
```bash
# Set CRON_SECRET from Vercel
export CRON_SECRET=your-secret-from-vercel

# Test production endpoint
./scripts/test-notification.sh production
```

## 📱 iOS Testing Checklist

### Test 1: Safari iOS

1. Open https://nawaetu.com di Safari iOS
2. Tap Share → "Add to Home Screen"
3. Open app dari home screen
4. Go to Settings → Enable prayer notifications
5. Select prayer times to notify
6. Close app completely (swipe up dari app switcher)
7. Wait for prayer time
8. **Verify**: Notification muncul di lock screen ✅

### Test 2: Chrome iOS

1. Open https://nawaetu.com di Chrome iOS
2. Tap menu (3 dots) → "Add to Home Screen"
3. Open app dari home screen
4. Go to Settings → Enable prayer notifications
5. Select prayer times to notify
6. Close app completely
7. Wait for prayer time
8. **Verify**: Notification muncul di lock screen ✅

## 🔍 Monitoring

### Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# Filter prayer-alert logs
vercel logs --follow | grep "prayer-alert"
```

### Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Check "Messages sent" metrics
3. Look for delivery errors

### Database Check

Check active subscriptions:
```sql
SELECT * FROM push_subscriptions WHERE active = 1;
```

## 🐛 Troubleshooting

### Cron Not Running

**Symptom**: No logs in Vercel Functions
**Solution**: 
1. Check `vercel.json` exists di root
2. Verify cron job listed di Vercel dashboard
3. Redeploy if needed

### Notifications Not Received

**Symptom**: Cron runs but no notifications
**Checklist**:
- [ ] **Check GitHub Actions Logs**: Go to your GitHub Repo -> Actions -> 'Prayer Alert Cron'. 
    - Is there a green checkmark for the recent time?
    - Click on it -> 'trigger-prayer-alert' -> 'Call Prayer Alert API'.
    - Check the "Response body". Does it say "sent: X"?
- [ ] **iOS Limit**: iOS PWA processes are killed quickly. 
    - Try opening the app ~5-10 minutes before prayer time to "wake" the service worker.
    - If this works, the issue is iOS killing the background worker (common PWA limitation).
- [ ] User enabled notification for this prayer?

### 401 Unauthorized

**Symptom**: Endpoint returns 401
**Solution**: 
- Check `CRON_SECRET` matches di Vercel env vars
- Vercel Cron automatically includes correct auth header

### iOS Not Receiving

**Symptom**: Android works, iOS doesn't
**Checklist**:
- [ ] APNS payload included in message? (Check code)
- [ ] User granted notification permission?
- [ ] App added to home screen?
- [ ] Device has internet connection?

## 📊 Expected Behavior

### Cron Execution

```
Every 5 minutes:
  ↓
Check current time
  ↓
If prayer time matches:
  ↓
Query active subscriptions
  ↓
Send notifications
  ↓
Log results
```

### Notification Flow

```
Vercel Cron
  ↓
prayer-alert endpoint
  ↓
Firebase Admin SDK
  ↓
APNS (for iOS) / FCM (for Android)
  ↓
User Device
  ↓
Notification appears ✅
```

## 🎯 Success Metrics

- ✅ Cron executes every 5 minutes
- ✅ Notifications sent within 1 minute of prayer time
- ✅ iOS background notifications work
- ✅ Chrome iOS notifications work
- ✅ Android notifications work
- ✅ Desktop notifications work

## 📚 Additional Resources

- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [APNS Documentation](https://developer.apple.com/documentation/usernotifications)
- [Implementation Plan](file:///Users/hadianr/.gemini/antigravity/brain/2f78960a-96a0-4c0e-82e3-544019a9fd05/implementation_plan.md)

---

**Need Help?** Check the [troubleshooting section](#-troubleshooting) or review the [diagnostic report](file:///Users/hadianr/.gemini/antigravity/brain/2f78960a-96a0-4c0e-82e3-544019a9fd05/ios_notification_diagnosis.md).
