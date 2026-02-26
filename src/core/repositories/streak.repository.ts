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
import { addXP } from '@/lib/leveling';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  milestones: number[];
}

export type StreakMilestone = { days: number; xp: number; label: string; icon: string };

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
  milestones: []
};

export interface StreakRepository {
  getStreak(): StreakData;
  saveStreak(data: StreakData): void;
  updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData };
  getDisplayStreak(): { streak: number; isActiveToday: boolean };
  resetStreak(): void;
}

export class LocalStreakRepository implements StreakRepository {
  private storage = getStorageService();

  getStreak(): StreakData {
    return this.storage.get<StreakData>(STORAGE_KEYS.USER_STREAK, DEFAULT_STREAK);
  }

  saveStreak(data: StreakData): void {
    this.storage.set(STORAGE_KEYS.USER_STREAK, data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('streak_updated', { detail: data }));
    }
  }

  updateStreak(): { newMilestone: StreakMilestone | null; streak: StreakData } {
    const today = DateUtils.today();
    const yesterday = DateUtils.yesterday();
    const current = this.getStreak();

    if (current.lastActiveDate === today) {
      return { newMilestone: null, streak: current };
    }

    let newStreak: number;

    if (current.lastActiveDate === yesterday) {
      newStreak = current.currentStreak + 1;
    } else if (current.lastActiveDate === '') {
      newStreak = 1;
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, current.longestStreak);

    let newMilestone: StreakMilestone | null = null;
    const milestones = [...current.milestones];

    for (const milestone of STREAK_MILESTONES) {
      if (newStreak >= milestone.days && !milestones.includes(milestone.days)) {
        milestones.push(milestone.days);
        addXP(milestone.xp);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('xp_updated'));
        }
        newMilestone = milestone;
      }
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today,
      milestones
    };

    this.saveStreak(updated);

    return { newMilestone, streak: updated };
  }

  getDisplayStreak(): { streak: number; isActiveToday: boolean } {
    const today = DateUtils.today();
    const yesterday = DateUtils.yesterday();
    const data = this.getStreak();

    const isActiveToday = data.lastActiveDate === today;

    if (data.lastActiveDate === yesterday || isActiveToday) {
      return { streak: data.currentStreak, isActiveToday };
    }

    return { streak: 0, isActiveToday: false };
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
