import { describe, expect, it } from "vitest";
import type { Mission } from "@/data/missions";
import { checkMissionValidation, getRulingLabel, localizeMissionReason } from "./mission-utils";
import { SETTINGS_TRANSLATIONS } from "@/data/translations";

const baseMission: Mission = {
  id: "test-mission",
  title: "Test mission",
  description: "Test mission",
  hasanahReward: 1,
  icon: "test",
  gender: null,
  type: "daily",
  category: "prayer",
  ruling: "sunnah",
  validationType: "manual",
};

const mission = (overrides: Partial<Mission>): Mission => ({ ...baseMission, ...overrides });
const at = (hour: number, minute = 0): Date => new Date(2026, 0, 15, hour, minute);

describe("checkMissionValidation", () => {
  it("allows missions without time restrictions", () => {
    expect(checkMissionValidation(baseMission, null, at(12))).toEqual({ locked: false });
    expect(checkMissionValidation(mission({ validationType: "auto" }), null, at(12))).toEqual({ locked: false });
    expect(checkMissionValidation(mission({ validationType: "time" }), null, at(12))).toEqual({ locked: false });
  });

  it("validates prayer time windows", () => {
    const prayerMission = mission({
      validationType: "time",
      validationConfig: { afterPrayer: "fajr" },
    });
    const prayers = { Fajr: "04:35", Dhuhr: "12:05", Asr: "15:20", Maghrib: "17:50", Isha: "19:00" };

    expect(checkMissionValidation(prayerMission, { prayerTimes: {} }, at(4, 30))).toEqual({
      locked: true,
      reason: "Waiting for prayer times...",
      code: "waiting",
    });
    expect(checkMissionValidation(prayerMission, { prayerTimes: prayers }, at(4, 30))).toEqual({
      locked: true,
      reason: "Not yet time for Fajr",
      code: "notYet",
      params: { prayer: "Fajr" },
    });
    expect(checkMissionValidation(prayerMission, { prayerTimes: prayers }, at(4, 50))).toEqual({
      locked: false,
      isEarly: true,
      reason: "Early Time (+Hasanah Bonus)",
    });
    expect(checkMissionValidation(prayerMission, { prayerTimes: prayers }, at(12, 10))).toEqual({
      locked: false,
      isLate: true,
      isEarly: false,
      reason: "Dhuhr has arrived",
      code: "arrived",
      params: { prayer: "Dhuhr" },
    });
  });

  it("handles non-prayer time windows and allowed days", () => {
    const windowMission = mission({
      category: "dhikr",
      validationType: "time",
      validationConfig: { timeWindow: { start: 4, end: 10 } },
    });
    expect(checkMissionValidation(windowMission, null, at(3))).toEqual({
      locked: true,
      reason: "Available at 04:00",
      code: "availableAt",
      params: { time: "04:00" },
    });
    expect(checkMissionValidation(windowMission, null, at(10))).toEqual({
      locked: false,
      isLate: true,
      reason: "Time window passed (4:00 - 10:00)",
      code: "windowPassed",
      params: { start: "4:00", end: "10:00" },
    });
    expect(checkMissionValidation(windowMission, null, at(7))).toEqual({ locked: false });

    const dayMission = mission({ validationType: "day", validationConfig: { allowedDays: [1] } });
    expect(checkMissionValidation(dayMission, null, new Date(2026, 0, 15))).toEqual({
      locked: true,
      reason: "Not available today",
      code: "notToday",
    });
    expect(checkMissionValidation(dayMission, null, new Date(2026, 0, 12))).toEqual({ locked: false });
  });
});

describe("getRulingLabel", () => {
  it("resolves known rulings and falls back safely", () => {
    const translations = {
      rulingWajib: "Wajib",
      rulingSunnah: "Sunnah",
      rulingMubah: "Mubah",
      rulingMakruh: "Makruh",
      rulingHaram: "Haram",
    } as never;

    expect(getRulingLabel("obligatory", translations)).toBe("Wajib");
    expect(getRulingLabel("sunnah", translations)).toBe("Sunnah");
    expect(getRulingLabel("permissible", translations)).toBe("Mubah");
    expect(getRulingLabel("disliked", translations)).toBe("Makruh");
    expect(getRulingLabel("forbidden", translations)).toBe("Haram");
    expect(getRulingLabel("unknown", translations)).toBe("unknown");
    expect(getRulingLabel("sunnah", { rulingSunnah: ["invalid"] } as never)).toBe("sunnah");
  });
});

describe("localizeMissionReason", () => {
  const id = SETTINGS_TRANSLATIONS.id as never;
  it("translates lock reasons and prayer names", () => {
    expect(localizeMissionReason({ locked: true, reason: "Available at 15:00", code: "availableAt", params: { time: "15:00" } }, id).reason).toBe("Tersedia pukul 15:00");
    expect(localizeMissionReason({ locked: true, reason: "Not yet time for Dhuhr", code: "notYet", params: { prayer: "Dhuhr" } }, id).reason).toBe("Belum masuk waktu Dzuhur");
  });
  it("keeps the English reason when there is no code or key", () => {
    expect(localizeMissionReason({ locked: true, reason: "x" }, id).reason).toBe("x");
    expect(localizeMissionReason({ locked: false }, {} as never)).toEqual({ locked: false });
  });
});
