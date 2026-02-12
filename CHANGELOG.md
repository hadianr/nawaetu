# Changelog

All notable changes to Nawaetu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.6.8] - 2026-02-12

### Improved
- **Style: make switch toggle colors theme-aware**
- **Chore: rename migrations with descriptive names and add documentation headers**

### Fixed
- **Fix: remove manual reset functionality and related UI elements**
- **Fix: update welcome toast logic to use localStorage and clear on logout**


## [1.6.7] - 2026-02-12

### Added
- **Feat: add MobileDebugConsole component for enhanced debugging capabilities**

### Fixed
- **Fix: remove unused location note from NotificationSettings component**
- **Fix: enhance service worker activation process with SKIP_WAITING message handling**
- **Fix: enhance logging and initialization checks in AppOverlays and UpdateChecker components**
- **Fix: improve PWA update process with detailed best practices and enhanced logging**
- **Fix: enhance logging and cleanup process during version updates in AppOverlays and UpdateChecker**
- **Fix: streamline session storage management for version checks to prevent redirect loops**
- **Fix: enhance session management for version checks to prevent redirect loops on iOS**
- **Fix: prevent redirect loop on iOS by ensuring hard refresh runs only once per session**
- **Fix: update CHANGELOG format and improve auto-generation script for better clarity and organization**


## [1.6.6] - 2026-02-12

### Performance
- **Qibla Compass Optimization**: Major performance improvements for smooth experience on low-end mobile devices:
  - React.memo implementation to prevent unnecessary re-renders of heavy visual elements
  - GPU-accelerated animations with translateZ(0) for 60fps smoothness
  - Passive event listeners to reduce event processing overhead
  - Maintained 30fps throttling cap to prevent excessive updates
  - Split UI components for better render optimization

### Improved
- **Qibla Page Translations**: Enhanced user guidance text and clarity across Indonesian and English languages
- **Compass Session Handling**: Improved compass reinitialization logic when app is reopened
- **Permission Flow**: Better handling of device orientation permission requests

### Fixed
- **Alignment Feedback**: Enhanced visual animations and added haptic response (vibration) when device aligns with Qibla direction
- **Rotation Accuracy**: Improved Qibla alignment detection and relative rotation calculations
- **Event Listener Cleanup**: Better cleanup of device orientation event listeners to prevent memory leaks

## [1.6.5] - 2026-02-11

### Fixed
- **Qibla Compass Accuracy**: Fixed Kaaba icon rotation calculation - now properly rotates based on actual qibla bearing relative to device heading
- **Permission Glitching**: Prevented duplicate compass initialization that caused permission re-prompts despite prior grant
- **Sensor Detection**: Increased timeout from 3s to 6s and added iOS-specific permission check on mount for better sensor reliability
- **Alignment Detection**: Improved qibla alignment logic with proper 360°/0° wraparound handling (±8° threshold)

## [1.6.4] - 2026-02-11

### Fixed
- **iOS PWA Version Persistence (Final)**: Implemented comprehensive fix for version reversion bug:
  - Dynamic manifest generation with versioned start_url (`/?v=1.6.4`)
  - iOS-specific hard refresh logic: detects version mismatch → unregister SW → clear caches → force reload
  - Added semver comparison in UpdateChecker to prevent downgrade prompts
  - No-cache headers for manifest and service worker files
  - Release script now atomically updates all version files before git operations

## [1.6.3] - 2026-02-11

### Fixed
- **iOS PWA Version Bug**: Updated service worker filename alignment and incremented manifest start_url version to break persistent cache

## [1.6.2] - 2026-02-11

### Refactored
- **Payment ID Consistency**: Introduced `paymentLinkId` in database to separately store the ID from Create Payment API and the Transaction ID from Webhooks. This eliminates ID mismatches permanently.
- **Enhanced Webhook & Sync**: Updated matching logic to support both Payment Link ID and Transaction ID, ensuring 100% reliable payment verification.

## [1.6.1] - 2026-02-11

### Fixed
- **Payment Verification Hotfix**: Implemented transaction lookup fallback by email/amount when Mayar webhook sends a Transaction ID that differs from our stored Payment Link ID.
- **Sync Logic**: Enhanced manual sync to also search transaction history if direct ID check fails.

