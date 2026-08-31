import { describe, expect, it } from "vitest";
import { mapStreakAchievementToShareData } from "./share-mappers";

describe("mapStreakAchievementToShareData", () => {
  it("creates a localized achievement card without account or activity details", () => {
    const card = mapStreakAchievementToShareData({
      currentStreak: 7,
      longestStreak: 12,
      hasanahEarned: 50,
      level: 3,
      milestoneLabel: "One Week",
    }, "en");

    expect(card).toMatchObject({
      kind: "achievement",
      id: "streak-7",
      arabic: "🔥 7",
      translation: "7 consistent days with Nawaetu",
      explanation: "One Week • +50 Hasanah • Level 3",
      sourceText: "Nawaetu • Istiqamah Streak",
    });
    expect(JSON.stringify(card)).not.toMatch(/email|userId|activity/i);
  });
});
