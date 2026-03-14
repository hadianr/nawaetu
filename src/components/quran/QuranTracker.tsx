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

import { useEffect } from "react";
import { trackQuranRead } from "@/lib/analytics";
import { useQuranTimeTracker } from "@/hooks/useQuranTimeTracker";
import { BookOpen, Check } from "lucide-react";

interface QuranTrackerProps {
    name: string;
    count: number;
}

export default function QuranTracker({ name, count }: QuranTrackerProps) {
    const { isTracking, dailyTotalSeconds, startTracking, stopTracking } = useQuranTimeTracker();

    useEffect(() => {
        trackQuranRead(name, count);
    }, [name, count]);

    // Format seconds to mm:ss or hh:mm:ss if it's long
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (totalSeconds === 0) return "00m 00s"; 
        
        if (hours > 0) {
            return `${hours}j ${minutes}m ${seconds}s`;
        }
        return `${minutes}m ${seconds}s`;
    };

    const timeString = formatTime(dailyTotalSeconds);

    return (
        <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-top-4">
            {isTracking ? (
                <button
                    onClick={stopTracking}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-md rounded-full border border-emerald-400/50 text-sm font-medium text-white shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                >
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </div>
                    Selesai Baca 
                    <span className="opacity-80 ml-1 font-mono text-xs hidden sm:inline-block">({timeString})</span>
                </button>
            ) : (
                <button
                    onClick={startTracking}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d]/80 hover:bg-[#1a1a1a]/90 backdrop-blur-md rounded-full border border-emerald-500/30 text-sm font-medium text-emerald-400 shadow-lg shadow-black/40 transition-all hover:scale-105"
                >
                    <BookOpen className="w-4 h-4" />
                    Mulai Tilawah
                    {dailyTotalSeconds > 0 && (
                        <span className="opacity-60 ml-1 font-mono text-xs hidden sm:inline-block">({timeString})</span>
                    )}
                </button>
            )}
            
            {/* Soft indicator of total time underneath when active on mobile, or just extra info */}
            {isTracking && (
                <div className="sm:hidden px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/10 text-[10px] text-emerald-200/70">
                    Sesi hari ini: {timeString}
                </div>
            )}
        </div>
    );
}