## [1.6.0] - 2026-02-11

### Added
- **Infaq Integration**: Support the app mission with seamless Mayar.id payments.
- **Muhsinin Status**: Instantly unlock exclusive benefits (Gold Badge + 25 AI chats/day) upon donation.
- **Payment Verification**: Robust webhook handling with manual sync fallback for reliable status updates.

## [1.5.12] - 2026-02-11

### Fixed
- **iOS PWA Revert Bug (Definitive)**: Changed `start_url` to `/?v=1.5.12` to force a new App Shell and renamed Service Worker to `sw-v1512.js` to ensure a completely fresh registration, bypassing any lingering iOS caches.

## [1.5.11] - 2026-02-11

### Improved
- **Update UX**: The "Update Available" button in Settings now automatically cleans up old caches and Service Workers to ensure a clean update.
- **Troubleshooting UI**: Renamed "Reset Aplikasi" to "Bersihkan Cache" with friendlier language to reduce user anxiety.

## [1.5.10] - 2026-02-11

### Added
- **Manual Reset Button**: A "Pemecahan Masalah" section in Settings allows users to manually unregister Service Workers & clear caches if the app feels "stuck" on an old version.

## [1.5.9] - 2026-02-11

### Fixed
- **iOS PWA Revert Bug (Final)**: Renamed Service Worker to `sw-v158.js` to forcefully break persistent cache loops. Added smart cleanup to unregister old `sw.js` zombies while preserving the new worker.

## [1.5.8] - 2026-02-11

### Fixed
- **iOS PWA Revert Bug**: Added a "Nuclear Update" mechanism to force-clean old caches and Service Workers that were causing the app to revert to v1.5.3 after a restart.

## [1.5.7] - 2026-02-11

### Fixed
- **Notification Icons**: Forced icon refresh on Android by adding version query parameter to prevent stale caching.
- **Legacy Assets**: Replaced old `src/app/icon.png` to ensure consistent favicons across all devices.

## [1.5.6] - 2026-02-11

### Fixed
- **Qibla**: Persisted compass permission (no more repetitive asks) and added "No Sensor" fallback for unsupported devices.

## [1.5.5] - 2026-02-11

### Added
- **Update Checker**: Added a manual "Update Available" overlay in Settings to help users stuck on old versions upgrade easily.
- **System API**: Added `/api/system/version` endpoint for reliable version checking.

## [1.5.4] - 2026-02-11

### Changed
- **Notifications**: Updated prayer alert wording to be more mindful and varied (e.g., "Mari sejenak menghadap Sang Pencipta").

## [1.5.3] - 2026-02-11

### Security & DevOps
- **PWA**: Added strict `Cache-Control: no-cache` headers for `sw.js` to prevent stale service workers.

## [1.5.2] - 2026-02-11

### Added
- **PWA**: Added aggressive Service Worker update checks (Mount, Focus, Interval) to ensure users get the latest version automatically without reinstalling.

## [1.5.1] - 2026-02-11

### Fixed
- **Security**: Hidden "Developer Tools" section in Settings page for production environment.
- **Documentation**: Added `RELEASE_WORKFLOW.md` link to English README.

## [1.5.0] - 2026-02-11

### Added
- **High-Precision Notification System**:
  - **External Cron Support**: Optimized for high-frequency (1-minute) triggers using external services (e.g., cron-job.org).
  - **Smart Deduplication**: DB-level tracking (`lastNotificationSent`) prevents duplicate alerts even with 1-minute polling.
  - **Strict Prayer Window**: Logic (`0-15m strict`) prevents "False Early Adhan" and ensures accurate timing.
- **Visual Identity Update**:
  - **New App Icon**: Premium, opaque, full-bleed design for iOS/Android/Web to match native app standards.
  - **Standardized Assets**: Consistent branding across `manifest.json`, `apple-touch-icon`, and favicon.
- **Direct Hit Debugging**:
  - New `/notification-debug` features: Manual Token Input to test "Killed State" delivery on real devices.

### Changed
- **Notification Architecture**:
  - **Replaced**: GitHub Actions Cron (unreliable/delayed) with External Cron documentation.
  - **Secured**: Debug APIs (`/debug/send`, `/debug/check`) now return 404 in Production for security.
