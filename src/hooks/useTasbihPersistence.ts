import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

type TasbihState = {
    count: number;
    target: number | null;
    activeZikirId: string;
    dailyCount: number;
    streak: number;
    lastZikirDate: string;
};

type UseTasbihPersistenceOptions = {
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

export function useTasbihPersistence(options: UseTasbihPersistenceOptions) {
    const { defaultActiveId, validActiveIds, defaultTarget = 33 } = options;
    const [state, setState] = useState<TasbihState>({
        count: 0,
        target: defaultTarget,
        activeZikirId: defaultActiveId,
        dailyCount: 0,
        streak: 0,
        lastZikirDate: ""
    });
    const [hasHydrated, setHasHydrated] = useState(false);
    const hasInitializedRef = useRef(false);

    const persistPartial = useCallback((partial: Partial<TasbihState>) => {
        if (typeof window === "undefined") return;
        if (partial.count !== undefined && !isNaN(partial.count)) {
            safeSetItem(STORAGE_KEYS.TASBIH_COUNT, partial.count.toString());
        }
        if (partial.target !== undefined && (partial.target === null || !isNaN(partial.target))) {
            safeSetItem(STORAGE_KEYS.TASBIH_TARGET, partial.target ? partial.target.toString() : "inf");
        }
        if (partial.activeZikirId !== undefined) {
            safeSetItem(STORAGE_KEYS.TASBIH_ACTIVE_PRESET, partial.activeZikirId);
        }
        if (partial.dailyCount !== undefined && !isNaN(partial.dailyCount)) {
            safeSetItem(STORAGE_KEYS.TASBIH_DAILY_COUNT, partial.dailyCount.toString());
        }
        if (partial.streak !== undefined && !isNaN(partial.streak)) {
            safeSetItem(STORAGE_KEYS.TASBIH_STREAK, partial.streak.toString());
        }
        if (partial.lastZikirDate !== undefined) {
            safeSetItem(STORAGE_KEYS.TASBIH_LAST_DATE, partial.lastZikirDate);
        }
    }, []);

    const persistAll = useCallback((nextState: TasbihState) => {
        persistPartial(nextState);
    }, [persistPartial]);

    const updateState = useCallback((partial: Partial<TasbihState>) => {
        setState((prev) => ({ ...prev, ...partial }));
        persistPartial(partial);
    }, [persistPartial]);

    useEffect(() => {
        if (hasInitializedRef.current) return;
        if (typeof window === "undefined") return;
        const today = new Date().toISOString().split("T")[0];

        const keysToClean = [
            STORAGE_KEYS.TASBIH_COUNT,
            STORAGE_KEYS.TASBIH_TARGET,
            STORAGE_KEYS.TASBIH_DAILY_COUNT,
            STORAGE_KEYS.TASBIH_STREAK
        ];

        keysToClean.forEach((key) => {
            const val = localStorage.getItem(key);
            if (val && corruptedValues.has(val)) {
                safeRemoveItem(key);
            }
        });

        const savedCount = localStorage.getItem(STORAGE_KEYS.TASBIH_COUNT);
        const savedTarget = localStorage.getItem(STORAGE_KEYS.TASBIH_TARGET);
        const savedZikirId = localStorage.getItem(STORAGE_KEYS.TASBIH_ACTIVE_PRESET);
        const savedDaily = localStorage.getItem(STORAGE_KEYS.TASBIH_DAILY_COUNT);
        const savedStreak = localStorage.getItem(STORAGE_KEYS.TASBIH_STREAK);
        const savedDate = localStorage.getItem(STORAGE_KEYS.TASBIH_LAST_DATE);

        const resolvedActiveId = savedZikirId && validActiveIds.includes(savedZikirId)
            ? savedZikirId
            : defaultActiveId;

        let nextState: TasbihState = {
            count: parseNumber(savedCount, 0),
            target: parseTarget(savedTarget, defaultTarget),
            activeZikirId: resolvedActiveId,
            dailyCount: parseNumber(savedDaily, 0),
            streak: parseNumber(savedStreak, 0),
            lastZikirDate: savedDate || today
        };

        if (nextState.lastZikirDate && nextState.lastZikirDate !== today) {
            const last = new Date(nextState.lastZikirDate);
            const curr = new Date(today);
            const diffTime = Math.abs(curr.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            nextState = {
                ...nextState,
                dailyCount: 0,
                streak: diffDays > 1 ? 0 : nextState.streak,
                lastZikirDate: today
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
        if (!validActiveIds.includes(state.activeZikirId)) {
            updateState({ activeZikirId: defaultActiveId });
        }
    }, [defaultActiveId, hasHydrated, state.activeZikirId, updateState, validActiveIds]);

    return { state, updateState, hasHydrated };
}
