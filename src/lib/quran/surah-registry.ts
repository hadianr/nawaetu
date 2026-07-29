/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * Surah Registry Mapping for Quran References
 */

export interface SurahMeta {
  id: number;
  nameEn: string;
  nameId: string;
}

/**
 * Complete Surah Registry (1..114)
 */
export const SURAH_REGISTRY: SurahMeta[] = [
  { id: 1, nameEn: "Al-Fatihah", nameId: "Al-Fatihah" },
  { id: 2, nameEn: "Al-Baqarah", nameId: "Al-Baqarah" },
  { id: 3, nameEn: "Ali 'Imran", nameId: "Ali 'Imran" },
  { id: 4, nameEn: "An-Nisa", nameId: "An-Nisa" },
  { id: 5, nameEn: "Al-Ma'idah", nameId: "Al-Ma'idah" },
  { id: 6, nameEn: "Al-An'am", nameId: "Al-An'am" },
  { id: 7, nameEn: "Al-A'raf", nameId: "Al-A'raf" },
  { id: 8, nameEn: "Al-Anfal", nameId: "Al-Anfal" },
  { id: 9, nameEn: "At-Tawbah", nameId: "At-Taubah" },
  { id: 10, nameEn: "Yunus", nameId: "Yunus" },
  { id: 11, nameEn: "Hud", nameId: "Hud" },
  { id: 12, nameEn: "Yusuf", nameId: "Yusuf" },
  { id: 13, nameEn: "Ar-Ra'd", nameId: "Ar-Ra'd" },
  { id: 14, nameEn: "Ibrahim", nameId: "Ibrahim" },
  { id: 15, nameEn: "Al-Hijr", nameId: "Al-Hijr" },
  { id: 16, nameEn: "An-Nahl", nameId: "An-Nahl" },
  { id: 17, nameEn: "Al-Isra", nameId: "Al-Isra'" },
  { id: 18, nameEn: "Al-Kahf", nameId: "Al-Kahfi" },
  { id: 19, nameEn: "Maryam", nameId: "Maryam" },
  { id: 20, nameEn: "Taha", nameId: "Taha" },
  { id: 21, nameEn: "Al-Anbiya", nameId: "Al-Anbiya'" },
  { id: 22, nameEn: "Al-Hajj", nameId: "Al-Hajj" },
  { id: 23, nameEn: "Al-Mu'minun", nameId: "Al-Mu'minun" },
  { id: 24, nameEn: "An-Nur", nameId: "An-Nur" },
  { id: 25, nameEn: "Al-Furqan", nameId: "Al-Furqan" },
  { id: 26, nameEn: "Ash-Shu'ara", nameId: "Asy-Syu'ara'" },
  { id: 27, nameEn: "An-Naml", nameId: "An-Naml" },
  { id: 28, nameEn: "Al-Qasas", nameId: "Al-Qasas" },
  { id: 29, nameEn: "Al-'Ankabut", nameId: "Al-'Ankabut" },
  { id: 30, nameEn: "Ar-Rum", nameId: "Ar-Rum" },
  { id: 31, nameEn: "Luqman", nameId: "Luqman" },
  { id: 32, nameEn: "As-Sajdah", nameId: "As-Sajdah" },
  { id: 33, nameEn: "Al-Ahzab", nameId: "Al-Ahzab" },
  { id: 34, nameEn: "Saba'", nameId: "Saba'" },
  { id: 35, nameEn: "Fatir", nameId: "Fatir" },
  { id: 36, nameEn: "Yasin", nameId: "Yasin" },
  { id: 37, nameEn: "As-Saffat", nameId: "As-Saffat" },
  { id: 38, nameEn: "Sad", nameId: "Sad" },
  { id: 39, nameEn: "Az-Zumar", nameId: "Az-Zumar" },
  { id: 40, nameEn: "Ghafir", nameId: "Ghafir" },
  { id: 41, nameEn: "Fussilat", nameId: "Fussilat" },
  { id: 42, nameEn: "Ash-Shura", nameId: "Asy-Syura" },
  { id: 43, nameEn: "Az-Zukhruf", nameId: "Az-Zukhruf" },
  { id: 44, nameEn: "Ad-Dukhan", nameId: "Ad-Dukhan" },
  { id: 45, nameEn: "Al-Jathiyah", nameId: "Al-Jasiyah" },
  { id: 46, nameEn: "Al-Ahqaf", nameId: "Al-Ahqaf" },
  { id: 47, nameEn: "Muhammad", nameId: "Muhammad" },
  { id: 48, nameEn: "Al-Fath", nameId: "Al-Fath" },
  { id: 49, nameEn: "Al-Hujurat", nameId: "Al-Hujurat" },
  { id: 50, nameEn: "Qaf", nameId: "Qaf" },
  { id: 51, nameEn: "Adh-Dhariyat", nameId: "Az-Zariyat" },
  { id: 52, nameEn: "At-Tur", nameId: "At-Tur" },
  { id: 53, nameEn: "An-Najm", nameId: "An-Najm" },
  { id: 54, nameEn: "Al-Qamar", nameId: "Al-Qamar" },
  { id: 55, nameEn: "Ar-Rahman", nameId: "Ar-Rahman" },
  { id: 56, nameEn: "Al-Waqi'ah", nameId: "Al-Waqi'ah" },
  { id: 57, nameEn: "Al-Hadid", nameId: "Al-Hadid" },
  { id: 58, nameEn: "Al-Mujadila", nameId: "Al-Mujadilah" },
  { id: 59, nameEn: "Al-Hashr", nameId: "Al-Hasyr" },
  { id: 60, nameEn: "Al-Mumtahanah", nameId: "Al-Mumtahanah" },
  { id: 61, nameEn: "As-Saff", nameId: "As-Saff" },
  { id: 62, nameEn: "Al-Jumu'ah", nameId: "Al-Jumu'ah" },
  { id: 63, nameEn: "Al-Munafiqun", nameId: "Al-Munafiqun" },
  { id: 64, nameEn: "At-Taghabun", nameId: "At-Taghabun" },
  { id: 65, nameEn: "At-Talaq", nameId: "At-Talaq" },
  { id: 66, nameEn: "At-Tahrim", nameId: "At-Tahrim" },
  { id: 67, nameEn: "Al-Mulk", nameId: "Al-Mulk" },
  { id: 68, nameEn: "Al-Qalam", nameId: "Al-Qalam" },
  { id: 69, nameEn: "Al-Haqqah", nameId: "Al-Haqqah" },
  { id: 70, nameEn: "Al-Ma'arij", nameId: "Al-Ma'arij" },
  { id: 71, nameEn: "Nuh", nameId: "Nuh" },
  { id: 72, nameEn: "Al-Jinn", nameId: "Al-Jinn" },
  { id: 73, nameEn: "Al-Muzzammil", nameId: "Al-Muzzammil" },
  { id: 74, nameEn: "Al-Muddaththir", nameId: "Al-Muddassir" },
  { id: 75, nameEn: "Al-Qiyamah", nameId: "Al-Qiyamah" },
  { id: 76, nameEn: "Al-Insan", nameId: "Al-Insan" },
  { id: 77, nameEn: "Al-Mursalat", nameId: "Al-Mursalat" },
  { id: 78, nameEn: "An-Naba'", nameId: "An-Naba'" },
  { id: 79, nameEn: "An-Nazi'at", nameId: "An-Nazi'at" },
  { id: 80, nameEn: "'Abasa", nameId: "'Abasa" },
  { id: 81, nameEn: "At-Takwir", nameId: "At-Takwir" },
  { id: 82, nameEn: "Al-Infitar", nameId: "Al-Infitar" },
  { id: 83, nameEn: "Al-Mutaffifin", nameId: "Al-Mutaffifin" },
  { id: 84, nameEn: "Al-Inshiqaq", nameId: "Al-Insyiqaq" },
  { id: 85, nameEn: "Al-Buruj", nameId: "Al-Buruj" },
  { id: 86, nameEn: "At-Tariq", nameId: "At-Tariq" },
  { id: 87, nameEn: "Al-A'la", nameId: "Al-A'la" },
  { id: 88, nameEn: "Al-Ghashiyah", nameId: "Al-Ghasyiyah" },
  { id: 89, nameEn: "Al-Fajr", nameId: "Al-Fajr" },
  { id: 90, nameEn: "Al-Balad", nameId: "Al-Balad" },
  { id: 91, nameEn: "Ash-Shams", nameId: "Asy-Syams" },
  { id: 92, nameEn: "Al-Layl", nameId: "Al-Lail" },
  { id: 93, nameEn: "Ad-Duhaa", nameId: "Ad-Duha" },
  { id: 94, nameEn: "Ash-Sharh", nameId: "Asy-Syarh" },
  { id: 95, nameEn: "At-Tin", nameId: "At-Tin" },
  { id: 96, nameEn: "Al-'Alaq", nameId: "Al-'Alaq" },
  { id: 97, nameEn: "Al-Qadr", nameId: "Al-Qadr" },
  { id: 98, nameEn: "Al-Bayyinah", nameId: "Al-Bayyinah" },
  { id: 99, nameEn: "Az-Zalzalah", nameId: "Az-Zalzalah" },
  { id: 100, nameEn: "Al-'Adiyat", nameId: "Al-'Adiyat" },
  { id: 101, nameEn: "Al-Qari'ah", nameId: "Al-Qari'ah" },
  { id: 102, nameEn: "At-Takathur", nameId: "At-Takasur" },
  { id: 103, nameEn: "Al-'Asr", nameId: "Al-'Asr" },
  { id: 104, nameEn: "Al-Humazah", nameId: "Al-Humazah" },
  { id: 105, nameEn: "Al-Fil", nameId: "Al-Fil" },
  { id: 106, nameEn: "Quraysh", nameId: "Quraisy" },
  { id: 107, nameEn: "Al-Ma'un", nameId: "Al-Ma'un" },
  { id: 108, nameEn: "Al-Kawthar", nameId: "Al-Kausar" },
  { id: 109, nameEn: "Al-Kafirun", nameId: "Al-Kafirun" },
  { id: 110, nameEn: "An-Nasr", nameId: "An-Nasr" },
  { id: 111, nameEn: "Al-Masad", nameId: "Al-Lahab" },
  { id: 112, nameEn: "Al-Ikhlas", nameId: "Al-Ikhlas" },
  { id: 113, nameEn: "Al-Falaq", nameId: "Al-Falaq" },
  { id: 114, nameEn: "An-Nas", nameId: "An-Nas" },
];

/**
 * Normalizes a string for fuzzy matching (lowercase, strip diacritics & punctuation).
 */
export function normalizeSurahName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^qs\.?\s*/i, "")
    .replace(/['’`ʿ]/g, "")
    .replace(/[-_\s]+/g, "")
    .trim();
}

/**
 * Lookup Surah ID by name/slug.
 */
export function findSurahIdByName(surahName: string): number | undefined {
  const norm = normalizeSurahName(surahName);
  if (!norm) return undefined;

  const match = SURAH_REGISTRY.find(
    (s) =>
      normalizeSurahName(s.nameEn) === norm ||
      normalizeSurahName(s.nameId) === norm
  );

  return match?.id;
}
