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

export type Gender = 'male' | 'female' | null;
export type ValidationType = 'auto' | 'time' | 'day' | 'manual';

export interface ValidationConfig {
    requiredCount?: number;
    allowedDays?: number[];
    afterPrayer?: string;
    timeWindow?: { start: number; end: number };
    visibility?: {
        hijriMonth?: string;
        hijriDay?: number;
    };
}

export type IslamicRuling = 'obligatory' | 'sunnah' | 'permissible' | 'disliked' | 'forbidden';

export interface Mission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string;
    gender: Gender;
    dalil?: string;
    type: 'daily' | 'weekly' | 'tracker';
    category: 'worship' | 'quran' | 'dhikr' | 'fasting' | 'prayer';
    ruling: IslamicRuling;
    validationType: ValidationType;
    validationConfig?: ValidationConfig;
    phase?: 'all_year' | 'ramadhan_prep' | 'ramadhan_during';
    completionOptions?: {
        label: string;
        xpReward: number;
        icon?: string;
    }[];
}

export interface QadhaPuasaData {
    totalDays: number;
    completedDays: number;
    lastUpdated: string;
}

export const DEFAULT_QADHA_DATA: QadhaPuasaData = {
    totalDays: 0,
    completedDays: 0,
    lastUpdated: new Date().toISOString()
};
