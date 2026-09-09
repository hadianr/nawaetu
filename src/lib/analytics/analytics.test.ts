/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  sendGAEvent,
  trackAIQuery,
  trackAppError,
  trackDuaView,
  trackFeatureUse,
  trackHadithSearch,
  trackHasanahGained,
  trackJournalAction,
  trackKiblatView,
  trackMissionComplete,
  trackPrayerCheckIn,
  trackQuranRead,
  trackRamadhanActivity,
  trackStreakEvent,
  trackDhikrSession,
  type AnalyticsWindow,
} from "./analytics";

const analyticsWindow = () => window as AnalyticsWindow;

describe("client analytics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete analyticsWindow().gtag;
    delete analyticsWindow().dataLayer;
    Reflect.deleteProperty(analyticsWindow(), "requestIdleCallback");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("queues feature events and batches dhikr taps", () => {
    sendGAEvent("custom_event", { value: 1 });
    trackQuranRead("Al-Fatihah");
    trackPrayerCheckIn("Fajr");
    trackMissionComplete("m1", "Read Quran");
    trackDuaView("Morning dua");
    trackHadithSearch("a".repeat(60));
    trackJournalAction("create");
    trackRamadhanActivity("fasting");
    trackHasanahGained(10);
    trackAIQuery();
    trackKiblatView();
    trackFeatureUse("quran");
    trackStreakEvent("updated", { userMode: "guest" });
    trackAppError("NetworkError", "x".repeat(120));
    trackDhikrSession("tasbih", 2);
    trackDhikrSession("tasbih", 3);

    vi.runAllTimers();

    expect(analyticsWindow().dataLayer).toEqual(expect.arrayContaining([
      ["event", "custom_event", { value: 1 }],
      ["event", "quran_read", { surah_name: "Al-Fatihah", ayah_count: 0 }],
      ["event", "dhikr_completed", { dhikr_id: "tasbih", count: 5 }],
    ]));
    expect(analyticsWindow().dataLayer?.find((event: unknown) => Array.isArray(event) && event[1] === "hadith_search")).toEqual([
      "event", "hadith_search", { search_query: "a".repeat(50), book_slug: "all" },
    ]);
  });

  it("uses gtag and idle callback when available", () => {
    const gtag = vi.fn();
    const requestIdleCallback = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });
    analyticsWindow().gtag = gtag;
    analyticsWindow().requestIdleCallback = requestIdleCallback as unknown as AnalyticsWindow["requestIdleCallback"];

    trackQuranRead("Al-Baqarah", 255);
    trackHasanahGained(25, "mission");
    trackAIQuery("mentor");
    trackStreakEvent("sync", { userMode: "logged_in", syncState: "canonical", streakDays: 7 });

    expect(requestIdleCallback).toHaveBeenCalled();
    expect(gtag).toHaveBeenCalledWith("event", "quran_read", { surah_name: "Al-Baqarah", ayah_count: 255 });
    expect(gtag).toHaveBeenCalledWith("event", "hasanah_gained", { amount: 25, source: "mission" });
  });
});
