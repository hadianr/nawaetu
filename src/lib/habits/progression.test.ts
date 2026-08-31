import { describe, expect, it } from "vitest";
import { LEVEL_RULES_VERSION, advanceStreak, calculatePlayerStats, rebuildStreakState } from "./progression";

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
