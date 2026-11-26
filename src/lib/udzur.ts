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

/**
 * Udzur mode: a woman in haid or nifas does not pray and does not make the prayers up (HR. Bukhari no. 321,
 * Muslim no. 335). The app marks those prayers as excused, pauses the streak instead of breaking it, and
 * keeps the periods on the device. Only the excused dates (no type, no times) are synced, for the streak.
 * See docs/GENDER_PERSONALIZATION_PLAN.md.
 */

import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { toLocalDate } from "@/lib/utils/date";
import type { Madzhab } from "@/data/fasting/types";

export type UdzurKind = "haid" | "nifas";

export interface UdzurPeriod {
    id: string;
    kind: UdzurKind;
    /** ISO timestamp. */
    startedAt: string;
    /** ISO timestamp; null while the period is ongoing. */
    endedAt: string | null;
}

/** How far back the start can be moved when she forgot to switch the mode on. */
export const UDZUR_MAX_BACKDATE_DAYS = 7;
/** No period is longer than this, whatever is stored (nifas is at most 60 days in any madhhab). */
export const UDZUR_HARD_CAP_DAYS = 60;
/** Periods older than this are dropped from the device. */
export const UDZUR_RETENTION_DAYS = 365;
/** From this day of a period the "period ended?" prompt moves to the top. */
export const UDZUR_REMIND_FROM_DAY = 7;

export const UDZUR_EVENT = "udzur_updated";

const DAY_MS = 86_400_000;
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The longest haid or nifas in the madhhab, used only to ask "has it ended?" and to explain istihadah,
 * never to end the mode on its own. Haid: Hanafi 10 days, the others 15. Nifas: Syafi'i and Maliki 60,
 * Hanafi and Hanbali 40. With no madhhab set: 15 and 40, and the copy says scholars differ.
 */
export function udzurLimitDays(kind: UdzurKind, madzhab: Madzhab | null): number {
    if (kind === "haid") return madzhab === "hanafi" ? 10 : 15;
    return madzhab === "syafii" || madzhab === "maliki" ? 60 : 40;
}

const isTimestamp = (value: unknown): value is string => typeof value === "string" && !Number.isNaN(Date.parse(value));

/** Drops anything malformed or too old, and keeps the periods in order. Never throws. */
export function parseUdzurPeriods(raw: unknown, now: Date = new Date()): UdzurPeriod[] {
    if (!Array.isArray(raw)) return [];
    const oldest = now.getTime() - UDZUR_RETENTION_DAYS * DAY_MS;
    return raw
        .filter((item): item is UdzurPeriod => Boolean(item)
            && typeof item === "object"
            && typeof item.id === "string"
            && (item.kind === "haid" || item.kind === "nifas")
            && isTimestamp(item.startedAt)
            && (item.endedAt === null || isTimestamp(item.endedAt)))
        .map(({ id, kind, startedAt, endedAt }) => ({ id, kind, startedAt, endedAt }))
        .filter((period) => Date.parse(period.endedAt ?? now.toISOString()) >= oldest)
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

/** When the period stops counting: its end, or now, capped at the hard limit. */
function effectiveEnd(period: UdzurPeriod, now: Date): number {
    const start = Date.parse(period.startedAt);
    const end = period.endedAt ? Date.parse(period.endedAt) : now.getTime();
    return Math.min(end, start + UDZUR_HARD_CAP_DAYS * DAY_MS, now.getTime());
}

export function getActivePeriod(periods: UdzurPeriod[], now: Date = new Date()): UdzurPeriod | null {
    return periods.find((period) => period.endedAt === null && Date.parse(period.startedAt) <= now.getTime()) ?? null;
}

/** Day of the period, 1 on the day it started. */
export function periodDay(period: UdzurPeriod, now: Date = new Date()): number {
    const start = new Date(period.startedAt);
    start.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - start.getTime()) / DAY_MS) + 1;
}

