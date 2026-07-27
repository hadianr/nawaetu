/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

export const APP_EVENTS = {
    MISSION_UPDATED: 'mission_updated',
    HASANAH_UPDATED: 'hasanah_updated',
    PROFILE_UPDATED: 'profile_updated',
    STORAGE_UPDATED: 'storage',
} as const;

export type AppEvent = typeof APP_EVENTS[keyof typeof APP_EVENTS];
