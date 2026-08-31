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

import { getStorageService } from '@/core/infrastructure/storage';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { DateUtils } from '@/lib/utils/date';
import { addHasanah } from '@/lib/habits/leveling';
import { advanceStreak } from '@/lib/habits/progression';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  milestones: number[];
  freezesAvailable: number;
  protectedDates: string[];
}

export type StreakMilestone = { days: number; xp: number; label: string; icon: string };

export interface StreakAchievementEventDetail {
  streak: StreakData;
  milestone: StreakMilestone | null;
}

export const STREAK_ACHIEVEMENT_EVENT = 'streak_achievement';

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xp: 50, label: '3 Hari Konsisten', icon: '🔥' },
  { days: 7, xp: 100, label: 'Seminggu Istiqomah', icon: '🔥' },
  { days: 14, xp: 200, label: '2 Minggu Strong', icon: '💪' },
  { days: 30, xp: 500, label: 'Sebulan Juara', icon: '🏆' },
  { days: 60, xp: 750, label: '60 Hari Fighter', icon: '⚔️' },
  { days: 100, xp: 1000, label: '100 Hari Legend', icon: '⭐' }
];

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  milestones: [],
  freezesAvailable: 0,
  protectedDates: []
};

export interface StreakRepository {
  getStreak(): StreakData;
  saveStreak(data: StreakData): void;
  updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData };
  getDisplayStreak(): { streak: number; isActiveToday: boolean; isLost: boolean };
  resetStreak(): void;
}

export class LocalStreakRepository implements StreakRepository {
  private storage = getStorageService();

  getStreak(): StreakData {
    const raw = this.storage.get<any>(STORAGE_KEYS.USER_STREAK, DEFAULT_STREAK);
    if (!raw || typeof raw !== 'object') {
      return DEFAULT_STREAK;
    }
    return {
      currentStreak: typeof raw.currentStreak === 'number' ? raw.currentStreak : (typeof raw.streak === 'number' ? raw.streak : 0),
      longestStreak: typeof raw.longestStreak === 'number' ? raw.longestStreak : 0,
      lastActiveDate: typeof raw.lastActiveDate === 'string' ? raw.lastActiveDate : '',
      milestones: Array.isArray(raw.milestones) ? raw.milestones : [],
      freezesAvailable: typeof raw.freezesAvailable === 'number' ? raw.freezesAvailable : 0,
      protectedDates: Array.isArray(raw.protectedDates) ? raw.protectedDates : []
    };
  }

  saveStreak(data: StreakData): void {
    this.storage.set(STORAGE_KEYS.USER_STREAK, data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('streak_updated', { detail: data }));
    }
  }

  updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData } {
    const today = DateUtils.today();
    const current = this.getStreak();

    if (current.lastActiveDate === today) {
      return { newMilestone: null, streak: current };
    }

    const advance = advanceStreak({
      currentDays: current.currentStreak,
      longestDays: current.longestStreak,
      lastStreakDate: current.lastActiveDate || null,
      freezesAvailable: current.freezesAvailable,
    }, today);
    const newStreak = advance.state.currentDays;

    let newMilestone: StreakMilestone | null = null;
    const milestones = Array.isArray(current.milestones) ? [...current.milestones] : [];

    for (const milestone of STREAK_MILESTONES) {
      if (newStreak >= milestone.days && !milestones.includes(milestone.days)) {
        milestones.push(milestone.days);
        addHasanah(milestone.xp);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('hasanah_updated'));
        }
        newMilestone = milestone;
      }
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: advance.state.longestDays,
      lastActiveDate: today,
      milestones,
      freezesAvailable: advance.state.freezesAvailable,
      protectedDates: advance.frozenDate
        ? [...new Set([...current.protectedDates, advance.frozenDate])]
        : current.protectedDates,
    };

    this.saveStreak(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<StreakAchievementEventDetail>(STREAK_ACHIEVEMENT_EVENT, {
        detail: { streak: updated, milestone: newMilestone }
      }));
    }

    return { newMilestone, streak: updated };
  }

  getDisplayStreak(): { streak: number; isActiveToday: boolean; isLost: boolean } {
    const today = DateUtils.today();
    const yesterday = DateUtils.yesterday();
    const data = this.getStreak();

    const isActiveToday = data.lastActiveDate === today;

    if (data.lastActiveDate === yesterday || isActiveToday) {
      return { streak: data.currentStreak, isActiveToday, isLost: false };
    }

    return {
      streak: 0,
      isActiveToday: false,
      isLost: Boolean(data.lastActiveDate && data.longestStreak > 0),
    };
  }

  resetStreak(): void {
    this.saveStreak(DEFAULT_STREAK);
  }
}

let repositoryInstance: StreakRepository | null = null;

export function getStreakRepository(): StreakRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalStreakRepository();
  }
  return repositoryInstance;
}

export function resetStreakRepository(): void {
  repositoryInstance = null;
}
