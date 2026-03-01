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

import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, MessageSquare, Target, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
    title: "Tentang Nawaetu - Aplikasi Muslim Lengkap #NiatAjaDulu",
    description: "Nawaetu adalah aplikasi Muslim lengkap yang membantu Anda membangun kebiasaan ibadah dengan gamifikasi. Dilengkapi Jadwal Sholat, Al Quran Online, Arah Kiblat, Tasbih Digital, dan Asisten AI. Gratis!",
    keywords: [
        "tentang nawaetu",
        "aplikasi muslim indonesia",
        "habit tracker ibadah",
        "gamifikasi islami",
        "aplikasi sholat gratis",
    ],
    alternates: {
        canonical: "https://nawaetu.com/about",
    },
    openGraph: {
        title: "Tentang Nawaetu - Aplikasi Muslim Lengkap",
        description: "Aplikasi Muslim lengkap untuk membangun kebiasaan ibadah dengan gamifikasi seru. Gratis!",
        url: "https://nawaetu.com/about",
    },
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
                        Tentang Nawaetu
                    </h1>
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
                        Aplikasi Muslim lengkap yang membantu Anda membangun kebiasaan ibadah dengan cara yang menyenangkan
                    </p>
                </div>

                {/* What is Nawaetu */}
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        Apa itu Nawaetu?
                    </h2>
                    <div className="space-y-4 text-white/80 leading-relaxed">
                        <p>
                            <strong className="text-white">Nawaetu</strong> adalah aplikasi Muslim lengkap yang dirancang untuk membantu umat Islam membangun dan menjaga konsistensi ibadah sehari-hari. Dengan tagline <strong className="text-[rgb(var(--color-primary))]">#NiatAjaDulu</strong>, kami percaya bahwa setiap perjalanan ibadah dimulai dari niat yang tulus.
                        </p>
                        <p>
                            Kami menggabungkan fitur-fitur ibadah esensial seperti <strong>Jadwal Sholat</strong>, <strong>Al Quran Digital</strong>, <strong>Arah Kiblat</strong>, dan <strong>Tasbih Digital</strong> dengan sistem <strong>gamifikasi</strong> yang membuat ibadah lebih engaging dan konsisten.
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                        Fitur Lengkap untuk Ibadah Anda
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Al Quran */}
                        <Link href="/quran" className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[rgb(var(--color-primary))]/50 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                                    <BookOpen className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Al Quran Online
                                    </h3>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Baca Al Quran 30 Juz lengkap dengan terjemahan Bahasa Indonesia, audio, dan tajwid. Gratis tanpa iklan.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Kiblat */}
                        <Link href="/qibla" className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[rgb(var(--color-primary))]/50 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                                    <Compass className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Arah Kiblat
                                    </h3>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Temukan arah kiblat dengan akurat menggunakan kompas digital berbasis GPS dan sensor perangkat Anda.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Daily Missions */}
                        <Link href="/missions" className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[rgb(var(--color-primary))]/50 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                                    <Target className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Daily Missions
                                    </h3>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Selesaikan misi ibadah harian, kumpulkan Hasanah, naik level, dan jaga streak untuk konsistensi maksimal.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* AI Assistant */}
                        <Link href="/mentor-ai" className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[rgb(var(--color-primary))]/50 transition-all hover:scale-[1.02]">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                                    <MessageSquare className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Asisten Muslim AI
                                    </h3>
                                    <p className="text-white/70 text-sm leading-relaxed">
                                        Tanya jawab seputar Islam, doa harian, dan panduan ibadah dengan asisten AI yang ramah dan informatif.
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Gamification */}
                <section className="bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-secondary))]/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-[rgb(var(--color-primary))]/30 rounded-lg">
                            <Zap className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                Gamifikasi Ibadah
                            </h2>
                            <p className="text-white/80">
                                Sistem reward yang membuat ibadah lebih engaging
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2">🎯 Daily Missions</h3>
                            <p className="text-sm text-white/70">
                                Selesaikan misi ibadah harian untuk mendapat Hasanah dan rewards
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2">🔥 Streak System</h3>
                            <p className="text-sm text-white/70">
                                Jaga konsistensi ibadah dengan streak counter yang memotivasi
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="font-bold text-lg mb-2">⬆️ Hasanah & Leveling</h3>
                            <p className="text-sm text-white/70">
                                Naik level seiring konsistensi ibadah Anda meningkat
                            </p>
                        </div>
                    </div>
                </section>

                {/* Why Choose Nawaetu */}
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                        Kenapa Memilih Nawaetu?
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-[rgb(var(--color-primary))] text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">100% Gratis</h3>
                                <p className="text-white/70 text-sm">Semua fitur dapat diakses tanpa biaya apapun</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-[rgb(var(--color-primary))] text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Tanpa Iklan</h3>
                                <p className="text-white/70 text-sm">Fokus ibadah tanpa gangguan iklan</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-[rgb(var(--color-primary))] text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Multi-Platform</h3>
                                <p className="text-white/70 text-sm">Tersedia di Web, Android, dan iOS</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-[rgb(var(--color-primary))] text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Offline Support</h3>
                                <p className="text-white/70 text-sm">Beberapa fitur dapat diakses tanpa koneksi internet</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-[rgb(var(--color-primary))] text-sm">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">Privasi Terjaga</h3>
                                <p className="text-white/70 text-sm">Data pribadi Anda aman dan tidak dibagikan</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center space-y-4 py-8">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                        Mulai Perjalanan Ibadah Anda
                    </h2>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        Bergabunglah dengan ribuan Muslim yang telah meningkatkan konsistensi ibadah mereka dengan Nawaetu
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
                            className="px-8 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-bold border border-white/20 hover:bg-white/20 transition-colors"
                        >
                            Baca Al Quran
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
