import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 604800;

export const metadata: Metadata = {
    title: "Privacy Policy - Nawaetu",
    description: "How Nawaetu collects, uses, and shares personal data.",
    alternates: { canonical: "https://nawaetu.com/privacy" },
};

const sections = [
    {
        title: "1. Who we are",
        text: "Nawaetu is an Islamic worship and habit-tracking service operated by NawaetuLabs (Hadian Rahmat). This policy applies to nawaetu.com and the Nawaetu Android app, including the app experience that opens nawaetu.com.",
    },
    {
        title: "2. Data we collect",
        bullets: [
            "Account details: your name, email address, profile image, and Google account identifiers when you sign in with Google.",
            "Information you add or create: settings, bookmarks, Quran reading progress, worship and habit activity, intentions and reflections, Ramadan fasting and prayer logs, and donation/support status. Some of these entries may reveal sensitive religious or health-related information.",
            "Location: if you enable location-based features, Nawaetu uses your device location to calculate prayer times and Qibla direction, resolve a city name, and support prayer notifications. Notification subscriptions may store coordinates, city, country, time zone, device type, notification token, and your prayer notification choices. You can also enter or select a location manually.",
            "AI mentor content: the questions, conversation context, and related account activity you submit. Signed-in chat history is saved to your account so you can reopen it.",
            "Technical and usage data: app and page activity, feature events, device/browser information, network identifiers processed by hosting and security services, diagnostic errors, and performance data. Depending on the feature, analytics events can include feature names, Quran surah names, prayer names, or a shortened Hadith search query. Our error-monitoring tool can collect sampled session-replay and interaction data to diagnose errors.",
            "Support and payment details: information you provide when contacting us, and donation transaction details such as amount, status, name, email, and payment-provider identifiers.",
        ],
    },
    {
        title: "3. How we use data",
        bullets: [
            "To provide sign-in, sync your account and progress, and operate Nawaetu features.",
            "To calculate prayer times and Qibla direction, set prayer reminders, and deliver notifications you enable.",
            "To answer AI mentor requests and keep your chat history when you are signed in.",
            "To process donations, respond to support requests, protect the service, fix errors, and understand performance and feature usage.",
        ],
    },
    {
        title: "4. When data is shared",
        text: "We do not sell personal data. We share only the data needed with service providers that help operate Nawaetu:",
        bullets: [
            "Google provides account sign-in, Google Analytics measurement, and Firebase Cloud Messaging (push delivery).",
            "Google Gemini, Groq, or OpenRouter may receive your AI prompt, relevant conversation history, and context needed to generate an answer. Nawaetu may use another listed provider when its primary AI provider is unavailable or rate-limited. Their handling is governed by their own terms and privacy policies.",
            "Aladhan provides prayer-time calculations. BigDataCloud or OpenStreetMap Nominatim may receive coordinates for reverse geocoding when Nawaetu resolves a location name.",
            "Mayar processes donations and payment links. Payment details may be shared with it to complete and reconcile a transaction.",
            "Vercel hosts the service and provides performance measurement; Supabase provides the PostgreSQL database; and Sentry provides error monitoring. These providers process data to run, secure, and maintain Nawaetu.",
        ],
    },
    {
        title: "5. Storage and retention",
        text: "Account data and synced activity are stored in Nawaetu’s database. Some app preferences and activity may also remain in browser or device storage. We keep account data while the account is active and handle deletion requests as described below. Certain transaction or security records may need to be retained where required for legitimate operational or legal reasons. Backups and provider logs may take time to expire under the providers’ retention schedules.",
    },
    {
        title: "6. Your choices and account deletion",
        text: "You can control location permission and push notification permission in your device or browser settings, and you can stop using AI features at any time. To request deletion of your Nawaetu account and associated personal data, use the instructions on our account deletion page. We may ask for information needed to verify that you control the account. Some records may be retained where required for legal, security, or transaction purposes.",
    },
    {
        title: "7. Changes and contact",
        text: "We may update this policy as the service changes. The effective date below shows the latest revision. For privacy questions or account deletion requests, email hadian.rahmat@gmail.com.",
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <article className="mb-12 w-full max-w-4xl space-y-8">
                <header className="space-y-3 text-center">
                    <h1 className="text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
                    <p className="text-[rgb(var(--color-text-muted))]">Effective date: September 26, 2026</p>
                </header>

                <div className="space-y-7 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-6 leading-relaxed text-[rgb(var(--color-text-muted))] sm:p-8">
                    {sections.map((section) => (
                        <section className="space-y-3" key={section.title}>
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">{section.title}</h2>
                            {section.text && <p>{section.text}</p>}
                            {section.bullets && (
                                <ul className="list-disc space-y-2 pl-5">
                                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                                </ul>
                            )}
                        </section>
                    ))}

                    <section className="space-y-3 border-t border-[rgb(var(--color-border))] pt-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">Kebijakan Privasi (Bahasa Indonesia)</h2>
                        <p>Kebijakan ini berlaku untuk nawaetu.com dan aplikasi Android Nawaetu yang membuka layanan nawaetu.com. Nawaetu dioperasikan oleh NawaetuLabs (Hadian Rahmat).</p>
                        <p>Kami memproses data akun Google (nama, email, foto profil, dan ID akun); data yang Anda simpan seperti pengaturan, bookmark, progres Al-Qur’an, aktivitas ibadah, niat dan refleksi, catatan Ramadan, serta status dukungan/donasi. Sebagian catatan dapat mengungkap informasi sensitif terkait agama atau kesehatan.</p>
                        <p>Jika Anda mengaktifkan fitur berbasis lokasi, lokasi digunakan untuk waktu salat, arah kiblat, nama kota, dan notifikasi. Token notifikasi, koordinat, kota/negara, zona waktu, jenis perangkat, serta pilihan notifikasi dapat disimpan untuk mengirim pengingat.</p>
                        <p>Pertanyaan dan konteks yang Anda kirim ke mentor AI dapat diproses oleh Google Gemini, Groq, atau OpenRouter; riwayat percakapan akun tersimpan agar dapat dibuka kembali. Aladhan digunakan untuk waktu salat; BigDataCloud atau OpenStreetMap Nominatim untuk pencarian nama lokasi; Google untuk login, analitik, dan Firebase Cloud Messaging; Mayar untuk pembayaran/donasi; Vercel untuk hosting dan pengukuran performa; Supabase untuk basis data; serta Sentry untuk pemantauan error.</p>
                        <p>Kami tidak menjual data pribadi. Data akun disimpan selama akun aktif. Untuk meminta penghapusan akun dan data pribadi terkait, ikuti petunjuk di <Link className="underline" href="/delete-account">halaman penghapusan akun</Link> atau hubungi <a className="underline" href="mailto:hadian.rahmat@gmail.com">hadian.rahmat@gmail.com</a>. Kami dapat meminta verifikasi kepemilikan akun dan dapat menyimpan catatan tertentu bila diperlukan untuk kewajiban hukum, keamanan, atau transaksi. Data pada cadangan dan log penyedia dapat memerlukan waktu untuk terhapus sesuai jadwal retensi mereka.</p>
                        <p>Anda dapat menonaktifkan izin lokasi dan notifikasi melalui pengaturan perangkat/browser, serta berhenti menggunakan fitur AI kapan saja. Kebijakan ini terakhir diperbarui pada 26 September 2026.</p>
                    </section>

                    <p className="border-t border-[rgb(var(--color-border))] pt-6">
                        <Link className="underline" href="/delete-account">Request account deletion</Link>
                    </p>
                </div>
            </article>
        </main>
    );
}
