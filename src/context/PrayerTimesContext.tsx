"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

// Re-export the hook result type
type PrayerData = {
    hijriDate: string;
    gregorianDate: string;
    prayerTimes: Record<string, string>;
    nextPrayer: string;
    nextPrayerTime: string;
    locationName: string;
    isDefaultLocation?: boolean;
    hijriMonth?: string;
    hijriDay?: number;
};

interface PrayerTimesContextType {
    data: PrayerData | null;
    loading: boolean;
    error: string | null;
    refreshLocation: () => void;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

/**
 * Provider that creates a single shared instance of usePrayerTimes.
 * Wrap this around the app so all components share the same prayer data
 * without triggering separate geolocation/API calls.
 */
export function PrayerTimesProvider({ children }: { children: ReactNode }) {
    const prayerTimes = usePrayerTimes();

    return (
        <PrayerTimesContext.Provider value={prayerTimes}>
            {children}
        </PrayerTimesContext.Provider>
    );
}

/**
 * Hook to consume the shared prayer times context.
 * Use this instead of usePrayerTimes() in all components to avoid
 * redundant hook instances and duplicate API/geolocation calls.
 */
export function usePrayerTimesContext(): PrayerTimesContextType {
    const context = useContext(PrayerTimesContext);
    if (!context) {
        throw new Error("usePrayerTimesContext must be used within PrayerTimesProvider");
    }
    return context;
}
