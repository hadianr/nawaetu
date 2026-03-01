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

import { useState, useEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getFeatureVisibility, DEFAULT_PRESET } from "@/data/feature-presets";
import type { ArchetypePreset, FeatureVisibility } from "@/data/feature-presets";

export interface UseFeaturePresetReturn extends FeatureVisibility {
    preset: ArchetypePreset;
    isLoaded: boolean;
}

/**
 * Hook untuk membaca feature visibility berdasarkan archetype preset user.
 *
 * Priority order (DB-first via cache):
 * 1. USER_FEATURE_PRESET (cache dari DB saat login)
 * 2. USER_ARCHETYPE (fallback dari onboarding lokal)
 * 3. DEFAULT_PRESET ("lengkap") — jika belum pernah di-set
 *
 * Untuk guest: hanya localStorage.
 * Untuk authenticated: preset disync dari DB oleh GuestSyncManager/DataSyncer.
 */
export function useFeaturePreset(): UseFeaturePresetReturn {
    const [result, setResult] = useState<UseFeaturePresetReturn>({
        preset: DEFAULT_PRESET,
        isLoaded: false,
        ...getFeatureVisibility(DEFAULT_PRESET),
    });

    useEffect(() => {
        // Initial sync on mount
        const currentData = readFromStorage();
        setResult(currentData);

        // Listen perubahan: setelah onboarding selesai, setelah sync dari DB
        const handleUpdate = () => setResult(readFromStorage());
        window.addEventListener("storage", handleUpdate);
        window.addEventListener("profile_updated", handleUpdate);

        return () => {
            window.removeEventListener("storage", handleUpdate);
            window.removeEventListener("profile_updated", handleUpdate);
        };
    }, []);

    return result;
}

function readFromStorage(): UseFeaturePresetReturn {
    const storage = getStorageService();

    // Prioritas 1: cache dari DB (diisi oleh DataSyncer/GuestSyncManager saat login)
    const cachedPreset = storage.getOptional<string>(STORAGE_KEYS.USER_FEATURE_PRESET as any);

    // Prioritas 2: archetype dari onboarding lokal
    const localArchetype = storage.getOptional<string>(STORAGE_KEYS.USER_ARCHETYPE as any);

    const activePreset = (cachedPreset || localArchetype || DEFAULT_PRESET) as ArchetypePreset;
    const visibility = getFeatureVisibility(activePreset);

    return {
        preset: activePreset,
        isLoaded: true,
        ...visibility,
    };
}
