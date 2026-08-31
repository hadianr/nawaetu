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

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  getStreakRepository,
  STREAK_MILESTONES,
  StreakData,
  StreakMilestone
} from '@/core/repositories/streak.repository';
import { getStorageService } from '@/core/infrastructure/storage';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { DateUtils } from '@/lib/utils/date';
import { rebuildStreakState } from '@/lib/habits/progression';

export function useStreak() {
  const repository = getStreakRepository();
  const { data: session, status } = useSession();
  const getProjection = useCallback(() => {
    const local = repository.getStreak();
    const canonical = status === 'authenticated'
      ? getStorageService().getOptional<any>(STORAGE_KEYS.CANONICAL_PROGRESSION)
      : null;
    if (canonical && session?.user?.id && canonical.userId === session.user.id && canonical.streak) {
      const canonicalDays = (canonical.streak.days ?? [])
        .filter((day: { status?: string }) => day.status !== 'frozen')
        .map((day: { localDate: string }) => day.localDate);
      const rebuilt = canonicalDays.length
        ? rebuildStreakState(canonicalDays, canonical.streak.freezesAvailable ?? 0)
        : null;
      const currentStreak = rebuilt?.currentDays ?? canonical.streak.currentDays ?? 0;
      const lastActiveDate = rebuilt?.lastStreakDate ?? canonical.streak.lastStreakDate ?? '';
      return {
        streak: {
          ...local,
          currentStreak,
          longestStreak: Math.max(canonical.streak.longestDays ?? 0, rebuilt?.longestDays ?? 0),
          lastActiveDate: rebuilt?.lastStreakDate ?? lastActiveDate,
          freezesAvailable: canonical.streak.freezesAvailable ?? 0,
          protectedDates: (canonical.streak.days ?? [])
            .filter((day: { status?: string }) => day.status === 'frozen')
            .map((day: { localDate: string }) => day.localDate),
        },
        display: {
          streak: currentStreak,
          isActiveToday: lastActiveDate === DateUtils.today(),
          isLost: false,
        },
      };
    }
    return { streak: local, display: repository.getDisplayStreak() };
  }, [repository, session?.user?.id, status]);
  const initialProjection = getProjection();
  const [streak, setStreak] = useState<StreakData>(initialProjection.streak);
  const [display, setDisplay] = useState(initialProjection.display);

  useEffect(() => {
    const refresh = () => {
      const projection = getProjection();
      setStreak(projection.streak);
      setDisplay(projection.display);
    };

    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener('streak_updated', handleUpdate);
    return () => {
      window.removeEventListener('streak_updated', handleUpdate);
    };
  }, [getProjection]);

  const updateStreak = useCallback((): { newMilestone: StreakMilestone | null; streak: StreakData } => {
    const result = repository.updateStreak();
    setStreak(result.streak);
    setDisplay(repository.getDisplayStreak());
    return result;
  }, [repository]);

  const resetStreak = useCallback(() => {
    repository.resetStreak();
    setStreak(repository.getStreak());
    setDisplay(repository.getDisplayStreak());
  }, [repository]);

  return {
    streak,
    display,
    milestones: STREAK_MILESTONES,
    updateStreak,
    resetStreak
  };
}
