import { describe, expect, it } from "vitest";
import { LEVEL_RULES_VERSION, advanceStreak, calculatePlayerStats, getStageIndex, getStageKey, missedDaysBetween, rebuildStreakDetailed, rebuildStreakFromHistory, rebuildStreakState } from "./progression";

describe("calculatePlayerStats", () => {
  it("handles level boundaries and progress", () => {
    expect(calculatePlayerStats(99)).toMatchObject({ level: 1, nextLevelHasanah: 100, progress: 99 });
    expect(calculatePlayerStats(100)).toMatchObject({ level: 2, nextLevelHasanah: 300, progress: 0 });
    expect(calculatePlayerStats(200)).toMatchObject({ level: 2, nextLevelHasanah: 300, progress: 50 });
  });

  it("preserves an earned-level floor after rule changes", () => {
    expect(calculatePlayerStats(50, 5)).toMatchObject({
      hasanah: 50,
      level: 5,
      progress: 0,
      levelRuleVersion: LEVEL_RULES_VERSION,
    });
  });

  it("normalizes invalid and negative totals", () => {
    expect(calculatePlayerStats(Number.NaN)).toMatchObject({ hasanah: 0, level: 1 });
    expect(calculatePlayerStats(-20)).toMatchObject({ hasanah: 0, level: 1 });
  });
});

describe("advanceStreak", () => {
  const initial = { currentDays: 0, longestDays: 0, lastStreakDate: null, freezesAvailable: 0 };

  it("increments once per consecutive local date", () => {
    const dayOne = advanceStreak(initial, "2026-08-29");
    const dayTwo = advanceStreak(dayOne.state, "2026-08-30");

    expect(dayTwo.state).toMatchObject({ currentDays: 2, longestDays: 2, lastStreakDate: "2026-08-30" });
    expect(advanceStreak(dayTwo.state, "2026-08-30")).toEqual({
      state: dayTwo.state,
      frozenDate: null,
      freezeGranted: false,
    });
  });

  it("restarts after a gap without reducing the longest streak", () => {
    const state = { currentDays: 7, longestDays: 7, lastStreakDate: "2026-08-20", freezesAvailable: 0 };
    expect(advanceStreak(state, "2026-08-30").state).toMatchObject({ currentDays: 1, longestDays: 7 });
  });

  it("grants one freeze at day seven and consumes it for exactly one missed day", () => {
    const daySeven = advanceStreak({
      currentDays: 6,
      longestDays: 6,
      lastStreakDate: "2026-08-28",
      freezesAvailable: 0,
    }, "2026-08-29");
    expect(daySeven).toMatchObject({
      state: { currentDays: 7, freezesAvailable: 1 },
      freezeGranted: true,
    });

    const protectedAdvance = advanceStreak(daySeven.state, "2026-08-31");
    expect(protectedAdvance).toMatchObject({
      state: { currentDays: 8, longestDays: 8, freezesAvailable: 0 },
      frozenDate: "2026-08-30",
      freezeGranted: false,
    });
  });

  it("rebuilds deterministically from out-of-order local dates", () => {
    expect(rebuildStreakState(["2026-08-31", "2026-08-29", "2026-08-30"])).toMatchObject({
      currentDays: 3,
      longestDays: 3,
      lastStreakDate: "2026-08-31",
    });
  });
});

describe("rebuildStreakFromHistory", () => {
  const day = (n: number) => new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);

  it("gives the streak each day would have produced one at a time, whatever freezes are stored", () => {
    let seed = 7;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

    for (let trial = 0; trial < 300; trial++) {
      const days: string[] = [];
      for (let n = 1; n <= 40; n++) if (rand() > 0.2) days.push(day(n));

      let incremental = { currentDays: 0, longestDays: 0, lastStreakDate: null as string | null, freezesAvailable: 0 };
      const seen: string[] = [];
      for (const d of days) {
        incremental = advanceStreak(incremental, d).state;
        seen.push(d);
        expect(rebuildStreakFromHistory(seen)).toEqual(incremental);
      }
    }
  });

  it("does not spend a freeze earned on day 7 on a gap before it", () => {
    // Active 1 Jan, missed 2 Jan, active 3-10 Jan: the gap came before any freeze existed.
    const dates = [1, 3, 4, 5, 6, 7, 8, 9, 10].map(day);
    expect(rebuildStreakFromHistory(dates).currentDays).toBe(8);
  });
});

