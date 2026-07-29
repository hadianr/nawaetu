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
    missionTabObligatory: "⭐ Wajib",
    missionTabSunnahPrayer: "🕌 Sholat Sunnah",
    missionTabDhikr: "📿 Dzikir",
    missionTabFasting: "🌙 Puasa",
    missionTabQuran: "📖 Al-Quran",
    missionTabRecommended: "✨ Sunnah",
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
    mission_fajr_prayer_title: "Sholat Subuh",
    mission_fajr_prayer_desc: "Tunaikan sholat Subuh tepat waktu",
    mission_fajr_prayer_source: "Kitab Shahih Muslim - Bab Fadhil Shalat al-Fajr",
    mission_fajr_prayer_qunut_title: "Doa Qunut",
    mission_fajr_prayer_qunut_translation: "Ya Allah, berilah aku petunjuk sebagaimana orang yang Engkau beri petunjuk, berilah kesehatan sebagaimana orang yang Engkau beri kesehatan, peliharalah aku sebagaimana orang yang Engkau pelihara, berakahilah apa yang Engkau berikan, lindungilah aku dari keburukan takdir-Mu. Sesungguhnya Engkau yang menetapkan dan tidak ada yang menetapkan atas-Mu. Tidak akan hina orang yang Engkau lindungi dan tidak akan mulia orang yang Engkau musuhi. Maha Suci Engkau Wahai Tuhan kami dan Maha Tinggi Engkau. Segala puji bagi-Mu atas ketetapan-Mu. Aku memohon ampun dan bertaubat kepada-Mu. Dan semoga sholawat serta salam tercurah kepada Nabi Muhammad, keluarga dan sahabatnya.",
    mission_fajr_prayer_qunut_note: "Sunnah Muakkad (Syafi'i)",
    mission_dhuhr_prayer_title: "Sholat Dzuhur",
    mission_dhuhr_prayer_desc: "Tunaikan sholat Dzuhur tepat waktu",
    mission_dhuhr_prayer_source: "Kitab Shahih Bukhari - Bab Waktu ad-Dhuhr",
    mission_asr_prayer_title: "Sholat Ashar",
    mission_asr_prayer_desc: "Tunaikan sholat Ashar tepat waktu",
    mission_asr_prayer_source: "Kitab Shahih Bukhari - Bab Fadhil Shalat al-Asr",
    mission_maghrib_prayer_title: "Sholat Maghrib",
    mission_maghrib_prayer_desc: "Tunaikan sholat Maghrib tepat waktu",
    mission_maghrib_prayer_source: "Kitab Shahih Muslim - Bab Waktu al-Maghrib",
    mission_isha_prayer_title: "Sholat Isya",
    mission_isha_prayer_desc: "Tunaikan sholat Isya tepat waktu",
    mission_isha_prayer_source: "Kitab Shahih Muslim - Bab Fadhil Shalat al-Isha",
    mission_friday_prayer_title: "Sholat Jumat",
    mission_friday_prayer_desc: "Tunaikan sholat Jumat (hanya Jumat)",
    mission_dhuha_prayer_title: "Sholat Dhuha",
    mission_dhuha_prayer_desc: "Tunaikan sholat Dhuha (jam 06:00-11:00)",

    // Sunnah Prayers (Detail & Cards)
    mission_sunnah_qobliyah_fajr_title: "Qobliyah Subuh",
    mission_sunnah_qobliyah_fajr_desc: "2 Rakaat sebelum Subuh (setelah adzan Subuh)",
    mission_sunnah_qobliyah_fajr_dalil: "HR. Muslim no. 725",
    mission_sunnah_qobliyah_fajr_intro: "Dua rakaat yang lebih berharga dari dunia dan seisinya, dilakukan sebelum sholat Subuh.",
    mission_sunnah_qobliyah_fajr_fadhilah: [
        "Lebih baik dari dunia dan seisinya",
        "Mengikuti sunnah muakkad yang tidak pernah ditinggalkan Rasulullah SAW",
        "Penyempurna kekurangan sholat fardhu Subuh"
    ],
    mission_sunnah_qobliyah_fajr_guides: [
        "Waktu: Setelah adzan Subuh sebelum sholat fardhu.",
        "Disunnahkan membaca surah Al-Kafirun (rakaat 1) dan Al-Ikhlas (rakaat 2).",
        "Bisa dilakukan meski sholat fardhu sudah akan dimulai (jika cukup waktu)."
    ],
    mission_sunnah_qobliyah_fajr_niat_munfarid_title: "Niat Qobliyah Subuh",
    mission_sunnah_qobliyah_fajr_niat_munfarid_translation: "Aku niat melakukan shalat sunat sebelum subuh 2 rakaat karena Allah ta'ala.",
    mission_sunnah_qobliyah_fajr_source: "HR. Muslim no. 725",

    mission_sunnah_qobliyah_dhuhr_title: "Qobliyah Dzuhur",
    mission_sunnah_qobliyah_dhuhr_desc: "Sholat sunnah sebelum Dzuhur (setelah adzan Dzuhur)",
    mission_sunnah_qobliyah_dhuhr_dalil: "HR. Tirmidzi no. 417",
    mission_sunnah_qobliyah_dhuhr_intro: "Membuka pintu langit di siang hari dengan sunnah sebelum Dzuhur.",
    mission_sunnah_qobliyah_dhuhr_fadhilah: [
        "Pintu-pintu langit dibuka pada waktu ini",
        "Diharamkan baginya api neraka (jika rutin 4 rakaat)",
        "Mendapatkan rahmat Allah"
    ],
    mission_sunnah_qobliyah_dhuhr_guides: [
        "Waktu: Setelah adzan Dzuhur sebelum sholat fardhu.",
        "Bisa dilakukan 2 atau 4 rakaat (2x salam)."
    ],
    mission_sunnah_qobliyah_dhuhr_niat_munfarid_title: "Niat Qobliyah Dzuhur",
    mission_sunnah_qobliyah_dhuhr_niat_munfarid_translation: "Aku niat melakukan shalat sunat sebelum dzuhur 2 rakaat karena Allah ta'ala.",
    mission_sunnah_qobliyah_dhuhr_source: "HR. Tirmidzi & Abu Dawud",

    mission_sunnah_ba_diyah_dhuhr_title: "Ba'diyah Dzuhur",
    mission_sunnah_ba_diyah_dhuhr_desc: "Sholat sunnah sesudah Dzuhur (setelah sholat Dzuhur)",
    mission_sunnah_ba_diyah_dhuhr_dalil: "HR. Tirmidzi no. 427",
    mission_sunnah_ba_diyah_dhuhr_intro: "Menutup ibadah siang dengan keberkahan sunnah sesudah Dzuhur.",
    mission_sunnah_ba_diyah_dhuhr_fadhilah: [
        "Menyempurnakan pahala sholat Dzuhur",
        "Diharamkan baginya api neraka (jika rutin 4 rakaat bersama qobliyah)"
    ],
    mission_sunnah_ba_diyah_dhuhr_guides: [
        "Waktu: Setelah selesai sholat fardhu Dzuhur.",
        "Dilakukan 2 rakaat (muakkad)."
    ],
    mission_sunnah_ba_diyah_dhuhr_niat_munfarid_title: "Niat Ba'diyah Dzuhur",
    mission_sunnah_ba_diyah_dhuhr_niat_munfarid_translation: "Aku niat melakukan shalat sunat sesudah dzuhur 2 rakaat karena Allah ta'ala.",
    mission_sunnah_ba_diyah_dhuhr_source: "HR. Bukhari & Muslim",

    mission_sunnah_ba_diyah_maghrib_title: "Ba'diyah Maghrib",
    mission_sunnah_ba_diyah_maghrib_desc: "Sholat sunnah sesudah Maghrib (setelah sholat Maghrib)",
    mission_sunnah_ba_diyah_maghrib_dalil: "HR. Bukhari no. 1180",
    mission_sunnah_ba_diyah_maghrib_intro: "Sunnah muakkad yang sangat dianjurkan setelah Maghrib.",
    mission_sunnah_ba_diyah_maghrib_fadhilah: [
        "Menyempurnakan kekurangan sholat Maghrib",
        "Amalan yang senantiasa dijaga Rasulullah SAW"
    ],
    mission_sunnah_ba_diyah_maghrib_guides: [
        "Waktu: Setelah sholat fardhu Maghrib sebelum masuk waktu Isya.",
        "Sangat dianjurkan dilakukan 2 rakaat."
    ],
    mission_sunnah_ba_diyah_maghrib_niat_munfarid_title: "Niat Ba'diyah Maghrib",
    mission_sunnah_ba_diyah_maghrib_niat_munfarid_translation: "Aku niat melakukan shalat sunat sesudah maghrib 2 rakaat karena Allah ta'ala.",
    mission_sunnah_ba_diyah_maghrib_source: "HR. Bukhari & Muslim",

    mission_sunnah_ba_diyah_isha_title: "Ba'diyah Isya",
    mission_sunnah_ba_diyah_isha_desc: "Sholat sunnah sesudah Isya (setelah sholat Isya)",
    mission_sunnah_ba_diyah_isha_dalil: "HR. Muslim no. 729",
    mission_sunnah_ba_diyah_isha_intro: "Menutup rangkaian sholat fardhu harian dengan sunnah Isya.",
    mission_sunnah_ba_diyah_isha_fadhilah: [
        "Pahala yang besar sebagai penutup malam",
        "Menggenapi kekurangan sholat fardhu Isya"
    ],
    mission_sunnah_ba_diyah_isha_guides: [
        "Waktu: Setelah sholat fardhu Isya.",
        "Dilakukan 2 rakaat."
    ],
    mission_sunnah_ba_diyah_isha_niat_munfarid_title: "Niat Ba'diyah Isya",
    mission_sunnah_ba_diyah_isha_niat_munfarid_translation: "Aku niat melakukan shalat sunat sesudah isya 2 rakaat karena Allah ta'ala.",
    mission_sunnah_ba_diyah_isha_source: "HR. Bukhari & Muslim",

    mission_sunnah_dhuha_title: "Sholat Dhuha",
    mission_sunnah_dhuha_desc: "Tunaikan sholat Dhuha (jam 06:00-11:00)",
    mission_sunnah_dhuha_dalil: "HR. Muslim no. 720",
    mission_sunnah_dhuha_intro: "Sholat Dhuha adalah sedekah bagi seluruh persendian tubuh.",
    mission_sunnah_dhuha_fadhilah: [
        "Sedekah bagi 360 persendian tubuh",
        "Membuka pintu rezeki dan keberkahan siang hari",
        "Dibangunkan rumah di surga (bagi yang 12 rakaat)",
        "Wajah bercahaya dan hati tenang"
    ],
    mission_sunnah_dhuha_guides: [
        "Waktu: 15 menit setelah Syuruq hingga 15 menit sebelum Dzuhur (jam 06:00 - 11:00).",
        "Utama dilakukan saat panas matahari mulai terasa (jam 9-10 pagi).",
        "Minimal 2 rakaat, maksimal 12 rakaat."
    ],
    mission_sunnah_dhuha_niat_munfarid_title: "Niat Sholat Dhuha",
    mission_sunnah_dhuha_niat_munfarid_translation: "Aku niat melakukan shalat sunat dhuha 2 rakaat karena Allah ta'ala.",
    mission_sunnah_dhuha_source: "Kitab Shahih Muslim - Bab Shalat ad-Dhuha",

    mission_sunnah_witir_title: "Sholat Witir",
    mission_sunnah_witir_desc: "Sholat malam ganjil (setelah Isya - Subuh)",
    mission_sunnah_witir_dalil: "HR. Bukhari no. 998",
    mission_sunnah_witir_intro: "Witir adalah sholat penutup malam yang sangat dicintai Allah.",
    mission_sunnah_witir_fadhilah: [
        "Allah itu Witir (Ganjil) dan menyukai yang witir",
        "Penutup rangkaian sholat malam agar menjadi ganjil",
        "Waktu mustajab di penghujung malam"
    ],
    mission_sunnah_witir_guides: [
        "Waktu: Setelah Isya hingga sebelum Subuh.",
        "Minimal 1 rakaat, maksimal 11 rakaat.",
        "Bisa dilakukan langsung setelah Ba'diyah Isya jika khawatir tidak bangun malam."
    ],
    mission_sunnah_witir_niat_munfarid_title: "Niat Sholat Witir (1 Rakaat)",
    mission_sunnah_witir_niat_munfarid_translation: "Aku niat melakukan shalat sunat witir 1 rakaat karena Allah ta'ala.",
    mission_sunnah_witir_source: "HR. Bukhari & Muslim",

    mission_sunnah_tahajjud_title: "Sholat Tahajjud",
    mission_sunnah_tahajjud_desc: "Sholat malam sepertiga malam terakhir (jam 02:00-04:00)",
    mission_sunnah_tahajjud_dalil: "QS. Al-Isra': 79",
    mission_sunnah_tahajjud_intro: "Tahajjud adalah kemuliaan bagi seorang mukmin di sepertiga malam terakhir.",
    mission_sunnah_tahajjud_fadhilah: [
        "Dinaikkan ke tempat yang terpuji (Maqaman Mahmuda)",
        "Tiket masuk surga dengan damai",
        "Waktu paling dekat antara hamba dengan Tuhannya",
        "Pembersih penyakit hati dan jasmani"
    ],
    mission_sunnah_tahajjud_guides: [
        "Waktu: Setelah sholat Isya hingga sebelum Subuh (harus tidur dulu, utama jam 02:00 - 04:00).",
        "Utama dilakukan di sepertiga malam terakhir (jam 02:00 ke atas).",
        "Minimal 2 rakaat, maksimal tidak terbatas."
    ],
    mission_sunnah_tahajjud_niat_munfarid_title: "Niat Sholat Tahajjud",
    mission_sunnah_tahajjud_niat_munfarid_translation: "Aku niat melakukan shalat sunat tahajjud 2 rakaat karena Allah ta'ala.",
    mission_sunnah_tahajjud_source: "QS. Al-Isra: 79, HR. Tirmidzi",

    mission_sunnah_istikharah_title: "Sholat Istikharah",
    mission_sunnah_istikharah_desc: "Sholat memohon petunjuk pilihan (kapan saja di luar waktu terlarang)",
    mission_sunnah_istikharah_dalil: "HR. Bukhari no. 1166",
    mission_sunnah_istikharah_intro: "Sholat untuk meminta pilihan terbaik dari Allah SWT dalam setiap urusan.",
    mission_sunnah_istikharah_fadhilah: [
        "Mendapatkan ketetapan hati dalam mengambil keputusan",
        "Dijauhkan dari penyesalan di masa depan",
        "Menyerahkan segala urusan kepada Yang Maha Mengetahui"
    ],
    mission_sunnah_istikharah_guides: [
        "Bisa dilakukan kapan saja kecuali waktu yang dilarang.",
        "Dilakukan 2 rakaat, lalu membaca doa istikharah setelah sholat.",
        "Istikharah tidak selalu lewat mimpi, bisa lewat kemantapan hati."
    ],
    mission_sunnah_istikharah_niat_munfarid_title: "Niat Sholat Istikharah",
    mission_sunnah_istikharah_niat_munfarid_translation: "Aku niat melakukan shalat sunat istikharah 2 rakaat karena Allah ta'ala.",
    mission_sunnah_istikharah_source: "HR. Bukhari",

    mission_sunnah_hajat_title: "Sholat Hajat",
    mission_sunnah_hajat_desc: "Sholat saat memiliki hajat (utama sepertiga malam)",
    mission_sunnah_hajat_dalil: "HR. Tirmidzi no. 479",
    mission_sunnah_hajat_intro: "Sholat saat memiliki keperluan atau keinginan kepada Allah SWT.",
    mission_sunnah_hajat_fadhilah: [
        "Allah akan mengabulkan hajat hamba-Nya",
        "Bentuk kepasrahan total atas sebuah keperluan",
        "Mendekatkan diri saat sedang kesulitan"
    ],
    mission_sunnah_hajat_guides: [
        "Dilakukan 2 rakaat, lalu berdoa dengan khusyuk menyebutkan hajatnya.",
        "Bisa dilakukan kapan saja, lebih utama di sepertiga malam terakhir."
    ],
    mission_sunnah_hajat_niat_munfarid_title: "Niat Sholat Hajat",
    mission_sunnah_hajat_niat_munfarid_translation: "Aku niat melakukan shalat sunat hajat 2 rakaat karena Allah ta'ala.",
    mission_sunnah_hajat_source: "HR. Tirmidzi & Ibnu Majah",

    mission_sunnah_taubat_title: "Sholat Taubat",
    mission_sunnah_taubat_desc: "Sholat memohon ampunan dosa (kapan saja di luar waktu terlarang)",
    mission_sunnah_taubat_dalil: "HR. Abu Dawud no. 1521",
    mission_sunnah_taubat_intro: "Sholat untuk memohon ampunan atas dosa-dosa yang telah diperbuat.",
    mission_sunnah_taubat_fadhilah: [
        "Dihapuskannya dosa-dosa bagi yang bertaubat dengan sungguh-sungguh",
        "Mendapatkan ketenangan jiwa setelah memohon ampun",
        "Menjadi hamba yang dicintai Allah karena bertaubat"
    ],
    mission_sunnah_taubat_guides: [
        "Dilakukan 2 rakaat dengan penuh penyesalan.",
        "Memperbanyak istighfar dan janji tidak mengulangi dosa tersebut."
    ],
    mission_sunnah_taubat_niat_munfarid_title: "Niat Sholat Taubat",
    mission_sunnah_taubat_niat_munfarid_translation: "Aku niat melakukan shalat sunat taubat 2 rakaat karena Allah ta'ala.",
    mission_sunnah_taubat_source: "HR. Abu Daud & Tirmidzi",

    mission_sunnah_tarawih_title: "Sholat Tarawih",
    mission_sunnah_tarawih_desc: "Sholat malam bulan Ramadhan (setelah Isya - Subuh)",
    mission_sunnah_tarawih_dalil: "HR. Bukhari no. 37",
    mission_sunnah_tarawih_intro: "Sholat malam khusus di bulan Ramadhan untuk menghidupkan malam bulan suci.",
    mission_sunnah_tarawih_fadhilah: [
        "Diampuni dosa-dosa yang telah lalu (jika dilakukan dengan iman & ikhlas)",
        "Pahala sholat semalam suntuk (jika berjamaah bersama imam hingga selesai)",
        "Mendekatkan diri kepada Allah di bulan penuh rahmat"
    ],
    mission_sunnah_tarawih_guides: [
        "Waktu: Setelah Isya hingga sebelum Subuh di bulan Ramadhan.",
        "Bisa dilakukan 8 atau 20 rakaat (2 rakaat sekali salam).",
        "Ditutup dengan sholat Witir."
    ],
    mission_sunnah_tarawih_niat_munfarid_title: "Niat Sholat Tarawih",
    mission_sunnah_tarawih_niat_munfarid_translation: "Aku niat melakukan shalat sunat tarawih 2 rakaat karena Allah ta'ala.",
    mission_sunnah_tarawih_source: "HR. Bukhari & Muslim",

    mission_sunnah_eid_fitri_title: "Sholat Idul Fitri",
    mission_sunnah_eid_fitri_desc: "Sholat hari raya 1 Syawal (jam 06:30-08:00)",
    mission_sunnah_eid_fitri_dalil: "HR. Bukhari no. 958",
    mission_sunnah_eid_fitri_intro: "Sholat hari raya kemenangan setelah sebulan penuh berpuasa.",
    mission_sunnah_eid_fitri_fadhilah: [
        "Simbol kegembiraan dan syukur hamba kepada Penciptanya",
        "Sarana silaturahmi akbar umat muslim",
        "Mendapatkan ampunan dan rahmat di hari yang fitri"
    ],
    mission_sunnah_eid_fitri_guides: [
        "Waktu: Pagi hari tanggal 1 Syawal setelah matahari terbit (jam 06:30 - 08:00).",
        "Dilakukan 2 rakaat dengan 7 takbir (rakaat 1) dan 5 takbir (rakaat 2).",
        "Disunnahkan makan sebelum berangkat sholat."
    ],
    mission_sunnah_eid_fitri_niat_munfarid_title: "Niat Sholat Idul Fitri",
    mission_sunnah_eid_fitri_niat_munfarid_translation: "Aku niat melakukan shalat sunat Idul Fitri 2 rakaat karena Allah ta'ala.",
    mission_sunnah_eid_fitri_source: "HR. Bukhari & Muslim",

    mission_sunnah_eid_adha_title: "Sholat Idul Adha",
    mission_sunnah_eid_adha_desc: "Sholat hari raya 10 Dzulhijjah (jam 06:30-08:00)",
    mission_sunnah_eid_adha_dalil: "HR. Bukhari no. 951",
    mission_sunnah_eid_adha_intro: "Sholat hari raya kurban sebagai peringatan ketauhidan Nabi Ibrahim AS.",
    mission_sunnah_eid_adha_fadhilah: [
        "Mengingat pengabdian total Nabi Ibrahim & Ismail kepada Allah",
        "Awal dari hari-hari tasyrik yang penuh keberkahan",
        "Syiar Islam yang agung di seluruh dunia"
    ],
    mission_sunnah_eid_adha_guides: [
        "Waktu: Pagi hari tanggal 10 Dzulhijjah setelah matahari terbit (jam 06:30 - 08:00).",
        "Tata cara sama dengan Idul Fitri (7 & 5 takbir).",
        "Disunnahkan tidak makan hingga selesai sholat."
    ],
    mission_sunnah_eid_adha_niat_munfarid_title: "Niat Sholat Idul Adha",
    mission_sunnah_eid_adha_niat_munfarid_translation: "Aku niat melakukan shalat sunat Idul Adha 2 rakaat karena Allah ta'ala.",
    mission_sunnah_eid_adha_source: "HR. Bukhari & Muslim",

    mission_sunnah_gerhana_title: "Sholat Gerhana",
    mission_sunnah_gerhana_desc: "Sholat sunnah saat gerhana (selama terjadi gerhana)",
    mission_sunnah_gerhana_dalil: "HR. Bukhari no. 1040",
    mission_sunnah_gerhana_intro: "Sholat Kusuf (Matahari) atau Khusuf (Bulan) saat terjadi fenomena alam gerhana.",
    mission_sunnah_gerhana_fadhilah: [
        "Mengingat kebesaran Allah melalui fenomena alam",
        "Bentuk ketundukan hamba agar dijauhkan dari marabahaya",
        "Mengikuti sunnah Rasulullah saat terjadi gerhana"
    ],
    mission_sunnah_gerhana_guides: [
        "Waktu: Selama proses gerhana berlangsung.",
        "Terdiri dari 2 rakaat, setiap rakaat memiliki 2 kali berdiri (baca Al-Fatihah & surah) dan 2 kali ruku'."
    ],
    mission_sunnah_gerhana_niat_munfarid_title: "Niat Sholat Gerhana",
    mission_sunnah_gerhana_niat_munfarid_translation: "Aku niat melakukan shalat sunat gerhana 2 rakaat karena Allah ta'ala.",
    mission_sunnah_gerhana_source: "HR. Bukhari & Muslim",

    mission_sunnah_istisqa_title: "Sholat Istisqa",
    mission_sunnah_istisqa_desc: "Sholat memohon hujan (siang hari di lapangan)",
    mission_sunnah_istisqa_dalil: "HR. Bukhari no. 1012",
    mission_sunnah_istisqa_intro: "Sholat untuk memohon turunnya hujan di saat kemarau panjang.",
    mission_sunnah_istisqa_fadhilah: [
        "Bentuk kepasrahan kolektif umat kepada Sang Pemberi Rezeki",
        "Mengharap rahmat Allah melalui tetesan air hujan",
        "Mengingatkan hamba atas ketergantungan mutlak kepada Allah"
    ],
    mission_sunnah_istisqa_guides: [
        "Waktu: Biasanya dilakukan di siang hari di lapangan terbuka.",
        "Dilakukan 2 rakaat diikuti dengan khutbah dan doa membalikkan selendang/baju."
    ],
    mission_sunnah_istisqa_niat_munfarid_title: "Niat Sholat Istisqa",
    mission_sunnah_istisqa_niat_munfarid_translation: "Aku niat melakukan shalat sunat istisqa 2 rakaat karena Allah ta'ala.",
    mission_sunnah_istisqa_source: "HR. Bukhari & Muslim",

    // Dhikr Missions (Cards & Detail Content)
    mission_tasbih_99_title: "Tasbih 99x",
    mission_tasbih_99_desc: "Selesaikan dzikir tasbih 99 kali ba'da sholat",
    mission_tasbih_99_dalil: "HR. Abu Dawud no. 5074",
    mission_tasbih_99_intro: "Tasbih 99x adalah dzikir ba'da sholat yang terdiri dari: 33x Subhanallah, 33x Alhamdulillah, dan 33x Allahu Akbar. Amalan ini ringan di lisan namun berat dalam timbangan pahala.",
    mission_tasbih_99_fadhilah: [
        "Diampuni dosanya walau sebanyak buih di lautan",
        "Tanaman surga bagi yang membacanya",
        "Menenangkan hati dan pikiran"
    ],
    mission_tasbih_99_source: "HR. Muslim no. 597",
    mission_tasbih_99_reading_0_title: "Subhanallah (Tasbih)",
    mission_tasbih_99_reading_0_translation: "Maha Suci Allah",
    mission_tasbih_99_reading_0_note: "33x",
    mission_tasbih_99_reading_1_title: "Alhamdulillah (Tahmid)",
    mission_tasbih_99_reading_1_translation: "Segala Puji Bagi Allah",
    mission_tasbih_99_reading_1_note: "33x",
    mission_tasbih_99_reading_2_title: "Allahu Akbar (Takbir)",
    mission_tasbih_99_reading_2_translation: "Allah Maha Besar",
    mission_tasbih_99_reading_2_note: "33x",

    mission_doa_pagi_title: "Dzikir Pagi",
    mission_doa_pagi_desc: "Baca dzikir pagi (jam 04:00-10:00)",
    mission_doa_pagi_dalil: "HR. Abu Dawud no. 5074",
    mission_doa_pagi_intro: "Dzikir pagi adalah pembuka pintu rezeki dan pelindung diri hingga sore hari.",
    mission_doa_pagi_fadhilah: [
        "Dilindungi Allah dari segala marabahaya hingga sore",
        "Mendapatkan ketenangan hati",
        "Dicukupkan segala kebutuhan dunia dan akhirat",
        "Menghapus dosa-dosa kecil"
    ],
    mission_doa_pagi_source: "Al-Ma'tsurat (Himpunan Doa dari Rasulullah SAW)",
    mission_doa_pagi_reading_0_title: "Ayat Kursi",
    mission_doa_pagi_reading_0_translation: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus menerus mengurus (makhluk-Nya)...",
    mission_doa_pagi_reading_0_note: "Dibaca 1x",
    mission_doa_pagi_reading_1_title: "Surah Al-Ikhlas, Al-Falaq, An-Naas",
    mission_doa_pagi_reading_1_translation: "Katakanlah: Dialah Allah, Yang Maha Esa...",
    mission_doa_pagi_reading_1_note: "Masing-masing dibaca 3x",
    mission_doa_pagi_reading_2_title: "Sayyidul Istighfar",
    mission_doa_pagi_reading_2_translation: "Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah selain Engkau...",
    mission_doa_pagi_reading_2_note: "Dibaca 1x",

    mission_doa_sore_title: "Dzikir Sore",
    mission_doa_sore_desc: "Baca dzikir sore (jam 15:00-18:00)",
    mission_doa_sore_dalil: "HR. Abu Dawud no. 5074",
    mission_doa_sore_intro: "Dzikir sore menutup aktivitas harian dengan perlindungan dan rasa syukur.",
    mission_doa_sore_fadhilah: [
        "Dilindungi dari gangguan setan di malam hari",
        "Menutup hari dengan pahala",
        "Menenangkan jiwa setelah seharian beraktivitas"
    ],
    mission_doa_sore_source: "Al-Ma'tsurat",
    mission_doa_sore_reading_0_title: "Ayat Kursi",
    mission_doa_sore_reading_0_translation: "Allah, tidak ada tuhan selain Dia...",
    mission_doa_sore_reading_0_note: "Dibaca 1x",
    mission_doa_sore_reading_1_title: "Doa Perlindungan",
    mission_doa_sore_reading_1_translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk-Nya.",
    mission_doa_sore_reading_1_note: "Dibaca 3x",

    mission_menstruation_dhikr_title: "Dzikir Saat Udzur",
    mission_menstruation_dhikr_desc: "Perbanyak dzikir dan istighfar saat haid",
    mission_menstruation_dhikr_dalil: "HR. Bukhari no. 305",
    mission_menstruation_dhikr_intro: "Wanita yang sedang haid (udzur syar'i) tidak sholat/puasa, namun tetap bisa panen pahala dengan dzikir dan doa.",
    mission_menstruation_dhikr_fadhilah: [
        "Tetap terhubung dengan Allah meski sedang berhalangan",
        "Mengisi waktu luang dengan pahala",
        "Menjaga hati agar tidak kering dari mengingat Allah"
    ],
    mission_menstruation_dhikr_guides: [
        "Mendengarkan Murottal Al-Quran",
        "Membaca buku-buku agama/sirah",
        "Berdoa di waktu mustajab",
        "Sedekah dan memberi makan orang lain"
    ],
    mission_menstruation_dhikr_source: "Ijma Ulama",
    mission_menstruation_dhikr_reading_0_title: "Istighfar",
    mission_menstruation_dhikr_reading_0_translation: "Aku memohon ampun kepada Allah",
    mission_menstruation_dhikr_reading_0_note: "Perbanyak sebanyak-banyaknya",
    mission_menstruation_dhikr_reading_1_title: "Shalawat",
    mission_menstruation_dhikr_reading_1_translation: "Ya Allah sampaikanlah shalawat kepada Nabi Muhammad",
    mission_menstruation_dhikr_reading_1_note: "Perbanyak shalawat",

    mission_salawat_100x_title: "Shalawat 100x",
    mission_salawat_100x_desc: "Membaca shalawat 100 kali",
    mission_salawat_100x_dalil: "QS. Al-Ahzab: 56 | HR. Muslim no. 408",
    mission_salawat_100x_intro: "Membaca shalawat kepada Nabi Muhammad SAW.",
    mission_salawat_100x_fadhilah: [
        "Barangsiapa bershalawat kepadaku 1x, Allah bershalawat kepadanya 10x",
        "Mendapat syafaat di hari kiamat",
        "Dikabulkannya doa-doa"
    ],
    mission_salawat_100x_source: "HR. Muslim",
    mission_salawat_100x_reading_0_title: "Shalawat Nabi",
    mission_salawat_100x_reading_0_translation: "Ya Allah, berilah shalawat kepada Muhammad dan keluarga Muhammad",
    mission_salawat_100x_reading_0_note: "100x",

    // Fasting & Quran Missions (Cards & Detail Content)
    mission_sunnah_fasting_title: "Puasa Sunnah",
    mission_sunnah_fasting_desc: "Puasa sunnah Senin & Kamis",
    mission_sunnah_fasting_dalil: "HR. Muslim no. 1162",
    mission_sunnah_fasting_intro: "Puasa Senin dan Kamis adalah kebiasaan Rasulullah SAW, di mana amal perbuatan manusia dilaporkan kepada Allah.",
    mission_sunnah_fasting_fadhilah: [
        "Pintu Surga khusus (Ar-Rayyan) bagi orang yang berpuasa",
        "Bau mulut orang puasa lebih harum di sisi Allah dari minyak kasturi",
        "Dijauhkan wajahnya dari api neraka sejauh 70 tahun perjalanan",
        "Doa orang berpuasa tidak akan ditolak hingga berbuka"
    ],
    mission_sunnah_fasting_niat_munfarid_title: "Niat Puasa Senin",
    mission_sunnah_fasting_niat_munfarid_translation: "Saya niat puasa hari Senin karena Allah Ta'āla.",
    mission_sunnah_fasting_niat_makmum_title: "Niat Puasa Kamis",
    mission_sunnah_fasting_niat_makmum_translation: "Saya niat puasa hari Kamis karena Allah Ta'āla.",
    mission_sunnah_fasting_source: "HR. Tirmidzi & Muslim",

    mission_makeup_fasting_tracker_title: "Tracker Qadha Puasa",
    mission_makeup_fasting_tracker_desc: "Catat dan bayar utang puasa Ramadhan",
    mission_makeup_fasting_tracker_dalil: "QS. Al-Baqarah: 184",
    mission_makeup_fasting_tracker_intro: "Hutang kepada Allah (puasa wajib) lebih berhak untuk ditunaikan. Gunakan tracker ini untuk mencatat progress pelunasan.",
    mission_makeup_fasting_tracker_fadhilah: [
        "Gugurnya kewajiban/dosa meninggalkan puasa",
        "Disiplin dalam menunaikan hutang ibadah",
        "Ketenangan hati menyambut Ramadhan baru"
    ],
    mission_makeup_fasting_tracker_niat_munfarid_title: "Niat Puasa Qadha",
    mission_makeup_fasting_tracker_niat_munfarid_translation: "Aku berniat untuk mengqadha puasa Bulan Ramadhan esok hari karena Allah Ta'ala.",
    mission_makeup_fasting_tracker_source: "QS. Al-Baqarah: 184",

    mission_puasa_syaban_title: "Puasa Sunnah Sya'ban",
    mission_puasa_syaban_desc: "Perbanyak puasa sunnah di bulan Sya'ban",
    mission_puasa_syaban_dalil: "HR. Bukhari no. 1969",
    mission_puasa_syaban_intro: "Latihan puasa sunnah di bulan Sya'ban sebagai pemanasan fisik dan mental menyambut Ramadhan.",
    mission_puasa_syaban_fadhilah: [
        "Membiasakan lambung dan fisik agar tidak kaget saat Ramadhan",
        "Menghidupkan sunnah di bulan yang sering dilalaikan manusia",
        "Amal perbuatan diangkat kepada Allah dalam keadaan berpuasa"
    ],
    mission_puasa_syaban_guides: [
        "Tetapkan niat sebelum Subuh atau di pagi hari untuk puasa sunnah",
        "Jaga kecukupan hidrasi air minum saat sahur dan berbuka"
    ],
    mission_puasa_syaban_niat_munfarid_title: "Niat Puasa Sya'ban",
    mission_puasa_syaban_niat_munfarid_translation: "Aku niat puasa sunnah di bulan Sya'ban karena Allah Ta'ala.",
    mission_puasa_syaban_source: "HR. An-Nasa'i no. 2357",

    mission_quran_10_ayat_title: "Baca 10 Ayat Quran",
    mission_quran_10_ayat_desc: "Membaca minimal 10 ayat Al-Quran harian",
    mission_quran_10_ayat_dalil: "QS. Al-Muzzammil: 20",
    mission_quran_10_ayat_intro: "Membaca Al-Quran adalah perdagangan yang tidak akan pernah merugi. 10 Ayat sehari adalah langkah awal membangun kebiasaan.",
    mission_quran_10_ayat_fadhilah: [
        "Satu huruf diganjar 10 kebaikan",
        "Syafaat (penolong) di hari kiamat bagi pembacanya",
        "Menurunkan ketenangan (Sakinah) dan rahmat",
        "Sebaik-baik manusia adalah yang belajar Al-Quran dan mengajarkannya"
    ],
    mission_quran_10_ayat_guides: [
        "Berwudhu sebelum membaca",
        "Menghadap Kiblat",
        "Mulai dengan Ta'awudz (A'udzu billahi minasy syaithanir rajim) dan Basmalah",
        "Baca dengan Tartil (perlahan dan jelas)"
    ],
    mission_quran_10_ayat_source: "HR. Tirmidzi & Bukhari",

    mission_read_surah_al_mulk_title: "Baca Surah Al-Mulk",
    mission_read_surah_al_mulk_desc: "Membaca Surah Al-Mulk (67) pelindung dari azab kubur",
    mission_read_surah_al_mulk_dalil: "HR. Tirmidzi no. 2891",
    mission_read_surah_al_mulk_intro: "Surah Al-Mulk (Kerajaan) terdiri dari 30 ayat. Rasulullah SAW senantiasa membacanya sebelum tidur sebagai benteng dari siksa kubur.",
    mission_read_surah_al_mulk_fadhilah: [
        "Melindungi pembacanya dari azab dan nikmat kubur",
        "Memberikan syafaat hingga pembacanya diampuni dosanya",
        "Amalan sunnah yang dirutinkan Nabi SAW sebelum beristirahat malam"
    ],
    mission_read_surah_al_mulk_guides: [
        "Disunnahkan dibaca setiap malam menjelang tidur",
        "Dibaca dengan tartil dan meresapi keagungan ciptaan Allah",
        "Dapat dibaca dari mushaf Quran maupun hafalan"
    ],
    mission_read_surah_al_mulk_source: "HR. Tirmidzi no. 2891 & HR. Abu Dawud",

    mission_read_surah_al_waqiah_title: "Baca Surah Al-Waqi'ah",
    mission_read_surah_al_waqiah_desc: "Membaca Surah Al-Waqi'ah (56) penolak kefakiran",
    mission_read_surah_al_waqiah_dalil: "HR. Al-Baihaqi no. 2269",
    mission_read_surah_al_waqiah_intro: "Surah Al-Waqi'ah (Hari Kiamat) diajarkan para sahabat dan ulama sebagai penawar kesempitan rezeki dan pelindung dari kemiskinan jiwa.",
    mission_read_surah_al_waqiah_fadhilah: [
        "Menjauhkan pembacanya dari kefakiran dan kesusahan",
        "Mengingatkan tentang huru-hara hari kiamat dan balasan ahli surga",
        "Mendatangkan ketenangan dan keberekahan rezeki"
    ],
    mission_read_surah_al_waqiah_guides: [
        "Waktu utama dibaca pada malam hari (setelah Maghrib atau Isya)",
        "Memperhatikan tajwid dan peresapan makna",
        "Diiringi dengan usaha ikhtiar yang halal dan bersedekah"
    ],
    mission_read_surah_al_waqiah_source: "HR. Ibn Asakir & Shu'ab al-Iman",

    mission_read_surah_ar_rahman_title: "Baca Surah Ar-Rahman",
    mission_read_surah_ar_rahman_desc: "Membaca Surah Ar-Rahman (55) pengingat nikmat Allah",
    mission_read_surah_ar_rahman_dalil: "HR. Al-Baihaqi no. 2252",
    mission_read_surah_ar_rahman_intro: "Surah Ar-Rahman (Yang Maha Pengasih) adalah pengantinnya Al-Quran (Aroosul Quran) yang menegaskan kelimpahan kasih sayang dan nikmat Allah.",
    mission_read_surah_ar_rahman_fadhilah: [
        "Dijuluki sebagai Pengantin Al-Quran (Aroosul Quran)",
        "Menggugah rasa syukur atas segala nikmat yang sering terabaikan",
        "Membersihkan hati dari kekufuran dan kesombongan"
    ],
    mission_read_surah_ar_rahman_guides: [
        "Dapat dibaca kapan saja, khususnya saat pagi atau sore hari",
        "Resapi setiap pengulangan ayat nikmat 'Fabi-ayyi ala-i Rabbikuma tukadzdziban'",
        "Jadikan sebagai sarana tadabbur dan penenang jiwa"
    ],
    mission_read_surah_ar_rahman_source: "HR. Al-Baihaqi & HR. Tirmidzi",

    mission_read_surah_al_kahf_title: "Baca Surah Al-Kahf",
    mission_read_surah_al_kahf_desc: "Membaca Surah Al-Kahf (18) penerang di hari Jumat",
    mission_read_surah_al_kahf_dalil: "HR. Al-Hakim no. 3392",
    mission_read_surah_al_kahf_intro: "Membaca Surah Al-Kahf pada malam Jumat atau hari Jumat menyinarkan cahaya petunjuk dan benteng keselamatan dari fitnah Dajjal.",
    mission_read_surah_al_kahf_fadhilah: [
        "Dipancarkan cahaya di antara dua Jumat",
        "Pelindung utama dari fitnah besar akhir zaman (fitnah Dajjal)",
        "Mengampuni dosa-dosa kecil di antara dua pekan"
    ],
    mission_read_surah_al_kahf_guides: [
        "Waktu baca dimulai sejak Kamis malam (Maghrib) hingga Jumat sebelum Maghrib",
        "Dapat dibaca bertahap bila tidak selesai sekaligus",
        "Dianjurkan pula menghafal 10 ayat pertama atau 10 ayat terakhir"
    ],
    mission_read_surah_al_kahf_source: "HR. Al-Hakim & Al-Baihaqi",

    mission_read_surah_yasin_title: "Baca Surah Yasin",
    mission_read_surah_yasin_desc: "Membaca Surah Yasin (36) jantung Al-Quran",
    mission_read_surah_yasin_dalil: "HR. Tirmidzi no. 2887",
    mission_read_surah_yasin_intro: "Surah Yasin adalah jantungnya Al-Quran (Qalbul Quran). Membacanya membawa keberkahan, kemudahan hajat, dan ampunan dosa.",
    mission_read_surah_yasin_fadhilah: [
        "Dikenal sebagai Jantung Al-Quran (Qalbul Quran)",
        "Mempermudah urusan kehidupan dan hajat-hajat kebaikan",
        "Dilipatgandakan pahala pembacanya di sisi Allah"
    ],
    mission_read_surah_yasin_guides: [
        "Dianjurkan dibaca di pagi hari setelah Subuh atau malam hari",
        "Dibaca secara khusyuk dan perlahan",
        "Tutup dengan berdoa memohon kebaikan dunia dan akhirat"
    ],
    mission_read_surah_yasin_source: "Kitab Sunan At-Tirmidzi & Sunan Ad-Darimi",

    mission_set_khatam_target_title: "Tadarus Al-Quran",
    mission_set_khatam_target_desc: "Baca minimal 1 halaman menuju khatam",
    mission_set_khatam_target_dalil: "HR. Muslim no. 804",
    mission_set_khatam_target_intro: "Tadarus dan tilawah Al-Quran secara konsisten harian menuju khatam.",
    mission_set_khatam_target_fadhilah: [
        "Satu huruf diganjar 10 kebaikan di sisi Allah",
        "Memberikan mahkota kehormatan bagi kedua orang tua di akhirat",
        "Hati menjadi tenang dan tenteram"
    ],
    mission_set_khatam_target_guides: [
        "Niatkan ikhlas karena Allah",
        "Luangkan waktu khusus setiap habis sholat fardhu (misal 2 halaman)",
        "Gunakan fitur penanda/tracker untuk mencatat halaman terakhir"
    ],
    mission_set_khatam_target_source: "HR. Tirmidzi & Muslim",

    mission_syaban_quran_title: "Bulan Para Pembaca Al-Quran",
    mission_syaban_quran_desc: "Tingkatkan tilawah Al-Quran (Shahrul Qurra)",
    mission_syaban_quran_dalil: "HR. Ibn Rajab no. 385",
    mission_syaban_quran_intro: "Sya'ban dijuluki oleh para ulama salaf sebagai Shahrul Qurra (Bulan Para Pembaca Quran) sebagai persiapan menyambut Ramadhan.",
    mission_syaban_quran_fadhilah: [
        "Mengikuti jejak para ulama salafus shalih",
        "Melatih kelancaran dan fokus membaca Al-Quran",
        "Memenuhi rumah dengan keberkahan dan cahaya Al-Quran"
    ],
    mission_syaban_quran_guides: [
        "Tingkatkan target bacaan secara bertahap",
        "Kombinasikan tilawah dengan membaca terjemahan ayat"
    ],
    mission_syaban_quran_source: "Ibnu Rajab Al-Hanbali",

    mission_tarawih_prayer_title: "Sholat Tarawih",
    mission_tarawih_prayer_desc: "Sholat tarawih malam ini (8-20 rakaat)",
    mission_breaking_fast_dua_title: "Doa Berbuka Puasa",
    mission_breaking_fast_dua_desc: "Baca doa berbuka saat Maghrib",
    mission_sedekah_ramadhan_title: "Sedekah Harian",
    mission_sedekah_ramadhan_desc: "Sisihkan untuk sedekah hari ini",
    mission_pre_dawn_meal_title: "Sahur",
    mission_pre_dawn_meal_desc: "Makan sahur sebelum Imsak",
    mission_makeup_fasting_title: "Lunasi Qadha Puasa",
    mission_makeup_fasting_desc: "Segera lunasi hutang puasa sebelum Ramadhan",
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
