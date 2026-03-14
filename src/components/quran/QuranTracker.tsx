"use client";

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

import { useEffect, useState } from "react";
import { trackQuranRead } from "@/lib/analytics";
import { useQuranTimeTracker } from "@/hooks/useQuranTimeTracker";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useTheme } from "@/context/ThemeContext";
import { BookOpen } from "lucide-react";
import {
    QuranNiyyahScreen,
    QuranFocusBadge,
    QuranFocusExitConfirm,
    FocusModeThemeIndicator,
} from "@/components/quran/QuranFocusOverlay";
import { cn } from "@/lib/utils";

interface QuranTrackerProps {
    name: string;
    count: number;
}

export default function QuranTracker({ name, count }: QuranTrackerProps) {
    const { currentTheme } = useTheme();
    const isLight = currentTheme === "daylight";

    const { isTracking, sessionSeconds, dailyTotalSeconds, startTracking, stopTracking } =
        useQuranTimeTracker();
    const { isFocusMode, enterFocusMode, exitFocusMode } = useFocusMode(isLight);

    // Niyyah screen state (shown before timer starts)
    const [showNiyyah, setShowNiyyah] = useState(false);
    // Exit confirmation dialog
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        trackQuranRead(name, count);
    }, [name, count]);

    /** Format time for the "Mulai Tilawah" button subtext */
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (totalSeconds === 0) return "00m 00s";
        if (hours > 0) return `${hours}j ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    };

    /** Called when user taps "Mulai Tilawah" → show Niyyah screen first */
    const handleStartRequest = () => {
        setShowNiyyah(true);
    };

    /** Called when user taps "Bismillah, Mulai" in Niyyah screen */
    const handleNiyyahConfirm = async () => {
        setShowNiyyah(false);
        startTracking();
        await enterFocusMode();
    };

    /** Called when user taps ✕ in FocusBadge → show exit confirmation */
    const handleExitRequest = () => {
        setShowExitConfirm(true);
    };

    /** Confirmed exit from focus mode */
    const handleExitConfirm = () => {
        setShowExitConfirm(false);
        stopTracking();
        exitFocusMode();
    };

    const timeString = formatTime(dailyTotalSeconds);

    return (
        <>
            {/* === Niyyah Entry Screen (before timer) === */}
            {showNiyyah && (
                <QuranNiyyahScreen
                    onConfirm={handleNiyyahConfirm}
                    onCancel={() => setShowNiyyah(false)}
                />
            )}

            {/* === Active Focus Mode Overlay === */}
            {isFocusMode && isTracking && (
                <>
                    <FocusModeThemeIndicator />
                    <QuranFocusBadge
                        sessionSeconds={sessionSeconds}
                        onExit={handleExitRequest}
                    />
                </>
            )}

            {/* === Exit Confirmation === */}
            {showExitConfirm && (
                <QuranFocusExitConfirm
                    sessionSeconds={sessionSeconds}
                    onConfirm={handleExitConfirm}
                    onCancel={() => setShowExitConfirm(false)}
                />
            )}

            {/* === Floating Control Button === */}
            {/* Hidden when focus badge is shown to keep UI clean */}
            {!isFocusMode && (
                <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-top-4">
                    {isTracking ? (
                        <button
                            onClick={handleExitRequest}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium shadow-lg transition-all hover:scale-105",
                                isLight
                                    ? "bg-amber-500/90 hover:bg-amber-600 border-amber-400/50 text-white shadow-amber-200/40 backdrop-blur-md"
                                    : "bg-emerald-600/90 hover:bg-emerald-600 border-emerald-400/50 text-white shadow-emerald-900/20 backdrop-blur-md"
                            )}
                        >
                            <div className="relative flex h-2 w-2">
                                <span className={cn(
                                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                    isLight ? "bg-amber-200" : "bg-emerald-200"
                                )} />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                            </div>
                            Selesai Baca
                            <span className="opacity-80 ml-1 font-mono text-xs hidden sm:inline-block">
                                ({timeString})
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStartRequest}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium shadow-lg transition-all hover:scale-105 backdrop-blur-md",
                                isLight
                                    ? "bg-white/80 hover:bg-amber-50 border-amber-400/30 text-amber-700 shadow-amber-100/40"
                                    : "bg-[#0d0d0d]/80 hover:bg-[#1a1a1a]/90 border-emerald-500/30 text-emerald-400 shadow-black/40"
                            )}
                        >
                            <BookOpen className="w-4 h-4" />
                            Mulai Tilawah
                            {dailyTotalSeconds > 0 && (
                                <span className="opacity-60 ml-1 font-mono text-xs hidden sm:inline-block">
                                    ({timeString})
                                </span>
                            )}
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