describe("rebuildStreakDetailed", () => {
  const day = (n: number) => `2026-01-${String(n).padStart(2, "0")}`;

  it("reports the missed day a freeze protected, and matches the plain rebuild", () => {
    // 1-7 Jan earns a freeze, 8 Jan is missed, 9 Jan continues the streak.
    const dates = [1, 2, 3, 4, 5, 6, 7, 9].map(day);
    const detailed = rebuildStreakDetailed(dates);

    expect(detailed.frozenDates).toEqual([day(8)]);
    expect(detailed.state).toEqual(rebuildStreakFromHistory(dates));
    // The frozen day keeps the streak alive but is not itself a day of activity: 7 days, then the 9th makes 8.
    expect(detailed.state.currentDays).toBe(8);
  });

  it("reports nothing when no freeze was available or no day was missed", () => {
    expect(rebuildStreakDetailed([1, 3].map(day)).frozenDates).toEqual([]);
    expect(rebuildStreakDetailed([1, 2, 3, 4].map(day)).frozenDates).toEqual([]);
  });

  it("does not report a day that later turned out to have evidence", () => {
    const withLateDay = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(day);
    expect(rebuildStreakDetailed(withLateDay).frozenDates).toEqual([]);
  });
});

describe("excused days (udzur)", () => {
  const day = (n: number) => `2026-03-${String(n).padStart(2, "0")}`;
  const excused = (...days: number[]) => new Set(days.map(day));
  const streakOf = (currentDays: number, last: number, freezesAvailable = 0) =>
    ({ currentDays, longestDays: currentDays, lastStreakDate: day(last), freezesAvailable });

  it("bridges a gap of excused days without growing the streak or using a freeze", () => {
    const step = advanceStreak(streakOf(20, 1, 1), day(8), excused(2, 3, 4, 5, 6, 7));
    expect(step).toMatchObject({ state: { currentDays: 21, freezesAvailable: 1 }, frozenDate: null });
  });

  it("still grows on activity during the period", () => {
    const wednesday = advanceStreak(streakOf(20, 1), day(4), excused(2, 3, 4, 5, 6, 7));
    expect(wednesday.state.currentDays).toBe(21);
    expect(advanceStreak(wednesday.state, day(8), excused(2, 3, 4, 5, 6, 7)).state.currentDays).toBe(22);
  });

  it("uses the freeze for the one day that was not excused, and reports that day", () => {
    const step = advanceStreak(streakOf(10, 1, 1), day(6), excused(2, 3, 4));
    expect(step).toMatchObject({ state: { currentDays: 11, freezesAvailable: 0 }, frozenDate: day(5) });
  });

  it("resets when two days outside the period were missed", () => {
    expect(advanceStreak(streakOf(10, 1, 1), day(7), excused(2, 3, 4)).state.currentDays).toBe(1);
  });

  it("rebuilds the same way, whatever order the days arrive in", () => {
    const set = excused(5, 6, 7, 8, 9, 10);
    const dates = [1, 2, 3, 4, 11, 12].map(day);
    expect(rebuildStreakDetailed([...dates].reverse(), set)).toEqual({
      state: { currentDays: 6, longestDays: 6, lastStreakDate: day(12), freezesAvailable: 0 },
      frozenDates: [],
    });
    expect(rebuildStreakFromHistory(dates)).toMatchObject({ currentDays: 2 });
  });

  it("counts only the missed days that are not excused", () => {
    expect(missedDaysBetween(day(1), day(2))).toBe(0);
    expect(missedDaysBetween(day(1), day(10), excused(2, 3, 9, 15))).toBe(5);
    expect(missedDaysBetween(day(5), day(1))).toBeLessThan(0);
  });
});

describe("journey stages", () => {
  it("maps levels to the seven stages at their boundaries", () => {
    expect([1, 2, 3, 5, 6, 9, 10, 14, 15, 24, 25, 39, 40, 99].map(getStageKey)).toEqual([
      "start", "start", "habit", "habit", "onTime", "onTime", "add", "add",
      "deepen", "deepen", "steady", "steady", "share", "share",
    ]);
    expect(getStageIndex(0)).toBe(-1);
    expect(getStageKey(0)).toBe("start");
    expect(calculatePlayerStats(2287).stageKey).toBe("onTime");
  });
});
