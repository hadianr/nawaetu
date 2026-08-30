import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { API_CONFIG } from "@/config/apis";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import {
    getAdjustedCalendarHijriDate,
    parseHijriAdjustment,
    type HijriDateInput,
} from "@/lib/hijri-date";
import { fetchWithTimeout } from "@/lib/utils/fetch";
import type { AladhanCalendarResponse, AladhanDayData } from "@/types/aladhan";

const storage = getStorageService();
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 9;
const TUNE_VERSION = "v2025-kemenag-5";
const inFlightRequests = new Map<string, Promise<AladhanCalendarResponse>>();

interface CalendarCacheEntry {
    v: number;
    ts: number;
    data: AladhanCalendarResponse;
}

export interface HijriCalendarDay {
    gregorianDate: string;
    gregorianIso: string;
    gregorianDay: number;
    gregorianWeekday: number;
    hijriDate: string;
    hijriDay: number;
    hijriMonth: string;
    hijriMonthNumber: number;
    hijriYear: number;
    timings: {
        Imsak: string;
        Subuh: string;
        Maghrib: string;
        Isya: string;
    };
    holidays: string[];
    isToday: boolean;
}

export type HijriCalendarViewMode = "month" | "ramadan";

const toIsoDate = (date: { day: string; month: { number: number }; year: string }) =>
    `${date.year}-${String(date.month.number).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;

const toApiDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

const monthKey = (day: HijriCalendarDay) => `${day.hijriYear}-${day.hijriMonthNumber}`;

const pruneCalendarCache = () => {
    if (typeof window === "undefined") return;
    const entries: { key: string; ts: number }[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(STORAGE_KEYS.HIJRI_CALENDAR_CACHE_PREFIX)) continue;
        const entry = storage.getOptional<CalendarCacheEntry>(key);
        entries.push({ key, ts: entry?.ts || 0 });
    }
    entries.sort((a, b) => b.ts - a.ts).slice(MAX_CACHE_ENTRIES).forEach(entry => storage.remove(entry.key));
};

async function fetchMonth(year: number, month: number, lat: number, lng: number, method: string) {
    const key = `${STORAGE_KEYS.HIJRI_CALENDAR_CACHE_PREFIX}${year}-${month}-${lat}-${lng}-${method}-${TUNE_VERSION}`;
    const cached = storage.getOptional<CalendarCacheEntry>(key);
    if (cached?.v === CACHE_VERSION && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

    const pending = inFlightRequests.get(key);
    if (pending) return pending;

    const tune = method === "20" ? "&tune=2,2,0,4,4,0,0,2,0" : "";
    const request = fetchWithTimeout(
        `${API_CONFIG.ALADHAN.BASE_URL}/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}${tune}`,
        {},
        { timeoutMs: 10000 },
    ).then(async response => {
        if (response.ok === false) throw new Error(`Failed to load Hijri calendar (${response.status})`);
        const data = await response.json() as AladhanCalendarResponse;
        if (!Array.isArray(data?.data)) throw new Error("Invalid Hijri calendar data received");
        try {
            storage.set(key, { v: CACHE_VERSION, ts: Date.now(), data });
            pruneCalendarCache();
        } catch {
            // Calendar remains usable when browser storage is full or restricted.
        }
        return data;
    }).finally(() => inFlightRequests.delete(key));

    inFlightRequests.set(key, request);
    return request;
}

export function useHijriCalendar(initialView: HijriCalendarViewMode = "month") {
    const [calendarData, setCalendarData] = useState<HijriCalendarDay[]>([]);
    const [allDays, setAllDays] = useState<HijriCalendarDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<HijriCalendarViewMode>(initialView);
    const [activeMonthKey, setActiveMonthKey] = useState("");
    const referenceDate = useRef(new Date());

    const showMonth = useCallback((days: HijriCalendarDay[], key: string, mode: HijriCalendarViewMode) => {
        const selected = mode === "ramadan"
            ? days.filter(day => day.hijriMonthNumber === 9)
            : days.filter(day => monthKey(day) === key);
        setCalendarData(selected);
        setActiveMonthKey(selected[0] ? monthKey(selected[0]) : key);
    }, []);

    const fetchCalendar = useCallback(async (
        mode: HijriCalendarViewMode = viewMode,
        targetDate: Date = referenceDate.current,
    ) => {
        setLoading(true);
        setError(null);
        setViewMode(mode);
        referenceDate.current = targetDate;

        try {
            const location = storage.getOptional<{ lat: number; lng: number }>(STORAGE_KEYS.USER_LOCATION);
            if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
                setError("location_required");
                return;
            }

            const method = storage.getOptional<string>(STORAGE_KEYS.SETTINGS_CALCULATION_METHOD) || "20";
            const adjustment = parseHijriAdjustment(
                storage.getOptional<string>(STORAGE_KEYS.SETTINGS_HIJRI_ADJUSTMENT),
            );
            const requestMonths = [-1, 0, 1].map(offset => addMonths(targetDate, offset));
            const responses = await Promise.all(requestMonths.map(date =>
                fetchMonth(date.getFullYear(), date.getMonth() + 1, location.lat, location.lng, method),
            ));

            const unique = new Map<string, AladhanDayData>();
            responses.flatMap(response => response.data).forEach(day => unique.set(toIsoDate(day.date.gregorian), day));
            const rawDays = [...unique.values()].sort((a, b) =>
                toIsoDate(a.date.gregorian).localeCompare(toIsoDate(b.date.gregorian)),
            );
            const hijriDates: HijriDateInput[] = rawDays.map(day => ({
                day: day.date.hijri.day,
                month: day.date.hijri.month.number,
                year: day.date.hijri.year,
            }));
            const today = toApiDate(new Date());
            const parsed = rawDays.map((raw, index): HijriCalendarDay => {
                const hijri = getAdjustedCalendarHijriDate(hijriDates, index, adjustment);
                const gregorianIso = toIsoDate(raw.date.gregorian);
                return {
                    gregorianDate: `${raw.date.gregorian.day} ${raw.date.gregorian.month.en} ${raw.date.gregorian.year}`,
                    gregorianIso,
                    gregorianDay: Number.parseInt(raw.date.gregorian.day, 10),
                    gregorianWeekday: new Date(`${gregorianIso}T12:00:00`).getDay(),
                    hijriDate: `${hijri.day} ${hijri.monthName} ${hijri.year}H`,
                    hijriDay: hijri.day,
                    hijriMonth: hijri.monthName,
                    hijriMonthNumber: hijri.month,
                    hijriYear: hijri.year,
                    timings: {
                        Imsak: raw.timings.Imsak.split(" ")[0],
                        Subuh: raw.timings.Fajr.split(" ")[0],
                        Maghrib: raw.timings.Maghrib.split(" ")[0],
                        Isya: raw.timings.Isha.split(" ")[0],
                    },
                    holidays: raw.date.hijri.holidays || [],
                    isToday: raw.date.gregorian.date === today,
                };
            });

            const targetApiDate = toApiDate(targetDate);
            const target = parsed.find((_, index) => rawDays[index].date.gregorian.date === targetApiDate)
                || parsed.find(day => day.isToday)
                || parsed[Math.floor(parsed.length / 2)];
            const key = mode === "ramadan" ? `${target?.hijriYear}-9` : target ? monthKey(target) : "";
            setAllDays(parsed);
            showMonth(parsed, key, mode);
        } catch (caught) {
            Sentry.captureException(caught);
            setError("calendar_load_failed");
        } finally {
            setLoading(false);
        }
    }, [showMonth, viewMode]);

    const navigateMonth = useCallback(async (direction: -1 | 1) => {
        const keys = [...new Set(allDays.map(monthKey))];
        const currentIndex = keys.indexOf(activeMonthKey);
        const nextKey = keys[currentIndex + direction];
        if (nextKey) {
            const nextMonth = allDays.find(day => monthKey(day) === nextKey);
            if (nextMonth) referenceDate.current = new Date(`${nextMonth.gregorianIso}T12:00:00`);
            showMonth(allDays, nextKey, "month");
            setViewMode("month");
            return;
        }

        const edge = direction > 0 ? calendarData.at(-1) : calendarData[0];
        const nextDate = edge ? new Date(`${edge.gregorianIso}T12:00:00`) : referenceDate.current;
        nextDate.setDate(nextDate.getDate() + direction * 35);
        await fetchCalendar("month", nextDate);
    }, [activeMonthKey, allDays, calendarData, fetchCalendar, showMonth]);

    useEffect(() => {
        const handleAdjustment = () => {
            if (allDays.length) void fetchCalendar(viewMode, referenceDate.current);
        };
        window.addEventListener("hijri_adjustment_changed", handleAdjustment);
        return () => window.removeEventListener("hijri_adjustment_changed", handleAdjustment);
    }, [allDays.length, fetchCalendar, viewMode]);

    const activeDay = calendarData[0];
    return {
        calendarData,
        loading,
        error,
        fetchCalendar,
        navigateMonth,
        viewMode,
        activeHijriMonth: activeDay?.hijriMonthNumber,
        activeHijriYear: activeDay?.hijriYear,
    };
}
