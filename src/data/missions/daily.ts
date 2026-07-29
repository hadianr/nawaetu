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

import { Mission, Gender, createMission } from './types';

export const PRAYER_NAMES: Record<string, string> = {
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya',
    dhuha: 'Dhuha'
};

/**
 * Core obligatory prayer ritual list (DRY base definitions without gender splits).
 */
const BASE_PRAYERS = [
    { id: 'fajr_prayer', afterPrayer: 'fajr', title: 'Sholat Subuh', icon: '🌙' },
    { id: 'dhuhr_prayer', afterPrayer: 'dhuhr', title: 'Sholat Dzuhur', icon: '☀️' },
    { id: 'asr_prayer', afterPrayer: 'asr', title: 'Sholat Ashar', icon: '🌤️' },
    { id: 'maghrib_prayer', afterPrayer: 'maghrib', title: 'Sholat Maghrib', icon: '🌅' },
    { id: 'isha_prayer', afterPrayer: 'isha', title: 'Sholat Isya', icon: '🌃' },
] as const;

export const BASE_PRAYER_MISSIONS: Mission[] = BASE_PRAYERS.map(p =>
    createMission({
        id: p.id,
        title: p.title,
        description: `Tunaikan ${p.title} tepat waktu`,
        hasanahReward: 25,
        icon: p.icon,
        category: 'prayer',
        ruling: 'obligatory',
        type: 'daily',
        validationType: 'time',
        validationConfig: { afterPrayer: p.afterPrayer }
    })
);

export const UNIVERSAL_MISSIONS: Mission[] = [
    ...BASE_PRAYER_MISSIONS,
    createMission({
        id: 'daily_intention',
        title: 'Luruskan Niat',
        description: 'Tetapkan niat kebaikan hari ini',
        hasanahReward: 50,
        icon: '🎯',
        dalil: 'HR. Bukhari no. 1',
        type: 'daily',
        category: 'worship',
        ruling: 'obligatory',
        validationType: 'manual',
    }),
    createMission({
        id: 'quran_10_ayat',
        title: 'Baca 10 Ayat Quran',
        description: 'Membaca minimal 10 ayat Al-Quran',
        hasanahReward: 50,
        icon: '📖',
        dalil: 'QS. Al-Muzzammil: 20',
        type: 'daily',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'auto',
        validationConfig: { requiredCount: 10 }
    }),
    createMission({
        id: 'read_surah_al_mulk',
        title: 'Baca Surah Al-Mulk',
        description: 'Membaca Surah Al-Mulk (67) pelindung dari azab kubur',
        hasanahReward: 60,
        icon: '📖',
        dalil: 'HR. Tirmidzi no. 2891',
        type: 'daily',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'manual'
    }),
    createMission({
        id: 'read_surah_al_waqiah',
        title: 'Baca Surah Al-Waqi\'ah',
        description: 'Membaca Surah Al-Waqi\'ah (56) penolak kefakiran',
        hasanahReward: 60,
        icon: '📖',
        dalil: 'HR. Al-Baihaqi no. 2269',
        type: 'daily',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'manual'
    }),
    createMission({
        id: 'read_surah_ar_rahman',
        title: 'Baca Surah Ar-Rahman',
        description: 'Membaca Surah Ar-Rahman (55) pengingat nikmat Allah',
        hasanahReward: 60,
        icon: '📖',
        dalil: 'HR. Al-Baihaqi no. 2252',
        type: 'daily',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'manual'
    }),
    createMission({
        id: 'read_surah_al_kahf',
        title: 'Baca Surah Al-Kahf',
        description: 'Membaca Surah Al-Kahf (18) penerang di hari Jumat',
        hasanahReward: 80,
        icon: '📖',
        dalil: 'HR. Al-Hakim no. 3392',
        type: 'weekly',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'day',
        validationConfig: { allowedDays: [4, 5] }
    }),
    createMission({
        id: 'read_surah_yasin',
        title: 'Baca Surah Yasin',
        description: 'Membaca Surah Yasin (36) jantung Al-Quran',
        hasanahReward: 60,
        icon: '📖',
        dalil: 'HR. Tirmidzi no. 2887',
        type: 'daily',
        category: 'quran',
        ruling: 'sunnah',
        validationType: 'manual'
    }),
    createMission({
        id: 'tasbih_99',
        title: 'Tasbih 99x',
        description: 'Selesaikan dzikir tasbih 99 kali',
        hasanahReward: 50,
        icon: '📿',
        dalil: 'HR. Bukhari no. 6329',
        type: 'daily',
        category: 'dhikr',
        ruling: 'sunnah',
        validationType: 'auto',
        validationConfig: { requiredCount: 99 }
    }),
    createMission({
        id: 'doa_pagi',
        title: 'Dzikir Pagi',
        description: 'Baca dzikir pagi (jam 04:00-10:00)',
        hasanahReward: 20,
        icon: '🌅',
        dalil: 'HR. Abu Dawud no. 5074',
        type: 'daily',
        category: 'dhikr',
        ruling: 'sunnah',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 4, end: 10 } }
    }),
    createMission({
        id: 'doa_sore',
        title: 'Dzikir Sore',
        description: 'Baca dzikir sore (jam 15:00-18:00)',
        hasanahReward: 20,
        icon: '🌆',
        dalil: 'HR. Tirmidzi no. 3388',
        type: 'daily',
        category: 'dhikr',
        ruling: 'sunnah',
        validationType: 'time',
        validationConfig: { timeWindow: { start: 15, end: 18 } }
    }),
    createMission({
        id: 'daily_reflection',
        title: 'Muhasabah Harian',
        description: 'Refleksi ibadah di penghujung hari',
        hasanahReward: 50,
        icon: '📝',
        dalil: 'QS. Al-Hasyr: 18',
        type: 'daily',
        category: 'worship',
        ruling: 'sunnah',
        validationType: 'manual',
    }),
    createMission({
        id: 'sunnah_fasting',
        title: 'Puasa Senin/Kamis',
        description: 'Puasa sunnah (hanya Senin/Kamis)',
        hasanahReward: 150,
        icon: '🌙',
        dalil: 'HR. Muslim no. 1162',
        type: 'weekly',
        category: 'fasting',
        ruling: 'sunnah',
        validationType: 'day',
        validationConfig: { allowedDays: [1, 4] }
    })
];

