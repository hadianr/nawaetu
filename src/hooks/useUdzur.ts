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

"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { APP_EVENTS } from "@/lib/constants/events";
import {
    UDZUR_EVENT,
    clearUdzurHistory,
    deleteUdzurPeriod,
    endUdzur,
    getActivePeriod,
    getExcusedDates,
    getPrayerWindows,
    isPrayerExcused as isWindowExcused,
    parseUdzurPeriods,
    periodDay,
    readCanonicalExcusedDates,
    readUdzurPeriods,
    startUdzur,
    type FardhuPrayerKey,
    type UdzurKind,
    type UdzurPeriod,
} from "@/lib/udzur";
import { reconcileExcusedDays } from "@/lib/sync/excused";
import { getSyncUserId } from "@/lib/sync/award";
import { setPrayerAlertPause } from "@/lib/notifications/prayer-preferences";
import { logUdzurFastingDays } from "@/hooks/useFastingTracker";
import { getHijriDate } from "@/lib/ramadhan-journey";
import { parseHijriAdjustment } from "@/lib/hijri-date";
import type { Gender } from "@/data/missions/types";
import { toLocalDate } from "@/lib/utils/date";

const DAY_MS = 86_400_000;
const NO_DATES: ReadonlySet<string> = new Set();
// A forgotten mode must not mute alerts for good: the pause runs out a day after the longest period.
const ALERT_PAUSE_DAYS: Record<UdzurKind, number> = { haid: 16, nifas: 61 };

const WATCHED = new Set<string>([STORAGE_KEYS.UDZUR_PERIODS, STORAGE_KEYS.CANONICAL_PROGRESSION, STORAGE_KEYS.USER_GENDER]);

function subscribe(onChange: () => void): () => void {
    const onStorage = (event: Event) => {
        const key = (event as CustomEvent<{ key?: string }>).detail?.key;
        if (!key || WATCHED.has(key)) onChange();
    };
    window.addEventListener(UDZUR_EVENT, onChange);
    window.addEventListener(APP_EVENTS.PROFILE_UPDATED, onChange);
    window.addEventListener("nawaetu_storage_change", onStorage);
    return () => {
        window.removeEventListener(UDZUR_EVENT, onChange);
        window.removeEventListener(APP_EVENTS.PROFILE_UPDATED, onChange);
        window.removeEventListener("nawaetu_storage_change", onStorage);
    };
}

const read = (key: string) => {
    try {
        return window.localStorage.getItem(key) ?? "";
    } catch {
        return "";
    }
};

// Raw strings are stable between changes, so React only re-renders when something was written.
const snapshot = () => `${read(STORAGE_KEYS.UDZUR_PERIODS)}\u0000${read(STORAGE_KEYS.CANONICAL_PROGRESSION)}\u0000${read(STORAGE_KEYS.USER_GENDER)}`;

