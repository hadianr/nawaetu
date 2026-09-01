import { describe, expect, it, vi } from "vitest";
import { getPrayerNotificationCopy, getStreakNotificationCopy } from "./push-copy";

describe("push notification copy", () => {
  it("uses English copy for the active English locale", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getPrayerNotificationCopy("en", "Fajr")).toEqual({
      title: "Fajr time 🌅",
      body: "Take it slow, make wudu, and start the day with Allah.",
    });
    vi.restoreAllMocks();
  });

  it("falls back to Indonesian and interpolates streak days", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getStreakNotificationCopy("fr", 7)).toEqual({
      title: "Streak kamu masih nyala 🔥",
      body: "Tinggal satu aktivitas bermakna untuk lanjutkan streak 7 hari.",
    });
    vi.restoreAllMocks();
  });
});
