/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * useFastingTracker — Offline-first Ramadan fasting tracker hook.
 *
 * Strategy:
 * 1. Read all logs from localStorage (source of truth)
 * 2. Expose actions to log/update/mark-qadha for any day in any year
 * 3. On session available → sync dirty records to server via API
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { getConsequence } from "@/data/fasting/fiqh-rules";
import type {
    AllFastingLogs,
    FastingDayLog,
    FastingStatus,
    FastingYearLog,
    FastingYearStats,
    Madzhab,
} from "@/data/fasting/types";
import { makeDayKey, makeYearKey } from "@/data/fasting/types";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function loadFromStorage(): AllFastingLogs {
    try {
        const storage = getStorageService();
        const raw = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_FASTING_LOG as any);
        if (!raw) return {};
        return JSON.parse(raw) as AllFastingLogs;
    } catch {
        return {};
    }
}

function saveToStorage(logs: AllFastingLogs): void {
    const storage = getStorageService();
    storage.set(STORAGE_KEYS.RAMADHAN_FASTING_LOG as any, JSON.stringify(logs));
}

function loadMadzhabPref(): Madzhab | null {
    try {
        const storage = getStorageService();
        const raw = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB as any);
        return (raw as Madzhab) || null;
    } catch {
        return null;
    }
}

function saveMadzhabPref(madzhab: Madzhab): void {
    const storage = getStorageService();
    storage.set(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB as any, madzhab);
}

