"use client";

import { useState, useEffect } from "react";

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

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { incrementDailyActivity } from "@/lib/analytics-utils";

export const LEVEL_THRESHOLDS = [
    0,      // Level 1 starts at 0 Hasanah
    100,    // Level 2
    300,    // Level 3
    600,    // Level 4
    1000,   // Level 5 (Unlock: Pencari Rahmat)
    1500,   // Level 6
    2100,   // Level 7
    2800,   // Level 8
    3600,   // Level 9
    4500,   // Level 10 (Unlock: Pejuang Subuh)
    // ... continues scaling
];

export type RankKey = 'mubtadi' | 'seeker' | 'warrior' | 'abid' | 'salik' | 'mukhlis' | 'muhsin';

export interface PlayerStats {
    hasanah: number;
    level: number;
    nextLevelHasanah: number;
    progress: number; // 0-100 percentage
    rankKey: RankKey;
}

export function getPlayerStats(): PlayerStats {
    if (typeof window === "undefined") {
        return { hasanah: 0, level: 1, nextLevelHasanah: 100, progress: 0, rankKey: 'mubtadi' };
    }

    const storage = getStorageService();
    let currentHasanah = parseInt((storage.getOptional(STORAGE_KEYS.USER_HASANAH) as string) || "0");
    if (isNaN(currentHasanah)) currentHasanah = 0;

    // Calculate Level
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (currentHasanah >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    const currentLevelBase = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelBase = LEVEL_THRESHOLDS[level] || (currentLevelBase + 1000);

    const hasanahInLevel = currentHasanah - currentLevelBase;
    const hasanahNeeded = nextLevelBase - currentLevelBase;

    // Progress %
    const progress = Math.min(100, Math.max(0, (hasanahInLevel / hasanahNeeded) * 100));

    return {
        hasanah: currentHasanah,
        level,
        nextLevelHasanah: nextLevelBase,
        progress,
        rankKey: getRankKey(level)
    };
}

export function getRankKey(level: number): RankKey {
    if (level >= 60) return 'muhsin';
    if (level >= 40) return 'mukhlis';
    if (level >= 25) return 'salik';
    if (level >= 15) return 'abid';
    if (level >= 10) return 'warrior';
    if (level >= 5) return 'seeker';
    return 'mubtadi';
}

export function addHasanah(amount: number, dateStr?: string) {
    if (typeof window === "undefined") return;

    const storage = getStorageService();
    let currentHasanah = parseInt((storage.getOptional(STORAGE_KEYS.USER_HASANAH) as string) || "0");
    if (isNaN(currentHasanah)) currentHasanah = 0;

    const newHasanah = currentHasanah + amount;

    storage.set(STORAGE_KEYS.USER_HASANAH, newHasanah.toString());

    // Record activity for stats
    incrementDailyActivity('hasanahGained', amount, dateStr);

    // Dispatch events to update UI
    window.dispatchEvent(new Event("hasanah_updated"));
    window.dispatchEvent(new Event("storage"));
}

export function usePlayerStats(): PlayerStats {
    const [stats, setStats] = useState<PlayerStats>(() => getPlayerStats());

    useEffect(() => {
        const handleUpdate = () => {
            setStats(getPlayerStats());
        };

        window.addEventListener("hasanah_updated", handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener("hasanah_updated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    return stats;
}
