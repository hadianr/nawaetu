import Link from "next/link";

// Text-only summary for crawlers that skip JS; the home shell shows it until the app mounts.
export default function HomeSeoIntro() {
    return (
        <div className="sr-only">
            <h1>Nawaetu: Aplikasi Muslim untuk Ibadah Harian</h1>
            <p>
                Nawaetu berarti niat. Aplikasi Muslim gratis ini menghubungkan niat dengan amalan harian, dengan panduan yang bersumber.
            </p>
            <ul>
                <li><Link href="/quran">Al-Qur&apos;an digital</Link> dengan terjemahan, audio, dan tajwid</li>
                <li><Link href="/hadith">Hadits</Link> dan <Link href="/dua">doa harian</Link> beserta sumber</li>
                <li><Link href="/sirah">Sirah Nabawiyah</Link> per bab</li>
                <li><Link href="/qibla">Kompas kiblat</Link>, jadwal sholat, dan <Link href="/dhikr">dzikir</Link></li>
                <li><Link href="/hijri-calendar">Kalender Hijriah</Link> dan <Link href="/ramadhan">panduan Ramadhan</Link></li>
                <li><Link href="/mentor-ai">Tanya Nawaetu</Link>, asisten Muslim AI dengan rujukan</li>
            </ul>
            <p><Link href="/about">Tentang Nawaetu</Link></p>
            <div lang="en">
                <h2>Nawaetu: Islamic app for daily worship</h2>
                <p>
                    Nawaetu means intention. This free Muslim app connects your intentions with daily worship, backed by sourced guidance, in English and Indonesian.
                </p>
                <ul>
                    <li><Link href="/quran">Digital Quran</Link> with translation, audio and tajweed</li>
                    <li><Link href="/hadith">Hadith</Link> and <Link href="/dua">daily duas</Link> with sources</li>
                    <li><Link href="/sirah">Sirah of the Prophet</Link> by chapter</li>
                    <li><Link href="/qibla">Qibla compass</Link>, prayer times and <Link href="/dhikr">dhikr</Link></li>
                    <li><Link href="/hijri-calendar">Hijri calendar</Link> and <Link href="/ramadhan">Ramadan guide</Link></li>
                    <li><Link href="/mentor-ai">Ask Nawaetu</Link>, an AI assistant for Islamic questions that cites its sources</li>
                </ul>
            </div>
        </div>
    );
}
