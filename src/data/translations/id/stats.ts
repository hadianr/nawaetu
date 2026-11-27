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
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 */

export const statsID = {
    stats: {
        header: {
            title: "Statistik Ibadah",
            subtitle: "Perjalanan spiritualmu"
        },
        journey: {
            stageOf: "Tahap {{n}} dari {{total}}",
            level: "Level {{level}}",
            toNextLevel: "{{n}} Hasanah lagi ke Level {{level}}",
            focus: "Saran fokus",
            nextStage: "Berikutnya: {{name}} di Level {{level}}",
            lastStage: "Ini tahap terakhir. Teruskan, sedikit asal kontinu.",
            howItWorks: "Cara kerja level",
            guideTitle: "Perjalananmu di Nawaetu",
            guideIntro: "Level dan tahap membantumu melihat arah, bukan menilai dirimu.",
            rule1: "Setiap ibadah yang kamu catat, seperti sholat, dzikir, tilawah, dan niat, menambah Hasanah.",
            rule2: "Hasanah menaikkan level. Setiap beberapa level, kamu masuk tahap baru.",
            rule3: "Tahap menggambarkan apa yang sedang kamu latih. Saran fokusnya pilihan, bukan syarat naik.",
            stagesTitle: "Tujuh tahap",
            levels: "Level {{from}}–{{to}}",
            levelsFrom: "Level {{from}}+",
            youAreHere: "Kamu di sini",
            disclaimerTitle: "Tentang Hasanah",
            disclaimer: "Hasanah adalah catatan usahamu di Nawaetu, bukan hitungan pahala. Pahala dan derajat seseorang hanya Allah yang tahu.",
            disclaimerQuote: "“…maka janganlah kamu menganggap dirimu suci. Dialah yang paling mengetahui siapa yang bertakwa.” QS. An-Najm: 32",
            close: "Tutup",
            streakRestart: "Mulai hari ini",
            streakRecord: "Rekor: {{days}} hari",
        },
        quick: {
            currentStreak: "Streak Saat Ini",
            longestStreak: "Terpanjang: {{days}} hari",
            weeklyPrayers: "Sholat 14 Hari Terakhir",
            outOfDue: "dari {{due}} waktu wajib",
            weeklyHasanah: "Hasanah Minggu Ini",
            last7Days: "14 hari terakhir",
            consistency: "Konsistensi",
            last30Days: "30 hari terakhir",
            lastDays: "terakhir"
        },
        heatmap: {
            title: "Konsistensi Sholat (14 Hari)",
            today: "hari ini",
            total: "total",
            missed: "Terlewat",
            completed: "Terlaksana",
            activityTrend: "Tren aktivitas",
            days7: "7H",
            days14: "14H"
        },
        chart: {
            title: "Hasanah Harian",
            subtitle: "Hasanah yang didapat dari misi dan aktivitas",
            filters: {
                today: "Hari Ini",
                last7d: "7H",
                last30d: "30H",
                last90d: "90H",
                last1y: "1T"
            }
        },
        missions: {
            title: "Ibadah Terlaksana",
            allTime: "sejak awal",
            total: "total",
            categories: {
                prayer: "Sholat Fardhu",
                sunnah: "Sholat Sunnah",
                worship: "Adab & Ibadah",
                quran: "Al-Quran",
                dhikr: "Dzikir",
                fasting: "Puasa"
            }
        },
        message: {
            title: "Pesan untukmu",
            udzur: "Masa udzurmu tidak dihitung sebagai bolong. Haid adalah ketetapan Allah, bukan kelalaian; dzikir, doa, dan niat baikmu tetap bernilai.",
            udzurSource: "\u201cIni adalah perkara yang telah Allah tetapkan bagi putri-putri Adam.\u201d HR. Bukhari No. 294",
            start: "Perjalanan ini dimulai dari satu langkah. Catat satu sholat hari ini, lalu jaga pelan-pelan.",
            return: "Belum ada sholat yang tercatat 14 hari ini. Pintu kembali selalu terbuka; mulai dari sholat berikutnya.",
            grow: "{{prayed}} dari {{due}} sholat wajib terjaga dalam 14 hari. Tidak perlu sempurna sekaligus: mulai jaga {{prayer}}, waktu yang paling sering terlewat.",
            strong: "{{prayed}} dari {{due}} sholat wajib terjaga dalam 14 hari. Ini fondasi yang kuat; teruskan, walau sedikit asal kontinu.",
            consistencySource: "\u201cAmalan yang paling dicintai Allah adalah yang paling kontinu, walaupun sedikit.\u201d HR. Bukhari No. 6464",
            returnSource: "\u201cJanganlah kamu berputus asa dari rahmat Allah.\u201d QS. Az-Zumar: 53"
        },
        quote: {
            text: '"Sesungguhnya Allah tidak menyia-nyiakan pahala orang yang berbuat kebaikan."',
            source: "QS. At-Taubah: 120"
        },
        extra: {
            quran: "Al-Quran",
            ayatRead: "Ayat dibaca",
            dhikr: "Dzikir",
            totalTasbih: "Total tasbih"
        },
        insights: {
            close: "Tutup",
            streak: {
                title: "Detail Konsistensi",
                desc: "Istiqomah adalah kunci perubahan. Landmark 40 hari biasanya menjadi titik balik pembentukan habit baru.",
                current: "Streak Saat Ini",
                longest: "Rekor Terpanjang",
                nextMilestone: "Milestone Berikutnya",
                status: "Pertahankan semangatmu!",
                successDesc: "Luar biasa! Kamu telah melampaui masa kritis 40 hari. Kebiasaan ini sudah mulai mendarah daging.",
                progressDesc: "Pertahankan! Kamu butuh {{needed}} hari lagi untuk mencapai milestone pembentukan habit 40 hari."
            },
            prayers: {
                title: "Analisis Sholat",
                desc: "Kualitas sholat mencerminkan kualitas hidup. Usahakan untuk menjaga sholat di awal waktu.",
                fardu: "Sholat Fardhu",
                sunnah: "Sholat Sunnah",
                target: "Target Mingguan",
                progress: "Progress Ibadah",
                names: {
                    subuh: "Subuh",
                    dzuhur: "Dzuhur",
                    ashar: "Ashar",
                    maghrib: "Maghrib",
                    isya: "Isya"
                },
                insightTitle: "Wawasan Sholat",
                noData: "Lakukan setidaknya satu sholat untuk mendapatkan wawasan lebih lanjut.",
                mostConsistent: "Waktu sholat paling konsisten bagimu adalah",
                sunnahDone: "Kamu juga telah melengkapi dengan {{count}} sholat sunnah, pertahankan!",
                sunnahNone: "Coba mulai tambahkan sholat sunnah Rawatib untuk menyempurnakan ibadahmu."
            },
            hasanah: {
                title: "Pertumbuhan Hasanah",
                desc: "Hasanah mencerminkan usaha dan dedikasi yang kamu berikan dalam setiap amalan.",
                weekly: "Hasanah Minggu Ini",
                avgDaily: "Rata-rata Harian",
                source: "Sumber Hasanah Terbesar",
                insightTitle: "Wawasan Hasanah",
                noData: "Terus selesaikan misi harian untuk melihat hari paling produktif bagimu.",
                levelProgress: "Progres Fase",
                powerDayDesc: "Hari paling produktifmu adalah {{day}}. Pada hari ini kamu cenderung lebih semangat dalam menyelesaikan misi."
            },
            consistency: {
                title: "Grafik Disiplin",
                desc: "Disiplin bukan tentang kesempurnaan, tapi tentang kemauan untuk kembali setiap hari.",
                activeDays: "Hari Aktif (30 Hari)",
                rate: "Tingkat Kehadiran",
                trend: "Tren Dibanding Bulan Lalu",
                tip: "Jadikan Nawaetu bagian dari rutinitas pagimu.",
                highTitle: "Tips Kedisiplinan",
                tipTitle: "Tips Kedisiplinan",
                highDesc: "Konsistensimu sangat tinggi! Ini adalah fondasi yang kuat untuk pertumbuhan spiritual jangka panjang.",
                lowDesc: "Jangan terlalu keras pada diri sendiri. Jika terlewat satu hari, segera kembali ke rutinitas di hari berikutnya."
            },
            quran: {
                title: "Interaksi Al-Quran",
                desc: "Setiap huruf yang dibaca adalah sepuluh kebaikan. Jadikan Al-Quran teman setiamu.",
                totalRead: "Total Ayat Dibaca",
                streak: "Streak Membaca",
                lastSurah: "Surah Terakhir",
                target: "Target Khataman",
                insightTitle: "Wawasan Tilawah",
                summary: "Kamu telah berinteraksi dengan {{count}} ayat suci.",
                milestoneReach: "Hanya kurang {{needed}} ayat lagi untuk mencapai milestone {{target}} ayat!",
                startTip: "Mulailah dengan membaca satu halaman setiap hari untuk mendapatkan keberkahan Al-Quran."
            },
            dhikr: {
                title: "Basahi Lidah dengan Zikir",
                desc: "Zikir adalah nutrisi bagi hati agar tetap tenang di tengah huru-hara dunia.",
                total: "Total Hitungan Tasbih",
                favDhikr: "Zikir Terfavorit",
                benefit: "Ketenangan hati yang dirasakan.",
                benefitTitle: "Manfaat Spiritual",
                summary: "Zikir harianmu membantu menjaga kejernihan pikiran di tengah kesibukan."
            }
        },
        stages: {
            start: { name: "Memulai", about: "Menata niat dan mulai mencatat ibadah harian.", focus: "Catat niat pagi dan sholat yang kamu kerjakan hari ini.", reminder: "“Sesungguhnya setiap amal tergantung pada niatnya.” HR. Bukhari No. 1" },
            habit: { name: "Membiasakan", about: "Membangun kebiasaan mencatat setiap hari, sedikit asal kontinu.", focus: "Usahakan lima waktu tercatat setiap hari, walau belum sempurna.", reminder: "“Amalan yang paling dicintai Allah adalah yang paling kontinu, walaupun sedikit.” HR. Bukhari No. 6464" },
            onTime: { name: "Menjaga Waktu", about: "Kebiasaan mulai terbentuk. Sekarang jaga waktunya.", focus: "Sholat di awal waktu, termasuk Subuh.", reminder: "Ditanya amal yang paling dicintai Allah, Nabi Muhammad SAW menjawab: “Sholat pada waktunya.” HR. Bukhari No. 527" },
            add: { name: "Menambah", about: "Yang wajib sudah terjaga. Mulai menambah amalan sunnah.", focus: "Tambahkan satu sunnah rawatib atau dhuha, perlahan.", reminder: "“Hamba-Ku terus mendekat kepada-Ku dengan amalan sunnah hingga Aku mencintainya.” HR. Bukhari No. 6502" },
            deepen: { name: "Memperdalam", about: "Bukan hanya menambah jumlah, tapi memperdalam makna.", focus: "Latih khusyuk, rutinkan tilawah, dan dzikir pagi petang.", reminder: "“Sungguh beruntung orang-orang beriman, (yaitu) orang yang khusyuk dalam sholatnya.” QS. Al-Mu'minun: 1–2" },
            steady: { name: "Meneguhkan", about: "Menjaga semuanya tetap berjalan, juga saat sibuk dan lelah.", focus: "Siapkan rencana kecil untuk hari-hari padat agar ibadah tetap terjaga.", reminder: "“Sesungguhnya orang-orang yang berkata, ‘Tuhan kami adalah Allah,’ kemudian tetap istiqamah, malaikat akan turun kepada mereka.” QS. Fussilat: 30" },
            share: { name: "Menebar Manfaat", about: "Kebaikanmu mulai mengalir kepada orang lain.", focus: "Ajak keluarga atau teman, dan bagikan ilmu yang bermanfaat.", reminder: "“Barangsiapa menunjukkan kepada kebaikan, maka baginya pahala seperti pelakunya.” HR. Muslim No. 1893" },
        }
    }
};
