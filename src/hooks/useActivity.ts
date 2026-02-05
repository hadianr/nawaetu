import { useState, useEffect, useCallback } from 'react';
import { getActivityRepository, ActivityData } from '@/core/repositories/activity.repository';

/**
 * React Hook for Activity Tracking
 * Menggunakan Repository Pattern untuk data access
 * 
 * Usage:
 * ```tsx
 * const { activity, trackQuran, trackTasbih, logPrayer } = useActivity();
 * ```
 */
export function useActivity() {
  const repository = getActivityRepository();
  const [activity, setActivity] = useState<ActivityData>(() => repository.getActivity());

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ActivityData>;
      setActivity(customEvent.detail || repository.getActivity());
    };

    window.addEventListener('activity_updated', handleUpdate);
    
    // Also listen to storage events from other tabs
    const handleStorageChange = () => {
      setActivity(repository.getActivity());
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('activity_updated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [repository]);

  const trackQuran = useCallback((count: number) => {
    repository.trackQuran(count);
  }, [repository]);

  const trackTasbih = useCallback((count: number) => {
    repository.trackTasbih(count);
  }, [repository]);

  const logPrayer = useCallback((name: string) => {
    repository.logPrayer(name);
  }, [repository]);

  const isPrayerLogged = useCallback((name: string) => {
    return repository.isPrayerLogged(name);
  }, [repository]);

  const resetDaily = useCallback(() => {
    repository.resetDaily();
  }, [repository]);

  return {
    activity,
    trackQuran,
    trackTasbih,
    logPrayer,
    isPrayerLogged,
    resetDaily,
  };
}