/** Every local date a period touches, up to today. A partly excused day counts: it only bridges the streak. */
export function getExcusedDates(periods: UdzurPeriod[], now: Date = new Date()): string[] {
    const dates = new Set<string>();
    for (const period of periods) {
        const end = effectiveEnd(period, now);
        const cursor = new Date(period.startedAt);
        cursor.setHours(12, 0, 0, 0);
        const last = toLocalDate(new Date(end));
        for (let guard = 0; guard <= UDZUR_HARD_CAP_DAYS; guard++) {
            const date = toLocalDate(cursor);
            if (date > last) break;
            dates.add(date);
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    return [...dates].sort();
}

export interface PrayerWindow {
    start: Date;
    /** Null when the end is unknown. */
    end: Date | null;
}

/**
 * A prayer is excused when its time began after the period started and ended before the period ended.
 * The prayer that was current when haid began, and the one whose time is running when she becomes pure,
 * are not excused: many scholars say the first is owed if there was time to pray it, and the second is due.
 */
export function isPrayerExcused(periods: UdzurPeriod[], window: PrayerWindow): boolean {
    const start = window.start.getTime();
    return periods.some((period) => {
        const periodStart = Date.parse(period.startedAt);
        if (start < periodStart || start > periodStart + UDZUR_HARD_CAP_DAYS * DAY_MS) return false;
        // Ongoing: every prayer from here on, including later ones today.
        if (period.endedAt === null) return true;
        return (window.end?.getTime() ?? start) <= Date.parse(period.endedAt);
    });
}

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type FardhuPrayerKey = typeof PRAYER_ORDER[number];

function timeOn(date: string, value: string | undefined, addDays = 0): Date | null {
    if (!value || !LOCAL_DATE.test(date)) return null;
    const [h, m] = value.split(" ")[0].split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    const [y, mo, d] = date.split("-").map(Number);
    return new Date(y, mo - 1, d + addDays, h, m, 0, 0);
}

/**
 * The five prayer windows on a local date, from the "HH:mm" times the app already has. Each ends when the
 * next one begins (Fajr at sunrise, Isha at the next Fajr). Other dates reuse today's times: a few minutes
 * off, which only matters at the exact start and end of a period.
 */
export function getPrayerWindows(date: string, times: Record<string, string | undefined>): Partial<Record<FardhuPrayerKey, PrayerWindow>> {
    const windows: Partial<Record<FardhuPrayerKey, PrayerWindow>> = {};
    const ends: Record<FardhuPrayerKey, Date | null> = {
        Fajr: timeOn(date, times.Sunrise),
        Dhuhr: timeOn(date, times.Asr),
        Asr: timeOn(date, times.Maghrib),
        Maghrib: timeOn(date, times.Isha),
        Isha: timeOn(date, times.Fajr, 1),
    };
    for (const key of PRAYER_ORDER) {
        const start = timeOn(date, times[key]);
        if (start) windows[key] = { start, end: ends[key] };
    }
    return windows;
}

// ─── Device storage ───────────────────────────────────────────────────────────

export function readUdzurPeriods(now: Date = new Date()): UdzurPeriod[] {
    return parseUdzurPeriods(getStorageService().getOptional<unknown>(STORAGE_KEYS.UDZUR_PERIODS), now);
}

function save(periods: UdzurPeriod[]): void {
    getStorageService().set(STORAGE_KEYS.UDZUR_PERIODS, periods);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(UDZUR_EVENT));
}

export type UdzurError = "already_active" | "in_future" | "too_far_back" | "overlaps" | "before_start" | "not_active";

export class UdzurInputError extends Error {
    constructor(readonly code: UdzurError) {
        super(code);
    }
}

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `udzur-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function startUdzur(kind: UdzurKind, startedAt: Date, now: Date = new Date()): UdzurPeriod {
    const periods = readUdzurPeriods(now);
    if (getActivePeriod(periods, now)) throw new UdzurInputError("already_active");
    if (startedAt.getTime() > now.getTime() + 60_000) throw new UdzurInputError("in_future");
    if (startedAt.getTime() < now.getTime() - UDZUR_MAX_BACKDATE_DAYS * DAY_MS) throw new UdzurInputError("too_far_back");
    const last = periods.at(-1);
    if (last?.endedAt && startedAt.getTime() < Date.parse(last.endedAt)) throw new UdzurInputError("overlaps");

    const period: UdzurPeriod = { id: newId(), kind, startedAt: startedAt.toISOString(), endedAt: null };
    save([...periods, period]);
    return period;
}

export function endUdzur(endedAt: Date, now: Date = new Date()): UdzurPeriod {
    const periods = readUdzurPeriods(now);
    const active = getActivePeriod(periods, now);
    if (!active) throw new UdzurInputError("not_active");
    if (endedAt.getTime() > now.getTime() + 60_000) throw new UdzurInputError("in_future");
    if (endedAt.getTime() < Date.parse(active.startedAt)) throw new UdzurInputError("before_start");

    const ended = { ...active, endedAt: endedAt.toISOString() };
    save(periods.map((period) => (period.id === active.id ? ended : period)));
    return ended;
}

/** Removes a period entirely, for one started by mistake. */
export function deleteUdzurPeriod(id: string, now: Date = new Date()): void {
    save(readUdzurPeriods(now).filter((period) => period.id !== id));
}

export function clearUdzurHistory(): void {
    save([]);
}

interface CanonicalExcused {
    userId?: string;
    streak?: { excusedDays?: unknown };
}

/** Excused dates the server holds for this account, such as ones recorded on another device. */
export function readCanonicalExcusedDates(userId?: string | null): string[] {
    const canonical = getStorageService().getOptional<CanonicalExcused>(STORAGE_KEYS.CANONICAL_PROGRESSION);
    if (!canonical || (userId && canonical.userId !== userId)) return [];
    const days = canonical.streak?.excusedDays;
    return Array.isArray(days) ? days.filter((day): day is string => typeof day === "string" && LOCAL_DATE.test(day)) : [];
}

/** Every excused date this device knows of: its own periods and the server's. */
export function getExcusedDateSet(userId?: string | null, now: Date = new Date()): Set<string> {
    return new Set([...getExcusedDates(readUdzurPeriods(now), now), ...readCanonicalExcusedDates(userId)]);
}
