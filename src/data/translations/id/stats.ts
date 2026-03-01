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
        level: {
            rankLabel: "Peringkat Spiritual",
            totalXp: "Total XP",
            toNextLevel: "menuju Level",
            xpNeeded: "XP dibutuhkan",
            nextRankGoal: "Target Berikutnya:",
            currentXp: "XP Saat Ini",
            nextLevelXp: "XP Berikutnya",
            understand: "Mengerti"
        },
        quick: {
            currentStreak: "Streak Saat Ini",
            longestStreak: "Terpanjang: {{days}} hari",
            weeklyPrayers: "Sholat 14 Hari Terakhir",
            outOf35: "dari 70 waktu sholat",
            weeklyXp: "XP Minggu Ini",
            last7Days: "14 hari terakhir",
            consistency: "Konsistensi",
            last30Days: "30 hari terakhir"
        },
        heatmap: {
            title: "Konsistensi Sholat (14 Hari)",
            today: "hari ini",
            total: "total",
            missed: "Terlewat",
            completed: "Terlaksana"
        },
        chart: {
            title: "XP Harian",
            subtitle: "XP yang didapat dari misi dan aktivitas",
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
        quote: {
            text: '"Sesungguhnya Allah tidak menyia-nyiakan pahala orang yang berbuat kebaikan."',
            source: "— QS. At-Taubah: 120"
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
            xp: {
                title: "Pertumbuhan XP",
                desc: "XP (Experience Points) mencerminkan usaha dan dedikasi yang kamu berikan dalam setiap amalan.",
                weekly: "XP Minggu Ini",
                avgDaily: "Rata-rata Harian",
                source: "Sumber XP Terbesar",
                insightTitle: "Wawasan XP",
                noData: "Terus selesaikan misi harian untuk melihat hari paling produktif bagimu.",
                levelProgress: "Progres Level",
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
        ranks: {
            mubtadi: {
                icon: "🌱",
                title: "Mubtadi",
                desc: "Istilah bagi pemula (al-mubtadi) yang baru memulai langkah pertama dalam perjalanan kedisiplinan diri dan perbaikan spiritual.",
                milestone: "Fokus pada menyempurnakan niat dalam setiap amal.",
                quote: "Sesungguhnya setiap amal tergantung pada niatnya.",
                source: "Hadits Bukhari & Muslim"
            },
            seeker: {
                icon: "🔍",
                title: "Pencari Rahmat",
                desc: "Mulai menemukan ketenangan dalam keteraturan ibadah fardhu.",
                milestone: "Usahakan sholat tepat waktu sebagai prioritas utama.",
                quote: "Janganlah kamu berputus asa dari rahmat Allah.",
                source: "QS. Az-Zumar: 53"
            },
            warrior: {
                icon: "⚔️",
                title: "Pejuang Subuh",
                desc: "Disiplin di waktu yang paling sulit namun penuh berkah.",
                milestone: "Jaga konsistensi sholat Subuh berjamaah atau tepat waktu.",
                quote: "Sesungguhnya shalat subuh itu disaksikan (oleh malaikat).",
                source: "QS. Al-Isra: 78"
            },
            abid: {
                icon: "🕌",
                title: "Abid",
                desc: "Hamba yang mulai merasakan manisnya ibadah melebihi kewajiban.",
                milestone: "Mulai tambahkan amalan sunnah rawatib secara perlahan.",
                quote: "Hamba-Ku mendekatkan diri dengan amalan sunnah hingga Aku mencintainya.",
                source: "Hadits Qudsi (Bukhari)"
            },
            salik: {
                icon: "👣",
                title: "Salik",
                desc: "Seorang penempuh jalan spiritual yang sadar akan setiap langkahnya.",
                milestone: "Latih kehadiran hati (khusyuk) dalam setiap gerakan sholat.",
                quote: "Jika hati itu baik, maka baiklah seluruh tubuhnya.",
                source: "Hadits Bukhari & Muslim"
            },
            mukhlis: {
                icon: "💎",
                title: "Mukhlis",
                desc: "Memurnikan segala amal hanya untuk mencari ridha Allah semata.",
                milestone: "Hindari perasaan ingin dipuji orang lain dalam beribadah.",
                quote: "Menyembah Allah dengan memurnikan ketaatan kepada-Nya.",
                source: "QS. Al-Bayyinah: 5"
            },
            muhsin: {
                icon: "✨",
                title: "Muhsin",
                desc: "Beribadah seakan-akan melihat Allah, atau sadar Ia melihatmu.",
                milestone: "Jadikan setiap detik sebagai bentuk zikir dan rasa syukur.",
                quote: "Beribadah seakan-akan engkau melihat-Nya... Dia melihatmu.",
                source: "Hadits Jibril (Muslim)"
            }
        }
    }
};
