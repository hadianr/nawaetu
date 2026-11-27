# Roadmap Nawaetu 🗺️

> **"Track Your Niat, Build Your Legacy"**

Roadmap ini menjelaskan visi kami untuk menjadikan Nawaetu sebagai **Islamic habit tracker paling bermakna** di dunia. Kami membangun secara transparan, dan dukungan Anda membantu kami bergerak lebih cepat. 🚀

[🌟 Dukung Misi Kami](README.id.md#-dukung-misi-nawaetu) | [💼 Model Bisnis](README.id.md#model-bisnis) | [📖 Read in English](ROADMAP.md)

---

## 🎯 Visi Kami

**Membantu 1 juta Muslim membangun kebiasaan spiritual yang kokoh dengan fokus pada *kenapa* di balik ibadah mereka—dimulai dari niat yang murni.**

---

## 📍 Posisi Saat Ini (v1.16.0)

**Keterangan status:** ✅ Sudah rilis · 🔨 Dalam pengerjaan · 📋 Direncanakan · 💡 Konsep · 🧪 Eksperimental

> Dicek terhadap kode pada 23 Nov 2026 (`main`, commit `1ca675f`). Item bertanda ✅ ada di kode; item "Dalam pengerjaan" sudah punya sebagian kode.

### ✅ Sudah Rilis

- **Jadwal Sholat, Kiblat & Notifikasi Push** - Pengingat sholat dan streak, termasuk untuk tamu
- **Al-Quran Digital** - Audio per ayat, dukungan Tajwid, mode Mushaf
- **Jurnal Niat** - Niat pagi, refleksi malam dengan ayat Al-Qur'an, dan Niat Streak; refleksi hanya bisa dilihat pemilik akun
- **Hadits & Doa** - Perawi dan derajat ditampilkan bersama teksnya, termasuk topik Amanah & Kepemimpinan dari HadeethEnc
- **Sirah dalam Tiga Format** - Ringkasan Sirah karya Syaikh Haitsam Sarhan (Indonesia dan Inggris, dengan izin tertulis beliau), Sirah Lengkap, dan Lini Masa Peristiwa
- **Kalender Hijriah** - Hari puasa sunnah dan peristiwa sirah di bulan berjalan
- **100 Hari Menuju Ramadhan** - Kartu perjalanan dengan panduan puasa, dalil, dan streak
- **Hasanah & Streak** - Misi harian, tujuh tahap perjalanan yang dinamai sesuai amalan (tanpa gelar spiritual), dan streak freeze gratis setiap 7 hari
- **Mode Udzur** - Untuk haid dan nifas: sholat yang terhalang tetap menjaga streak, misi menyesuaikan, pengingat sholat dijeda, dan hadits tentang haid
- **Statistik Ibadah** - Pesan personal dengan satu langkah berikutnya, perhitungan hari udzur yang adil, dan kartu komunitas "Ibadah Bersama"
- **Tanya Nawaetu (Asisten AI)** - Dirancang menyertakan rujukan; 10 chat per hari untuk semua pengguna (Gemini, Groq, dan OpenRouter)
- **Mode Tamu & Sinkronisasi** - Bisa dipakai tanpa akun; data ikut saat masuk akun dan antarperangkat
- **Lima Tema, Semua Gratis** - Daylight sebagai bawaan, Emerald sebagai tema gelap
- **Infaq** - Donasi sukarela di dalam aplikasi; tidak membuka fitur apa pun, jadi tidak ada yang dikunci
- **Pencarian & Pencarian AI** - Halaman konten dirender di server, data terstruktur, dan `llms.txt`
- **Multi-bahasa** - Bahasa Indonesia & English

**Pengguna Saat Ini:** 286 akun terdaftar (27 Nov 2026)
**Tech Stack:** Next.js 16, React 19, PostgreSQL dengan Drizzle ORM (lihat [README](README.id.md#️-tech-stack))

---

## 💼 Bagaimana Nawaetu Didanai

Ibadah tetap gratis; Nawaetu hanya menarik biaya atas layanan dan jasa; dukungan tetap sukarela. Model lengkapnya, sumber pendapatannya, dan hal yang tidak akan dilakukan Nawaetu ada di [README](README.id.md#model-bisnis). Singkatnya: tanpa iklan, tanpa jual data, tanpa menjual pahala, dan tanpa versi white-label.

---

## 🚀 Apa Selanjutnya?

### Sebelum Ramadhan 1448 H (sekitar Februari 2027)

**Tema:** *Siap untuk Ramadhan, dan mitra organisasi pertama*

#### 🏢 Nawaetu untuk Organisasi - Uji Coba
**Status:** 📋 Direncanakan (belum ada fitur grup di kode)

Program co-branded ("Nawaetu × organisasi Anda") untuk perusahaan, sekolah Islam, dan pesantren. Target pertama adalah **satu mitra uji coba untuk Ramadhan 1448 H**, sebaiknya di Bandung atau Jakarta, tempat sebagian besar pengguna saat ini berada.

**Cakupan uji coba:**
- Ruang grup yang diikuti anggota dengan kode undangan
- Niat bersama dan khatam bersama
- Tantangan Ramadhan untuk grup
- Tampilan admin dengan laporan partisipasi (hanya agregat; refleksi pribadi tetap privat)

**Prinsip:** co-branded, tidak pernah white-label. Kredit sumber dan nama Nawaetu selalu tetap ada.

---

#### 🌙 Ramadhan 1448 H
**Status:** 📋 Direncanakan

- Mengaktifkan kembali halaman Ramadhan untuk bulannya (sempat diturunkan sampai musimnya tiba).
- Memutuskan apakah pelacak tarawih kembali.
- Melanjutkan perjalanan 100 Hari Menuju Ramadhan sampai masuk bulannya.

---

#### 🛠️ Fondasi
**Status:** 📋 Direncanakan kecuali disebut lain

- **Toko aplikasi:** menerbitkan aplikasi Android (wrapper-nya ada di [`android/`](android/)) dan menulis deskripsi toko.
- **Verifikasi hadits:** 🔨 mengecek nomor hadits terhadap [Sunnah.com](https://sunnah.com); menunggu akses API.
- **Kecepatan:** memuat pemutar animasi setelah tampilan pertama agar beranda lebih cepat di HP ([#299](https://github.com/hadianr/nawaetu/issues/299)).
- **Pengingat niat waktu Subuh:** pengingat niat pagi yang mengikuti waktu Subuh setempat.
- **Pengukuran:** tandai pendaftaran, pemasangan niat, dan check-in sholat sebagai key event di Google Analytics, cari asal sesi "general / (not set)" yang tidak bertag, dan tetapkan baseline retensi di bawah.

---

### 2027

**Tema:** *Kamu tidak harus membangun kebiasaan sendirian*

#### 🤖 Tanya Nawaetu → Pendamping Proaktif
**Status:** 📋 Direncanakan (asisten yang menjawab pertanyaan sudah rilis)

Belum ada pesan proaktif, check-in terjadwal, atau insight personal di kode.

**Cakupan, berurutan:**
1. Ringkasan mingguan dari data kebiasaan pengguna sendiri (job terjadwal, tanpa perlu chat).
2. Check-in lembut yang bisa dipilih (notifikasi push, maksimal 1 per hari, bisa dimatikan).
3. Insight personal (misalnya, "kamu lebih konsisten sholat Subuh kalau tidur sebelum jam 11 malam"), hanya setelah datanya cukup.

**Prinsip:** hanya jika pengguna memilih, panduan Islam dari sumber yang bisa dirujuk tim, tidak pernah mempermalukan pengguna yang terlewat sholat.

**Contoh interaksi:**
```
AI: Assalamu'alaikum! Aku perhatikan kamu terlewat Subuh 3 kali minggu ini.
    Mau ngobrol soal apa yang menghalangi?

Kamu: Aku susah bangun...

AI: Aku paham. Yuk coba langkah kecil:
    1. Pasang niat malam ini: "Ya Allah, bantu aku bangun Subuh"
    2. Tidur 15 menit lebih awal
    3. Taruh HP di seberang kamar

    Bisa coba ini selama 3 hari?
```

---

#### 🎮 Badge & Hadiah Hasanah
**Status:** 💡 Konsep (tahap perjalanan dan streak sudah rilis)

- **Badge baru:** "Sahur Champion" (streak Ramadhan 30 hari), "Night Warrior" (100x Qiyamul Lail), "40 Hari Niat" (Niat Streak 40 hari). Badge menamai amalannya, bukan keadaan hati.
- **Hadiah bersponsor:** mitra menyediakan hadiah yang dicapai pengguna lewat konsistensi ibadah. Lihat [`docs/HASANAH_LEVELS_AND_REWARDS_PLAN.md`](docs/HASANAH_LEVELS_AND_REWARDS_PLAN.md).

**Prinsip:** Hasanah, tahap, dan streak tidak pernah dijual. Tidak ada boost atau perbaikan streak berbayar.

---

#### 👥 Accountability Partners
**Status:** 💡 Konsep (belum ada kode)

Temukan teman niat kamu.

- Cocokkan dengan Muslim yang punya tujuan serupa
- Bagikan refleksi (opsional, privat secara bawaan)
- Akuntabilitas lembut: "Partner kamu sudah sholat Subuh hari ini. Giliran kamu!"

**Privasi dulu:** semua berbagi bersifat opt-in. Dibangun di atas fitur grup dari uji coba organisasi.

---

#### 💎 Nawaetu Plus
**Status:** 💡 Konsep (harga belum ditentukan; belum ada kode langganan)

Langganan opsional untuk layanan yang punya biaya berjalan atau berupa pendampingan pribadi. Tidak pernah mengunci konten ibadah.

**Usulan:**
- ✨ Tanya Nawaetu di atas batas harian gratis
- 👨‍👩‍👧 Paket keluarga (orang tua mengikuti progres sholat dan Al-Qur'an anak)
- 📊 Insight jurnal dan kebiasaan yang lebih dalam
- 🤝 Pay it forward: setiap langganan membiayai akun Plus gratis untuk pelajar atau orang yang membutuhkan

**Selalu gratis:** Al-Qur'an, hadits, alat sholat, dzikir, Sirah, niat, streak, tahap, dan tema.

---

#### 📖 Nawaetu Stories
**Status:** 💡 Konsep (belum ada kode)

Cerita nyata dari Muslim nyata, diterbitkan dengan persetujuan pengguna: "Bagaimana Saya Akhirnya Taklukkan Subuh", "Dari 0 ke 100 Halaman Quran", "Transformasi Ramadhan Saya".

---

### 🌐 Ekspansi & Aksesibilitas

#### 🧩 Ekstensi Browser Nawaetu (Chrome/Edge)
**Status:** 🧪 Eksperimental (v1.9.4 di repositori; status publikasi di toko belum dipastikan)

Wrapper sidebar untuk aplikasi web yang sedang live.

- **Pendamping Sidebar:** baca Al-Qur'an dan cek jadwal sholat tanpa meninggalkan tab.
- **Mode Fokus:** blokir situs yang mengganggu saat waktu sholat (opsional). *Belum dibuat.*
- **Niat Instan:** pasang niat untuk sesi browsing ("Belajar", "Kerja", "Riset"). *Belum dibuat.*

**Strategi teknis:** aplikasi web yang sama ditanam di ekstensi (iframe ke nawaetu.com). Tanpa pelacakan. Catatan arsitektur: `extension/README.md`.

---

## 🌍 Visi Masa Depan (2027+)

### Ide yang Kami Eksplorasi

**🎓 Marketplace Pengajar**
- Kelas tahsin, bahasa Arab, dan kajian secara langsung; pengajar menerima upah dan Nawaetu mengambil komisi

**🤲 Kanal Zakat & Infak**
- Bayar zakat dan infak ke amil resmi (BAZNAS atau LAZ) dari dalam aplikasi; dana langsung masuk ke amil. Hanya setelah kajian hukum dan syariah

**🕌 Fitur Komunitas Lokal**
- Check-in masjid dan acara
- Kelas Islam lokal dan halaqah

**📚 Learning Path Terstruktur**
- "40 Hadits dalam 40 Hari"
- "Pahami Quran dalam 3 Bulan"
- "Master Tajwid" kursus interaktif

**🎙️ Konten Audio**
- Refleksi spiritual harian
- Wawancara ulama

**🌐 Ekspansi Global**
- Lebih banyak bahasa (Arab, Urdu, Turki, Melayu)
- Metode kalkulasi sholat regional

**🤝 Ekosistem Open Source**
- Fitur yang dibangun komunitas

---

## 💬 Suara Anda Penting

**Roadmap ini adalah dokumen hidup.** Kami menyesuaikan berdasarkan:
- Feedback dan request pengguna
- Data penggunaan nyata
- Bimbingan para ulama

### Cara Mempengaruhi Roadmap

1. **Usulkan atau dukung fitur:** [Buka atau beri reaksi pada Issue](https://github.com/hadianr/nawaetu/issues)
2. **Ikut beta testing:** Akses awal ke fitur baru
3. **Dukung misi:** [Donasi](README.id.md#-dukung-misi-nawaetu) untuk mempercepat pengembangan

---

## 📊 Metrik Sukses (Publik)

Kami ukur sukses dari **dampak**, bukan cuma jumlah unduhan.

| Metrik | Saat ini (Nov 2026) | Target berikutnya |
|--------|---------------------|-------------------|
| **Pengguna aktif (Google Analytics)** | 889 sepanjang 2026 (pelacakan andal sejak pertengahan Agustus) | - |
| **Akun terdaftar** | 286 | - |
| **Pemasang niat mingguan** | Belum diukur | Baseline ditetapkan |
| **Retensi (D1 / D7 / D30)** | Belum diukur | Baseline ditetapkan |
| **Pengguna aktif harian / bulanan** | Belum diukur | Baseline ditetapkan |
| **Keterlibatan Tanya Nawaetu** | Belum diukur | Baseline ditetapkan |
| **Uji coba organisasi** | 0 | 1 sebelum Ramadhan 1448 H |
| **Konversi Plus** | Belum diluncurkan | Ditetapkan setelah peluncuran |
| **Kontributor komunitas** | Belum dipastikan | - |

Target ditetapkan setelah baseline terukur.

**Transparansi:** Kami akan membagikan update kuartalan tentang progres.

---

## 🙏 Dukung Misi Kami

Membangun Nawaetu adalah labor of love, tapi server tidak gratis. Dukungan Anda membantu kami:

- 💰 **Menutup biaya:** AI API, database, hosting
- ⚡ **Bergerak lebih cepat:** merekrut developer paruh waktu
- 🌍 **Menjangkau lebih banyak Muslim:** pemasaran dan outreach
- 📚 **Membuat konten:** materi edukasi dan panduan

Semoga setiap kontribusi menjadi *sadaqah jariyah*; balasannya milik Allah semata. 🤲

[![Dukung di GitHub](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github)](https://github.com/sponsors/hadianr)
[![Dukung di Trakteer](https://img.shields.io/badge/Trakteer-Traktir-be1e2d?style=for-the-badge)](https://trakteer.id/hadianr)

---

## 🤝 Mau Kontribusi?

Kami menyambut developer, desainer, penulis, dan tester!

**Cara membantu:**
- 💻 **Kode:** Cek [Good First Issues](https://github.com/hadianr/nawaetu/labels/good%20first%20issue)
- 🎨 **Desain:** Perbaikan UI/UX
- 📝 **Konten:** Tulis panduan, terjemahkan
- 🧪 **Tes:** Beta test fitur baru
- 🌍 **Sebarkan:** Bagikan ke komunitas kamu

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk detail.

---

## 📜 Lisensi

**AGPLv3** (gratis dan open source). Lisensi ini mencakup kode, bukan nama dan logo Nawaetu. Konten dari penerbit lain tetap mengikuti ketentuan masing-masing.

Lihat [LICENSE](LICENSE) untuk detail.

---

**"Innama al-a'malu bin-niyyat" - Amal itu tergantung niatnya.**

Mari kita bangun sesuatu yang bermakna bersama. 🌙✨

---

*Terakhir diperbarui: 23 November 2026 (dicek terhadap `main` @ 1ca675f)*
*Pertanyaan? Email: roadmap@nawaetu.com*
