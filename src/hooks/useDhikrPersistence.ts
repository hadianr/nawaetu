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

import { useCallback, useEffect, useRef, useState } from "react";

export const STORAGE_KEYS = {
    // ...existing...
    DHIKR_COUNT: "nawaetu_dhikr_count",
    DHIKR_TARGET: "nawaetu_dhikr_target",
    DHIKR_ACTIVE_PRESET: "nawaetu_dhikr_active_preset",
    DHIKR_DAILY_COUNT: "nawaetu_dhikr_daily_count",
    DHIKR_STREAK: "nawaetu_dhikr_streak",
    DHIKR_LAST_DATE: "nawaetu_dhikr_last_date",
    DHIKR_SEQUENCE_ID: "nawaetu_dhikr_sequence_id",
    DHIKR_SEQUENCE_INDEX: "nawaetu_dhikr_sequence_index",
    DHIKR_CUSTOM_PRESETS: "nawaetu_dhikr_custom_presets",
    DHIKR_LIFETIME_COUNT: "nawaetu_dhikr_lifetime_count",
    DHIKR_HISTORY: "nawaetu_dhikr_history",
};


export type DhikrPreset = {
    id: string;
    label: string;
    arab: string;
    latin: string;
    tadabbur: string;
    target: number;
};

type DhikrState = {
    count: number;
    target: number | null;
    activeDhikrId: string;
    dailyCount: number;
    streak: number;
    lastDhikrDate: string;
    activeSequenceId: string | null;
    sequenceIndex: number;
    customPresets: DhikrPreset[];
    lifetimeCount: number;
    dhikrHistory: Record<string, number>;
};

type UseDhikrPersistenceOptions = {
    defaultActiveId: string;
    validActiveIds: string[];
    defaultTarget?: number | null;
};

const corruptedValues = new Set(["NaN", "null", ""]);

const parseNumber = (value: string | null, fallback: number) => {
    const parsed = value ? parseInt(value, 10) : NaN;
    return !isNaN(parsed) ? parsed : fallback;
};

const parseTarget = (value: string | null, fallback: number | null) => {
    if (value === "inf") return null;
    const parsed = value ? parseInt(value, 10) : NaN;
    return !isNaN(parsed) ? parsed : fallback;
};

const safeSetItem = (key: string, value: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
};

const safeRemoveItem = (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
};

