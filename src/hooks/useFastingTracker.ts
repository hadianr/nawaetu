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

import { useState, useEffect, useCallback } from "react";
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
        // The storage layer parses JSON text it reads back, so this is usually already an object.
        const raw = storage.getOptional<unknown>(STORAGE_KEYS.RAMADHAN_FASTING_LOG);
        if (!raw) return {};
        return (typeof raw === "string" ? JSON.parse(raw) : raw) as AllFastingLogs;
    } catch {
        return {};
    }
}

function saveToStorage(logs: AllFastingLogs): void {
    const storage = getStorageService();
    storage.set(STORAGE_KEYS.RAMADHAN_FASTING_LOG, JSON.stringify(logs));
}

// Edits the server has not accepted yet. Kept in storage so a reload or a closed tab cannot lose them.
function loadPending(): Set<string> {
    try {
        const raw = getStorageService().getOptional<unknown>(STORAGE_KEYS.RAMADHAN_FASTING_PENDING);
        const list = typeof raw === "string" ? JSON.parse(raw) : raw;
        return new Set(Array.isArray(list) ? list.filter((item): item is string => typeof item === "string") : []);
    } catch {
        return new Set();
    }
}

function savePending(pending: Set<string>): void {
    getStorageService().set(STORAGE_KEYS.RAMADHAN_FASTING_PENDING, [...pending]);
}

async function postOrThrow(url: string, method: "POST" | "PATCH", body: unknown): Promise<void> {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${method} ${url} failed with ${res.status}`);
}

function loadMadzhabPref(): Madzhab | null {
    try {
        const storage = getStorageService();
        const raw = storage.getOptional<string>(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB);
        return (raw as Madzhab) || null;
    } catch {
        return null;
    }
}

function saveMadzhabPref(madzhab: Madzhab): void {
    const storage = getStorageService();
    storage.set(STORAGE_KEYS.RAMADHAN_FASTING_MADZHAB, madzhab);
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

let flushing = false;
let flushAgain = false;

/** One pass over what is pending. False when it stopped early because the server could not be reached. */
async function flushOnce(): Promise<boolean> {
    for (const key of [...loadPending()]) {
        const isQadha = key.startsWith("qadha:");
        const [yr, dy] = key.replace("qadha:", "").split("-").map(Number);
        const dayLog = loadFromStorage()[makeYearKey(yr)]?.[makeDayKey(dy)];
        const sent = JSON.stringify(dayLog ?? null);
        try {
            if (dayLog) {
                if (isQadha) await postOrThrow("/api/ramadhan/fasting/qadha", "PATCH", { hijriYear: yr, hijriDay: dy });
                else await postOrThrow("/api/ramadhan/fasting", "POST", {
                    hijriYear: yr, hijriDay: dy, status: dayLog.status, consequence: dayLog.consequence,
                    madzhab: dayLog.madzhab, note: dayLog.note,
                });
            }
        } catch (error) {
            // Offline or a server error: keep it pending and stop; the next flush retries in order.
            console.error(error);
            return false;
        }
        // The day may have been edited while the request was on its way. Then the server has the older
        // version: leave it pending so the next pass sends the new one.
        if (JSON.stringify(loadFromStorage()[makeYearKey(yr)]?.[makeDayKey(dy)] ?? null) !== sent) {
            flushAgain = true;
            continue;
        }
        const remaining = loadPending();
        remaining.delete(key);
        savePending(remaining);
    }
    return true;
}

async function flushPending() {
    // A call that arrives mid-flush is not dropped: it is the signal that something changed, so go round again.
    if (flushing) { flushAgain = true; return; }
    flushing = true;
    try {
        do {
            flushAgain = false;
            if (!(await flushOnce())) return;
        } while (flushAgain);
    } finally {
        flushing = false;
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFastingTracker() {
    const { data: session } = useSession();
    const [allLogs, setAllLogs] = useState<AllFastingLogs>({});
    const [defaultMadzhab, setDefaultMadzhab] = useState<Madzhab | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        queueMicrotask(() => {
            setAllLogs(loadFromStorage());
            setDefaultMadzhab(loadMadzhabPref());
        });
    }, []);

    // A pull from the server (another device's fasting days) rewrote the stored log.
    useEffect(() => {
        const reload = () => setAllLogs(loadFromStorage());
        window.addEventListener("fasting_updated", reload);
        return () => window.removeEventListener("fasting_updated", reload);
    }, []);

    // Send unsent edits when a session exists, and again whenever the connection returns.
    useEffect(() => {
        if (!session?.user) return;
        void flushPending();
        const onOnline = () => { void flushPending(); };
        window.addEventListener("online", onOnline);
        return () => window.removeEventListener("online", onOnline);
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

            // Write storage first: the flush below reads the log back from it.
            const stored = loadFromStorage();
            const next: AllFastingLogs = {
                ...stored,
                [yearKey]: { ...(stored[yearKey] ?? {}), [dayKey]: dayLog },
            };
            saveToStorage(next);
            setAllLogs(next);

            // Stays pending until the server answers 2xx; the next flush retries it.
            const pending = loadPending();
            pending.add(`${hijriYear}-${hijriDay}`);
            savePending(pending);
            if (session?.user) void flushPending();
        },
        [defaultMadzhab, session?.user]
    );

    /** Mark a qadha/fidyah obligation as fulfilled */
    const markQadhaDone = useCallback(
        (hijriYear: number, hijriDay: number) => {
            const yearKey = makeYearKey(hijriYear);
            const dayKey = makeDayKey(hijriDay);

            const stored = loadFromStorage();
            const existing = stored[yearKey]?.[dayKey];
            if (!existing) return;
            const next: AllFastingLogs = {
                ...stored,
                [yearKey]: { ...(stored[yearKey] ?? {}), [dayKey]: { ...existing, qadhaDone: true } },
            };
            saveToStorage(next);
            setAllLogs(next);

            const pending = loadPending();
            pending.add(`qadha:${hijriYear}-${hijriDay}`);
            savePending(pending);
            if (session?.user) void flushPending();
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
