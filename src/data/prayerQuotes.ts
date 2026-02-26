/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


export interface PrayerQuote {
    text: string;
    source: string;
    type: "quran" | "hadith" | "quote";
}

export const PREPARATION_QUOTES: PrayerQuote[] = [
    {
        text: "Menunggu waktu sholat dinilai sebagai sedang sholat.",
        source: "HR. Bukhari",
        type: "hadith"
    },
    {
        text: "Pakailah pakaianmu yang indah di setiap (memasuki) masjid.",
        source: "QS. Al-A'raf: 31",
        type: "quran"
    },
    {
        text: "Sempurnakan wudhu, karena ia adalah separuh dari iman.",
        source: "HR. Muslim",
        type: "hadith"
    },
    {
        text: "Sholat tepat waktu adalah amalan yang paling dicintai Allah.",
        source: "HR. Bukhari & Muslim",
        type: "hadith"
    },
    {
        text: "Jadikan sabar dan sholat sebagai penolongmu.",
        source: "QS. Al-Baqarah: 45",
        type: "quran"
    }
];
