import { describe, expect, it } from "vitest";
import { SETTINGS_EN } from "./en";
import { SETTINGS_ID } from "./id";
import { getSettingsTranslation } from ".";

describe("streak translations", () => {
  it("keeps Indonesian and English streak keys in sync", () => {
    const streakKeys = Object.keys(SETTINGS_ID).filter((key) => key.startsWith("streak"));

    expect(streakKeys.length).toBeGreaterThan(0);
    expect(streakKeys.filter((key) => !(key in SETTINGS_EN))).toEqual([]);
    expect(SETTINGS_EN.streakMilestone7).toBe("One Week of Istiqamah");
    expect(SETTINGS_ID.streakMilestone7).toBe("Seminggu Istiqamah");
  });

  it("falls back to Indonesian for an unknown locale", () => {
    expect(getSettingsTranslation("en", "streakMilestone7")).toBe("One Week of Istiqamah");
    expect(getSettingsTranslation("unknown", "streakMilestone7")).toBe("Seminggu Istiqamah");
  });
});