- **PWA Configuration**:
  - **iOS Optimization**: Explicit `apple-touch-icon-precomposed` link to fix 404 errors.
  - **Manifest**: Updated icons to use new opaque assets.

### Fixed
- **iOS Killed State**: Notifications now successfully arrive even when the app is swiped away (Force Quit).
- **Service Worker Conflict**: Removed aggressive lifecycle listeners in `firebase-messaging-sw.js` that caused reload loops.
- **Toggle State Sync**: Fixed optimistic UI glitches when toggling prayer alerts.
- **Location Data**: Fixed null `userLocation` in subscriptions, ensuring timezone-accurate prayer times.

---
## [1.4.0] - 2026-02-08

### Added
- **iOS Background Notifications Fix**: 
  - Reliable delivery of prayer alerts on iOS (Safari, Chrome, etc.)
  - Server-side notification triggering via Firebase Admin SDK
  - Scheduled delivery using Vercel Cron Jobs
  - APNS payload optimization for background wakeup and content-available
- **Hybrid Notification Approach**:
  - Daily server-side token sync (Vercel Hobby plan compatible)
  - Real-time client-side prayer time detection (every 5 seconds)
  - Seamless fallback between server-side health checks and client-side alerts
- **Advanced Notification Debugging**:
  - `scripts/test-notification.sh` for endpoint verification
  - Comprehensive documentation for iOS setup and troubleshooting
- **New Documentation**:
  - [IOS_NOTIFICATION_SETUP.md](docs/IOS_NOTIFICATION_SETUP.md)
  - [HYBRID_NOTIFICATION_APPROACH.md](docs/HYBRID_NOTIFICATION_APPROACH.md)
  - [VERCEL_CRON_WORKAROUND.md](docs/VERCEL_CRON_WORKAROUND.md)

### Changed
- **Cron Configuration**: Switched to daily sync schedule (0 4 * * *) to support Vercel Hobby plan
- **Prayer Alert API**: Refactored as a silent background sync job to keep tokens fresh
- **README**: Full update with iOS notification setup and versioning

### Technical
- Integrated `firebase-admin` SDK
- Implemented Base64 service account credential handling for secure Vercel deployment
- Configured dynamic `vercel.json` cron paths

---
## [1.3.0] - 2026-02-05

### Added
- **Smart Rate Limiting**: Limit pintar dengan auto-reset
  - Free users: 5 chat/hari
  - Muhsinin users: 25 chat/hari
  - **Instant Reset**: Upgrade ke Muhsinin langsung reset kuota ke 0 (dapat 25 chat baru) tanpa menunggu besok
- **Mentor AI Chat History**:
  - Riwayat chat kini tersimpan di local storage
  - Bisa melanjutkan percakapan antar sesi (refresh page tidak hilang)
  - Mendukung multi-session management
- **Streamlined AI Responses**:
  - Instruksi sistem baru untuk Gemini, Groq, dan OpenRouter
  - Jawaban lebih to-the-point tanpa basa-basi salam (kecuali disalamin duluan)
  - Tone lebih profesional namun tetap hangat sebagai "Mentor Spiritual"

### Changed
- **Translations**: Updated English & Indonesian settings translations to reflect new features
- **About Section**: Updated app improvements list in Settings page
- **README**: Detailed new feature capabilities and version bump

### Fixed
- Rate limit counter logic issue during tier upgrades

### Performance
- Optimized quota check logic to minimize unnecessary writes to storage

---
## [1.2.0] - 2026-02-05

### Added
- **Backend Architecture Readiness**:
  - **Drizzle ORM Integration**: Installed and configured for type-safe database access
  - **Database Schema**: Defined Users, Accounts (SSO), Sessions, and Bookmarks tables
  - **Repository Pattern**: Implemented `DbBookmarkRepository` for future migration from LocalStorage
  - **API Config**: Centralized external API constants to adhere to DRY principle
  - **NextAuth Preparation**: Schema ready for authenticating via Google/Apple
  