function parseJson(raw: string): unknown {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/** Ramadan days a period covered, for the fasting log. */
function ramadanDays(period: UdzurPeriod, now: Date): Array<{ hijriYear: number; hijriDay: number }> {
    const adjustment = parseHijriAdjustment(read(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT) || undefined);
    return getExcusedDates([period], now).flatMap((date) => {
        const [y, m, d] = date.split("-").map(Number);
        const hijri = getHijriDate(new Date(y, m - 1, d, 12), adjustment);
        return hijri.month === 9 && Number.isInteger(hijri.year) ? [{ hijriYear: hijri.year, hijriDay: hijri.day }] : [];
    });
}

/** Everything that follows a change of periods: server dates, Ramadan log. Safe to run any number of times. */
function followUp(periods: UdzurPeriod[], now: Date) {
    reconcileExcusedDays(now);
    const signedIn = Boolean(getSyncUserId());
    for (const period of periods) {
        if (now.getTime() - Date.parse(period.endedAt ?? now.toISOString()) > 40 * DAY_MS) continue;
        const days = ramadanDays(period, now);
        if (days.length > 0) logUdzurFastingDays(days, period.kind === "nifas" ? "postpartum" : "menstruation", signedIn);
    }
}

export interface UdzurState {
    /** Only a user whose profile says female is offered the mode. */
    available: boolean;
    active: UdzurPeriod | null;
    /** Today's prayers are set aside: the mode is on, or another device recorded today as excused. */
    excusedToday: boolean;
    /** Day of the active period, 1 on the day it began. */
    day: number;
    /** Every excused local date this device knows (its own periods and the server's). */
    excusedDates: ReadonlySet<string>;
    periods: UdzurPeriod[];
    isDateExcused: (date: string) => boolean;
    /** Whether one fardhu prayer on a local date is excused, from the device's periods or the server's dates. */
    isPrayerExcused: (date: string, prayer: FardhuPrayerKey, times: Record<string, string | undefined> | undefined) => boolean;
    start: (kind: UdzurKind, startedAt: Date, options?: { keepAlerts?: boolean }) => UdzurPeriod;
    end: (endedAt: Date) => UdzurPeriod;
    remove: (id: string) => void;
    clearHistory: () => void;
}

export function useUdzur(): UdzurState {
    const { data: session } = useSession();
    const userId = session?.user?.id ?? null;
    const raw = useSyncExternalStore(subscribe, snapshot, () => "");

    const { gender, periods, excused, localExcused } = useMemo(() => {
        const [periodsRaw = "", , genderRaw = ""] = raw.split("\u0000");
        const now = new Date();
        const list = parseUdzurPeriods(parseJson(periodsRaw), now);
        const own = new Set(getExcusedDates(list, now));
        // Read through the same guard as the streak: only the signed-in account's server dates.
        const all = new Set([...own, ...(raw ? readCanonicalExcusedDates(userId) : [])]);
        const savedGender = (parseJson(genderRaw) as Gender) || (session?.user?.gender as Gender) || null;
        return { gender: savedGender, periods: list, excused: all, localExcused: own };
    }, [raw, userId, session?.user?.gender]);

    const available = gender === "female";
    const active = available ? getActivePeriod(periods) : null;

    // An ongoing period gains a day every day: keep the server's dates and the Ramadan log up to date.
    useEffect(() => {
        if (!available || periods.length === 0) return;
        followUp(periods, new Date());
    }, [available, periods, userId]);

    // The profile changed away from female: the mode no longer applies.
    useEffect(() => {
        if (gender && gender !== "female" && getActivePeriod(periods)) {
            try {
                endUdzur(new Date());
                void setPrayerAlertPause(null);
            } catch {
                // Already ended in another tab.
            }
        }
    }, [gender, periods]);

    const isDateExcused = useCallback((date: string) => available && excused.has(date), [available, excused]);

    const isPrayerExcused = useCallback((date: string, prayer: FardhuPrayerKey, times: Record<string, string | undefined> | undefined) => {
        if (!available || !excused.has(date)) return false;
        // A date known only from the server (another device) is excused whole: the times stayed there.
        if (!localExcused.has(date)) return true;
        const window = times ? getPrayerWindows(date, times)[prayer] : undefined;
        return window ? isWindowExcused(periods, window) : true;
    }, [available, excused, localExcused, periods]);

    const start = useCallback((kind: UdzurKind, startedAt: Date, options: { keepAlerts?: boolean } = {}) => {
        const period = startUdzur(kind, startedAt);
        if (!options.keepAlerts) {
            void setPrayerAlertPause(new Date(Date.parse(period.startedAt) + ALERT_PAUSE_DAYS[kind] * DAY_MS).toISOString());
        }
        return period;
    }, []);

    const end = useCallback((endedAt: Date) => {
        const period = endUdzur(endedAt);
        void setPrayerAlertPause(null);
        return period;
    }, []);

    const remove = useCallback((id: string) => {
        deleteUdzurPeriod(id);
        if (!getActivePeriod(readUdzurPeriods())) void setPrayerAlertPause(null);
        reconcileExcusedDays();
    }, []);

    const clearHistory = useCallback(() => {
        clearUdzurHistory();
        void setPrayerAlertPause(null);
        reconcileExcusedDays();
    }, []);

    const today = toLocalDate(new Date());
    return {
        available,
        active,
        excusedToday: available && (active !== null || (excused.has(today) && !localExcused.has(today))),
        day: active ? periodDay(active) : 0,
        excusedDates: available ? excused : NO_DATES,
        periods,
        isDateExcused,
        isPrayerExcused,
        start,
        end,
        remove,
        clearHistory,
    };
}
