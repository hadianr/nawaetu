<p align="center">
  <img src="public/brand/mark.svg" width="96" alt="Logo Nawaetu">
</p>

<h1 align="center">Nawaetu</h1>

<p align="center"><b>Aplikasi Muslim yang dimulai dari niat.</b><br>
Al-Qur'an, sholat, hadits, dan Sirah yang bisa dicek sumbernya, dalam kebiasaan harian yang berangkat dari <i>niat</i>.</p>

<p align="center">
  <a href="https://nawaetu.com"><b>Buka nawaetu.com</b></a> ·
  <a href="README.md">Read in English</a> ·
  <a href="#ringkasan-pitch">Ringkasan pitch</a>
</p>

<p align="center">
  <a href="https://github.com/hadianr/nawaetu/releases"><img src="https://img.shields.io/badge/Version-v1.16.0-158057" alt="Versi"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPL_v3-blue.svg" alt="Lisensi: AGPL v3"></a>
  <a href="https://nawaetu.com"><img src="https://img.shields.io/badge/Live-nawaetu.com-158057" alt="Live di nawaetu.com"></a>
  <img src="https://img.shields.io/badge/Harga-Gratis%2C_tanpa_iklan-D6AC56" alt="Gratis, tanpa iklan">
</p>

<p align="center">
  <img src="public/og-image.png" width="760" alt="Nawaetu: Aplikasi Muslim untuk Ibadah Harian. Mulai Langkah Baikmu Hari Ini, #NiatAjaDulu">
</p>

---

<a name="ringkasan-pitch"></a>
## Ringkasan Pitch

