/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  SETTINGS_HIJRI_ADJUSTMENT: 'settings_hijri_adjustment',

  // Prayer Times
  PRAYER_DATA: 'prayer_data',
  USER_LOCATION: 'user_location',
  ADHAN_PREFERENCES: 'adhan_preferences',

  // AI Chat
  AI_CHAT_SESSIONS: 'nawaetu_chat_sessions',
  AI_CHAT_HISTORY_OLD: 'nawaetu_chat_history',
  AI_CHAT_HISTORY: 'ai_chat_history_v2', // Keep for backward compatibility if needed by other parts
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
  LAST_SYNC_USER_ID: 'last_sync_user_id',
  IS_MUHSININ: 'is_muhsinin',

  // Ramadhan Hub (Seasonal)
  RAMADHAN_TARAWEH_LOG: 'nawaetu_ramadhan_taraweh_log',   // { "1447-09-01": 8, ... }
  RAMADHAN_KHATAMAN_LOG: 'nawaetu_ramadhan_khataman_log', // { currentJuz: 3, log: [...] }
  RAMADHAN_YEAR: 'nawaetu_ramadhan_year',                 // "1447" — for yearly reset
} as const;

// Type for storage keys
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Helper to validate storage key
export function isValidStorageKey(key: string): key is StorageKey {
  return Object.values(STORAGE_KEYS).includes(key as StorageKey);
}
