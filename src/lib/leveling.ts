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

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { incrementDailyActivity } from "@/lib/analytics-utils";

export const LEVEL_THRESHOLDS = [
    0,      // Level 1 starts at 0 XP
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
    xp: number;
    level: number;
    nextLevelXp: number;
    progress: number; // 0-100 percentage
    rankKey: RankKey;
}

export function getPlayerStats(): PlayerStats {
    if (typeof window === "undefined") {
        return { xp: 0, level: 1, nextLevelXp: 100, progress: 0, rankKey: 'mubtadi' };
    }

    const storage = getStorageService();
    let currentXP = parseInt((storage.getOptional(STORAGE_KEYS.USER_XP) as string) || "0");
    if (isNaN(currentXP)) currentXP = 0;

    // Calculate Level
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (currentXP >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    const currentLevelBase = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextLevelBase = LEVEL_THRESHOLDS[level] || (currentLevelBase + 1000);

    const xpInLevel = currentXP - currentLevelBase;
    const xpNeeded = nextLevelBase - currentLevelBase;

    // Progress %
    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

    return {
        xp: currentXP,
        level,
        nextLevelXp: nextLevelBase,
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

export function addXP(amount: number, dateStr?: string) {
    if (typeof window === "undefined") return;

    const storage = getStorageService();
    let currentXP = parseInt((storage.getOptional(STORAGE_KEYS.USER_XP) as string) || "0");
    if (isNaN(currentXP)) currentXP = 0;

    const newXP = currentXP + amount;

    storage.set(STORAGE_KEYS.USER_XP, newXP.toString());

    // Record activity for stats
    incrementDailyActivity('xpGained', amount, dateStr);

    // Dispatch events to update UI
    window.dispatchEvent(new Event("xp_updated"));
    window.dispatchEvent(new Event("storage"));
}
