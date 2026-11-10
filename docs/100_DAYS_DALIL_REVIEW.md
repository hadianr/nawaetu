# 100 Hari Menuju Ramadan: Peninjauan Dalil

**Status:** menunggu tinjauan ustadz / ahli hadits sebelum rilis.
**Sumber data:** semua teks hadits dan ayat diambil dari data yang sudah ada di aplikasi
(`src/data/hadiths`, `src/data/ramadhan`), bukan ditulis ulang. Pasangan kebiasaan dan dalil ada di
`src/data/ramadhan-journey.ts`. Tes `ramadhan-journey.test.ts` memastikan setiap hadits ada di pustaka.

## Pasangan kebiasaan dan dalil

| # | Kebiasaan (ringkas) | Fase | Dalil (id di pustaka) | Catatan untuk peninjau |
| --- | --- | --- | --- | --- |
| 1 | 1 halaman Quran sudah cukup | 2, 3 | Bukhari 6465, amal yang terus-menerus walau sedikit (`hadith_istiqomah_sedikit`) | Cocok |
| 2 | Baca beberapa ayat, sedikit pun cukup (dulu: "Tukar scroll dengan 5 ayat") | 1 | Bukhari 6465, amal yang terus-menerus walau sedikit (`hadith_istiqomah_sedikit`) | Angka "5 ayat" dan kata "scroll" dihapus: tidak ada dalil yang menyebutnya. Pertimbangkan QS. Al-Muzzammil: 20 (membaca yang mudah) setelah teksnya diverifikasi dan masuk pustaka |
| 3 | Dzikir 1 menit | 1 | Muslim 2731, kalimat yang paling dicintai Allah (`hadith_dzikir`) | Cocok |
| 4 | Satu sholat tepat waktu | 2, 3 | Bukhari 527 / Muslim 85 (`hadith_sholat_awal_waktu`) | Cocok |
| 5 | Syukuri satu hal | 1 | Ahmad 18449, syukur atas yang sedikit (`hadith_syukur_nikmat_kecil`, Hasan) | **Cek derajat** |
| 6 | Latihan sahur | 3 | Bukhari 1923 / Muslim 1095, dalam sahur ada berkah (`hadith_sahur`) | Cocok |
| 7 | Berkata baik atau diam | 1 | Bukhari 6018 (`hadith_berkata_baik_atau_diam`) | Cocok |
| 8 | Sedekah kecil | 2 | Bukhari 1442, doa malaikat bagi yang berinfak (`hadith_sedekah_subuh`) | Hadits menyebut pagi hari; kebiasaan tidak membatasi waktu |
| 9 | Kabari keluarga atau teman | 2 | Bukhari 5986 / Muslim 2557, silaturrahim (`hadith_silaturrahim`) | Hadits tentang kerabat; teks kebiasaan sudah menyebut "keluarga atau teman" |
| 10 | Tidur 30 menit lebih awal | 3 | Bukhari 1975, diri punya hak atasmu (`hadith_menjaga_kesehatan_mental`) | Makna umum, bukan perintah tidur awal |
| 11 | Luruskan niat untuk besok | 1, 3 | Bukhari 1 (`hadith_intention`) | Cocok |
| 12 | Baca atau dengarkan satu surah (Al-Mulk) | 2, 3 | Tirmidzi 2891, Surah Al-Mulk (`hadith_surah_al_mulk`) | Hadits tentang keutamaan surah; kebiasaan menyarankan Al-Mulk sebagai pilihan |
| 13 | HP 10 menit, duduk tenang | 1 | Bukhari 6412, dua nikmat: sehat dan waktu luang (`hadith_dua_nikmat_terperdaya`) | Pasangan makna longgar, mohon dinilai |
| 14 | Doakan orang lain | 2 | Muslim 2732 (`hadith_mendoakan_saudara_gaib`) | Cocok |

## Dalil per fase

| Fase | Hari lagi | Sumber |
| --- | --- | --- |
| 1 · Luruskan Niat | 100–71 | Bukhari 1 (niat); QS. Al-Baqarah 184 (mengganti puasa yang ditinggalkan) |
| 2 · Bangun Kebiasaan | 70–31 | Bukhari 6465 |
| 3 · Latihan Ramadan | 30–1 | Bukhari 1969 (puasa Sya'ban) |
| Tujuan program | | QS. Al-Baqarah 183 (agar bertakwa) |

## Yang sengaja tidak diubah atau tidak dipakai

1. **Istighfar dihapus** dari daftar kebiasaan karena pustaka belum punya hadits istighfar yang terverifikasi, dan teks
   hadits tidak ditulis dari ingatan. Bisa ditambahkan setelah entri hadits diverifikasi.
2. **`QURAN_RECITATION_EVIDENCE` tidak dipakai.** Di data yang sudah ada, judulnya "HR. Tirmidzi 2910" tetapi
   sumbernya "HR. Muslim No. 804". Salah satunya keliru. Entri ini tampil di halaman Khataman, jadi perlu diperiksa
   terpisah.
3. **Doa "Allahumma barik lana fi Rajab wa Sya'ban"** tidak dipakai karena banyak ulama menilainya lemah.
4. Penjelasan program menyebut jelas bahwa "100 hari" adalah program persiapan buatan Nawaetu, bukan kewajiban dan
   bukan amalan khusus dengan keutamaan tertentu.
5. Fase 1 menyebut mencicil utang puasa, tetapi kartu belum terhubung ke pelacak qadha.

## Pembaruan: kebiasaan yang dihapus agar tidak tumpang tindih dengan kartu lain

- Kebiasaan 4 (sholat tepat waktu) dihapus dari kartu: sholat dimiliki kartu Check-in Sholat.
- Kebiasaan 11 (luruskan niat untuk besok) dihapus: niat dimiliki Jurnal Niat Harian.
- Hadits Bukhari 527 / Muslim 85 dan Bukhari 1 tidak dipakai lagi sebagai dalil kebiasaan harian. Bukhari 1 tetap menjadi dalil Fase 1.
- Tersisa 4 kebiasaan untuk Fase 2 dan 3, jadi berulang tiap 4 hari. Kebiasaan baru perlu hadits terverifikasi.
