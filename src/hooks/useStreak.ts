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
