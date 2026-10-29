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
        </div>
    );
}
