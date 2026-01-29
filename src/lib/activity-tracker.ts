import { useState, useEffect } from "react";
import { getDisplayStreak } from "./streak-utils";

// Activity Tracker - tracks user activities for mission validation
// Stores daily activity counts in localStorage

const STORAGE_KEY = "activity_tracker";

export interface ActivityData {
    date: string; // YYYY-MM-DD
    quranAyat: number; // Ayat read today
    tasbihCount: number; // Total tasbih today
    prayersLogged: string[]; // e.g. ['fajr', 'dhuhr', 'asr']
}

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getDefaultActivity(): ActivityData {
    return {
        date: getTodayString(),
        quranAyat: 0,
        tasbihCount: 0,
        prayersLogged: []
    };
}

export function getActivityData(): ActivityData {
    if (typeof window === "undefined") return getDefaultActivity();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultActivity();

    try {
        const data = JSON.parse(saved) as ActivityData;
        // Reset if it's a new day
        if (data.date !== getTodayString()) {
            return getDefaultActivity();
        }
        return data;
    } catch {
        return getDefaultActivity();
    }
}

function saveActivityData(data: ActivityData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("activity_updated"));
}

/**
 * Track Quran reading. Called from VerseList when user reads verses.
 */
export function trackQuranRead(ayatCount: number): void {
    const data = getActivityData();
    data.quranAyat += ayatCount;
    data.date = getTodayString();
    saveActivityData(data);
}

/**
 * Track Tasbih count. Called from TasbihCounter.
 */
export function trackTasbih(count: number): void {
    const data = getActivityData();
    data.tasbihCount += count;
    data.date = getTodayString();
    saveActivityData(data);
}

/**
 * Log a prayer as completed. 
 */
export function logPrayer(prayerName: string): void {
    const data = getActivityData();
    if (!data.prayersLogged.includes(prayerName)) {
        data.prayersLogged.push(prayerName);
    }
    data.date = getTodayString();
    saveActivityData(data);
}

/**
 * Check if a prayer has been logged today.
 */
export function isPrayerLogged(prayerName: string): boolean {
    const data = getActivityData();
    return data.prayersLogged.includes(prayerName);
}

/**
 * Get progress for a specific mission type.
 */
export function getMissionProgress(missionId: string): { current: number; required: number; isComplete: boolean } {
    const data = getActivityData();

    switch (missionId) {
        case 'quran_10_ayat':
            return { current: data.quranAyat, required: 10, isComplete: data.quranAyat >= 10 };
        case 'tasbih_99':
            return { current: data.tasbihCount, required: 99, isComplete: data.tasbihCount >= 99 };
        case 'tasbih_33':
            return { current: data.tasbihCount, required: 33, isComplete: data.tasbihCount >= 33 };
        default:
            return { current: 0, required: 0, isComplete: false };
    }
}

/**
 * Check if current time is after a specific prayer time.
 * prayerTimes should come from usePrayerTimes hook.
 */
export function isAfterPrayerTime(prayerName: string, prayerTimes: Record<string, string> | null): boolean {
    if (!prayerTimes) return false;

    const now = new Date();
    const timeStr = prayerTimes[prayerName];
    if (!timeStr) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);

    return now >= prayerTime;
}

/**
 * Check if today is a specific day (0=Sunday, 1=Monday, etc.)
 */
export function isTodayDay(allowedDays: number[]): boolean {
    const today = new Date().getDay();
    return allowedDays.includes(today);
}

// React Hooks for UI Components

export function useUserActivity() {
    const [stats, setStats] = useState({
        streakDays: 0,
        todayAyat: 0,
        todayTasbih: 0,
        prayersLogged: [] as string[]
    });

    useEffect(() => {
        const load = () => {
            const streak = getDisplayStreak();
            const activity = getActivityData();
            setStats({
                streakDays: streak.streak,
                todayAyat: activity.quranAyat,
                todayTasbih: activity.tasbihCount,
                prayersLogged: activity.prayersLogged
            });
        };
        load();

        const handleUpdate = () => load();
        window.addEventListener("activity_updated", handleUpdate);
        window.addEventListener("streak_updated", handleUpdate);
        return () => {
            window.removeEventListener("activity_updated", handleUpdate);
            window.removeEventListener("streak_updated", handleUpdate);
        };
    }, []);

    return { stats };
}

export function useUserProfile() {
    const [profile, setProfile] = useState({
        name: "Hamba Allah",
        title: "Hamba Allah"
    });

    useEffect(() => {
        const load = () => {
            // Safe check for window
            if (typeof window !== 'undefined') {
                const name = localStorage.getItem("user_name");
                const title = localStorage.getItem("user_title");
                if (name || title) {
                    setProfile({
                        name: name || "Hamba Allah",
                        title: title || "Hamba Allah"
                    });
                }
            }
        };
        load();
    }, []);

    return { profile };
}
