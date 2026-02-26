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

export interface AladhanTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird?: string;
    Lastthird?: string;
}

export interface AladhanGregorianDate {
    date: string;
    format: string;
    day: string;
    weekday: {
        en: string;
    };
    month: {
        number: number;
        en: string;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
}

export interface AladhanHijriDate {
    date: string;
    format: string;
    day: string;
    weekday: {
        en: string;
        ar: string;
    };
    month: {
        number: number;
        en: string;
        ar: string;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
    holidays: string[];
}

export interface AladhanDate {
    readable: string;
    timestamp: string;
    gregorian: AladhanGregorianDate;
    hijri: AladhanHijriDate;
}

export interface AladhanMeta {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
        id: number;
        name: string;
        params: {
            Fajr: number;
            Isha: number;
        };
        location: {
            latitude: number;
            longitude: number;
        };
    };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
    };
}

export interface AladhanDayData {
    timings: AladhanTimings;
    date: AladhanDate;
    meta?: AladhanMeta;
}

export interface AladhanCalendarResponse {
    code: number;
    status: string;
    data: AladhanDayData[];
}
