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

import Link from "next/link";
import { Zap, Heart } from "lucide-react";
import RewardsSupportCard from "@/components/RewardsSupportCard";
import { AppIcon } from "@/components/ui/AppIcon";
import { pageMetadata } from "@/lib/seo";

// ISR: Static marketing page — cache for 7 days
export const revalidate = 604800;

export const metadata = pageMetadata(
    "Aplikasi Muslim untuk Ibadah Harian",
    "Aplikasi Muslim Nawaetu: Al-Qur'an dan tafsir, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah dan kuis, kalender Hijriah, Ramadhan, jurnal niat, misi, statistik, dan Asisten Muslim AI.",
    "/about",
);

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <div className="w-full max-w-none space-y-8 xl:max-w-4xl">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
                        Tentang Nawaetu
                    </h1>
                    <p className="text-lg sm:text-xl text-[rgb(var(--color-text-muted))] max-w-2xl mx-auto">
                        Mulai dengan niat. Jalani dengan ilmu.
                    </p>
                </div>

                {/* What is Nawaetu */}
                <section className="bg-[rgb(var(--color-surface))]/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))]">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        Apa itu Nawaetu?
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-muted))] leading-relaxed">
                        <p>
                            <strong className="text-[rgb(var(--color-text-strong))]">Nawaetu</strong> berarti niat—fondasi yang mengawali setiap amal ibadah. Kami hadir agar niat dapat dijalani dengan ilmu: memahami tuntunan dan menelusuri rujukan sebelum mengamalkan.
                        </p>
                        <p>
                            Sebagai aplikasi Muslim, Nawaetu menggabungkan panduan ibadah yang bersumber dengan alat untuk mengamalkannya sehari-hari. Baca Al-Qur&apos;an, telusuri hadits dan doa beserta sumbernya, pelajari Sirah, atur waktu sholat, dan bangun rutinitas ibadah. Tanya Nawaetu dirancang untuk menyertakan rujukan pada jawaban agama dan mengakui batasnya saat sumber belum dapat dipastikan.
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-center text-2xl font-bold sm:text-3xl">Fitur Aplikasi Muslim Nawaetu</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <article className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-5">
                            <h3 className="mb-2 text-lg font-bold">Al-Qur&apos;an dan panduan bersumber</h3>
                            <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">
                                <Link href="/quran" className="underline underline-offset-4">Al-Qur&apos;an digital</Link> dengan terjemahan, audio, tajwid, tafsir, pencarian, dan penanda bacaan; <Link href="/hadith" className="underline underline-offset-4">kumpulan hadits</Link> dengan perawi, referensi, dan keterangan kualitas; <Link href="/dua" className="underline underline-offset-4">doa harian</Link> beserta sumber; <Link href="/sirah" className="underline underline-offset-4">Sirah Nabawiyah</Link> per bab dan kuis; serta <Link href="/mentor-ai" className="underline underline-offset-4">Tanya Nawaetu</Link>, asisten Muslim AI untuk pertanyaan Islam dengan rujukan dan batas jawaban yang jelas.
                            </p>
                        </article>
                        <article className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-5">
                            <h3 className="mb-2 text-lg font-bold">Alat ibadah harian</h3>
                            <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">
                                <Link href="/" className="underline underline-offset-4">Jadwal sholat</Link> dan pengingat waktu sholat, <Link href="/qibla" className="underline underline-offset-4">kompas kiblat</Link>, <Link href="/dhikr" className="underline underline-offset-4">dzikir dan tasbih digital</Link> dengan target dan riwayat hitungan, serta jurnal niat dan refleksi ibadah di halaman utama.
                            </p>
                        </article>
                        <article className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-5">
                            <h3 className="mb-2 text-lg font-bold">Kalender dan panduan Ramadhan</h3>
                            <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">
                                <Link href="/hijri-calendar" className="underline underline-offset-4">Kalender Hijriah</Link> untuk melihat tanggal Islam dan puasa sunnah, serta <Link href="/ramadhan" className="underline underline-offset-4">panduan Ramadhan</Link> dengan pencatatan puasa dan qadha, progres khatam Al-Qur&apos;an, panduan Tarawih, makanan sunnah, dan kalkulator zakat fitrah.
                            </p>
                        </article>
                        <article className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-5">
                            <h3 className="mb-2 text-lg font-bold">Kebiasaan dan progres ibadah</h3>
                            <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">
                                <Link href="/missions" className="underline underline-offset-4">Misi harian</Link>, streak, <Link href="/stats" className="underline underline-offset-4">statistik ibadah</Link>, dan progres membantu melihat rutinitas serta menjaga konsistensi. Poin dan level adalah progres aplikasi, bukan ukuran nilai atau penerimaan amal.
                            </p>
                        </article>
                        <div className="sm:col-span-2">
                            <RewardsSupportCard />
                        </div>
                    </div>
                </section>

                {/* Gamification */}
                <section className="bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-secondary))]/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))]">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-[rgb(var(--color-primary))]/30 rounded-lg">
                            <Zap className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                Dukungan untuk Konsistensi Harian
                            </h2>
                            <p className="text-[rgb(var(--color-text-muted))]">
                                Misi dan streak membantu menjaga kebiasaan. Poin dan level adalah progres di aplikasi, bukan ukuran niat, nilai, atau penerimaan amal.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-[rgb(var(--color-surface-subtle))] rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AppIcon name="target" size="sm" tone="primary" /> Daily Missions</h3>
                            <p className="text-sm text-[rgb(var(--color-text-muted))]">
                                Pilih langkah kecil untuk menjaga rutinitas ibadah harian
                            </p>
                        </div>
                        <div className="bg-[rgb(var(--color-surface-subtle))] rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AppIcon name="sparkles" size="sm" tone="primary" /> Streak System</h3>
                            <p className="text-sm text-[rgb(var(--color-text-muted))]">
                                Lihat pola konsistensi tanpa menghakimi hari yang terlewat
                            </p>
                        </div>
                        <div className="bg-[rgb(var(--color-surface-subtle))] rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AppIcon name="trophy" size="sm" tone="primary" /> Hasanah & Leveling</h3>
                            <p className="text-sm text-[rgb(var(--color-text-muted))]">
                                Poin dan level memotivasi kebiasaan; keduanya tidak menilai amal
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Choose Nawaetu */}
                <section className="bg-[rgb(var(--color-surface))]/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))]">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                        Kenapa Memilih Nawaetu?
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <AppIcon name="shield-check" size="sm" tone="primary" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">100% Gratis</h3>
                                <p className="text-[rgb(var(--color-text-muted))] text-sm">Semua fitur dapat diakses tanpa biaya apapun</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <AppIcon name="shield-check" size="sm" tone="primary" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Tanpa Iklan</h3>
                                <p className="text-[rgb(var(--color-text-muted))] text-sm">Fokus ibadah tanpa gangguan iklan</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <AppIcon name="shield-check" size="sm" tone="primary" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Multi-Platform</h3>
                                <p className="text-[rgb(var(--color-text-muted))] text-sm">Tersedia di Web, Android, dan iOS</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <AppIcon name="shield-check" size="sm" tone="primary" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Offline Support</h3>
                                <p className="text-[rgb(var(--color-text-muted))] text-sm">Beberapa fitur dapat diakses tanpa koneksi internet</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <AppIcon name="shield-check" size="sm" tone="primary" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Privasi Terjaga</h3>
                                <p className="text-[rgb(var(--color-text-muted))] text-sm">Data pribadi Anda aman dan tidak dibagikan</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center space-y-4 py-8">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                        Mulai dengan Niat
                    </h2>
                    <p className="text-[rgb(var(--color-text-muted))] max-w-2xl mx-auto">
                        Temukan panduan yang jelas, lalu jalani ibadah harian dengan lebih terarah bersama Nawaetu.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/"
                            className="px-8 py-3 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            Mulai Sekarang
                        </Link>
                        <Link
                            href="/quran"
                            className="px-8 py-3 bg-[rgb(var(--color-surface-subtle))] backdrop-blur-sm rounded-lg font-bold border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))] transition-colors"
                        >
                            Baca Al-Qur&apos;an
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
