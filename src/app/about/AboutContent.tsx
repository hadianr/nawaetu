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

import type { ReactNode } from "react";
import { RAMADHAN_PAGE_ENABLED } from "@/lib/features";
import Link from "next/link";
import { Heart, Trophy } from "@/components/ui/icons";
import RewardsSupportCard from "@/components/RewardsSupportCard";
import { AppIcon } from "@/components/ui/AppIcon";

export type AboutLang = "id" | "en";

const link = (href: string, text: string) => <Link href={href} className="underline underline-offset-4">{text}</Link>;

export const FAQ: Record<AboutLang, { q: string; a: string }[]> = {
    id: [
        { q: "Apa itu Nawaetu?", a: "Nawaetu adalah aplikasi Muslim yang menghubungkan niat dengan amalan harian: Al-Qur'an, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah, kalender Hijriah, Ramadhan, jurnal niat, misi, dan Tanya Nawaetu." },
        { q: "Apakah Nawaetu gratis?", a: "Ya, Nawaetu dapat digunakan secara gratis." },
        { q: "Apakah Nawaetu bisa dipakai tanpa internet?", a: "Beberapa fitur dapat diakses tanpa koneksi internet." },
        { q: "Bagaimana Tanya Nawaetu menjawab pertanyaan agama?", a: "Tanya Nawaetu dirancang untuk menyertakan rujukan pada jawaban agama dan mengakui batasnya saat sumber belum dapat dipastikan." },
    ],
    en: [
        { q: "What is Nawaetu?", a: "Nawaetu is a Muslim app that connects intention with daily worship: Quran, prayer times, qibla, dhikr, sourced hadith and duas, Sirah, Hijri calendar, Ramadan, an intention journal, missions, and Ask Nawaetu." },
        { q: "Is Nawaetu free?", a: "Yes, Nawaetu is free to use." },
        { q: "Can I use Nawaetu without internet?", a: "Some features are available without an internet connection." },
        { q: "How does Ask Nawaetu answer religious questions?", a: "Ask Nawaetu is designed to include references in its religious answers and to acknowledge its limits when a source cannot be confirmed." },
    ],
};

