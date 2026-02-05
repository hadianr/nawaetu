import { useCallback, useEffect, useState } from 'react';
import {
  getMissionRepository,
  MissionProgress,
  CompletedMission
} from '@/core/repositories/mission.repository';

export function useMissions() {
  const repository = getMissionRepository();
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>(
    repository.getCompletedMissions()
  );

  useEffect(() => {
    const refresh = () => {
      setCompletedMissions(repository.getCompletedMissions());
    };

    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener('mission_updated', handleUpdate);
    window.addEventListener('missions_reset', handleUpdate);
    
    return () => {
      window.removeEventListener('mission_updated', handleUpdate);
      window.removeEventListener('missions_reset', handleUpdate);
    };
  }, [repository]);

  const getProgress = useCallback(
    (missionId: string): MissionProgress => {
      return repository.getProgress(missionId);
    },
    [repository]
  );

  const completeMission = useCallback(
    (missionId: string, xpEarned: number): void => {
      repository.completeMission(missionId, xpEarned);
      setCompletedMissions(repository.getCompletedMissions());
    },
    [repository]
  );

  const isCompleted = useCallback(
    (missionId: string): boolean => {
      return repository.isCompleted(missionId);
    },
    [repository]
  );

  const resetMissions = useCallback(() => {
    repository.resetCompletedMissions();
    setCompletedMissions([]);
  }, [repository]);

  return {
    completedMissions,
    getProgress,
    completeMission,
    isCompleted,
    resetMissions
  };
}
