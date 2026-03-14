'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const FOCUS_MODE_KEY = 'nawaetu_focus_mode';

export interface FocusMode {
    isFocusMode: boolean;
    isLightTheme: boolean;
    enterFocusMode: () => Promise<void>;
    exitFocusMode: () => void;
}

export function useFocusMode(isLightTheme: boolean): FocusMode {
    const [isFocusMode, setIsFocusMode] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    // Release wake lock and exit fullscreen on unmount
    useEffect(() => {
        return () => {
            exitFocusMode();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-acquire wake lock when page becomes visible again (wake lock is released on minimize)
    useEffect(() => {
        const handleVisibility = async () => {
            if (document.visibilityState === 'visible' && isFocusMode && !wakeLockRef.current) {
                try {
                    wakeLockRef.current = await navigator.wakeLock?.request('screen');
                } catch {/* silently ignore */}
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isFocusMode]);

    const enterFocusMode = useCallback(async () => {
        // 1. Fullscreen
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch {/* some browsers block unless triggered by gesture */}

        // 2. Screen Wake Lock
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
        } catch {/* not supported or denied */}

        // 3. Set focus flag (read by firebase SW via BroadcastChannel)
        localStorage.setItem(FOCUS_MODE_KEY, 'true');
        try {
            const bc = new BroadcastChannel('nawaetu_focus');
            bc.postMessage({ type: 'FOCUS_MODE_ENTER' });
            bc.close();
        } catch {/* BroadcastChannel not supported */}

        // 4. Hide bottom navigation
        document.body.setAttribute('data-focus-mode', 'true');

        setIsFocusMode(true);
    }, []);

    const exitFocusMode = useCallback(() => {
        // 1. Exit fullscreen
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        } catch {/* ignore */}

        // 2. Release wake lock
        if (wakeLockRef.current) {
            wakeLockRef.current.release().catch(() => {});
            wakeLockRef.current = null;
        }

        // 3. Clear flag
        localStorage.removeItem(FOCUS_MODE_KEY);
        try {
            const bc = new BroadcastChannel('nawaetu_focus');
            bc.postMessage({ type: 'FOCUS_MODE_EXIT' });
            bc.close();
        } catch {/* ignore */}

        // 4. Restore bottom navigation
        document.body.removeAttribute('data-focus-mode');

        setIsFocusMode(false);
    }, []);

    return { isFocusMode, isLightTheme, enterFocusMode, exitFocusMode };
}