const COPY: Record<AboutLang, {
    title: string; tagline: string; otherLang: { href: string; text: string; lang: AboutLang };
    whatTitle: string; whatBody: [ReactNode, string];
    featuresTitle: string;
    features: { title: string; body: ReactNode }[];
    habitTitle: string; habitBody: string;
    habits: { icon: "target" | "calendar" | "trophy"; title: string; body: string }[];
    whyTitle: string; why: { title: string; body: string }[];
    faqTitle: string;
    ctaTitle: string; ctaBody: string; ctaPrimary: string; ctaQuran: string;
}> = {
    id: {
        title: "Tentang Nawaetu",
        tagline: "Mulai dengan niat. Jalani dengan ilmu.",
        otherLang: { href: "/en/about", text: "Read in English", lang: "en" },
        whatTitle: "Apa itu Nawaetu?",
        whatBody: [
            <><strong className="text-[rgb(var(--color-text-strong))]">Nawaetu</strong> berarti niat, fondasi yang mengawali setiap amal ibadah. Kami hadir agar niat dapat dijalani dengan ilmu: memahami tuntunan dan menelusuri rujukan sebelum mengamalkan.</>,
            "Sebagai aplikasi Muslim, Nawaetu menggabungkan panduan ibadah yang bersumber dengan alat untuk mengamalkannya sehari-hari. Baca Al-Qur'an, telusuri hadits dan doa beserta sumbernya, pelajari Sirah, atur waktu sholat, dan bangun rutinitas ibadah. Tanya Nawaetu dirancang untuk menyertakan rujukan pada jawaban agama dan mengakui batasnya saat sumber belum dapat dipastikan.",
        ],
        featuresTitle: "Fitur Aplikasi Muslim Nawaetu",
        features: [
            { title: "Al-Qur'an dan panduan bersumber", body: <>{link("/quran", "Al-Qur'an digital")} dengan terjemahan, audio, tajwid, tafsir, pencarian, dan penanda bacaan; {link("/hadith", "kumpulan hadits")} dengan perawi, referensi, dan keterangan kualitas; {link("/dua", "doa harian")} beserta sumber; {link("/sirah", "Sirah Nabawiyah")} dalam ringkasan, bab lengkap, dan lini masa peristiwa; serta {link("/mentor-ai", "Tanya Nawaetu")}, asisten Muslim AI untuk pertanyaan Islam dengan rujukan dan batas jawaban yang jelas.</> },
            { title: "Alat ibadah harian", body: <>{link("/", "Jadwal sholat")} dan pengingat waktu sholat, {link("/qibla", "kompas kiblat")}, {link("/dhikr", "dzikir dan tasbih digital")} dengan target dan riwayat hitungan, serta jurnal niat dan refleksi ibadah di halaman utama.</> },
            { title: RAMADHAN_PAGE_ENABLED ? "Kalender dan panduan Ramadhan" : "Kalender Hijriah", body: <>{link("/hijri-calendar", "Kalender Hijriah")} untuk melihat tanggal Islam dan puasa sunnah{RAMADHAN_PAGE_ENABLED && <>, serta {link("/ramadhan", "panduan Ramadhan")} dengan pencatatan puasa dan qadha, progres khatam Al-Qur&apos;an</>}, panduan Tarawih, makanan sunnah, dan kalkulator zakat fitrah.</> },
            { title: "Kebiasaan dan progres ibadah", body: <>{link("/missions", "Misi harian")}, streak, {link("/stats", "statistik ibadah")}, dan progres membantu melihat rutinitas serta menjaga konsistensi. Poin dan level adalah progres aplikasi, bukan ukuran nilai atau penerimaan amal.</> },
        ],
        habitTitle: "Dukungan untuk Konsistensi Harian",
        habitBody: "Misi dan streak membantu menjaga kebiasaan. Poin dan level adalah progres di aplikasi, bukan ukuran niat, nilai, atau penerimaan amal.",
        habits: [
            { icon: "target", title: "Daily Missions", body: "Pilih langkah kecil untuk menjaga rutinitas ibadah harian" },
            { icon: "calendar", title: "Streak System", body: "Lihat pola konsistensi tanpa menghakimi hari yang terlewat" },
            { icon: "trophy", title: "Hasanah & Leveling", body: "Poin dan level memotivasi kebiasaan; keduanya tidak menilai amal" },
        ],
        whyTitle: "Kenapa Memilih Nawaetu?",
        why: [
            { title: "100% Gratis", body: "Semua fitur dapat diakses tanpa biaya apapun" },
            { title: "Tanpa Iklan", body: "Fokus ibadah tanpa gangguan iklan" },
            { title: "Multi-Platform", body: "Tersedia di Web, Android, dan iOS" },
            { title: "Offline Support", body: "Beberapa fitur dapat diakses tanpa koneksi internet" },
            { title: "Privasi Terjaga", body: "Data pribadi Anda aman dan tidak dibagikan" },
        ],
        faqTitle: "Pertanyaan Umum",
        ctaTitle: "Mulai dengan Niat",
        ctaBody: "Temukan panduan yang jelas, lalu jalani ibadah harian dengan lebih terarah bersama Nawaetu.",
        ctaPrimary: "Mulai dari niat hari ini",
        ctaQuran: "Baca Al-Qur'an",
    },
    en: {
        title: "About Nawaetu",
        tagline: "Begin with intention. Practice with knowledge.",
        otherLang: { href: "/about", text: "Baca dalam Bahasa Indonesia", lang: "id" },
        whatTitle: "What is Nawaetu?",
        whatBody: [
            <><strong className="text-[rgb(var(--color-text-strong))]">Nawaetu</strong> means intention, the foundation that begins every act of worship. We want intention to be practiced with knowledge: understanding the guidance and tracing its references before acting on it.</>,
            "As a Muslim app, Nawaetu brings sourced worship guidance together with tools to practice it every day. Read the Quran, explore hadith and duas with their sources, learn the Sirah, keep track of prayer times, and build a worship routine. Ask Nawaetu is designed to include references in its religious answers and to acknowledge its limits when a source cannot be confirmed.",
        ],
        featuresTitle: "Features of the Nawaetu Muslim App",
        features: [
            { title: "Quran and sourced guidance", body: <>The {link("/quran", "digital Quran")} with translation, audio, tajweed, tafsir, search, and bookmarks; a {link("/hadith", "hadith collection")} with narrators, references, and grading; {link("/dua", "daily duas")} with their sources; the {link("/en/sirah/concise", "Sirah of Prophet Muhammad SAW")} as a summary, full chapters, and a timeline of events; and {link("/mentor-ai", "Ask Nawaetu")}, an AI Muslim assistant for questions about Islam with clear references and limits.</> },
            { title: "Daily worship tools", body: <>{link("/", "Prayer times")} and prayer reminders, a {link("/qibla", "qibla compass")}, {link("/dhikr", "dhikr and a digital tasbih")} with targets and count history, and an intention and reflection journal on the home screen.</> },
            { title: RAMADHAN_PAGE_ENABLED ? "Calendar and Ramadan guide" : "Hijri calendar", body: <>A {link("/hijri-calendar", "Hijri calendar")} for Islamic dates and sunnah fasts{RAMADHAN_PAGE_ENABLED && <>, and a {link("/ramadhan", "Ramadan guide")} with fasting and qadha tracking, Quran completion progress</>}, a Tarawih guide, sunnah foods, and a zakat al-fitr calculator.</> },
            { title: "Habits and worship progress", body: <>{link("/missions", "Daily missions")}, streaks, {link("/stats", "worship statistics")}, and progress help you see your routine and stay consistent. Points and levels are app progress, not a measure of the worth or acceptance of deeds.</> },
        ],
        habitTitle: "Support for Daily Consistency",
        habitBody: "Missions and streaks help you keep a habit. Points and levels are progress in the app, not a measure of intention, worth, or the acceptance of deeds.",
        habits: [
            { icon: "target", title: "Daily Missions", body: "Choose small steps to keep a daily worship routine" },
            { icon: "calendar", title: "Streak System", body: "See your consistency without judging the days you missed" },
            { icon: "trophy", title: "Hasanah & Leveling", body: "Points and levels encourage the habit; neither judges your deeds" },
        ],
        whyTitle: "Why Nawaetu?",
        why: [
            { title: "100% Free", body: "Every feature is available at no cost" },
            { title: "No Ads", body: "Focus on worship without ads in the way" },
            { title: "Multi-Platform", body: "Available on the web, Android, and iOS" },
            { title: "Offline Support", body: "Some features work without an internet connection" },
            { title: "Privacy Respected", body: "Your personal data is kept safe and is not shared" },
        ],
        faqTitle: "Frequently Asked Questions",
        ctaTitle: "Begin with Intention",
        ctaBody: "Find clear guidance, then practice your daily worship with more direction with Nawaetu.",
        ctaPrimary: "Write today's intention",
        ctaQuran: "Read the Quran",
    },
};

