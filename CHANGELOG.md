# Changelog

All notable changes to Nawaetu will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/yourusername/nawaetu/releases/tag/v1.1.0
[1.0.0]: https://github.com/yourusername/nawaetu/releases/tag/v1.0.0
