/**
 * Centralized Storage Keys
 * Type-safe storage keys to prevent typos and facilitate refactoring
 * 
 * Note: This is the single source of truth for all storage keys
 * Do not hardcode string keys in components/services
 */
export const STORAGE_KEYS = {
  // User Profile
  USER_NAME: 'user_name',
  USER_TITLE: 'user_title',
  USER_GENDER: 'user_gender',
  USER_AVATAR: 'user_avatar',
  USER_ARCHETYPE: 'user_archetype',

  // Activity Tracking
  ACTIVITY_TRACKER: 'activity_tracker',
  DAILY_ACTIVITY_HISTORY: 'daily_activity_history',

  // Streak & Gamification
  USER_STREAK: 'user_streak',
  USER_LEVEL: 'user_level',
  USER_XP: 'user_xp',

  // Missions
  COMPLETED_MISSIONS: 'completed_missions',

  // Quran
  QURAN_LAST_READ: 'quran_last_read',
  QURAN_BOOKMARKS: 'nawaetu_bookmarks',

  // Settings - General
  SETTINGS_LOCALE: 'settings_locale',
  SETTINGS_THEME: 'app_theme',

  // Settings - Audio
  SETTINGS_RECITER: 'settings_reciter',
  SETTINGS_MUADZIN: 'settings_muadzin',

  // Settings - Prayer
  SETTINGS_CALCULATION_METHOD: 'settings_calculation_method',

  // Prayer Times
  PRAYER_DATA: 'prayer_data',
  USER_LOCATION: 'user_location',
  ADHAN_PREFERENCES: 'adhan_preferences',

  // AI Chat
  AI_CHAT_HISTORY: 'ai_chat_history_v2',
  AI_USAGE: 'ai_usage_v1',

  // Dhikr (Tasbih)
  DHIKR_COUNT: 'tasbih_count',
  DHIKR_TARGET: 'tasbih_target',
  DHIKR_ACTIVE_PRESET: 'tasbih_active_preset',
  DHIKR_STREAK: 'tasbih_streak',
  DHIKR_LAST_DATE: 'tasbih_last_date',
  DHIKR_DAILY_COUNT: 'tasbih_daily_count',

  // Donation (Infaq)
  USER_TOTAL_DONATION: 'user_total_infaq',
  USER_DONATION_HISTORY: 'user_infaq_history',

  // Intention Journal
  INTENTION_JOURNAL: 'intention_journal',

  // UI State
  PWA_PROMPT_DISMISSED: 'pwa_prompt_dismissed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  APP_VERSION: 'app_version',
} as const;

// Type for storage keys
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Helper to validate storage key
export function isValidStorageKey(key: string): key is StorageKey {
  return Object.values(STORAGE_KEYS).includes(key as StorageKey);
}
