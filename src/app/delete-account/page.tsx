import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Delete Your Account - Nawaetu",
    description: "Request deletion of your Nawaetu account and associated personal data.",
    alternates: { canonical: "https://nawaetu.com/delete-account" },
};

const deletionEmail = "mailto:hadian.rahmat@gmail.com?subject=Request%20to%20delete%20my%20Nawaetu%20account&body=Please%20delete%20my%20Nawaetu%20account%20and%20associated%20personal%20data.%0A%0AAccount%20email%3A%20";

export default function DeleteAccountPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] px-4 pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <article className="mb-12 w-full max-w-3xl space-y-8">
                <header className="space-y-3">
                    <h1 className="text-4xl font-bold">Delete your Nawaetu account</h1>
                    <p className="text-[rgb(var(--color-text-muted))]">Account deletion request / Permintaan penghapusan akun</p>
                </header>

                <div className="space-y-8 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/70 p-6 leading-relaxed text-[rgb(var(--color-text-muted))] sm:p-8">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">Request deletion</h2>
                        <p>Email us from the email address associated with your Nawaetu account. Include the account email in the request so we can verify and locate your account. We will contact you if we need more information to verify the request.</p>
                        <a className="inline-flex min-h-11 items-center rounded-xl bg-[rgb(var(--color-primary))] px-5 font-semibold text-[rgb(var(--color-primary-foreground))] underline" href={deletionEmail}>
                            Email account deletion request
                        </a>
                    </section>

                    <section className="space-y-3 border-t border-[rgb(var(--color-border))] pt-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">Ajukan penghapusan</h2>
                        <p>Kirim email dari alamat yang terhubung ke akun Nawaetu Anda. Cantumkan email akun agar kami dapat memverifikasi dan menemukan akun. Kami akan menghubungi Anda jika memerlukan informasi tambahan untuk verifikasi.</p>
                        <a className="underline" href={deletionEmail}>Kirim permintaan melalui email</a>
                    </section>

                    <section className="space-y-3 border-t border-[rgb(var(--color-border))] pt-6">
                        <h2 className="text-xl font-bold text-[rgb(var(--color-text-strong))]">What will be deleted / Data yang dihapus</h2>
                        <p>After we verify and process your request, we will delete your account and associated profile and synced app data. We may retain limited transaction, security, or other records where needed for legal or operational reasons. Data in backups and provider logs may take additional time to expire.</p>
                        <p>Setelah permintaan diverifikasi dan diproses, kami akan menghapus akun serta data profil dan data aplikasi tersinkron yang terkait. Catatan transaksi, keamanan, atau catatan lain yang diperlukan untuk alasan hukum maupun operasional dapat disimpan secara terbatas. Data di cadangan dan log penyedia mungkin memerlukan waktu tambahan untuk terhapus.</p>
                    </section>

                    <p className="border-t border-[rgb(var(--color-border))] pt-6">
                        Questions? Contact <a className="underline" href="mailto:hadian.rahmat@gmail.com">hadian.rahmat@gmail.com</a>. See our <Link className="underline" href="/privacy">Privacy Policy</Link>.
                    </p>
                </div>
            </article>
        </main>
    );
}
