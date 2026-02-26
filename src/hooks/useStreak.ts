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
import {
  getStreakRepository,
  STREAK_MILESTONES,
  StreakData,
  StreakMilestone
} from '@/core/repositories/streak.repository';

export function useStreak() {
  const repository = getStreakRepository();
  const [streak, setStreak] = useState<StreakData>(repository.getStreak());
  const [display, setDisplay] = useState(repository.getDisplayStreak());

  useEffect(() => {
    const refresh = () => {
      setStreak(repository.getStreak());
      setDisplay(repository.getDisplayStreak());
    };

    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener('streak_updated', handleUpdate);
    return () => {
      window.removeEventListener('streak_updated', handleUpdate);
    };
  }, [repository]);

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
