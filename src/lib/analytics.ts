'use client';

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
