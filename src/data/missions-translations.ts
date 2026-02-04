/**
 * Mission Translations
 * Localized text for mission titles and descriptions
 */

interface MissionTranslation {
    title: string;
    description: string;
}

interface MissionTranslations {
    [missionId: string]: {
        id: MissionTranslation;
        en: MissionTranslation;
    };
}

export const MISSION_TRANSLATIONS: MissionTranslations = {
    // Universal Missions
    quran_10_ayat: {
        id: {
            title: "Baca 10 Ayat Quran",
            description: "Membaca minimal 10 ayat Al-Quran"
        },
        en: {
            title: "Read 10 Quran Verses",
            description: "Read at least 10 verses of the Quran"
        }
    },
    tasbih_99: {
        id: {
            title: "Tasbih 99x",
            description: "Selesaikan dzikir tasbih 99 kali"
        },
        en: {
            title: "Tasbih 99x",
            description: "Complete tasbih dhikr 99 times"
        }
    },
    doa_pagi: {
        id: {
            title: "Dzikir Pagi",
            description: "Baca dzikir pagi (jam 04:00-10:00)"
        },
        en: {
            title: "Morning Dhikr",
            description: "Recite morning dhikr (04:00-10:00)"
        }
    },
    doa_sore: {
        id: {
            title: "Dzikir Sore",
            description: "Baca dzikir sore (jam 15:00-18:00)"
        },
        en: {
            title: "Evening Dhikr",
            description: "Recite evening dhikr (15:00-18:00)"
        }
    },
    puasa_sunnah: {
        id: {
            title: "Puasa Sunnah",
            description: "Puasa Senin/Kamis atau Ayyamul Bidh"
        },
        en: {
            title: "Sunnah Fasting",
            description: "Monday/Thursday or Ayyamul Bidh fasting"
        }
    },
    qadha_puasa_tracker: {
        id: {
            title: "Qadha Puasa",
            description: "Lunasi hutang puasa Ramadhan"
        },
        en: {
            title: "Makeup Fasting",
            description: "Make up missed Ramadan fasts"
        }
    },
    dzikir_haid: {
        id: {
            title: "Dzikir Ketika Haid",
            description: "Perbanyak dzikir selama menstruasi"
        },
        en: {
            title: "Dhikr During Period",
            description: "Increase dhikr during menstruation"
        }
    },
    shalawat_100: {
        id: {
            title: "Shalawat 100x",
            description: "Kirim shalawat kepada Nabi 100x"
        },
        en: {
            title: "Salawat 100x",
            description: "Send blessings upon the Prophet 100x"
        }
    },

    // Female Prayers
    sholat_subuh_female: {
        id: {
            title: "Sholat Subuh",
            description: "Tunaikan sholat Subuh tepat waktu"
        },
        en: {
            title: "Fajr Prayer",
            description: "Perform Fajr prayer on time"
        }
    },
    sholat_dzuhur_female: {
        id: {
            title: "Sholat Dzuhur",
            description: "Tunaikan sholat Dzuhur tepat waktu"
        },
        en: {
            title: "Dhuhr Prayer",
            description: "Perform Dhuhr prayer on time"
        }
    },
    sholat_ashar_female: {
        id: {
            title: "Sholat Ashar",
            description: "Tunaikan sholat Ashar tepat waktu"
        },
        en: {
            title: "Asr Prayer",
            description: "Perform Asr prayer on time"
        }
    },
    sholat_maghrib_female: {
        id: {
            title: "Sholat Maghrib",
            description: "Tunaikan sholat Maghrib tepat waktu"
        },
        en: {
            title: "Maghrib Prayer",
            description: "Perform Maghrib prayer on time"
        }
    },
    sholat_isya_female: {
        id: {
            title: "Sholat Isya",
            description: "Tunaikan sholat Isya tepat waktu"
        },
        en: {
            title: "Isha Prayer",
            description: "Perform Isha prayer on time"
        }
    },

    // Male Prayers
    sholat_jumat: {
        id: {
            title: "Sholat Jumat",
            description: "Tunaikan sholat Jumat (hanya Jumat)"
        },
        en: {
            title: "Friday Prayer",
            description: "Perform Friday prayer (Friday only)"
        }
    },
    sholat_dhuha: {
        id: {
            title: "Sholat Dhuha",
            description: "Tunaikan sholat Dhuha (jam 06:00-11:00)"
        },
        en: {
            title: "Dhuha Prayer",
            description: "Perform Dhuha prayer (06:00-11:00)"
        }
    },
    sholat_subuh_male: {
        id: {
            title: "Sholat Subuh",
            description: "Tunaikan sholat Subuh (Utama: Berjamaah)"
        },
        en: {
            title: "Fajr Prayer",
            description: "Perform Fajr prayer (Preferably: Congregation)"
        }
    },
    sholat_dzuhur_male: {
        id: {
            title: "Sholat Dzuhur",
            description: "Tunaikan sholat Dzuhur (Utama: Berjamaah)"
        },
        en: {
            title: "Dhuhr Prayer",
            description: "Perform Dhuhr prayer (Preferably: Congregation)"
        }
    },
    sholat_ashar_male: {
        id: {
            title: "Sholat Ashar",
            description: "Tunaikan sholat Ashar (Utama: Berjamaah)"
        },
        en: {
            title: "Asr Prayer",
            description: "Perform Asr prayer (Preferably: Congregation)"
        }
    },
    sholat_maghrib_male: {
        id: {
            title: "Sholat Maghrib",
            description: "Tunaikan sholat Maghrib (Utama: Berjamaah)"
        },
        en: {
            title: "Maghrib Prayer",
            description: "Perform Maghrib prayer (Preferably: Congregation)"
        }
    },
    sholat_isya_male: {
        id: {
            title: "Sholat Isya",
            description: "Tunaikan sholat Isya (Utama: Berjamaah)"
        },
        en: {
            title: "Isha Prayer",
            description: "Perform Isha prayer (Preferably: Congregation)"
        }
    },

    // Ramadhan Missions
    tarawih: {
        id: {
            title: "Sholat Tarawih",
            description: "Sholat tarawih malam ini (8-20 rakaat)"
        },
        en: {
            title: "Tarawih Prayer",
            description: "Perform tarawih prayer tonight (8-20 rakaat)"
        }
    },
    tadarus_ramadhan: {
        id: {
            title: "Tadarus Al-Quran",
            description: "Baca Al-Quran minimal 1 halaman"
        },
        en: {
            title: "Quran Recitation",
            description: "Read at least 1 page of the Quran"
        }
    },
    doa_berbuka: {
        id: {
            title: "Doa Berbuka Puasa",
            description: "Baca doa berbuka saat Maghrib"
        },
        en: {
            title: "Breaking Fast Supplication",
            description: "Recite breaking fast dua at Maghrib"
        }
    },
    sedekah_ramadhan: {
        id: {
            title: "Sedekah Harian",
            description: "Sisihkan untuk sedekah hari ini"
        },
        en: {
            title: "Daily Charity",
            description: "Set aside for today's charity"
        }
    },
    sahur: {
        id: {
            title: "Sahur",
            description: "Makan sahur sebelum Imsak"
        },
        en: {
            title: "Pre-Dawn Meal",
            description: "Eat pre-dawn meal before Imsak"
        }
    },

    // Sya'ban Missions
    qadha_puasa: {
        id: {
            title: "Lunasi Qadha Puasa",
            description: "Segera lunasi hutang puasa sebelum Ramadhan"
        },
        en: {
            title: "Complete Makeup Fasts",
            description: "Finish makeup fasts before Ramadan"
        }
    },
    puasa_syaban: {
        id: {
            title: "Puasa Sunnah Sya'ban",
            description: "Perbanyak puasa sunnah di bulan Sya'ban"
        },
        en: {
            title: "Sha'ban Voluntary Fasting",
            description: "Increase voluntary fasting in Sha'ban"
        }
    },
    baca_quran_syaban: {
        id: {
            title: "Bulan Para Qurra'",
            description: "Perbanyak tilawah Al-Quran (Syahrul Qurra)"
        },
        en: {
            title: "Month of Quran Reciters",
            description: "Increase Quran recitation (Shahrul Qurra)"
        }
    },
    persiapan_ilmu: {
        id: {
            title: "Pelajari Fiqih Ramadhan",
            description: "Bekali diri dengan ilmu puasa & zakat"
        },
        en: {
            title: "Learn Ramadan Fiqh",
            description: "Equip yourself with fasting & zakat knowledge"
        }
    },
    cek_kesehatan: {
        id: {
            title: "Cek Kesehatan (Checkup)",
            description: "Pastikan tubuh fit sebelum Ramadhan"
        },
        en: {
            title: "Health Checkup",
            description: "Ensure body is fit before Ramadan"
        }
    },
    sedekah_subuh: {
        id: {
            title: "Rutin Sedekah Subuh",
            description: "Sedekah di waktu subuh setiap hari"
        },
        en: {
            title: "Regular Fajr Charity",
            description: "Give charity at Fajr time daily"
        }
    },
    maaf_maafan: {
        id: {
            title: "Saling Memaafkan",
            description: "Minta maaf kepada orang tua & teman"
        },
        en: {
            title: "Seek Forgiveness",
            description: "Apologize to parents & friends"
        }
    },
    malam_nisfu_syaban: {
        id: {
            title: "Malam Nisfu Sya'ban",
            description: "Perbanyak doa & amalan di pertengahan Sya'ban"
        },
        en: {
            title: "Mid-Sha'ban Night",
            description: "Increase prayers & worship in mid-Sha'ban"
        }
    }
};

export function getMissionTranslation(missionId: string, locale: string): MissionTranslation | null {
    const translation = MISSION_TRANSLATIONS[missionId];
    if (!translation) return null;
    
    return locale === 'en' ? translation.en : translation.id;
}
