import { describe, expect, it } from "vitest";
import {
  mapDailySpiritToShareData,
  mapDuaToShareData,
  mapHadithToShareData,
  mapQuranVerseToShareData,
  mapStreakAchievementToShareData,
} from "./share-mappers";

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
      arabic: "7",
      translation: "7 days of staying consistent in daily worship",
      explanation: "One Week • +50 Hasanah • Level 3",
      sourceText: "Nawaetu • Istiqamah Streak",
    });
    expect(JSON.stringify(card)).not.toMatch(/email|userId/i);
  });
});

describe("content share mappers", () => {
  it("maps hadith and dua content for Indonesian and English locales", () => {
    const hadith = mapHadithToShareData({
      id: "h1",
      collection: "Bukhari",
      hadithNumber: 1,
      title: "Judul",
      titleEn: "Title",
      arabic: "عربي",
      latin: "Arabi",
      translation: "Terjemahan",
      translationEn: "Translation",
      explanation: "Penjelasan",
      explanationEn: "Explanation",
      authenticity: "Sahih",
    }, "en");
    expect(hadith).toMatchObject({
      title: "Title",
      translation: "Translation",
      explanation: "Explanation",
      sourceText: "HR. Bukhari No. 1 (Sahih)",
    });

    const dua = mapDuaToShareData({
      id: "d1",
      title: "Doa",
      titleEn: "Dua",
      arabic: "دعاء",
      translation: "Terjemahan doa",
      translationEn: "Dua translation",
      virtue: "Keutamaan",
      virtueEn: "Virtue",
      source: { referenceText: "Sumber", referenceTextEn: "Source" },
    }, "en");
    expect(dua).toMatchObject({
      title: "Dua",
      translation: "Dua translation",
      explanation: "Virtue",
      sourceText: "Source",
    });
  });

  it("maps Quran verses with translation cleanup and fallback fields", () => {
    expect(mapQuranVerseToShareData({
      verse_key: "2:255",
      text_uthmani: "آية",
      transliteration: "Ayah",
      translations: [
        { resource_id: 20, text: "<p>First 1</p>" },
        { resource_id: 33, text: "<p>Chosen 2.</p>" },
      ],
    }, "Al-Baqarah", 2)).toMatchObject({
      id: "qs-2-255",
      title: "QS. Al-Baqarah: 255",
      arabic: "آية",
      latin: "Ayah",
      translation: "Chosen .",
      sourceText: "QS. Al-Baqarah (2:255)",
    });

    expect(mapQuranVerseToShareData({
      verse_key: "3",
      text_indopak: "Indo",
    }, "Ali Imran", 3)).toMatchObject({
      id: "qs-3-1",
      arabic: "Indo",
      latin: "",
      translation: "",
    });
  });

  it("maps daily spirit content using explicit values before fallbacks", () => {
    const item = {
      id: "daily-1",
      content: {
        title: "Content title",
        arabic: "عربي",
        latin: "Latin",
        translation: "Content translation",
        source: "Source",
      },
    };
    expect(mapDailySpiritToShareData(item, "Custom title", "Custom translation")).toMatchObject({
      id: "daily-1",
      title: "Custom title",
      translation: "Custom translation",
    });
    expect(mapDailySpiritToShareData(item, "", "")).toMatchObject({
      title: "Content title",
      translation: "Content translation",
    });
  });

  it("uses Indonesian achievement fallbacks when optional values are absent", () => {
    expect(mapStreakAchievementToShareData({ currentStreak: 3, longestStreak: 5 })).toMatchObject({
      title: "Streak 3 hari!",
      explanation: "Streak terpanjang: 5 hari",
      sourceText: "Nawaetu • Jejak Istiqamah",
    });
  });
});
