# Changelog

All notable changes to Nawaetu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
