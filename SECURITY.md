# Security & Billing Protection Guide

## 🔒 API Key Security

### Current Protection (Implemented ✅)

1. **Environment Variables**
   - API key stored in `.env.local`
   - Never hardcoded in source code
   - `.env.local` in `.gitignore` (won't be committed to Git)

2. **Server-Side Only**
   - API calls in Server Actions (`"use server"`)
   - Key never exposed to client/browser
   - No API key in network requests visible to users

3. **Rate Limiting**
   - 10 requests per minute per user
   - Prevents spam and abuse
   - In-memory cache (LRU)

4. **Input Validation**
   - Max 500 characters per message
   - Rejects empty messages
   - Prevents excessive token usage

---

## 💰 Billing Protection

### Implemented Safeguards ✅

1. **Rate Limiting**
   - Max 10 chat requests/minute per user
   - Max 1 greeting per hour per user
   - Prevents runaway costs

2. **Token Limits**
   - `maxOutputTokens: 600` (prevents long responses)
   - Short system instruction (cached)
   - Compact user prompts

3. **Topic Guardrails**
   - Rejects off-topic questions with short response
   - Saves 80-90% tokens on irrelevant queries

4. **Error Handling**
   - Quota errors handled gracefully
   - User-friendly messages (no retries on user errors)

### Estimated Costs

**Per Request:**
- Input: ~150 tokens (cached = ~15 tokens charged after first request)
- Output: ~100 tokens average (max 600)
- Cost: ~$0.0001 per request

**Monthly estimate (100 active users):**
- 10 requests/user/day × 100 users × 30 days = 30,000 requests
- With caching: ~$3-5/month
- Without protection: Could be **unlimited** 💸

---

## 🛡️ Additional Security Steps (Manual)

### 1. Google Cloud API Restrictions

Configure in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**Application Restrictions:**
```
HTTP referrers (websites):
- https://nawaetu.com/*
- https://*.vercel.app/*
```

**API Restrictions:**
```
✅ Generative Language API only
❌ All other APIs disabled
```

### 2. Budget Alerts

Set up in Google Cloud Billing:

1. Go to Billing → Budgets & Alerts
2. Create budget: $10/month (adjust as needed)
3. Set alerts at: 50%, 90%, 100%
4. Add email notifications

### 3. Usage Monitoring

Monitor in Google Cloud Console:
- Check API usage daily for first week
- Look for unusual spikes
- Adjust rate limits if needed

---

## 🚨 What to Do If Compromised

If API key is exposed:

1. **Immediately**: Delete key in Google Cloud Console
2. **Generate new key** with proper restrictions
3. **Update `.env.local`** with new key
4. **Check billing** for unauthorized usage
5. **Review logs** for suspicious activity

---

## 📊 Monitoring Checklist

Weekly checks:
- [ ] Review total API usage
- [ ] Check billing (should be < $10/month for small app)
- [ ] Look for unusual patterns
- [ ] Verify rate limiting is working

Monthly:
- [ ] Rotate API key (optional but recommended)
- [ ] Review and adjust rate limits
- [ ] Update budget alerts if needed

---

## 🎯 Rate Limit Configuration

Current settings in `src/lib/rate-limit.ts`:

```typescript
// Chat messages: 10 per minute per user
chatRateLimiter = {
  interval: 60 * 1000,  // 1 minute
  limit: 10
}

// Greetings: 1 per hour per user
greetingRateLimiter = {
  interval: 60 * 60 * 1000,  // 1 hour
  limit: 1
}
```

Adjust based on your user base and needs.

---

## ✅ Security Layers Summary

| Layer | Status | Protection |
|-------|--------|------------|
| Environment variables | ✅ Implemented | API key isolation |
| Server-side only | ✅ Implemented | No client exposure |
| Rate limiting | ✅ Implemented | Abuse prevention |
| Input validation | ✅ Implemented | Token optimization |
| Topic guardrails | ✅ Implemented | Focused responses |
| API restrictions | ⚠️ Manual setup | Domain/API limiting |
| Budget alerts | ⚠️ Manual setup | Cost monitoring |
| Vercel Security | ✅ Auto-enabled | DDoS protection, SSL |

**Next Steps:**
1. Set up Google Cloud API restrictions (domain: nawaetu.com)
2. Configure budget alerts ($10-20/month recommended)
3. Monitor usage for first week
4. Review Vercel security settings

---

## 🌐 Deployment Security

**Vercel Auto-Security Features:**
- ✅ **Automatic SSL/HTTPS** - Free SSL certificates
- ✅ **DDoS Protection** - Edge network protection
- ✅ **Environment Variable Encryption** - Secure storage
- ✅ **Preview Deployments** - Isolated test environments
- ✅ **Secure Headers** - CSP, HSTS, X-Frame-Options

**Production URL:** https://nawaetu.com

**Preview Deployments:** Each PR gets isolated preview URL with same security

---

*Last updated: February 5, 2026*
