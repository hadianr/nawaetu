# Nawaetu

> *"Innamal A'malu Binniyat" (Sesungguhnya amal itu tergantung niatnya).*

**Nawaetu** adalah teman digital bagi Muslim modern untuk membantu menata niat dan menjaga istiqomah dalam beribadah. Kami percaya bahwa kualitas ibadah ditentukan sebelum gerakan dimulai—yaitu saat niat dipasang.

---

## 🕌 Brand DNA

### Core Philosophy
Setiap langkah ibadah dimulai dari hati. Nawaetu hadir bukan untuk menggantikan esensi ibadah, melainkan sebagai **Sahabat (The Companion)** yang menemani perjalanan spiritual Anda tanpa menggurui.

### Mission
Menjadi teman digital yang paling fokus dan bebas gangguan bagi Muslim modern dalam mempersiapkan bekal akhiratnya, dimulai dari hal terjujur: **Niat**.

---

## 🌟 Fitur Unggulan

Aplikasi ini dirancang dengan pendekatan *essentialist* dan estetika *premium dark mode*:

### 1. 🎯 Gamifikasi & Motivasi (Misi Harian)
*   **System Misi**: Daftar amal harian (Daily Missions) yang dipersonalisasi berdasarkan gender.
*   **XP & Leveling**: Dapatkan XP untuk setiap ibadah yang terlaksana dan tingkatkan level profile Anda.
*   **The Streak (🔥)**: Pantau konsistensi ibadah Anda dengan sistem *streak* harian dan raih bonus XP pada *milestone* tertentu.
*   **Authentic References**: Setiap misi disertai dalil Al-Qur'an atau Hadist Shahih sebagai landasan beramal.

### 2. 👩‍💼 Personalitas & Experience
*   **Gender Based UI**: Personalisasi tema warna (Blue untuk Laki-laki, Pink untuk Perempuan) dan penyesuaian misi ibadah (seperti reminder Sholat Jumat atau tracker Qadha Puasa).
*   **Profile Management**: Kustomisasi nama dan koleksi gelar berdasarkan level pencapaian spiritual Anda.

### 3. 📖 Al-Qur'an & Audio Digital
*   **Multimedia Experience**: Pilihan Qari internasional (Mishary Rashid Alafasy, dll) yang terintegrasi secara global.
*   **Audio Per-Ayat**: Membantu hafalan dan tilawah dengan kontrol audio yang presisi.
*   **Dynamic UI**: Menampilkan informasi pembacaan terakhir dan navigasi surat yang intuitif.

### 4. 🧭 Navigasi & Waktu
*   **Dashboard Adaptif**: Widget cerdas yang menampilkan hitung mundur sholat, countdown Ramadhan, dan progres bacaan Al-Qur'an.
*   **Smart Qibla Finder**: Kompas visual minimalis dengan indikator Ka'bah untuk akurasi arah kiblat.
*   **Advanced Calculation**: Pilihan metode perhitungan waktu sholat (Kemenag RI, MWL, ISNA, dll) dan sinkronisasi lokasi otomatis.

### 5. 📿 Tasbih Digital
*   **Full Screen Tap**: Menghitung zikir tanpa harus melihat layar dengan *haptic feedback* yang premium.
*   **Presets & Targets**: Pilihan zikir siap pakai dengan target yang bisa disesuaikan.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router & Server Components)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Persistence**: Persistence via LocalStorage & Cookies for Server-side Sync.
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai (Getting Started)

### Prasyarat
*   Node.js v18+

### Instalasi & Menjalankan

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/nawaetu.git
    cd nawaetu
    ```

2.  **Instal Dependencies**
    ```bash
    npm install
    ```

3.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```

    Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📂 Struktur Project

```
src/
├── app/              # App Router (Pages: Home, Quran, Kiblat, Tasbih)
├── components/       # Reusable Components
│   ├── ui/           # Shadcn UI Components
│   ├── quran/        # Komponen spesifik Al-Qur'an
│   └── icons/        # Custom SVG Icons
├── lib/              # Utilities & Helpers
└── hooks/            # Custom React Hooks (usePrayerTimes, etc.)
```

---

*Nawaetu — Mulai dari Niat.*
