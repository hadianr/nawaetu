# Changelog

All notable changes to Nawaetu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