export const FEMALE_MISSIONS: Mission[] = [
    createMission({
        id: 'makeup_fasting_tracker',
        title: 'Qadha Puasa',
        description: 'Catat dan tunaikan hutang puasa Ramadhan',
        hasanahReward: 100,
        icon: '🗓️',
        gender: 'female',
        dalil: 'QS. Al-Baqarah: 184',
        type: 'daily',
        category: 'fasting',
        ruling: 'obligatory',
        validationType: 'manual'
    }),
    createMission({
        id: 'menstruation_dhikr',
        title: 'Dzikir Saat Haid',
        description: 'Rutin berdzikir dan berdoa meski sedang berhalangan',
        hasanahReward: 30,
        icon: '🌸',
        gender: 'female',
        dalil: 'HR. Bukhari no. 305',
        type: 'daily',
        category: 'dhikr',
        ruling: 'sunnah',
        validationType: 'manual'
    }),
    createMission({
        id: 'salawat_100x',
        title: 'Shalawat 100x',
        description: 'Membaca shalawat 100 kali',
        hasanahReward: 40,
        icon: '💚',
        gender: 'female',
        dalil: 'QS. Al-Ahzab: 56 | HR. Muslim no. 408',
        type: 'daily',
        category: 'dhikr',
        ruling: 'sunnah',
        validationType: 'manual'
    })
];

export const MALE_MISSIONS: Mission[] = [
    createMission({
        id: 'friday_prayer',
        title: 'Sholat Jumat',
        description: 'Tunaikan sholat Jumat (hanya Jumat)',
        hasanahReward: 200,
        icon: '🕌',
        gender: 'male',
        dalil: 'QS. Al-Jumu\'ah:9',
        type: 'weekly',
        category: 'prayer',
        ruling: 'obligatory',
        validationType: 'day',
        validationConfig: { allowedDays: [5] } // Friday = 5
    })
];

/**
 * Polymorphic decorator to adapt prayer rituals based on user gender at runtime.
 */
export function resolveRitualForGender(baseMission: Mission, gender: Gender): Mission {
    if (baseMission.category !== 'prayer' || !baseMission.validationConfig?.afterPrayer) {
        return baseMission;
    }

    const isMale = gender === 'male';

    return {
        ...baseMission,
        gender: gender,
        description: isMale
            ? `Tunaikan ${baseMission.title} (Utama: Berjamaah)`
            : `Tunaikan ${baseMission.title} tepat waktu`,
        dalil: isMale
            ? 'HR. Bukhari no. 645 & HR. Muslim no. 650'
            : 'HR. Abu Dawud no. 576 & HR. Ahmad no. 26550',
        ...(isMale && {
            completionOptions: [
                { label: 'Pray Alone', hasanahReward: 25 },
                { label: 'Congregation', hasanahReward: 75, icon: '🕌' }
            ]
        })
    };
}
