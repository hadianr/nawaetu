# GitHub Actions Workflows

## Active Workflows

### `release.yml`
Handles automated releases when a new version tag is pushed.

## Disabled Workflows

### `prayer-alert-cron.yml.disabled`
**Status**: Disabled (renamed to `.disabled`)

**Reason**: This workflow is no longer needed due to our hybrid notification approach.

**Previous Purpose**: 
- Triggered prayer alert API every 5 minutes
- Attempted to send server-side notifications

**Why Disabled**:
1. **Vercel Cron**: We now use Vercel Cron (daily at 4 AM UTC) for token sync
2. **Client-Side Notifications**: Real-time prayer notifications are handled by `useAdhanNotifications` hook in the browser
3. **Redundancy**: This workflow was causing conflicts and unnecessary API calls
4. **iOS Limitations**: Server-side notifications don't work reliably on iOS Safari/Chrome anyway

**Current Approach**:
- **Vercel Cron** (daily): Validates FCM tokens, sends silent sync
- **Client-Side** (real-time): Browser notifications when app is open

See `docs/HYBRID_NOTIFICATION_APPROACH.md` for full details.

---

**Last Updated**: 2026-02-09
