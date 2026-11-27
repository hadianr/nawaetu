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

import { PRAYER_SUFFIXES } from "@/hooks/useStatsInsights";

type FardhuPrayer = typeof PRAYER_SUFFIXES[number];

/** Obligatory prayers due over the days: five a day, but an udzur day only counts what was prayed. */
export function prayersDue(days: string[], prayerMap: Record<string, Set<string>>, excused: ReadonlySet<string>): number {
    return days.reduce((sum, date) => sum + (excused.has(date) ? (prayerMap[date]?.size || 0) : 5), 0);
}

/** The prayer missed most often on the days it was due, or null when none was missed. */
export function mostMissedPrayer(days: string[], prayerMap: Record<string, Set<string>>, excused: ReadonlySet<string>): FardhuPrayer | null {
    let worst: FardhuPrayer | null = null;
    let worstMissed = 0;
    for (const prayer of PRAYER_SUFFIXES) {
        const missed = days.filter((date) => !excused.has(date) && !prayerMap[date]?.has(prayer)).length;
        if (missed > worstMissed) [worst, worstMissed] = [prayer, missed];
    }
    return worst;
}

export type StatsMessageKind = "udzur" | "start" | "return" | "grow" | "strong";

export interface StatsMessageInput {
    prayed: number;
    due: number;
    excusedToday: boolean;
    /** Whether anything at all was recorded, ever. */
    hasHistory: boolean;
}

/** Which message the stats page opens with. Kind, never shaming: it names one next step. */
export function statsMessageKind({ prayed, due, excusedToday, hasHistory }: StatsMessageInput): StatsMessageKind {
    if (excusedToday) return "udzur";
    if (!hasHistory) return "start";
    if (prayed === 0) return "return";
    return prayed / Math.max(1, due) >= 0.8 ? "strong" : "grow";
}
