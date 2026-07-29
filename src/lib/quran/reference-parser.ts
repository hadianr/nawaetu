/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Clean Quran Reference Parser & Route Generator
 */

import { findSurahIdByName } from "./surah-registry";

export interface ParsedQuranReference {
  isQuranRef: boolean;
  rawText: string;
  surahId?: number;
  surahName?: string;
  verseNum?: number;
  targetUrl?: string;
}

/**
 * Parses a dalil/reference string to determine if it is a Quran reference
 * and constructs the target Quran reader URL (/quran/[surahId]#verse-[verseNum]).
 *
 * Examples:
 * - "QS. Al-Kahf: 10" -> { isQuranRef: true, surahId: 18, verseNum: 10, targetUrl: "/quran/18#verse-10" }
 * - "QS. Al-Mulk: 1-30" -> { isQuranRef: true, surahId: 67, verseNum: 1, targetUrl: "/quran/67#verse-1" }
 * - "QS. Ar-Rahman" -> { isQuranRef: true, surahId: 55, targetUrl: "/quran/55" }
 * - "HR. Tirmidzi no. 2891" -> { isQuranRef: false, rawText: "HR. Tirmidzi no. 2891" }
 */
export function parseQuranReference(ref?: string): ParsedQuranReference {
  if (!ref || typeof ref !== "string") {
    return { isQuranRef: false, rawText: "" };
  }

  const trimmed = ref.trim();
  if (!trimmed) {
    return { isQuranRef: false, rawText: "" };
  }

  // Hadith citations starting with HR., Hadits, etc. are NOT Quran references
  if (/^(hr\.|hadits|hadith|narrated)/i.test(trimmed)) {
    return { isQuranRef: false, rawText: trimmed };
  }

  // Match patterns like "QS. Al-Kahf: 10", "QS. Al-Mulk: 1-30", "QS. Al-Waqi'ah", "Surah Yasin"
  const qsRegex = /^(?:QS\.?|Surah)\s+([A-Za-z'’`ʿ\-\s]+)(?:\:\s*(\d+)(?:\s*-\s*\d+)?)?/i;
  const match = trimmed.match(qsRegex);

  if (!match) {
    return { isQuranRef: false, rawText: trimmed };
  }

  const rawSurahName = match[1]?.trim();
  const rawVerse = match[2] ? parseInt(match[2], 10) : undefined;

  if (!rawSurahName) {
    return { isQuranRef: false, rawText: trimmed };
  }

  const surahId = findSurahIdByName(rawSurahName);
  if (!surahId) {
    return { isQuranRef: false, rawText: trimmed };
  }

  const verseNum = rawVerse && !isNaN(rawVerse) && rawVerse > 0 ? rawVerse : undefined;
  const targetUrl = verseNum
    ? `/quran/${surahId}#verse-${verseNum}`
    : `/quran/${surahId}`;

  return {
    isQuranRef: true,
    rawText: trimmed,
    surahId,
    surahName: rawSurahName,
    verseNum,
    targetUrl,
  };
}
