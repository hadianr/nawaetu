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

// Helper to track custom events
export const sendGAEvent = (eventName: string, params?: Record<string, string | number | boolean>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
    }
};

// Standardized Tracking Functions

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
 * Track when user asks the Asisten Muslim AI
 */
export const trackAIQuery = () => {
    sendGAEvent('ai_query', {
        timestamp: new Date().toISOString()
    });
};

/**
 * Track when user uses the Kiblat feature
 */
export const trackKiblatView = () => {
    sendGAEvent('kiblat_view', {
        timestamp: new Date().toISOString()
    });
};

/**
 * Track general feature usage (e.g., missions, tasbih)
 */
export const trackFeatureUse = (featureName: string) => {
    sendGAEvent('feature_use', {
        feature_name: featureName
    });
};
