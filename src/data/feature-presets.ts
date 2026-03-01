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

/**
 * Tipe niat pengguna — menentukan preset tampilan fitur.
 * - esensial : Ibadah inti (Quran, Sholat, Qibla, Tasbih, Jurnal Niat)
 * - seimbang  : Ibadah inti + sunnah terpilih (+ Misi, Hadith, Bookmarks)
 * - lengkap   : Semua fitur aktif termasuk Statistik
 */
export type ArchetypePreset = "esensial" | "seimbang" | "lengkap";

/**
 * Visibilitas fitur per preset.
 * Fitur yang selalu aktif di semua preset (tidak ada di sini):
 * - Home (Prayer Times & Check-in)
 * - Al-Quran
 * - Qibla
 * - Tasbih / Dhikr
 * - Jurnal Niat  ← core Nawaetu
 * - Settings
 * - AI Mentor    ← nilai jual Muhsinin
 * - Ramadhan     ← selalu ada (seasonal logic tersendiri)
 */
export interface FeatureVisibility {
    showMissions: boolean;   // Misi Harian
    showHadith: boolean;     // Hadith
    showBookmarks: boolean;  // Bookmarks Al-Quran
    showStats: boolean;      // Statistik / Analytics
}

export const FEATURE_PRESETS: Record<ArchetypePreset, FeatureVisibility> = {
    esensial: {
        showMissions: false,
        showHadith: false,
        showBookmarks: false,
        showStats: false,
    },
    seimbang: {
        showMissions: true,
        showHadith: true,
        showBookmarks: true,
        showStats: false,
    },
    lengkap: {
        showMissions: true,
        showHadith: true,
        showBookmarks: true,
        showStats: true,
    },
};

/** Default fallback jika archetype belum di-set */
export const DEFAULT_PRESET: ArchetypePreset = "lengkap";

/**
 * Mendapatkan feature visibility dari nilai archetype.
 * Aman untuk dipanggil tanpa pengecekan null — fallback ke lengkap.
 */
export function getFeatureVisibility(archetype?: string | null): FeatureVisibility {
    if (archetype && archetype in FEATURE_PRESETS) {
        return FEATURE_PRESETS[archetype as ArchetypePreset];
    }
    return FEATURE_PRESETS[DEFAULT_PRESET];
}
