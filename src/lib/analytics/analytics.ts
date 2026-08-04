'use client';

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

// Non-blocking event dispatch helper using browser idle callback for maximum performance
export const sendGAEvent = (eventName: string, params?: Record<string, string | number | boolean>) => {
    if (typeof window === 'undefined') return;

    const dispatch = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', eventName, params);
        } else {
            (window as any).dataLayer.push(['event', eventName, params]);
        }
    };

    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(dispatch, { timeout: 2000 });
    } else {
        setTimeout(dispatch, 0);
    }
};

// Standardized Feature Tracking Functions

/**
 * Track when user reads a specific Surah
 */
export const trackQuranRead = (surahName: string, ayahCount?: number) => {
    sendGAEvent('quran_read', {
        surah_name: surahName,
        ayah_count: ayahCount || 0
    });
};

/**
 * Debounced Dhikr tracker to prevent high-frequency tap lag
 */
let dhikrDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingDhikrCounts: Record<string, number> = {};

export const trackDhikrSession = (dhikrId: string, addedCount: number = 1) => {
    pendingDhikrCounts[dhikrId] = (pendingDhikrCounts[dhikrId] || 0) + addedCount;

    if (dhikrDebounceTimer) {
        clearTimeout(dhikrDebounceTimer);
    }

    dhikrDebounceTimer = setTimeout(() => {
        for (const [id, count] of Object.entries(pendingDhikrCounts)) {
            sendGAEvent('dhikr_completed', {
                dhikr_id: id,
                count
            });
        }
        pendingDhikrCounts = {};
        dhikrDebounceTimer = null;
    }, 1500);
};

/**
 * Track Prayer Check-ins
 */
export const trackPrayerCheckIn = (prayerName: string) => {
    sendGAEvent('prayer_check_in', {
        prayer_name: prayerName,
        timestamp: new Date().toISOString()
    });
};

/**
 * Track Daily Missions
 */
export const trackMissionComplete = (missionId: string, missionTitle: string) => {
    sendGAEvent('mission_completed', {
        mission_id: missionId,
        mission_title: missionTitle
    });
};

/**
 * Track Dua & Dzikir views
 */
export const trackDuaView = (duaTitle: string, category?: string) => {
    sendGAEvent('dua_view', {
        dua_title: duaTitle,
        category: category || 'general'
    });
};

/**
 * Track Hadith searches and views
 */
export const trackHadithSearch = (query: string, bookSlug?: string) => {
    sendGAEvent('hadith_search', {
        search_query: query.substring(0, 50),
        book_slug: bookSlug || 'all'
    });
};

/**
 * Track Journal & Intention entries
 */
export const trackJournalAction = (action: 'create' | 'edit' | 'delete') => {
    sendGAEvent('journal_action', {
        action_type: action
    });
};

/**
 * Track Ramadhan features (Imsakiyah, Fasting, Khataman, Taraweh)
 */
export const trackRamadhanActivity = (activityName: string) => {
    sendGAEvent('ramadhan_activity', {
        activity_name: activityName
    });
};

/**
 * Track Hasanah earned
 */
export const trackHasanahGained = (amount: number, source?: string) => {
    sendGAEvent('hasanah_gained', {
        amount,
        source: source || 'general'
    });
};

/**
 * Track when user asks Asisten Muslim AI
 */
export const trackAIQuery = (category?: string) => {
    sendGAEvent('ai_query', {
        category: category || 'general',
        timestamp: new Date().toISOString()
    });
};

/**
 * Track when user uses Kiblat feature
 */
export const trackKiblatView = () => {
    sendGAEvent('kiblat_view', {
        timestamp: new Date().toISOString()
    });
};

/**
 * Track general feature usage
 */
export const trackFeatureUse = (featureName: string) => {
    sendGAEvent('feature_use', {
        feature_name: featureName
    });
};

/**
 * Track client-side app errors
 */
export const trackAppError = (errorName: string, errorMessage: string) => {
    sendGAEvent('app_error', {
        error_name: errorName,
        error_message: errorMessage.substring(0, 100),
    });
};
