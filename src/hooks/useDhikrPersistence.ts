import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

type DhikrState = {
    count: number;
    target: number | null;
    activeDhikrId: string;
    dailyCount: number;
    streak: number;
    lastDhikrDate: string;
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
        lastDhikrDate: ""
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
            STORAGE_KEYS.DHIKR_STREAK
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

        const resolvedActiveId = savedDhikrId && validActiveIds.includes(savedDhikrId)
            ? savedDhikrId
            : defaultActiveId;

        let nextState: DhikrState = {
            count: parseNumber(savedCount, 0),
            target: parseTarget(savedTarget, defaultTarget),
            activeDhikrId: resolvedActiveId,
            dailyCount: parseNumber(savedDaily, 0),
            streak: parseNumber(savedStreak, 0),
            lastDhikrDate: savedDate || today
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
        if (!validActiveIds.includes(state.activeDhikrId)) {
            updateState({ activeDhikrId: defaultActiveId });
        }
    }, [defaultActiveId, hasHydrated, state.activeDhikrId, updateState, validActiveIds]);

    return { state, updateState, hasHydrated };
}