| Topik | Ringkasan |
| :--- | :--- |
| **Satu kalimat** | Aplikasi Muslim gratis tanpa iklan yang menjadikan ibadah harian sebuah kebiasaan yang dimulai dari niat, dengan konten agama yang menampilkan sumbernya. |
| **Masalah** | Kebanyakan aplikasi Muslim berupa kotak perkakas: jam sholat di satu tempat, penghitung di tempat lain. Teks agama di internet sering dibagikan tanpa sumber, dan chatbot AI umum menjawab pertanyaan agama tanpa rujukan. |
| **Solusi** | Satu aplikasi yang menghubungkan niat, ibadah, dan belajar: niat pagi dan refleksi malam, jadwal sholat, kiblat, Al-Qur'an dengan tajwid dan audio, hadits dan doa dengan perawi dan derajat, Sirah dalam tiga format, serta asisten AI yang dirancang menyertakan rujukan. |
| **Keunggulan** | Desain yang dimulai dari niat, konten bersumber yang ditampilkan persis seperti aslinya, asisten yang menyatakan bila sumber belum dapat dipastikan, tanpa iklan, dan open source. |
| **Pasar** | Indonesia saja memiliki sekitar 246 juta Muslim (87% penduduk). Belanja konsumen Muslim global mencapai $2,6 triliun pada 2024. ([sumber](#mengapa-sekarang)) |
| **Traksi** | Live di nawaetu.com sejak 2026, 889 pengguna aktif tahun ini (Google Analytics), 286 akun terdaftar, 587 sholat dan 217 niat tercatat, 90 rilis. ([detail](#sekilas)) |
| **Model bisnis** | Ibadah tetap gratis, tanpa iklan. Pendapatan dari paket organisasi co-branded (perusahaan, sekolah, pesantren), langganan Plus opsional untuk layanan seperti penggunaan AI lebih banyak, dan program bersponsor, dengan donasi sebagai dukungan komunitas. ([detail](#model-bisnis)) |
| **Founder** | Hadian Rahmat ([@hadianr](https://github.com/hadianr)) |

---

<a name="sekilas"></a>
## Sekilas Nawaetu

Angka per **27 November 2026**. Sholat, niat, dan jumlah orang yang beribadah minggu ini diambil dari endpoint publik aplikasi [`/api/stats/global`](https://nawaetu.com/api/stats/global), sehingga bisa diperbarui untuk setiap deck. Akun dan misi dihitung dari database.

| Bidang | Angka |
| :--- | :--- |
| **Akun terdaftar** | 286 (tamu memakai aplikasi tanpa akun dan tidak dihitung) |
| **Pengguna aktif** | 889 sepanjang 2026, rata-rata 3 menit keterlibatan per pengguna (Google Analytics, 1 Januari sampai 23 November). Pelacakan sempat terblokir sampai pertengahan Agustus 2026, jadi bulan-bulan sebelumnya tercatat lebih rendah |
| **Asal pengguna** | Sebagian besar kunjungan langsung dan tautan yang dibagikan, lalu pencarian Google, Instagram, dan Threads. Pengguna berada di Indonesia, terbanyak di Bandung dan Jakarta |
| **Misi diselesaikan** | 844 |
| **Sholat tercatat** | 587 |
| **Niat ditulis** | 217 |
| **Beribadah minggu ini** | 11 orang |
| **Al-Qur'an** | 114 surah, audio per ayat, warna tajwid, terjemahan Indonesia dan Inggris |
| **Hadits dan doa** | 122 hadits sahih dan hasan pilihan (termasuk hadits tentang haid dan istihadah) serta 50 doa, masing-masing dengan perawi dan derajat |
| **Sirah** | 3 format: buku ringkas 10 bagian (dengan izin penulis), Sirah lengkap 50 bab, dan linimasa 13 bab |
| **Kehadiran di pencarian** | 592 halaman terindeks di sitemap, dengan halaman konten yang dirender di server dan `llms.txt` untuk pencarian AI |
| **Pengembangan** | 90 rilis bertag dan 1.417 commit sejak Januari 2026 |
| **Kualitas** | 168 file test (1.087 test), batas coverage baris 80% di CI, pemindaian CodeQL, dan uji browser dengan Anoa |
| **Aksesibilitas** | Teks tombol, teks aksen, dan warna status memenuhi WCAG AA di kelima tema (diuji otomatis), dengan fokus keyboard yang terlihat |
| **Bahasa** | Indonesia dan Inggris |
| **Platform** | Aplikasi web (PWA yang bisa dipasang) dan Android wrapper di repositori ini |
| **Harga** | Gratis, tanpa iklan |

---

## Masalah

1. **Alat ibadah tersebar.** Jadwal sholat, Al-Qur'an, dzikir, dan puasa biasanya ada di aplikasi terpisah atau di sudut yang berbeda dalam satu aplikasi, tanpa ada yang menghubungkannya menjadi kebiasaan harian.
2. **Konten agama sering tanpa sumber.** Hadits dan kutipan beredar tanpa perawi atau derajat, sehingga pembaca tidak bisa mengecek apa yang mereka bagikan.
3. **AI menjawab tanpa rujukan.** Chatbot umum menjawab pertanyaan agama dengan yakin, tanpa menunjukkan ayat atau hadits yang menjadi dasarnya.
4. **Semangat mudah pudar.** Penghitung mencatat angka, tetapi tidak mencatat *mengapa* seseorang beribadah.

## Solusi

Nawaetu membangun hari pengguna di atas tiga gagasan.

| Pilar | Wujudnya di aplikasi |
| :--- | :--- |
| **Niat** | Menetapkan niat setiap pagi dan berefleksi setiap malam. Misi, streak yang pemaaf, dan tujuh tahap perjalanan (Memulai sampai Menebar Manfaat) menghargai konsistensi, bukan sekadar hitungan. Tahap menamai apa yang sedang dilatih, bukan gelar spiritual, dan Hasanah adalah catatan usaha, bukan hitungan pahala. |
| **Ilmu yang bisa dicek** | Al-Qur'an, hadits, doa, dan Sirah menampilkan sumber, perawi, dan derajatnya, serta menjaga teks dari penerbit lain persis seperti aslinya. Tanya Nawaetu, asisten AI-nya, dirancang menyertakan rujukan dan menyatakan bila sumber belum dapat dipastikan. |
| **Ibadah harian** | Jadwal sholat berbasis GPS dengan pengingat, kompas kiblat, kalender Hijriah dengan hari puasa sunnah, tasbih berantai dengan mode fokus, panduan Ramadhan musiman, dan mode udzur untuk muslimah saat haid dan nifas. |

<a name="mengapa-sekarang"></a>
## Mengapa Sekarang

| Sinyal | Angka | Sumber |
| :--- | :--- | :--- |
| Muslim di Indonesia | 245.973.915 orang, 87,08% penduduk (semester I 2024) | [Databoks, mengutip data kependudukan](https://databoks.katadata.co.id/en/demographics/statistics/66b45dd8e5dd0/the-majority-of-indonesias-population-is-muslim-in-the-first-half-of-2024) |
| Belanja konsumen Muslim global | $2,6 triliun pada 2024, diproyeksikan $3,56 triliun pada 2029 | [State of the Global Islamic Economy 2025/26, DinarStandard](https://www.dinarstandard.com/our-impact/state-of-the-global-islamic-economy-report) |
| Permintaan aplikasi Muslim | Muslim Pro melewati 150 juta unduhan di seluruh dunia (2023) | [Siaran pers Bitsmedia](https://prnewswire.com/apac/news-releases/singapore-based-bitsmedia-announces-significant-milestone-with-150-million-downloads-for-its-global-lifestyle-app-301853984.html) |

Nawaetu dimulai dari pengguna berbahasa Indonesia dan Inggris, pasar mayoritas Muslim terbesar, dan dibangun agar bisa dicek di saat makin banyak orang bertanya kepada AI tentang agamanya.

---

## ✨ Produk

Tangkapan layar asli dari aplikasi di [nawaetu.com](https://nawaetu.com) (ukuran HP, 27 November 2026, dengan profil demo). Tersedia lima tema; Daylight adalah tema bawaan dan Emerald adalah tema gelap.

| Beranda: niat dan jadwal sholat | Al-Qur'an dengan audio | Sirah dalam tiga format |
| :---: | :---: | :---: |
| <img src="public/images/readme/home.png" width="240" alt="Beranda dengan jurnal niat dan jadwal sholat hari ini"> | <img src="public/images/readme/quran.png" width="240" alt="Pembaca Al-Qur'an menampilkan Al-Fatihah"> | <img src="public/images/readme/sirah.png" width="240" alt="Halaman Sirah dengan format ringkas, lengkap, dan linimasa"> |
| **Hadits dengan perawi dan derajat** | **Kalender Hijriah dan hari puasa** | **Tasbih (tema gelap Emerald)** |
| <img src="public/images/readme/hadith.png" width="240" alt="Perpustakaan hadits dengan nomor dan derajat"> | <img src="public/images/readme/hijri-calendar.png" width="240" alt="Kalender Hijriah dengan penanda puasa sunnah"> | <img src="public/images/readme/tasbih-emerald.png" width="240" alt="Penghitung tasbih digital dengan tema gelap Emerald"> |
| **Statistik: pesan personal dan tahap perjalanan** | **Cara kerja level: tujuh tahap** | **Mode udzur saat haid** |
| <img src="public/images/readme/stats.png" width="240" alt="Halaman statistik dengan pesan personal yang menyebut sholat paling sering terlewat, dan tahap Menjaga Waktu di level 7"> | <img src="public/images/readme/stage-guide.png" width="240" alt="Panduan tujuh tahap perjalanan dengan tahap saat ini ditandai beserta pengingat haditsnya"> | <img src="public/images/readme/udzur.png" width="240" alt="Check-in sholat dalam mode udzur dengan kelima sholat ditandai terhalang pada hari ke-3"> |

---

## Apa yang Membuat Nawaetu Berbeda?

Banyak aplikasi Islam berfokus pada utilitas seperti jadwal sholat dan penghitung tasbih. Nawaetu mempertahankan alat-alat itu dan membangun di sekitar niat di balik setiap ibadah.

| Aspek | Aplikasi utilitas (cth. Muslim Pro) | Nawaetu |
| :--- | :--- | :--- |
| **Fokus utama** | Jadwal sholat, penghitung, pengingat | **Niat lebih dulu**: alasan di balik ibadahmu |
| **Refleksi** | Penghitung dan pengingat pasif | **Jurnal Muhasabah**: niat pagi, refleksi malam |
| **Konten agama** | Bervariasi menurut aplikasi | **Sumber ditampilkan bersama teksnya**: perawi, derajat, dan tautan, persis seperti aslinya |
| **Tanya jawab Islami** | Artikel dan pencarian teks | **Tanya Nawaetu**: asisten AI yang dirancang menyertakan rujukan Al-Qur'an dan hadits, dan menyatakan bila sumber belum dapat dipastikan |
| **Motivasi** | Penghitung dan streak | **Tahap perjalanan**: tujuh tahap yang dinamai sesuai amalan, tanpa gelar spiritual, streak yang pemaaf, dan mode udzur agar haid dan nifas tidak pernah dihitung bolong |
| **Iklan** | Bervariasi menurut aplikasi dan paket | Tanpa iklan |
| **Kode sumber** | Umumnya closed-source | Open source (AGPLv3) |

---

## Milestone

| Waktu | Milestone |
| :--- | :--- |
| Januari 2026 | Commit pertama |
| 2026 | Aplikasi web live di nawaetu.com: jurnal niat, misi, level Hasanah, check-in sholat, Al-Qur'an, hadits dan doa, tasbih, alat puasa dan Ramadhan |
| Oktober 2026 | Halaman konten dirender di server untuk mesin pencari dan pencarian AI (`llms.txt`, data terstruktur) |
| November 2026 | Sirah dalam tiga format, termasuk buku ringkas Syaikh Haytham Sarhan yang diterbitkan dengan izin tertulis beliau |
| November 2026 | Penyegaran brand: logo dan set ikon vektor datar, tema terang sebagai bawaan, sistem dua font, dan kontras WCAG AA di setiap tema |
| November 2026 | Mode udzur untuk haid dan nifas: sholat yang terhalang tetap menjaga streak, misi menyesuaikan, pengingat sholat dijeda, dan hadits tentang haid masuk ke perpustakaan |
| November 2026 | Revamp statistik dan progres: tujuh tahap perjalanan tanpa gelar spiritual, perhitungan hari udzur yang adil, pesan personal di halaman statistik, dan kartu komunitas "Ibadah Bersama" |

## Roadmap

Ini langkah berikutnya yang sudah tercatat di repositori ini, bukan komitmen bertanggal.

- **Toko aplikasi**: menerbitkan aplikasi Android (wrapper-nya ada di [`android/`](android/)) dan menulis deskripsi toko.
- **Verifikasi hadits**: mengecek nomor hadits di perpustakaan terhadap [Sunnah.com](https://sunnah.com).
- **Kecepatan**: memuat pemutar animasi setelah tampilan pertama agar beranda lebih cepat di HP.
- **Ramadhan 1448 H**: mengaktifkan panduan Ramadhan untuk musimnya; perjalanan 100 hari menuju Ramadhan sudah berjalan.

<a name="model-bisnis"></a>
## Model Bisnis dan Keberlanjutan

**Prinsip: ibadah tetap gratis; Nawaetu hanya menarik biaya atas layanan dan jasa; dukungan tetap sukarela.** Al-Qur'an, hadits, alat sholat, dzikir, Sirah, niat, dan streak gratis untuk semua orang, selamanya. Uang membayar hal yang memang butuh biaya untuk disediakan atau butuh kerja untuk dijalankan, tidak pernah membayar akses ke agama itu sendiri.

### Sumber pendapatan

| Sumber | Siapa yang membayar | Untuk apa | Status |
| :--- | :--- | :--- | :--- |
| **Nawaetu untuk Organisasi** | Perusahaan, sekolah Islam, pesantren, lembaga Islam | Program co-branded ("Nawaetu × organisasi Anda"): niat bersama, khatam bersama, tantangan Ramadhan, dashboard admin, dan laporan partisipasi. Harga per anggota | Direncanakan; mencari mitra uji coba |
| **Nawaetu Plus** | Pengguna perorangan, opsional | Layanan yang punya biaya berjalan atau berupa pendampingan pribadi: Tanya Nawaetu di atas kuota gratis bulanan, paket keluarga, insight jurnal yang lebih dalam. Setiap langganan juga membiayai akun Plus gratis untuk pelajar atau orang yang membutuhkan | Direncanakan |
| **Program bersponsor** | Brand dan lembaga | Program musiman seperti tantangan khatam Ramadhan, hadiah Hasanah, dan infrastruktur, dengan keterangan "didukung oleh" | Sponsor infrastruktur berjalan ([Biznet Gio Cloud](https://www.biznetgio.com/)) |
| **Marketplace pengajar** | Peserta belajar | Kelas tahsin, bahasa Arab, dan kajian secara langsung; pengajar menerima upah dan Nawaetu mengambil komisi | Nanti |
| **Kanal zakat dan infak** | Lembaga amil mitra | Integrasi dengan amil resmi (BAZNAS atau LAZ). Dana langsung masuk ke amil; Nawaetu tidak pernah memegang dana atau memotong dari donatur | Nanti, setelah kajian hukum dan syariah |
| **Donasi** | Pendukung | Dukungan komunitas untuk biaya operasional ([Dukung Misi Nawaetu](#-dukung-misi-nawaetu)) | Berjalan |

Organisasi adalah jalur pertumbuhan utama: setiap organisasi membawa anggotanya ke aplikasi gratis, dan paket organisasi memberi pendapatan berulang. Langganan perorangan saja masih kecil di pasar yang sensitif harga seperti Indonesia.

### Posisi Nawaetu saat ini

- **Tahap awal**: dengan 889 pengguna aktif dan 286 akun di 2026, langganan perorangan belum akan menghasilkan banyak, jadi Nawaetu Plus ditunda. Langkah komersial pertama adalah satu uji coba organisasi, yang sekaligus membawa satu kelompok pengguna.
- **Tumbuh lokal dari mulut ke mulut**: sebagian besar pengguna datang langsung, lewat tautan yang dibagikan, atau Instagram, dan terpusat di Bandung dan Jakarta. Ini cocok untuk uji coba pertama dengan perusahaan, kampus, atau pesantren terdekat.
- **Ukur sebelum pitching**: pendaftaran, niat, dan check-in sholat sudah dilacak, tetapi konversi dan retensi belum punya baseline. Menetapkannya termasuk dalam [roadmap](ROADMAP.id.md#-metrik-sukses-publik).

### Yang tidak akan dilakukan Nawaetu

- Mengunci Al-Qur'an, hadits, jadwal sholat, dzikir, Sirah, niat, atau streak di balik pembayaran.
- Menjual pahala: tidak ada boost, rank, atau perbaikan streak berbayar.
- Menampilkan iklan, atau menjual dan membagikan data pengguna untuk penargetan.
- Menjual versi white-label yang mengganti merek konten kurasi Nawaetu dengan nama lain. Paket organisasi bersifat co-branded, dan kredit sumber selalu tetap ada.
- Menerima sponsor yang bisnis utamanya riba atau judi.
- Menghimpun zakat sendiri; zakat hanya melalui amil resmi.

### Mengapa model ini bisa berjalan

- **Kebiasaan harian sudah terbentuk**: lima waktu sholat membuat pengguna kembali beberapa kali sehari, dan Ramadhan menjadi musim puncak setiap tahun.
- **Kepercayaan sebagai keunggulan**: tanpa iklan, tanpa jual data, dan konten yang sumbernya bisa dicek adalah posisi yang sulit ditiru aplikasi berbasis iklan.

## Tim

**Hadian Rahmat**, founder dan maintainer. Kontak: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com).

---

## 📑 Daftar Isi
- [Pilar Utama & Fitur](#-pilar-utama--fitur)
- [Sumber Konten](#-sumber-konten)
- [FAQ](#faq)
- [Tech Stack](#️-tech-stack)
- [Memulai](#-memulai)
- [Kontribusi](#-kontribusi)
- [Dukung Misi Nawaetu](#-dukung-misi-nawaetu)
- [Lisensi](#lisensi)

## 🌟 Pilar Utama & Fitur

### 1. 🎯 Pembinaan Berbasis Niat
*   **Jurnal Niat**: Tetapkan "Niat" setiap pagi dan refleksi di malam hari (Muhasabah Jiwa). Refleksi malam memuat ayat tentang menunaikan amanah, berlaku adil, memeriksa berita sebelum membagikannya, dan berbicara lemah lembut (QS 4:58, 5:8, 49:6, 20:44).
*   **Tanya Nawaetu**: Asisten Islami yang dirancang mendasarkan jawaban pada Al-Qur'an, Sunnah, dan Hadits beserta rujukan, serta mengakui batasnya bila sumber belum dapat dipastikan.
    *   **Pertanyaan seputar politik tanpa memihak**: dijawab dengan prinsip Islam (amanah, keadilan, syura, tabayyun) dan pendapat-pendapat utama para ulama. Tanya Nawaetu tidak pernah mendukung atau menolak partai, calon, tokoh, undang-undang, atau aksi tertentu.
    *   **Paham bahasa Gen Z**: mengerti istilah sehari-hari seperti *privilege*, *ordal*, *bagi-bagi kue*, *cawe-cawe*, *buzzer*, *pencitraan*, *politik identitas*, *serangan fajar*, *apatis*, *oposisi*, dan *rezim*.
*   **Misi dan Tahap Perjalanan**: Kumpulkan Hasanah melalui misi harian, termasuk misi opsional untuk mendoakan pemimpin dan negeri. Level dikelompokkan menjadi tujuh tahap yang dinamai sesuai amalan yang sedang dilatih (Memulai, Membiasakan, Menjaga Waktu, Menambah, Memperdalam, Meneguhkan, Menebar Manfaat), masing-masing dengan saran fokus opsional dan pengingat dari Al-Qur'an atau hadits yang sudah dicek. Hasanah adalah catatan usaha di aplikasi, bukan hitungan pahala, dan tidak ada tahap yang menjadi gelar spiritual.

### 2. 📖 Konten Spiritual Terpadu
*   **Al-Qur'an Digital**: Mode Mushaf & List dengan audio per ayat, pewarnaan Tajwid, dan standar Mushaf Kemenag RI.
*   **Hub Hadits & Doa**: Konten pilihan harian dengan terjemahan Bahasa Indonesia dan Inggris, dikelompokkan menurut topik sehari-hari.
    *   **Amanah & Kepemimpinan**: hadits sahih tentang tanggung jawab, keadilan, menyuarakan kebenaran, suap, dan korupsi, yang bisa dicari dengan kata-kata yang dipakai anak muda (misalnya *cawe-cawe*, *serangan fajar*, *buzzer*).
*   **Sirah Nabawiyah**: tiga cara mempelajari perjalanan hidup Nabi Muhammad SAW, dengan bahasa bacaan yang bisa diatur terpisah dari bahasa aplikasi.
    *   **Ringkasan Sirah**: buku singkat Syaikh Haitsam Sarhan tentang sejarah dan kepribadian Nabi Muhammad SAW, dalam bahasa Indonesia dan Inggris. Dimuat tanpa diubah dengan izin penulis, dibaca per bagian, dan progresnya tersimpan di perangkat.
    *   **Sirah Lengkap**: 50 bab dari *Ar-Rahiq al-Makhtum* (terjemahan Indonesia), dengan sumber dan nomor halaman yang dicantumkan.
    *   **Lini Masa Peristiwa**: 13 bab berurutan, dari sebelum kenabian hingga wafatnya beliau. Setiap bab merangkai hadits sahih dengan kalimat penghubung singkat, menampilkan perawi dan derajat setiap hadits, dan hanya diberi tanggal bila teks Sirah menyebutkannya.
*   **Feed Spiritual**: Widget Daily Spirit, Quote of the Day, dan Hadits harian.

### 3. 🕌 Presisi Ritual
*   **Adzan Presisi Tinggi**: Jadwal sholat berbasis GPS dengan akurasi notifikasi < 60 detik.
*   **Kompas Kiblat**: Penunjuk arah presisi berbasis sensor perangkat.
*   **Kalibrasi Hijriah**: Penyesuaian tanggal yang fleksibel sesuai dengan pengamatan hilal lokal.

### 4. 📈 Alat Konsistensi (Istiqamah)
*   **Tasbih 2.0**: Penghitung canggih dengan mode Berantai (Sequential), bacaan Kustom, dan Mode Zen OLED.
*   **Check-in Sholat**: Pelacak ritual presisi tinggi dengan opsi jamaah/sendiri.
*   **Statistik Ibadah**: Dibuka dengan pesan personal dan satu langkah berikutnya, lalu tahap perjalanan, konsistensi sholat 14 hari, tren Hasanah, dan waktu tilawah. Kartu "Ibadah Bersama" menampilkan sholat yang dijaga, niat yang diikrarkan, dan jumlah orang yang beribadah minggu ini, tanpa papan peringkat.
*   **Mode Udzur (haid & nifas)**: Muslimah dapat memulai dan mengakhiri masa haid atau nifas dengan dua ketukan. Sholat pada masa itu ditandai terhalang, bukan terlewat, streak dijeda alih-alih putus, misi berganti ke dzikir, mendengarkan murottal, dan belajar, pengingat sholat dijeda, hari Ramadhan dicatat untuk qadha, dan perpustakaan hadits memiliki topik Muslimah & Haid. Hanya tanggal yang disinkronkan; detail masa udzur tetap di perangkat dan dapat dihapus.

### 5. 🗓️ Pendamping Puasa & Amalan Musiman
*   **Puasa Sunnah & Sukarela**: Pelacak puasa Senin-Kamis, Ayyamul Bidh, dan puasa kustom dengan status berbasis fiqih dan reward Hasanah.
*   **Peristiwa Hijriah & Musiman**: Pelacakan presisi untuk milestone kalender Islam, pengamatan hilal, dan panduan amalan musiman. Kalender Hijriah juga menampilkan "Sejarah di Bulan Ini", misalnya Perang Badar di bulan Ramadhan serta Perang Uhud, Khandaq, dan Hunain di bulan Syawal.
*   **Mode Ramadhan**: Panduan Fiqh khusus, rekomendasi Sahur & Buka Puasa sesuai Sunnah, serta hitung mundur yang aktif secara dinamis di Bulan Suci.

---

## 📚 Sumber Konten

Konten agama harus bisa dicek. Nawaetu menampilkan asal setiap teks, dan menjaga teks dari penerbit lain persis seperti yang mereka terbitkan.

| Konten | Sumber | Keterangan |
| :--- | :--- | :--- |
| Hadits Amanah & Kepemimpinan, hadits haid dan istihadah, bab Lini Masa Peristiwa | [HadeethEnc.com](https://hadeethenc.com) | Teks Arab, terjemahan Indonesia dan Inggris, perawi, serta derajat ditampilkan tanpa diubah, dengan tautan ke setiap hadits |
| Ayat refleksi malam | [QuranEnc.com](https://quranenc.com) | Terjemahan Kementerian Agama RI dan Saheeh International, tanpa diubah |
| Ringkasan Sirah | *Catatan Penting Seputar Sejarah dan Kepribadian Rasulullah* karya Syaikh Haitsam Sarhan ([IslamHouse](https://islamhouse.com/id/books/2831882), [sarhaan.com](https://sarhaan.com/ab/a-concise-biography-of-the-prophet-peace-be-upon-him-and-his-special-traits/)) | Diterjemahkan ke bahasa Indonesia oleh Abdul Aziz Firdaus dan Mufassir Arif, ke bahasa Inggris oleh Ibraheem Abu Tameem Al-Mubtasim. Ditampilkan tanpa diubah, dengan izin tertulis dari penulis |
| Sirah Lengkap | Dataset Sirah Nabawiyah ([Bagian 1](https://doi.org/10.17632/mwmzf8c2r5.1), [Bagian 2](https://doi.org/10.17632/zvn9cjn8nh.1), CC BY 4.0) | Berdasarkan *Ar-Rahiq al-Makhtum* karya Syaikh Shafiyyurrahman al-Mubarakfuri (terjemahan Indonesia) |
| Teks dan audio Al-Qur'an | [Quran.com](https://quran.com), Kemenag | Murattal oleh Mishary Rashid Al-Afasy |

Judul, tadabbur, pengantar bab, dan kalimat penghubung ditulis oleh Nawaetu, diberi keterangan demikian, dan hanya merangkum isi sumbernya. Nomor hadits di perpustakaan sedang dicek terhadap [Sunnah.com](https://sunnah.com) dan rujukan lain. Bila sebuah hadits ada di dua kitab, kedua nomornya ditampilkan beserta nama kitabnya, misalnya "HR. Bukhari No. 321 & Muslim No. 335".

Lisensi Nawaetu (AGPLv3) mencakup kode dan tulisan Nawaetu sendiri. Konten dari penerbit di atas tetap mengikuti ketentuan masing-masing.

---

## FAQ

**Apa itu Nawaetu?**
Aplikasi pelacak kebiasaan Islami gratis yang berangkat dari niat, dengan Al-Qur'an, alat ibadah, hadits dan doa bersumber, Sirah, alat puasa dan Ramadhan, dzikir, serta asisten AI.

**Apakah Nawaetu gratis?**
Ya. Alat ibadah dan konten agama gratis dan akan tetap gratis, dan kode sumbernya terbuka di bawah AGPLv3. Opsi berbayar yang direncanakan, seperti penggunaan AI lebih banyak atau paket organisasi, tidak pernah mengunci konten ibadah.

**Bukankah menarik bayaran itu sama dengan "menjual agama"?**
Nawaetu hanya menarik biaya atas layanan dan jasa, tidak pernah atas akses ke Al-Qur'an, hadits, atau ibadah. Mayoritas ulama membolehkan upah atas pekerjaan yang berkaitan dengan agama, seperti mencetak mushaf atau mengajar Al-Qur'an. Lihat [Model Bisnis](#model-bisnis).

**Apakah bisa dipakai tanpa internet?**
Beberapa fitur dapat diakses tanpa koneksi internet.

**Bagaimana Tanya Nawaetu menjawab pertanyaan agama?**
Dirancang untuk menyertakan rujukan pada jawaban agama dan mengakui batasnya bila sumber belum dapat dipastikan. Ini tidak menggantikan ulama yang kompeten.

**Bahasa apa yang didukung?**
Indonesia dan Inggris.

**Dari mana konten agamanya berasal?**
Dari sumber yang diterbitkan: hadits dari HadeethEnc, terjemahan Al-Qur'an melalui QuranEnc, Ringkasan Sirah dari buku Syaikh Haitsam Sarhan (dengan izin beliau), dan Sirah Lengkap dari dataset yang dicantumkan sumbernya, berdasarkan *Ar-Rahiq al-Makhtum*. Setiap konten menampilkan sumbernya. Lihat [Sumber Konten](#-sumber-konten).

**Apakah Hasanah sama dengan pahala?**
Tidak. Hasanah adalah catatan usahamu di aplikasi, dipakai untuk level dan tahap. Pahala dan derajat seseorang hanya Allah yang tahu, jadi tahap menggambarkan apa yang sedang dilatih dan tidak pernah memberi gelar spiritual.

**Bagaimana Nawaetu menangani haid dan nifas?**
Muslimah dapat menyalakan mode udzur. Sholat pada masa itu ditandai terhalang, streak tetap terjaga, misi berganti ke amalan yang tetap bisa dilakukan seperti dzikir dan mendengarkan Al-Qur'an, dan statistik tidak menghitung hari-hari itu. Hanya tanggalnya yang disinkronkan ke akun.

**Apakah Nawaetu memihak dalam politik?**
Tidak. Konten Amanah & Kepemimpinan dan Tanya Nawaetu mengajarkan prinsip dari Al-Qur'an dan Sunnah, tanpa pernah menyebut atau mendukung partai, calon, maupun pejabat tertentu.

---

## 🛠️ Tech Stack

Versi dikunci di [`package.json`](package.json).

### Core Framework
*   **Next.js** (App Router) - Meta-framework React utama
*   **TypeScript** - Arsitektur type-safe yang ketat
*   **React** - Fitur concurrent & Server Components terbaru

### Backend & Database
*   **Drizzle ORM** - Type-safe SQL database query
*   **PostgreSQL (Supabase)** - Database serverless melalui transaction pooler
*   **NextAuth v5** - Sesi autentikasi aman
*   **Upstash Redis & Rate Limiting** - Proteksi dan pembatasan rate API terdistribusi
*   **Firebase Admin SDK** - Infrastruktur push notification
*   **cron-job.org** - Penjadwalan prayer-alert dan streak reminder

### AI & External APIs
*   **Google Gemini** (`@google/generative-ai`)
*   **Groq (Llama)** - Inferensi LLM kecepatan tinggi
*   **OpenRouter** - Routing model cadangan
*   **Aladhan API** (Jadwal Sholat GPS)
*   **Quran.com API** (Mushaf Uthmani & Audio Murottal)

### UI, Styling & Experience
*   **Design system**: Lora (display) dan Plus Jakarta Sans (UI) lewat `next/font`, Amiri untuk teks Arab, 5 tema di atas token bersama dengan test kontras WCAG AA, dan semua ikon dibuat dari satu logo vektor (`npm run icons`, `npm run og-image`)
*   **Tailwind CSS v4** & **Shadcn UI** (Primitif Radix UI)
*   **Framer Motion** & **dotLottie** - Animasi & mikro-interaksi
*   **Recharts** - Analitik dinamis & grafik tren Hasanah
*   **Lucide React**, **Hugeicons** (ikon gratis, path disalin) & **Sonner** - Ikonografi & notifikasi toast
*   **Next PWA (`@ducanh2912/next-pwa`)** - Progressive Web App yang dapat diinstal

### Monitoring & Kualitas
*   **Sentry** - Pelacakan error real-time & pemantauan performa
*   **Vercel Speed Insights** - Real User Performance Monitoring
*   **Vitest** - Pengujian unit dan integrasi

---

## 🚀 Memulai

### Untuk Pengguna
1. Buka [nawaetu.com](https://nawaetu.com)
2. Izinkan akses lokasi untuk jadwal sholat
3. Mulai isi niat harian dan selesaikan misi
4. Opsional: pasang sebagai PWA (tambahkan ke layar utama)

### Untuk Developer

**Prasyarat:**
- Node.js 24.x
- npm (repositori memakai `package-lock.json`)
- Git

**Instalasi:**
```bash
# Clone repository
git clone https://github.com/hadianr/nawaetu.git
cd nawaetu

# Install dependencies
npm ci

# Salin environment variables lalu isi sesuai kebutuhan
cp .env.example .env.local

# Jalankan development server
npm run dev
# Buka http://localhost:3000
```

**Skrip yang tersedia:**
```bash
npm run dev          # Development server
npm run build        # Build produksi (webpack)
npm run start        # Jalankan server produksi
npm run lint         # ESLint
npm run typecheck    # Validasi TypeScript
npm run test:run     # Seluruh test (Vitest)
npm run analyze      # Analisis ukuran bundle
```

## 🤝 Kontribusi

Kami sangat menyambut kontribusi dari seluruh komunitas global! Baik berupa perbaikan bug, fitur baru, dokumentasi, maupun terjemahan.

Harap pelajari [Code of Conduct](CODE_OF_CONDUCT.md) kami sebelum berkontribusi.
Untuk melaporkan bug atau mengajukan ide fitur baru, silakan gunakan [GitHub Issue Templates](https://github.com/hadianr/nawaetu/issues/new/choose). Panduan kontribusi lengkap dapat dibaca di [CONTRIBUTING.id.md](CONTRIBUTING.id.md) (Bahasa Indonesia) atau [CONTRIBUTING.md](CONTRIBUTING.md) (English).

**Ketentuan konten:** dalam teks yang ditulis Nawaetu sendiri, sebut Nabi secara lengkap sebagai "Nabi Muhammad SAW" (Indonesia) atau "Prophet Muhammad SAW" (Inggris), tidak memakai ligatur ﷺ atau "Nabi SAW" saja. Teks yang disalin dari sumber berlisensi seperti HadeethEnc dan QuranEnc harus tetap persis seperti aslinya. Aturan ini dijaga oleh test (`src/data/honorific.test.ts`) dan [AGENTS.md](AGENTS.md).

> 💡 **Asisten AI untuk coding**: konvensi repositori untuk agen ada di [AGENTS.md](AGENTS.md).

**Cara Berkontribusi:**
1. **Fork** repositori ini
2. **Buat branch fitur** (`git checkout -b feature/amazing-feature`)
3. **Commit perubahan** (`git commit -m 'feat: add amazing feature'`)
4. **Push ke branch** (`git push origin feature/amazing-feature`)
5. **Buat Pull Request**

---

## 📦 Alur Rilis (Release Workflow)

Maintainer dapat melakukan rilis versi baru menggunakan script otomatis:
```bash
./scripts/release.sh v1.X.Y
```
Script ini akan secara otomatis memperbarui versi pada `package.json`, `package-lock.json`, `src/config/app-config.ts`, badge `README.md` dan `README.id.md`, serta memperbarui `CHANGELOG.md`.

Untuk panduan lengkap dan troubleshooting, baca [Panduan Alur Rilis](docs/RELEASE_WORKFLOW.md).

---

## ☕ Dukung Misi Nawaetu

Nawaetu adalah proyek open-source untuk umat. Dukungan Anda membantu menutupi biaya server (database, hosting) dan mempercepat pengembangan fitur baru.

### ☁️ Sponsor Infrastruktur
Kami sangat berterima kasih atas dukungan dari **[Biznet Gio Cloud](https://www.biznetgio.com/)**, yang telah bermurah hati menyediakan infrastruktur server cloud berkinerja tinggi untuk menenagai Nawaetu.com.

[![Biznet Gio Cloud](https://img.shields.io/badge/Supported_by-Biznet_Gio_Cloud-00529B?style=for-the-badge&logo=icloud&logoColor=white)](https://www.biznetgio.com/)

*Apakah perusahaan Anda tertarik mendukung teknologi open-source Islami? Jadilah sponsor untuk menampilkan logo/brand Anda di sini dan bantu kami mengembangkan aplikasi Nawaetu untuk umat global! Hubungi [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com).*

### 💖 Platform Donasi
| Platform | Link |
| :--- | :--- |
| **GitHub Sponsors** | [![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=flat-square&logo=github)](https://github.com/sponsors/hadianr) |
| **Trakteer** | [![Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=flat-square&logo=ko-fi&logoColor=white)](https://trakteer.id/hadianr) |
| **Ko-fi** | [![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-F16061?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/hadianr) |
| **Buy Me a Coffee** | [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/hadianr) |

### 🏢 Untuk Organisasi
Ingin program Nawaetu untuk perusahaan, sekolah, pesantren, atau masjid Anda, seperti tantangan Ramadhan bersama atau khatam bersama? Paket organisasi bersifat co-branded ("Nawaetu × organisasi Anda") dan sedang dikembangkan. Kami mencari mitra uji coba: hubungi [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com). Lihat [Model Bisnis](#model-bisnis).

Semoga Allah membalas kebaikan Anda dengan keberkahan. Jazakumullah Khairan Katsiran! 🤲

---

<a name="lisensi"></a>
## 📄 Lisensi

**Nawaetu** berlisensi di bawah **AGPLv3 (GNU Affero General Public License v3)**.
- ✅ Gratis digunakan, dimodifikasi, dan didistribusikan.
- ⚠️ Jika Anda memodifikasi dan mendistribusikan (termasuk menjalankannya sebagai layanan SaaS), **Anda WAJIB membuka source code Anda** di bawah lisensi AGPLv3.
- 🏷️ Lisensi ini mencakup kode, bukan nama dan logo Nawaetu. Fork sebaiknya memakai nama sendiri.
- 📚 Konten dari penerbit lain tetap mengikuti ketentuan masing-masing, yang mewajibkan kredit sumbernya tetap ada. Lihat [Sumber Konten](#-sumber-konten).

Lihat file [LICENSE](LICENSE) untuk teks lengkap AGPLv3.

---

## 👤 Author

**Hadian Rahmat**
- GitHub: [@hadianr](https://github.com/hadianr)
- Email: [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com)

---

**"Mulai dengan niat, akhiri dengan keberkahan."**

Mari jadikan ibadah lebih mudah, satu niat setiap kali. 🚀🌙