export function useDhikrPersistence(options: UseDhikrPersistenceOptions) {
    const { defaultActiveId, validActiveIds, defaultTarget = 33 } = options;
    const [state, setState] = useState<DhikrState>({
        count: 0,
        target: defaultTarget,
        activeDhikrId: defaultActiveId,
        dailyCount: 0,
        streak: 0,
        lastDhikrDate: "",
        activeSequenceId: null,
        sequenceIndex: 0,
        customPresets: [],
        lifetimeCount: 0,
        dhikrHistory: {}
    });
    const [hasHydrated, setHasHydrated] = useState(false);
    const hasInitializedRef = useRef(false);

    const persistPartial = useCallback((partial: Partial<DhikrState>) => {
        if (typeof window === "undefined") return;
        if (partial.count !== undefined && !isNaN(partial.count)) {
            safeSetItem(STORAGE_KEYS.DHIKR_COUNT, partial.count.toString());
        }
        if (partial.target !== undefined && (partial.target === null || !isNaN(partial.target))) {
            safeSetItem(STORAGE_KEYS.DHIKR_TARGET, partial.target ? partial.target.toString() : "inf");
        }
        if (partial.activeDhikrId !== undefined) {
            safeSetItem(STORAGE_KEYS.DHIKR_ACTIVE_PRESET, partial.activeDhikrId);
        }
        if (partial.dailyCount !== undefined && !isNaN(partial.dailyCount)) {
            safeSetItem(STORAGE_KEYS.DHIKR_DAILY_COUNT, partial.dailyCount.toString());
        }
        if (partial.streak !== undefined && !isNaN(partial.streak)) {
            safeSetItem(STORAGE_KEYS.DHIKR_STREAK, partial.streak.toString());
        }
        if (partial.lastDhikrDate !== undefined) {
            safeSetItem(STORAGE_KEYS.DHIKR_LAST_DATE, partial.lastDhikrDate);
        }
        if (partial.activeSequenceId !== undefined) {
            if (partial.activeSequenceId === null) {
                safeRemoveItem(STORAGE_KEYS.DHIKR_SEQUENCE_ID);
            } else {
                safeSetItem(STORAGE_KEYS.DHIKR_SEQUENCE_ID, partial.activeSequenceId);
            }
        }
        if (partial.sequenceIndex !== undefined && !isNaN(partial.sequenceIndex)) {
            safeSetItem(STORAGE_KEYS.DHIKR_SEQUENCE_INDEX, partial.sequenceIndex.toString());
        }
        if (partial.customPresets !== undefined) {
            safeSetItem(STORAGE_KEYS.DHIKR_CUSTOM_PRESETS, JSON.stringify(partial.customPresets));
        }
        if (partial.lifetimeCount !== undefined && !isNaN(partial.lifetimeCount)) {
            safeSetItem(STORAGE_KEYS.DHIKR_LIFETIME_COUNT, partial.lifetimeCount.toString());
        }
        if (partial.dhikrHistory !== undefined) {
            safeSetItem(STORAGE_KEYS.DHIKR_HISTORY, JSON.stringify(partial.dhikrHistory));
        }
    }, []);

    const persistAll = useCallback((nextState: DhikrState) => {
        persistPartial(nextState);
    }, [persistPartial]);

    const updateState = useCallback((partial: Partial<DhikrState>) => {
        setState((prev) => ({ ...prev, ...partial }));
        persistPartial(partial);
    }, [persistPartial]);

    useEffect(() => {
        if (hasInitializedRef.current) return;
        if (typeof window === "undefined") return;
        const today = new Date().toISOString().split("T")[0];

        const keysToClean = [
            STORAGE_KEYS.DHIKR_COUNT,
            STORAGE_KEYS.DHIKR_TARGET,
            STORAGE_KEYS.DHIKR_DAILY_COUNT,
            STORAGE_KEYS.DHIKR_STREAK,
            STORAGE_KEYS.DHIKR_SEQUENCE_INDEX
        ];

        keysToClean.forEach((key) => {
            const val = localStorage.getItem(key);
            if (val && corruptedValues.has(val)) {
                safeRemoveItem(key);
            }
        });

        const savedCount = localStorage.getItem(STORAGE_KEYS.DHIKR_COUNT);
        const savedTarget = localStorage.getItem(STORAGE_KEYS.DHIKR_TARGET);
        const savedDhikrId = localStorage.getItem(STORAGE_KEYS.DHIKR_ACTIVE_PRESET);
        const savedDaily = localStorage.getItem(STORAGE_KEYS.DHIKR_DAILY_COUNT);
        const savedStreak = localStorage.getItem(STORAGE_KEYS.DHIKR_STREAK);
        const savedDate = localStorage.getItem(STORAGE_KEYS.DHIKR_LAST_DATE);
        const savedSequenceId = localStorage.getItem(STORAGE_KEYS.DHIKR_SEQUENCE_ID);
        const savedSequenceIndex = localStorage.getItem(STORAGE_KEYS.DHIKR_SEQUENCE_INDEX);
        const savedCustomPresetsString = localStorage.getItem(STORAGE_KEYS.DHIKR_CUSTOM_PRESETS);
        const savedLifetimeCount = localStorage.getItem(STORAGE_KEYS.DHIKR_LIFETIME_COUNT);
        const savedDhikrHistoryString = localStorage.getItem(STORAGE_KEYS.DHIKR_HISTORY);

        let parsedCustomPresets: DhikrPreset[] = [];
        try {
            if (savedCustomPresetsString) {
                parsedCustomPresets = JSON.parse(savedCustomPresetsString);
            }
        } catch (e) {
            console.error("Failed to parse custom presets", e);
        }

        let parsedDhikrHistory: Record<string, number> = {};
        try {
            if (savedDhikrHistoryString) {
                parsedDhikrHistory = JSON.parse(savedDhikrHistoryString);
            }
        } catch (e) {
            console.error("Failed to parse dhikr history", e);
        }

        const resolvedActiveId = savedDhikrId && (validActiveIds.includes(savedDhikrId) || parsedCustomPresets.some(p => p.id === savedDhikrId))
            ? savedDhikrId
            : defaultActiveId;

        let nextState: DhikrState = {
            count: parseNumber(savedCount, 0),
            target: parseTarget(savedTarget, defaultTarget),
            activeDhikrId: resolvedActiveId,
            dailyCount: parseNumber(savedDaily, 0),
            streak: parseNumber(savedStreak, 0),
            lastDhikrDate: savedDate || today,
            activeSequenceId: savedSequenceId,
            sequenceIndex: parseNumber(savedSequenceIndex, 0),
            customPresets: parsedCustomPresets,
            lifetimeCount: parseNumber(savedLifetimeCount, 0),
            dhikrHistory: parsedDhikrHistory
        };

        if (nextState.lastDhikrDate && nextState.lastDhikrDate !== today) {
            const last = new Date(nextState.lastDhikrDate);
            const curr = new Date(today);
            const diffTime = Math.abs(curr.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            nextState = {
                ...nextState,
                dailyCount: 0,
                streak: diffDays > 1 ? 0 : nextState.streak,
                lastDhikrDate: today
            };
        }

        setState(nextState);
        setHasHydrated(true);
        hasInitializedRef.current = true;
    }, [defaultActiveId, defaultTarget, validActiveIds]);

    useEffect(() => {
        if (!hasHydrated) return;
        if (typeof window === "undefined") return;
        const handleBeforeUnload = () => {
            if (!hasHydrated) return;
            persistAll(state);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasHydrated, persistAll, state]);

    useEffect(() => {
        if (!hasHydrated) return;
        if (!validActiveIds.includes(state.activeDhikrId) && !state.customPresets.some(p => p.id === state.activeDhikrId)) {
            updateState({ activeDhikrId: defaultActiveId });
        }
    }, [defaultActiveId, hasHydrated, state.activeDhikrId, state.customPresets, updateState, validActiveIds]);

    const addCustomPreset = useCallback((preset: Omit<DhikrPreset, 'id'>) => {
        const newPreset: DhikrPreset = {
            ...preset,
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        };
        updateState({
            customPresets: [...state.customPresets, newPreset]
        });
        return newPreset;
    }, [state.customPresets, updateState]);

    const removeCustomPreset = useCallback((id: string) => {
        const newPresets = state.customPresets.filter(p => p.id !== id);
        updateState({
            customPresets: newPresets,
            activeDhikrId: state.activeDhikrId === id ? defaultActiveId : state.activeDhikrId
        });
    }, [state.customPresets, state.activeDhikrId, updateState, defaultActiveId]);

    return { state, updateState, hasHydrated, addCustomPreset, removeCustomPreset };
}