const card = "rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-5 shadow-[var(--shadow-card)]";

function FaqList({ items }: { items: { q: string; a: string }[] }) {
    return (
        <dl className="space-y-4">
            {items.map(({ q, a }) => (
                <div key={q} className={card}>
                    <dt className="mb-2 font-bold">{q}</dt>
                    <dd className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{a}</dd>
                </div>
            ))}
        </dl>
    );
}

export function AboutContent({ lang }: { lang: AboutLang }) {
    const c = COPY[lang];
    // The Indonesian page keeps its English FAQ for search; the English page shows only English.
    const faqLangs: AboutLang[] = lang === "id" ? ["id", "en"] : ["en"];
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqLangs.flatMap((l) => FAQ[l].map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            inLanguage: l,
            acceptedAnswer: { "@type": "Answer", text: a, inLanguage: l },
        }))),
    };

    return (
        <main lang={lang} className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <div className="w-full max-w-none space-y-8 xl:max-w-4xl">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-[rgb(var(--color-text-strong))]">
                        {c.title}
                    </h1>
                    <p className="text-lg sm:text-xl text-[rgb(var(--color-text-muted))] max-w-2xl mx-auto">
                        {c.tagline}
                    </p>
                    <p>
                        <Link href={c.otherLang.href} hrefLang={c.otherLang.lang} lang={c.otherLang.lang} className="inline-flex min-h-11 items-center text-sm font-semibold text-[rgb(var(--color-primary-strong))] underline underline-offset-4">
                            {c.otherLang.text}
                        </Link>
                    </p>
                </div>

                {/* What is Nawaetu */}
                <section className="bg-[rgb(var(--color-surface))]/70 rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-[rgb(var(--color-primary-strong))]" />
                        {c.whatTitle}
                    </h2>
                    <div className="space-y-4 text-[rgb(var(--color-text-muted))] leading-relaxed">
                        <p>{c.whatBody[0]}</p>
                        <p>{c.whatBody[1]}</p>
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="text-center text-2xl font-bold sm:text-3xl">{c.featuresTitle}</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {c.features.map((f) => (
                            <article key={f.title} className={card}>
                                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-[rgb(var(--color-text-muted))]">{f.body}</p>
                            </article>
                        ))}
                        <div className="sm:col-span-2">
                            <RewardsSupportCard />
                        </div>
                    </div>
                </section>

                {/* Gamification */}
                <section className="bg-[rgb(var(--color-primary))]/10 rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-[rgb(var(--color-primary))]/30 rounded-lg">
                            <Trophy className="w-6 h-6 text-[rgb(var(--color-primary-strong))]" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{c.habitTitle}</h2>
                            <p className="text-[rgb(var(--color-text-muted))]">{c.habitBody}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {c.habits.map((h) => (
                            <div key={h.title} className="bg-[rgb(var(--color-surface-subtle))] rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AppIcon name={h.icon} size="sm" tone="primary" /> {h.title}</h3>
                                <p className="text-sm text-[rgb(var(--color-text-muted))]">{h.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Choose Nawaetu */}
                <section className="bg-[rgb(var(--color-surface))]/70 rounded-2xl p-6 sm:p-8 border border-[rgb(var(--color-border))] shadow-[var(--shadow-card)]">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">{c.whyTitle}</h2>
                    <div className="space-y-4">
                        {c.why.map((w) => (
                            <div key={w.title} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <AppIcon name="shield-check" size="sm" tone="primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">{w.title}</h3>
                                    <p className="text-[rgb(var(--color-text-muted))] text-sm">{w.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="space-y-4">
                    <h2 className="text-center text-2xl font-bold sm:text-3xl">{c.faqTitle}</h2>
                    <FaqList items={FAQ[lang]} />
                    {lang === "id" && (
                        <div lang="en" className="space-y-4 pt-4">
                            <h2 className="text-center text-2xl font-bold sm:text-3xl">{COPY.en.faqTitle}</h2>
                            <FaqList items={FAQ.en} />
                        </div>
                    )}
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
                </section>

                {/* CTA */}
                <section className="text-center space-y-4 py-8">
                    <h2 className="text-2xl sm:text-3xl font-bold">{c.ctaTitle}</h2>
                    <p className="text-[rgb(var(--color-text-muted))] max-w-2xl mx-auto">{c.ctaBody}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/"
                            className="px-8 py-3 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))] rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            {c.ctaPrimary}
                        </Link>
                        <Link
                            href="/quran"
                            className="px-8 py-3 bg-[rgb(var(--color-surface-subtle))] rounded-lg font-bold border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))] transition-colors"
                        >
                            {c.ctaQuran}
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
