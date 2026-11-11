import type { AppIconName } from '@/lib/icon-names';

export type StreakMilestone = { days: number; xp: number; label: string; iconKey: AppIconName };

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, xp: 50, label: '3 Hari Konsisten', iconKey: 'sparkles' },
  { days: 7, xp: 100, label: 'Seminggu Istiqomah', iconKey: 'sparkles' },
  { days: 14, xp: 200, label: '2 Minggu Strong', iconKey: 'target' },
  { days: 30, xp: 500, label: 'Sebulan Juara', iconKey: 'trophy' },
  { days: 60, xp: 750, label: '60 Hari Fighter', iconKey: 'shield-check' },
  { days: 100, xp: 1000, label: '100 Hari Legend', iconKey: 'star' }
];
