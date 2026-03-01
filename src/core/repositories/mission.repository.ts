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
import { getActivityRepository } from './activity.repository';
import { DateUtils } from '@/lib/utils/date';

export interface MissionProgress {
  missionId: string;
  current: number;
  required: number;
  isComplete: boolean;
}

export interface CompletedMission {
  id: string;
  completedAt: string; // YYYY-MM-DD or ISO timestamp (we'll prefer local date string for comparisons)
  hasanahEarned: number;
}

export interface MissionRepository {
  getProgress(missionId: string): MissionProgress;
  getCompletedMissions(): CompletedMission[];
  completeMission(missionId: string, hasanahEarned: number, dateStr?: string): void;
  undoCompleteMission(missionId: string, dateStr?: string): void;
  isCompleted(missionId: string, dateStr?: string): boolean;
  resetCompletedMissions(): void;
}

export class LocalMissionRepository implements MissionRepository {
  private storage = getStorageService();
  private activity = getActivityRepository();

  getProgress(missionId: string): MissionProgress {
    const activity = this.activity.getActivity();

    // Common missions based on activity tracking
    switch (missionId) {
      case 'quran_10_ayat':
        return {
          missionId,
          current: activity.quranAyat,
          required: 10,
          isComplete: activity.quranAyat >= 10
        };
      case 'tasbih_99':
        return {
          missionId,
          current: activity.tasbihCount,
          required: 99,
          isComplete: activity.tasbihCount >= 99
        };
      case 'tasbih_33':
        return {
          missionId,
          current: activity.tasbihCount,
          required: 33,
          isComplete: activity.tasbihCount >= 33
        };
      default:
        return {
          missionId,
          current: 0,
          required: 0,
          isComplete: false
        };
    }
  }

  getCompletedMissions(): CompletedMission[] {
    const data = this.storage.getOptional<any>(
      STORAGE_KEYS.COMPLETED_MISSIONS
    );

    if (!data) return [];

    // Handle old format (object) - convert to new format (array)
    if (!Array.isArray(data)) {
      const converted: CompletedMission[] = [];
      for (const [id, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && 'date' in value) {
          converted.push({
            id,
            completedAt: (value as any).completedAt || DateUtils.today(),
            hasanahEarned: 0 // Unknown for old data
          });
        }
      }
      // Save in new format to migrate data
      if (converted.length > 0) {
        this.storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, converted);
      }
      return converted;
    }

    return data as CompletedMission[];
  }

  completeMission(missionId: string, hasanahEarned: number, dateStr?: string): void {
    const completed = this.getCompletedMissions();
    const targetDate = dateStr || DateUtils.today();

    // Check if already completed on that date.
    // We use DateUtils.toLocalDate to ensure we are comparing local dates regardless of how completedAt is stored
    if (completed.some(m => m.id === missionId && DateUtils.toLocalDate(m.completedAt) === targetDate)) {
      return;
    }

    // For today, we can store full ISO if we want, but for consistency and to avoid UTC flip bugs, 
    // we'll store a local-time based ISO-like string or just the date.
    // Let's use DateUtils.toLocalDate for everything to be ultra-safe about per-day missions.
    const completedAt = dateStr || new Date().toISOString();
    // Note: If dateStr is provided (backdate), it's already YYYY-MM-DD. 
    // If not, it's today's ISO. The isCompleted/undo logic below handles both via toLocalDate.

    completed.push({
      id: missionId,
      completedAt: completedAt,
      hasanahEarned
    });

    this.storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, completed);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mission_updated', { detail: { missionId, completed: true } })
      );
    }
  }

  isCompleted(missionId: string, dateStr?: string): boolean {
    const completed = this.getCompletedMissions();
    const targetDate = dateStr || DateUtils.today();

    return completed.some(m => m.id === missionId && DateUtils.toLocalDate(m.completedAt) === targetDate);
  }

  undoCompleteMission(missionId: string, dateStr?: string): void {
    const completed = this.getCompletedMissions();
    const targetDate = dateStr || DateUtils.today();

    // Remove the completion for the specified date.
    const filtered = completed.filter(m => !(m.id === missionId && DateUtils.toLocalDate(m.completedAt) === targetDate));

    this.storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, filtered);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mission_updated', { detail: { missionId, completed: false } })
      );
    }
  }

  resetCompletedMissions(): void {
    this.storage.set(STORAGE_KEYS.COMPLETED_MISSIONS, []);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('missions_reset'));
    }
  }
}

let repositoryInstance: MissionRepository | null = null;

export function getMissionRepository(): MissionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalMissionRepository();
  }
  return repositoryInstance;
}

export function resetMissionRepository(): void {
  repositoryInstance = null;
}
