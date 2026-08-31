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
import { incrementDailyActivity } from "@/lib/analytics/analytics-utils";
import { trackHasanahGained } from "@/lib/analytics/analytics";
import {
    PlayerStats,
    calculatePlayerStats,
} from "@/lib/habits/progression";

export { LEVEL_RULES_VERSION, LEVEL_THRESHOLDS, getRankKey } from "@/lib/habits/progression";
export type { PlayerStats, RankKey } from "@/lib/habits/progression";

export function getPlayerStats(): PlayerStats {
    if (typeof window === "undefined") {
        return calculatePlayerStats(0);
    }

    const storage = getStorageService();
    let currentHasanah = parseInt((storage.getOptional(STORAGE_KEYS.USER_HASANAH) as string) || "0");
    if (isNaN(currentHasanah)) currentHasanah = 0;

    return calculatePlayerStats(currentHasanah);
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
    trackHasanahGained(amount);

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
