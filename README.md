# Nawaetu

> *"Innamal A'malu Binniyat" (Sesungguhnya amal itu tergantung niatnya).*

**Nawaetu** adalah teman digital bagi Muslim modern untuk membantu menata niat dan menjaga istiqomah dalam beribadah. Kami percaya bahwa kualitas ibadah ditentukan sebelum gerakan dimulai—yaitu saat niat dipasang.

## 🕌 Brand DNA

### Core Philosophy
Setiap langkah ibadah dimulai dari hati. Nawaetu hadir bukan untuk menggantikan esensi ibadah, melainkan sebagai **Sahabat (The Companion)** yang menemani perjalanan spiritual Anda tanpa menggurui.

### Mission
Menjadi teman digital yang paling fokus dan bebas gangguan bagi Muslim modern dalam mempersiapkan bekal akhiratnya, dimulai dari hal terkecil: **Niat**.

---

## 🌟 Fitur Utama

Aplikasi ini dirancang dengan pendekatan *essentialist* dan estetika *dark mode* yang premium:

### 1. 🏡 Dashboard Modern
*   **Jadwal Sholat Otomatis**: Mendeteksi lokasi pengguna untuk jadwal sholat yang akurat.
*   **Countdown Waktu Sholat**: Hitung mundur menuju waktu sholat berikutnya.
*   **Daily Inspiration**: Quote dan Hadis harian sebagai pengingat.
*   **Hijri Calendar**: Integrasi tanggalan Hijriah.

### 2. 📖 Al-Qur'an Digital
*   **Bacaan Nyaman**: Typography yang jelas dengan *dark mode* yang ramah mata.
*   **Audio Murottal**: Pemutaran audio per-ayat untuk membantu hafalan/tilawah.
*   **Terjemahan Bahasa Indonesia**: Memahami makna setiap ayat.
*   **Search & Navigation**: Pencarian surat yang cepat.

### 3. 🧭 Penunjuk Kiblat (Qibla Finder)
*   **Visual Kompas**: Tampilan kompas visual dengan indikator Ka'bah yang intuitif.
*   **Kalibrasi**: Mendukung sensor perangkat untuk akurasi tinggi.
*   **Minimalist UI**: Fokus pada arah tanpa gangguan peta yang berat.

### 4. 📿 Tasbih Digital (New!)
*   **Full Screen Tap**: Menghitung zikir dengan mengetuk area layar manapun (cocok untuk penggunaan tanpa melihat layar).
*   **Zikir Presets**: Pilihan bacaan siap pakai (Tasbih, Tahmid, Takbir, Istighfar, Sholawat, Tahlil).
*   **Rich Feedback**:
    *   **Haptic Interface**: Getaran *tactile* (support Android/Device with Vibration API).
    *   **Sound Feedback**: Suara "klik" natural (opsi fallback untuk iOS).
*   **Custom Targets**: Atur target zikir Anda sendiri (33, 99, 100, 1000, atau Tanpa Batas).
*   **Immersive Design**: Visual progress ring yang memuaskan dan *distraction-free*.

---

## 🛠️ Tech Stack

Dibangun dengan fondasi teknologi web modern untuk performa maksimal:

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & Tailwind Animate
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **PWA**: Support Progressive Web App (Installable).

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
