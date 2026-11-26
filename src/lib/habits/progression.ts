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

const NO_EXCUSED: ReadonlySet<string> = new Set();

/** Days strictly between two local dates, minus the ones excused (haid/nifas). */
export function missedDaysBetween(from: string, to: string, excused: ReadonlySet<string> = NO_EXCUSED): number {
  const gap = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) - 1;
  if (gap <= 0) return gap;
  let excusedInGap = 0;
  for (const date of excused) if (date > from && date < to) excusedInGap++;
  return gap - excusedInGap;
}

/**
 * Excused days (haid/nifas, see src/lib/udzur.ts) bridge a gap: they neither add to the streak nor use a
 * freeze. Activity on an excused day still counts as a normal day.
 */
export function advanceStreak(
  state: ProgressionStreakState,
  localDate: string,
  excused: ReadonlySet<string> = NO_EXCUSED,
): ProgressionAdvance {
  if (state.lastStreakDate === localDate) {
    return { state, frozenDate: null, freezeGranted: false };
  }

  const missed = state.lastStreakDate ? missedDaysBetween(state.lastStreakDate, localDate, excused) : null;
  const usesFreeze = missed === 1 && state.freezesAvailable > 0;
  const currentDays = missed === 0 || usesFreeze ? state.currentDays + 1 : 1;
  let frozenDate: string | null = null;
  if (usesFreeze && state.lastStreakDate) {
    // The one missed day that was not excused.
    frozenDate = addUtcDays(state.lastStreakDate, 1);
    while (excused.has(frozenDate)) frozenDate = addUtcDays(frozenDate, 1);
  }
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

export function rebuildStreakState(dates: string[], freezesAvailable = 0, excused: ReadonlySet<string> = NO_EXCUSED): ProgressionStreakState {
  const orderedDates = [...new Set(dates)].sort();
  return orderedDates.reduce<ProgressionStreakState>(
    (state, localDate) => advanceStreak(state, localDate, excused).state,
    { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable },
  );
}

/**
 * The streak a list of qualified days produces, as if each day had arrived in order.
 * Freezes come only from the history itself (earned at a 7-day streak, spent on a one-day gap), never from
 * a stored count: seeding with today's count would spend a freeze earned later on a gap from long ago.
 */
export function rebuildStreakFromHistory(dates: string[], excused: ReadonlySet<string> = NO_EXCUSED): ProgressionStreakState {
  return rebuildStreakDetailed(dates, excused).state;
}

/** The same rebuild, also reporting which missed days a freeze protected along the way. */
export function rebuildStreakDetailed(dates: string[], excused: ReadonlySet<string> = NO_EXCUSED): { state: ProgressionStreakState; frozenDates: string[] } {
  const frozenDates: string[] = [];
  const state = [...new Set(dates)].sort().reduce<ProgressionStreakState>((current, localDate) => {
    const step = advanceStreak(current, localDate, excused);
    if (step.frozenDate) frozenDates.push(step.frozenDate);
    return step.state;
  }, { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable: 0 });
  return { state, frozenDates };
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