- **UX Polish & Performance**:
  - Hydration placeholders for Tasbih counter (prevents flash of default state)
  - Layout stabilization for HomeHeader (skeleton loading for profile data)
  - Shared bottom navigation padding utility (`pb-nav`) for consistent spacing across all pages
  - Reduced-motion support for users with motion sensitivity preferences


- **AI Assistant Rebranding**:
  - Renamed from "Tanya Ustadz" to "Nawaetu AI" (more inclusive & less sensitive)
  - Route updated: `/tanya-ustadz` → `/mentor-ai`
  - Function refactor: `askUstadz()` → `askMentor()`
  - System prompts updated to "Nawaetu AI - Asisten Muslim Digital"
  - Updated onboarding text and UI references

- **Cache & Storage Improvements**:
  - TTL + versioning for tafsir (7 days), last-read (7 days), prayer times (30 days)
  - Global cache cleanup in AppOverlays component
  - Comprehensive fetch timeout protection (15s default)

### Changed
- **Mobile UX**: 
  - Quote of the Day spacing reduced for better visual hierarchy
  - All page wrappers now use consistent `pb-nav` (6rem + safe-area-inset-bottom)
  - HomeHeader sections reserved minimum space to prevent layout shift
  
- **System Prompts**:
  - Removed "Jangan sebut dirimu Ustadz" instruction
  - Enhanced identity as "mentor spiritual"
  - Emphasis on educational support role

### Technical
- Added `prefers-reduced-motion` media query support
- Fetch timeout helper with AbortSignal.any() support
- Improved storage exception documentation for direct localStorage (Tasbih)
- NaN validation across Tasbih persistence layer
- Build: 0 errors, 9/9 tests passing, 4.6s compile time

### Fixed
- HomeHeader layout shifts during data hydration
- Tasbih counter flash before localStorage data loads
- Quote section spacing inconsistency
- Animation performance for users with motion sensitivity

### Performance
- No bundle size increase despite new features
- Decreased CLS (Cumulative Layout Shift) improvements
- Reduced paint operations with hydration guards

---

## [1.1.0] - 2026-02-05

### Added
- **Multi-language Support**: Full localization in Indonesian and English across all pages
  - All UI components now support language switching
  - Missions, settings, bookmarks, and Qibla pages fully localized
- **Enhanced Bookmark System**: 
  - Edit dialog with note-taking capability
  - Set verses as "Last Read" from bookmarks
  - Theme-aware UI with accent colors
- **About App Modal**: New informative modal in settings with:
  - Version information
  - What's New section
  - Feature highlights
  - App statistics
- **Theme System Improvements**:
  - All pages now respect active theme colors
  - Dynamic CSS variables for consistent theming
  - Quote of the Day card theme integration
  - Tasbih page full theme support
  - Settings page comprehensive theme alignment
  - Qibla page theme colors

### Changed
- **Mission System**: Complete localization with dynamic translation keys
  - All 28+ missions now support multiple languages
  - Hukum labels (Wajib, Sunnah) localized
  - Completion options text localized
- **Tasbih Counter**:
  - Presets now dynamically generated based on language
  - Changed from label-based to ID-based tracking
  - All action buttons localized
  - Streak icon uses theme accent color
- **Settings Page**: Redesigned About section with compact card + modal
- **Bookmark Page**: Full localization of all text elements

### Fixed
- Hydration error in About modal (nested h2 tags)
- Hardcoded color classes replaced with theme CSS variables
- Storage migration for Tasbih presets (backward compatible)

### Technical
- Updated package name from "ramadhan-app" to "nawaetu"
- Improved translation system with 150+ new keys
- Enhanced component architecture with better separation of concerns

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Prayer times calculation
- Qibla direction finder
- Digital Quran reader with 114 surahs
- Daily missions system with gamification
- Tasbih counter with presets
- AI assistant (Tanya Ustadz)
- Multiple calculation methods
- Dark mode support
- Progressive Web App (PWA) capabilities
- Notification system for prayer times

---

[1.2.0]: https://github.com/hadianr/nawaetu/releases/tag/v1.2.0
[1.1.0]: https://github.com/hadianr/nawaetu/releases/tag/v1.1.0
[1.0.0]: https://github.com/hadianr/nawaetu/releases/tag/v1.0.0
