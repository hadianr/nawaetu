import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type SunnahKey = "dhuha" | "rawatibQabl" | "rawatibBad" | "witir" | "istikharah" | "hajat" | "taubat";

export interface DailyLogEntry {
    // Per-prayer location (true = masjid, false = rumah, null = not set)
    fajrAtMasjid: boolean | null;
    dhuhrAtMasjid: boolean | null;
    asrAtMasjid: boolean | null;
    maghribAtMasjid: boolean | null;
    ishaAtMasjid: boolean | null;
    // Sunnah checklist
    dhuha: boolean;
    rawatibQabl: boolean;
    rawatibBad: boolean;
    witir: boolean;
    istikharah: boolean;
    hajat: boolean;
    taubat: boolean;
}

const DEFAULT_ENTRY: DailyLogEntry = {
    fajrAtMasjid: null,
    dhuhrAtMasjid: null,
    asrAtMasjid: null,
    maghribAtMasjid: null,
    ishaAtMasjid: null,
    dhuha: false,
    rawatibQabl: false,
    rawatibBad: false,
    witir: false,
    istikharah: false,
    hajat: false,
    taubat: false,
};

type FullLog = Record<string | number, Record<string, DailyLogEntry>>;
export type DailyLogYearLog = Record<string, DailyLogEntry>;

function readFullLog(): FullLog {
    try {
        const storage = getStorageService();
        const raw = storage.getOptional<unknown>(STORAGE_KEYS.RAMADHAN_DAILY_LOG);
        if (!raw) return {};
        if (typeof raw === "string") { try { return JSON.parse(raw) as FullLog; } catch { return {}; } }
        if (typeof raw === "object") return raw as FullLog;
        return {};
    } catch { return {}; }
}

function writeFullLog(fullLog: FullLog): void {
    try {
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.RAMADHAN_DAILY_LOG, fullLog);
    } catch (e) {
        console.error("[useRamadhanDailyLog] write failed", e);
    }
}

export function useRamadhanDailyLog(hijriYear: number) {
    const { status } = useSession();
    const [log, setLog] = useState<DailyLogYearLog>({});

    // Load from localStorage
    useEffect(() => {
        if (!hijriYear) return;
        const fullLog = readFullLog();
        const yearData = (fullLog[hijriYear] || fullLog[String(hijriYear)] || {}) as DailyLogYearLog;
        queueMicrotask(() => setLog(yearData));
    }, [hijriYear]);

    // DB sync on mount
    useEffect(() => {
        if (status !== "authenticated" || !hijriYear) return;
        async function syncFromDb() {
            try {
                const res = await fetch(`/api/ramadhan/daily-log?year=${hijriYear}`);
                if (!res.ok) return;
                const { rows } = await res.json();
                if (!rows || !Array.isArray(rows)) return;

                setLog((prev) => {
                    const next = { ...prev };
                    let changed = false;
                    for (const row of rows) {
                        const key = `${row.hijriYear}-${row.hijriDay}`;
                        const entry: DailyLogEntry = {
                            fajrAtMasjid: row.fajrAtMasjid,
                            dhuhrAtMasjid: row.dhuhrAtMasjid,
                            asrAtMasjid: row.asrAtMasjid,
                            maghribAtMasjid: row.maghribAtMasjid,
                            ishaAtMasjid: row.ishaAtMasjid,
                            dhuha: Boolean(row.dhuha),
                            rawatibQabl: Boolean(row.rawatibQabl),
                            rawatibBad: Boolean(row.rawatibBad),
                            witir: Boolean(row.witir),
                            istikharah: Boolean(row.istikharah),
                            hajat: Boolean(row.hajat),
                            taubat: Boolean(row.taubat),
                        };
                        next[key] = entry;
                        changed = true;
                    }
                    if (changed) {
                        const fl = readFullLog();
                        fl[hijriYear] = next;
                        writeFullLog(fl);
                    }
                    return changed ? next : prev;
                });
            } catch (e) {
                console.error("[useRamadhanDailyLog] DB sync failed", e);
            }
        }
        syncFromDb();
    }, [status, hijriYear]);

    const updateDay = useCallback((day: number, updates: Partial<DailyLogEntry>) => {
        const key = `${hijriYear}-${day}`;

        const fullLog = readFullLog();
        const yearLog = (fullLog[hijriYear] || fullLog[String(hijriYear)] || {}) as DailyLogYearLog;
        const current = yearLog[key] || { ...DEFAULT_ENTRY };
        const finalEntry: DailyLogEntry = { ...current, ...updates };

        setLog((prev) => {
            const prevEntry = prev[key] || { ...DEFAULT_ENTRY };
            const next = { ...prev, [key]: { ...prevEntry, ...updates } };
            const latest = readFullLog();
            latest[hijriYear] = next;
            writeFullLog(latest);
            return next;
        });

        if (status === "authenticated") {
            fetch("/api/ramadhan/daily-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hijriYear, hijriDay: day, ...finalEntry }),
            }).catch(e => console.error("[useRamadhanDailyLog] POST failed", e));
        }
    }, [hijriYear, status]);

    return { log, updateDay };
}
