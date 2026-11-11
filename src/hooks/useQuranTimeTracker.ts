'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { addHasanah } from '@/lib/habits/leveling';
import { queueHasanahEvent } from '@/lib/sync/award';

const STORAGE_KEY = 'nawaetu_quran_time_buffer';
const SYNC_INTERVAL_MS = 30000; // 30 seconds

function getLocalDateString() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() - offset);
    return today.toISOString().split('T')[0];
}

interface QuranTimeTrackerResult {
    isTracking: boolean;
    sessionSeconds: number; // Seconds tracked in the current visible session
    dailyTotalSeconds: number; // Accumulated seconds for today across sessions
    isSyncing: boolean;
    startTracking: () => void;
    stopTracking: () => void;
}

export function useQuranTimeTracker(): QuranTimeTrackerResult {
    const { status } = useSession();
    
    // Always start as NOT tracking whenever the component mounts (strictly manual control)
    const [isTracking, setIsTracking] = useState<boolean>(false);
    
    const [sessionSeconds, setSessionSeconds] = useState<number>(0);
    const [dailyTotalSeconds, setDailyTotalSeconds] = useState<number>(0);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Refs for intervals to clear them on unmount
    const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Safety sync flag
    const isTrackingRef = useRef<boolean>(false);

    // Seconds counted since the last write to storage. Writing every second made two synchronous
    // localStorage writes per tick for the whole reading session; now they happen every few seconds.
    const dailyTotalRef = useRef<number>(0);
    const unsavedSecondsRef = useRef<number>(0);

    const flushLocal = useCallback(() => {
        const unsaved = unsavedSecondsRef.current;
        if (unsaved <= 0) return;
        unsavedSecondsRef.current = 0;
        const buffer = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
        localStorage.setItem(STORAGE_KEY, (buffer + unsaved).toString());
        localStorage.setItem(`nawaetu_quran_daily_total_${getLocalDateString()}`, dailyTotalRef.current.toString());
    }, []);

    // Fetch initial daily total on mount
    useEffect(() => {
        const dateString = getLocalDateString();
        const storedDaily = parseInt(localStorage.getItem(`nawaetu_quran_daily_total_${dateString}`) || '0', 10);
        dailyTotalRef.current = storedDaily;
        queueMicrotask(() => setDailyTotalSeconds(storedDaily));
        
        if (status === 'authenticated') {
            fetch('/api/quran/sync-time')
                .then(res => res.json())
                .then(data => {
                    if (data.success && typeof data.totalTodaySeconds === 'number') {
                        const newValue = Math.max(dailyTotalRef.current, data.totalTodaySeconds);
                        dailyTotalRef.current = newValue;
                        localStorage.setItem(`nawaetu_quran_daily_total_${dateString}`, newValue.toString());
                        setDailyTotalSeconds(newValue);
                    }
                })
                .catch(err => console.error("Failed to fetch initial total time", err));
        }
    }, [status]);


    // Sync function
    const syncTimeToServer = useCallback(async () => {
        if (status !== 'authenticated') return;

        flushLocal(); // seconds still in memory belong in the buffer we are about to send
        const storedBuffer = localStorage.getItem(STORAGE_KEY);
        if (!storedBuffer) return;

        const bufferSeconds = parseInt(storedBuffer, 10);
        if (isNaN(bufferSeconds) || bufferSeconds <= 0) return;

        try {
            setIsSyncing(true);
            const response = await fetch('/api/quran/sync-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ additionalSeconds: bufferSeconds }),
            });

            if (response.ok) {
                const data = await response.json();
                
                const currentBuffer = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
                const newBuffer = Math.max(0, currentBuffer - bufferSeconds);
                
                if (newBuffer === 0) {
                     localStorage.removeItem(STORAGE_KEY);
                } else {
                     localStorage.setItem(STORAGE_KEY, newBuffer.toString());
                }
                
                if (data.totalTodaySeconds) {
                    const dateString = getLocalDateString();
                    const newValue = Math.max(dailyTotalRef.current, data.totalTodaySeconds);
                    dailyTotalRef.current = newValue;
                    localStorage.setItem(`nawaetu_quran_daily_total_${dateString}`, newValue.toString());
                    setDailyTotalSeconds(newValue);
                }
            }
        } catch (error) {
            console.error('Failed to sync Quran reading time:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [status, flushLocal]);

    // Manual controls
    const startTracking = useCallback(() => {
        setIsTracking(true);
        isTrackingRef.current = true;
    }, []);

    const stopTracking = useCallback(() => {
        if (isTrackingRef.current) {
            setIsTracking(false);
            isTrackingRef.current = false;
            setSessionSeconds(0); // Reset UI session counter
            syncTimeToServer(); // Flush strictly when stopped
        }
    }, [syncTimeToServer]);

    // Safety net: Visibility change & Unmount
    useEffect(() => {
        const handleVisibilityChange = () => {
            // If the user navigates to another app or minimizes the browser, 
            // the timer MUST stop strictly to prevent ghost tracking!
            if (document.visibilityState === 'hidden' && isTrackingRef.current) {
                stopTracking();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // If the component unmounts (e.g. moving to another Next.js page), stop tracking!
            stopTracking();
        };
    }, [stopTracking]);


    // Setup Time Tracking Interval
    useEffect(() => {
        if (isTracking) {
             trackingIntervalRef.current = setInterval(() => {
                // The screen updates every second; storage is written every 10 seconds and on stop.
                setSessionSeconds((prev) => prev + 1);

                dailyTotalRef.current += 1;
                unsavedSecondsRef.current += 1;
                setDailyTotalSeconds(dailyTotalRef.current);

                // Award Hasanah (1 point per minute), outside any state updater so it cannot run twice
                if (dailyTotalRef.current % 60 === 0) {
                    addHasanah(1);
                    queueHasanahEvent('quran_time', 'time', Math.floor(dailyTotalRef.current / 60));
                }

                if (unsavedSecondsRef.current >= 10) flushLocal();
             }, 1000);
        } else {
            if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
        }

        return () => {
            if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
            flushLocal();
        };
    }, [isTracking, flushLocal]);

    // Setup Background Sync Interval
    useEffect(() => {
        // Initial sync on mount if any left over time exists from previous unrecorded sessions
        queueMicrotask(syncTimeToServer);

        syncIntervalRef.current = setInterval(() => {
            syncTimeToServer();
        }, SYNC_INTERVAL_MS);

        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        };
    }, [syncTimeToServer]);

    return {
        isTracking,
        sessionSeconds,
        dailyTotalSeconds,
        isSyncing,
        startTracking,
        stopTracking
    };
}
