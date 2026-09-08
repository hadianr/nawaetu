import { useState, useEffect, useCallback } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useSession } from "next-auth/react";

export type TarawehChoice = 8 | 20 | null;
export type TarawehLocation = "masjid" | "rumah" | null;

export interface TarawehEntry {
    choice: TarawehChoice;
    location: TarawehLocation;
    isQiyam: boolean;
}

// Full log shape: { [hijriYear]: { ["year-day"]: TarawehEntry } }
type FullLog = Record<string | number, Record<string, TarawehEntry>>;
export type TarawehYearLog = Record<string, TarawehEntry>;

/**
 * Normalise a choice value from any source (DB returns strings "8"/"20",
 * localStorage may have numbers 8/20 or strings).
 */
function normaliseChoice(raw: unknown): TarawehChoice {
    if (raw === null || raw === undefined) return null;
    const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (n === 8 || n === 20) return n;
    return null;
}

/**
 * Safely reads the full taraweh log from localStorage.
 * Handles both:
 * - New format: object stored directly (adapter auto-parses JSON)
 * - Legacy format: double-stringified (adapter returns string → needs one more JSON.parse)
 */
function readFullLog(): FullLog {
    try {
        const storage = getStorageService();
        const raw = storage.getOptional<unknown>(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG);
        if (!raw) return {};
        if (typeof raw === "string") {
            try { return JSON.parse(raw) as FullLog; } catch { return {}; }
        }
        if (typeof raw === "object") return raw as FullLog;
        return {};
    } catch {
        return {};
    }
}

function writeFullLog(fullLog: FullLog): void {
    try {
        const storage = getStorageService();
        storage.set(STORAGE_KEYS.RAMADHAN_TARAWEH_LOG, fullLog);
    } catch (e) {
        console.error("[useTarawehTracker] Failed to write to localStorage", e);
    }
}

function migrateYearData(yearData: Record<string, unknown>): TarawehYearLog {
    const migrated: TarawehYearLog = {};
    for (const [key, val] of Object.entries(yearData)) {
        if (val === null || typeof val === "number" || typeof val === "string") {
            // Legacy flat format: just a number/string choice
            migrated[key] = { choice: normaliseChoice(val), location: null, isQiyam: false };
        } else if (typeof val === "object" && val !== null) {
            const entry = val as Record<string, unknown>;
            migrated[key] = {
                choice: normaliseChoice(entry.choice),
                location: (entry.location as TarawehLocation) || null,
                isQiyam: Boolean(entry.isQiyam),
            };
        }
    }
    return migrated;
}

export function useTarawehTracker(hijriYear: number) {
    const { status } = useSession();
    const [log, setLog] = useState<TarawehYearLog>({});

    // 1. Load from localStorage on mount / year change
    useEffect(() => {
        if (!hijriYear) return;
        const fullLog = readFullLog();
        const yearData = (fullLog[hijriYear] || fullLog[String(hijriYear)] || {}) as Record<string, unknown>;
        queueMicrotask(() => setLog(migrateYearData(yearData)));
    }, [hijriYear]);

    // 2. DB sync: merge in real data only — normalise choice string→number from DB enum
    useEffect(() => {
        if (status !== "authenticated" || !hijriYear) return;

        async function syncFromDb() {
            try {
                const res = await fetch(`/api/ramadhan/taraweh?year=${hijriYear}`);
                if (!res.ok) return;
                const { rows } = await res.json();
                if (!rows || !Array.isArray(rows)) return;

                setLog((prev) => {
                    const next = { ...prev };
                    let changed = false;

                    for (const row of rows) {
                        const key = `${row.hijriYear}-${row.hijriDay}`;
                        // ──KEY FIX: DB enum returns "8"/"20" strings → parse to number
                        const dbChoice = normaliseChoice(row.choice);
                        const dbLocation = (row.location as TarawehLocation) || null;
                        const dbQiyam = Boolean(row.isQiyamulLail);

                        // Skip rows with no meaningful data (avoids wiping local data)
                        if (dbChoice === null && !dbQiyam) continue;

                        const current = next[key] || { choice: null, location: null, isQiyam: false };
                        if (current.choice !== dbChoice || current.location !== dbLocation || current.isQiyam !== dbQiyam) {
                            next[key] = { choice: dbChoice, location: dbLocation, isQiyam: dbQiyam };
                            changed = true;
                        }
                    }

                    if (changed) {
                        const fullLog = readFullLog();
                        fullLog[hijriYear] = next;
                        writeFullLog(fullLog);
                    }

                    return changed ? next : prev;
                });
            } catch (err) {
                console.error("[useTarawehTracker] DB sync failed", err);
            }
        }

        syncFromDb();
    }, [status, hijriYear]);

    const updateDay = useCallback((day: number, updates: Partial<TarawehEntry>) => {
        const key = `${hijriYear}-${day}`;

        // Read current state from localStorage synchronously
        const fullLog = readFullLog();
        const yearLog = (fullLog[hijriYear] || fullLog[String(hijriYear)] || {}) as TarawehYearLog;
        const current = migrateYearData({ [key]: (yearLog[key] || null) as unknown })[key]
            || { choice: null, location: null, isQiyam: false };
        const finalEntry: TarawehEntry = { ...current, ...updates };

        // 1. Optimistic local update
        setLog((prev) => {
            const prevEntry = prev[key] || { choice: null, location: null, isQiyam: false };
            const nextEntry: TarawehEntry = { ...prevEntry, ...updates };
            const next: TarawehYearLog = { ...prev, [key]: nextEntry };
            const latest = readFullLog();
            latest[hijriYear] = next;
            writeFullLog(latest);
            return next;
        });

        // 2. Background POST — always POST on any explicit user action,
        // including cancel (choice: null), so DB reflects the latest state.
        // This allows the cancel use case to work correctly after refresh.
        if (status === "authenticated") {
            fetch("/api/ramadhan/taraweh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hijriYear,
                    hijriDay: day,
                    choice: finalEntry.choice,
                    location: finalEntry.location,
                    isQiyamulLail: finalEntry.isQiyam,
                }),
            }).catch(e => console.error("[useTarawehTracker] POST failed", e));
        }
    }, [hijriYear, status]);

    return { log, updateDay };
}
