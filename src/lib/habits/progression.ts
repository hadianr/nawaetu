export const LEVEL_RULES_VERSION = 1;

export const LEVEL_THRESHOLDS = [
  0,
  100,
  300,
  600,
  1000,
  1500,
  2100,
  2800,
  3600,
  4500,
] as const;

export type RankKey = "mubtadi" | "seeker" | "warrior" | "abid" | "salik" | "mukhlis" | "muhsin";

export interface PlayerStats {
  hasanah: number;
  level: number;
  nextLevelHasanah: number;
  progress: number;
  rankKey: RankKey;
  levelRuleVersion: number;
}

export interface ProgressionStreakState {
  currentDays: number;
  longestDays: number;
  lastStreakDate: string | null;
  freezesAvailable: number;
}

export interface ProgressionAdvance {
  state: ProgressionStreakState;
  frozenDate: string | null;
  freezeGranted: boolean;
}

export const STREAK_FREEZE_GRANT_DAYS = 7;
export const STREAK_FREEZE_CAP = 1;

function addUtcDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function advanceStreak(
  state: ProgressionStreakState,
  localDate: string,
): ProgressionAdvance {
  if (state.lastStreakDate === localDate) {
    return { state, frozenDate: null, freezeGranted: false };
  }

  const currentDay = Date.parse(`${localDate}T00:00:00Z`);
  const previousDay = state.lastStreakDate
    ? Date.parse(`${state.lastStreakDate}T00:00:00Z`)
    : Number.NaN;
  const dayDifference = Number.isNaN(previousDay)
    ? null
    : Math.round((currentDay - previousDay) / 86_400_000);
  const usesFreeze = dayDifference === 2 && state.freezesAvailable > 0;
  const currentDays = dayDifference === 1 || usesFreeze ? state.currentDays + 1 : 1;
  const frozenDate = usesFreeze && state.lastStreakDate ? addUtcDays(state.lastStreakDate, 1) : null;
  let freezesAvailable = usesFreeze ? state.freezesAvailable - 1 : state.freezesAvailable;
  const freezeGranted = state.currentDays < STREAK_FREEZE_GRANT_DAYS
    && currentDays >= STREAK_FREEZE_GRANT_DAYS
    && freezesAvailable < STREAK_FREEZE_CAP;
  if (freezeGranted) freezesAvailable = STREAK_FREEZE_CAP;

  return {
    state: {
      ...state,
      currentDays,
      longestDays: Math.max(state.longestDays, currentDays),
      lastStreakDate: localDate,
      freezesAvailable,
    },
    frozenDate,
    freezeGranted,
  };
}

export function rebuildStreakState(dates: string[], freezesAvailable = 0): ProgressionStreakState {
  const orderedDates = [...new Set(dates)].sort();
  return orderedDates.reduce<ProgressionStreakState>(
    (state, localDate) => advanceStreak(state, localDate).state,
    { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable },
  );
}

export function getRankKey(level: number): RankKey {
  if (level >= 60) return "muhsin";
  if (level >= 40) return "mukhlis";
  if (level >= 25) return "salik";
  if (level >= 15) return "abid";
  if (level >= 10) return "warrior";
  if (level >= 5) return "seeker";
  return "mubtadi";
}

export function calculatePlayerStats(hasanah: number, earnedLevelFloor = 1): PlayerStats {
  const safeHasanah = Number.isFinite(hasanah) ? Math.max(0, Math.trunc(hasanah)) : 0;
  const safeFloor = Number.isFinite(earnedLevelFloor) ? Math.max(1, Math.trunc(earnedLevelFloor)) : 1;

  let calculatedLevel = 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index++) {
    if (safeHasanah < LEVEL_THRESHOLDS[index]) break;
    calculatedLevel = index + 1;
  }

  const level = Math.max(calculatedLevel, safeFloor);
  const currentLevelBase = LEVEL_THRESHOLDS[level - 1] ?? LEVEL_THRESHOLDS.at(-1) ?? 0;
  const nextLevelHasanah = LEVEL_THRESHOLDS[level] ?? currentLevelBase + 1000;
  const progress = Math.min(
    100,
    Math.max(0, ((safeHasanah - currentLevelBase) / (nextLevelHasanah - currentLevelBase)) * 100),
  );

  return {
    hasanah: safeHasanah,
    level,
    nextLevelHasanah,
    progress,
    rankKey: getRankKey(level),
    levelRuleVersion: LEVEL_RULES_VERSION,
  };
}
