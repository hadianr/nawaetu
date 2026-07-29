/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Unit Tests for Quran Reference Parser
 */

import { describe, it, expect } from "vitest";
import { parseQuranReference } from "../reference-parser";
import { findSurahIdByName } from "../surah-registry";

describe("Surah Registry", () => {
  it("correctly finds Surah IDs by Indonesian and English names", () => {
    expect(findSurahIdByName("Al-Mulk")).toBe(67);
    expect(findSurahIdByName("Al-Waqi'ah")).toBe(56);
    expect(findSurahIdByName("Al-Waqiah")).toBe(56);
    expect(findSurahIdByName("Ar-Rahman")).toBe(55);
    expect(findSurahIdByName("Al-Kahf")).toBe(18);
    expect(findSurahIdByName("Al-Kahfi")).toBe(18);
    expect(findSurahIdByName("Yasin")).toBe(36);
    expect(findSurahIdByName("Al-Muzzammil")).toBe(73);
    expect(findSurahIdByName("Al-Baqarah")).toBe(2);
  });
});

describe("parseQuranReference", () => {
  it("parses single verse references to /quran/[id]#verse-[num]", () => {
    const res = parseQuranReference("QS. Al-Kahf: 10");
    expect(res.isQuranRef).toBe(true);
    expect(res.surahId).toBe(18);
    expect(res.verseNum).toBe(10);
    expect(res.targetUrl).toBe("/quran/18#verse-10");
  });

  it("parses verse range references to start verse /quran/[id]#verse-[start]", () => {
    const res = parseQuranReference("QS. Al-Mulk: 1-30");
    expect(res.isQuranRef).toBe(true);
    expect(res.surahId).toBe(67);
    expect(res.verseNum).toBe(1);
    expect(res.targetUrl).toBe("/quran/67#verse-1");
  });

  it("parses whole Surah reference without verse number", () => {
    const res = parseQuranReference("QS. Ar-Rahman");
    expect(res.isQuranRef).toBe(true);
    expect(res.surahId).toBe(55);
    expect(res.verseNum).toBeUndefined();
    expect(res.targetUrl).toBe("/quran/55");
  });

  it("returns isQuranRef: false for Hadith citations", () => {
    const res = parseQuranReference("HR. Tirmidzi no. 2891");
    expect(res.isQuranRef).toBe(false);
    expect(res.targetUrl).toBeUndefined();
  });

  it("handles undefined or empty string gracefully", () => {
    expect(parseQuranReference("").isQuranRef).toBe(false);
    expect(parseQuranReference(undefined).isQuranRef).toBe(false);
  });
});
