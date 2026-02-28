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

export const missionsID = {
    // Mission List Modal Tabs
    missionTabAll: "Semua",
    missionTabDaily: "📋 Harian",
    missionTabWeekly: "📅 Mingguan",
    missionTabRamadhan: "🌙 Ramadhan",
    missionTabSyaban: "🌙 Sya'ban",
    missionTabTracker: "📊 Tracker",
    missionTabSeasonal: "🌙 Musiman",
    missionEmptyCategory: "Belum ada misi di kategori ini.",
    missionEmptySeasonalTitle: "Belum ada misi khusus bulan ini.",
    missionEmptySeasonalDesc: "Nantikan misi spesial Ramadhan segera!",

    // Mission Completion Options
    missionCompletionAlone: "Sholat Sendiri",
    missionCompletionCongregation: "Berjamaah di Masjid",

    // Mission Hukum Labels
    rulingWajib: "Wajib",
    rulingSunnah: "Sunnah",
    rulingMubah: "Mubah",
    rulingMakruh: "Makruh",
    rulingHaram: "Haram",

    // Mission Dialog
    mission_dialog_guide: "Panduan",
    mission_dialog_info: "Info & Dalil",
    mission_dialog_intention_sholat: "Niat Sholat",
    mission_dialog_intention_puasa: "Niat Puasa",
    mission_dialog_intention_general: "Lafadz Niat",
    mission_dialog_sholat_sendiri: "Sendiri",
    mission_dialog_sholat_makmum: "Makmum",
    mission_dialog_prev: "Sebelumnya",
    mission_dialog_next: "Selanjutnya",
    mission_dialog_reading_of: "Bacaan {current} dari {total}",
    mission_dialog_steps: "Langkah-langkah:",
    mission_dialog_fadhilah: "Keutamaan (Fadhilah)",
    mission_dialog_dalil_source: "Sumber Dalil",
    mission_dialog_no_content: "Belum ada detail konten untuk misi ini. Lakukan sesuai instruksi singkat di atas.",
    mission_dialog_dalil_label: "Dalil:",
    mission_dialog_undo_title: "Misi Direset",
    mission_dialog_undo_desc: "telah di-reset.",
    mission_dialog_select_option: "Pilih Opsi:",
    mission_dialog_coming_soon: "Fitur Menyusul",
    mission_dialog_coming_soon_desc: "Sedang dikembangkan",

    // Mission Translations
    mission_daily_intention_title: "Luruskan Niat",
    mission_daily_intention_desc: "Tetapkan niat kebaikan hari ini",
    mission_daily_reflection_title: "Muhasabah Harian",
    mission_daily_reflection_desc: "Refleksi ibadah di penghujung hari",
    mission_quran_10_ayat_title: "Baca 10 Ayat Quran",
    mission_quran_10_ayat_desc: "Membaca minimal 10 ayat Al-Quran",
    mission_tasbih_99_title: "Tasbih 99x",
    mission_tasbih_99_desc: "Selesaikan dzikir tasbih 99 kali",
    mission_doa_pagi_title: "Dzikir Pagi",
    mission_doa_pagi_desc: "Baca dzikir pagi (jam 04:00-10:00)",
    mission_doa_sore_title: "Dzikir Sore",
    mission_doa_sore_desc: "Baca dzikir sore (jam 15:00-18:00)",
    mission_sunnah_fasting_title: "Puasa Sunnah",
    mission_sunnah_fasting_desc: "Puasa Senin/Kamis atau Ayyamul Bidh",
    mission_makeup_fasting_tracker_title: "Qadha Puasa",
    mission_makeup_fasting_tracker_desc: "Lunasi hutang puasa Ramadhan",
    mission_menstruation_dhikr_title: "Dzikir Ketika Haid",
    mission_menstruation_dhikr_desc: "Perbanyak dzikir selama menstruasi",
    mission_salawat_100x_title: "Shalawat 100x",
    mission_salawat_100x_desc: "Kirim shalawat kepada Nabi 100x",
    mission_fajr_prayer_female_title: "Sholat Subuh",
    mission_fajr_prayer_female_desc: "Tunaikan sholat Subuh tepat waktu",
    mission_dhuhr_prayer_female_title: "Sholat Dzuhur",
    mission_dhuhr_prayer_female_desc: "Tunaikan sholat Dzuhur tepat waktu",
    mission_asr_prayer_female_title: "Sholat Ashar",
    mission_asr_prayer_female_desc: "Tunaikan sholat Ashar tepat waktu",
    mission_maghrib_prayer_female_title: "Sholat Maghrib",
    mission_maghrib_prayer_female_desc: "Tunaikan sholat Maghrib tepat waktu",
    mission_isha_prayer_female_title: "Sholat Isya",
    mission_isha_prayer_female_desc: "Tunaikan sholat Isya tepat waktu",
    mission_friday_prayer_title: "Sholat Jumat",
    mission_friday_prayer_desc: "Tunaikan sholat Jumat (hanya Jumat)",
    mission_dhuha_prayer_title: "Sholat Dhuha",
    mission_dhuha_prayer_desc: "Tunaikan sholat Dhuha (jam 06:00-11:00)",
    mission_fajr_prayer_male_title: "Sholat Subuh",
    mission_fajr_prayer_male_desc: "Tunaikan sholat Subuh (Utama: Berjamaah)",
    mission_dhuhr_prayer_male_title: "Sholat Dzuhur",
    mission_dhuhr_prayer_male_desc: "Tunaikan sholat Dzuhur (Utama: Berjamaah)",
    mission_asr_prayer_male_title: "Sholat Ashar",
    mission_asr_prayer_male_desc: "Tunaikan sholat Ashar (Utama: Berjamaah)",
    mission_maghrib_prayer_male_title: "Sholat Maghrib",
    mission_maghrib_prayer_male_desc: "Tunaikan sholat Maghrib (Utama: Berjamaah)",
    mission_isha_prayer_male_title: "Sholat Isya",
    mission_isha_prayer_male_desc: "Tunaikan sholat Isya (Utama: Berjamaah)",
    mission_tarawih_prayer_title: "Sholat Tarawih",
    mission_tarawih_prayer_desc: "Sholat tarawih malam ini (8-20 rakaat)",
    mission_set_khatam_target_title: "Tadarus Al-Quran",
    mission_set_khatam_target_desc: "Baca Al-Quran minimal 1 halaman",
    mission_breaking_fast_dua_title: "Doa Berbuka Puasa",
    mission_breaking_fast_dua_desc: "Baca doa berbuka saat Maghrib",
    mission_sedekah_ramadhan_title: "Sedekah Harian",
    mission_sedekah_ramadhan_desc: "Sisihkan untuk sedekah hari ini",
    mission_pre_dawn_meal_title: "Sahur",
    mission_pre_dawn_meal_desc: "Makan sahur sebelum Imsak",
    mission_makeup_fasting_title: "Lunasi Qadha Puasa",
    mission_makeup_fasting_desc: "Segera lunasi hutang puasa sebelum Ramadhan",
    mission_puasa_syaban_title: "Puasa Sunnah Sya'ban",
    mission_puasa_syaban_desc: "Perbanyak puasa sunnah di bulan Sya'ban",
    mission_syaban_quran_title: "Bulan Para Qurra'",
    mission_syaban_quran_desc: "Perbanyak tilawah Al-Quran (Syahrul Qurra)",
    mission_ramadan_fiqh_study_title: "Pelajari Fiqih Ramadhan",
    mission_ramadan_fiqh_study_desc: "Bekali diri dengan ilmu puasa & zakat",
    mission_health_checkup_title: "Cek Kesehatan (Checkup)",
    mission_health_checkup_desc: "Pastikan tubuh fit sebelum Ramadhan",
    mission_fajr_charity_title: "Rutin Sedekah Subuh",
    mission_fajr_charity_desc: "Sedekah di waktu subuh setiap hari",
    mission_seek_forgiveness_title: "Saling Memaafkan",
    mission_seek_forgiveness_desc: "Minta maaf kepada orang tua & teman",
    mission_mid_syaban_night_title: "Malam Nisfu Sya'ban",
    mission_mid_syaban_night_desc: "Perbanyak doa & amalan di pertengahan Sya'ban",
    intention_suggestions: [
        "Fokus ngerjain tugas tanpa ngeluh",
        "Stay positive walau lagi capek",
        "Kurangin scrolling sosmed gak jelas",
        "Bantu ortu di rumah hari ini",
        "Jaga lisan, gak mau ghibah dulu",
        "Sedekah subuh walau cuma nyicil",
        "Nyempetin baca Quran abis sholat",
        "Sabar ngadepin temen atau keluarga",
        "Sholat tepat waktu, usahain jamaah",
        "Bersyukur buat hal-hal kecil hari ini"
    ],
    debugConsoleTitle: "Konsol Debug"

};
