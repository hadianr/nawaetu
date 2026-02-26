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

  const undoCompleteMission = useCallback(
    (missionId: string): void => {
      repository.undoCompleteMission(missionId);
      setCompletedMissions(repository.getCompletedMissions());
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
    undoCompleteMission,
    isCompleted,
    resetMissions
  };
}