function computeStats(yearLog: FastingYearLog): FastingYearStats {
    const entries = Object.values(yearLog);
    const stats: FastingYearStats = {
        totalFasting: 0,
        totalMissed: 0,
        totalQadha: 0,
        totalFidyah: 0,
        totalChoice: 0,
        pendingQadha: 0,
        pendingFidyah: 0,
        totalLogged: entries.length,
    };

    for (const entry of entries) {
        if (entry.status === "fasting") stats.totalFasting++;
        if (entry.status === "not_fasting") stats.totalMissed++;

        switch (entry.consequence) {
            case "qadha":
                stats.totalQadha++;
                if (!entry.qadhaDone) stats.pendingQadha++;
                break;
            case "fidyah":
                stats.totalFidyah++;
                if (!entry.qadhaDone) stats.pendingFidyah++;
                break;
            case "choice":
                stats.totalChoice++;
                if (!entry.qadhaDone) stats.pendingQadha++; // treat "choice" as pending until done
                break;
        }
    }
    return stats;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFastingTracker() {
    const { data: session } = useSession();
    const [allLogs, setAllLogs] = useState<AllFastingLogs>({});
    const [defaultMadzhab, setDefaultMadzhab] = useState<Madzhab | null>(null);
    const pendingSyncRef = useRef<Set<string>>(new Set()); // "hijriYear-hijriDay" keys

    // Load from localStorage on mount
    useEffect(() => {
        setAllLogs(loadFromStorage());
        setDefaultMadzhab(loadMadzhabPref());
    }, []);

    // Sync dirty records to server when session becomes available
    useEffect(() => {
        if (!session?.user || pendingSyncRef.current.size === 0) return;
        syncDirtyToServer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user]);

    // ── Core actions ────────────────────────────────────────────────────────

    /** Log or update a fasting day */
    const logDay = useCallback(
        (
            hijriYear: number,
            hijriDay: number,
            status: FastingStatus,
            madzhab?: Madzhab | null,
            note?: string
        ) => {
            const yearKey = makeYearKey(hijriYear);
            const dayKey = makeDayKey(hijriDay);
            const effectiveMadzhab = madzhab ?? defaultMadzhab;
            const consequence = getConsequence(status, effectiveMadzhab);

            const dayLog: FastingDayLog = {
                status,
                consequence,
                madzhab: effectiveMadzhab ?? undefined,
                note: note?.trim() || undefined,
                qadhaDone: false,
            };

            setAllLogs((prev) => {
                const next: AllFastingLogs = {
                    ...prev,
                    [yearKey]: {
                        ...(prev[yearKey] ?? {}),
                        [dayKey]: dayLog,
                    },
                };
                saveToStorage(next);
                return next;
            });

            // Mark for server sync
            pendingSyncRef.current.add(`${hijriYear}-${hijriDay}`);
            if (session?.user) {
                // Fire-and-forget sync
                syncDayToServer(hijriYear, hijriDay, status, consequence, effectiveMadzhab, note).catch(console.error);
                pendingSyncRef.current.delete(`${hijriYear}-${hijriDay}`);
            }
        },
        [defaultMadzhab, session?.user]
    );

    /** Mark a qadha/fidyah obligation as fulfilled */
    const markQadhaDone = useCallback(
        (hijriYear: number, hijriDay: number) => {
            const yearKey = makeYearKey(hijriYear);
            const dayKey = makeDayKey(hijriDay);

            setAllLogs((prev) => {
                const existing = prev[yearKey]?.[dayKey];
                if (!existing) return prev;
                const next: AllFastingLogs = {
                    ...prev,
                    [yearKey]: {
                        ...(prev[yearKey] ?? {}),
                        [dayKey]: { ...existing, qadhaDone: true },
                    },
                };
                saveToStorage(next);
                return next;
            });

            // Sync to server
            if (session?.user) {
                fetch("/api/ramadhan/fasting/qadha", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hijriYear, hijriDay }),
                }).catch(console.error);
            }
        },
        [session?.user]
    );

    /** Get the log for a specific year */
    const getYearLog = useCallback(
        (hijriYear: number): FastingYearLog => {
            return allLogs[makeYearKey(hijriYear)] ?? {};
        },
        [allLogs]
    );

    /** Get a specific day's log */
    const getDayLog = useCallback(
        (hijriYear: number, hijriDay: number): FastingDayLog | null => {
            return allLogs[makeYearKey(hijriYear)]?.[makeDayKey(hijriDay)] ?? null;
        },
        [allLogs]
    );

    /** Get computed stats for a year */
    const getStats = useCallback(
        (hijriYear: number): FastingYearStats => {
            const yearLog = allLogs[makeYearKey(hijriYear)] ?? {};
            return computeStats(yearLog);
        },
        [allLogs]
    );

    /** Get list of pending qadha/fidyah days (not yet done) */
    const getPendingQadha = useCallback(
        (hijriYear?: number): Array<{ hijriYear: number; hijriDay: number; log: FastingDayLog }> => {
            const results: Array<{ hijriYear: number; hijriDay: number; log: FastingDayLog }> = [];
            const yearsToCheck = hijriYear
                ? [makeYearKey(hijriYear)]
                : Object.keys(allLogs);

            for (const yk of yearsToCheck) {
                const yearLog = allLogs[yk] ?? {};
                const yr = parseInt(yk, 10);
                for (const [dk, dayLog] of Object.entries(yearLog)) {
                    if (
                        (dayLog.consequence === "qadha" || dayLog.consequence === "fidyah" || dayLog.consequence === "choice") &&
                        !dayLog.qadhaDone
                    ) {
                        results.push({ hijriYear: yr, hijriDay: parseInt(dk, 10), log: dayLog });
                    }
                }
            }
            return results.sort((a, b) => a.hijriYear - b.hijriYear || a.hijriDay - b.hijriDay);
        },
        [allLogs]
    );

    /** Update user's preferred madzhab */
    const updateDefaultMadzhab = useCallback((madzhab: Madzhab) => {
        setDefaultMadzhab(madzhab);
        saveMadzhabPref(madzhab);
    }, []);

    // ── Server sync helpers ──────────────────────────────────────────────────

    async function syncDayToServer(
        hijriYear: number,
        hijriDay: number,
        status: FastingStatus,
        consequence: string,
        madzhab?: Madzhab | null,
        note?: string
    ) {
        await fetch("/api/ramadhan/fasting", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hijriYear, hijriDay, status, consequence, madzhab, note }),
        });
    }

    async function syncDirtyToServer() {
        const dirty = [...pendingSyncRef.current];
        for (const key of dirty) {
            const [yr, dy] = key.split("-").map(Number);
            const dayLog = getDayLog(yr, dy);
            if (!dayLog) continue;
            await syncDayToServer(yr, dy, dayLog.status, dayLog.consequence, dayLog.madzhab, dayLog.note);
            pendingSyncRef.current.delete(key);
        }
    }

    return {
        allLogs,
        defaultMadzhab,
        logDay,
        markQadhaDone,
        getYearLog,
        getDayLog,
        getStats,
        getPendingQadha,
        updateDefaultMadzhab,
    };
}
