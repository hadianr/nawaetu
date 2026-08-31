import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const { values, addHasanah } = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
  addHasanah: vi.fn(),
}));

vi.mock("@/core/infrastructure/storage", () => ({
  getStorageService: () => ({
    get: (key: string, fallback: unknown) => values.get(key) ?? fallback,
    set: (key: string, value: unknown) => values.set(key, value),
  }),
}));

vi.mock("@/lib/habits/leveling", () => ({ addHasanah }));

import {
  LocalStreakRepository,
  STREAK_ACHIEVEMENT_EVENT,
  type StreakAchievementEventDetail,
} from "./streak.repository";

describe("LocalStreakRepository achievements", () => {
  beforeEach(() => {
    values.clear();
    addHasanah.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T12:00:00"));
    vi.stubGlobal("window", new EventTarget());
  });

  it("emits one persisted milestone celebration and never repeats it the same day", () => {
    values.set(STORAGE_KEYS.USER_STREAK, {
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: "2026-08-29",
      milestones: [],
    });
    const achievements: StreakAchievementEventDetail[] = [];
    window.addEventListener(STREAK_ACHIEVEMENT_EVENT, (event) => {
      achievements.push((event as CustomEvent<StreakAchievementEventDetail>).detail);
    });

    const repository = new LocalStreakRepository();
    repository.updateStreak();
    repository.updateStreak();

    expect(achievements).toHaveLength(1);
    expect(achievements[0]).toMatchObject({
      streak: { currentStreak: 3, lastActiveDate: "2026-08-30" },
      milestone: { days: 3, xp: 50 },
    });
    expect(addHasanah).toHaveBeenCalledOnce();
  });

  it("distinguishes a lost streak from a never-started streak", () => {
    const repository = new LocalStreakRepository();

    expect(repository.getDisplayStreak()).toMatchObject({ streak: 0, isLost: false });

    values.set(STORAGE_KEYS.USER_STREAK, {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: "2026-08-25",
      milestones: [3],
    });

    expect(repository.getDisplayStreak()).toEqual({
      streak: 0,
      isActiveToday: false,
      isLost: true,
    });
  });
});
