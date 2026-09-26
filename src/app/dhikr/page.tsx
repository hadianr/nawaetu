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

import { Suspense } from "react";
import Link from "next/link";
import DhikrCounter from "@/components/DhikrCounter";
import { Loader2 } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

// ISR: Page shell is static, state is client-side — cache for 1 hour
export const revalidate = 3600;

export const metadata = pageMetadata(
    "Tasbih Online untuk Dzikir Harian",
    "Gunakan penghitung dzikir online Nawaetu untuk menghitung bacaan, melihat target preset, serta memantau hitungan dan streak dzikir harian.",
    "/dhikr",
);

export default function DhikrPage() {
    return (
        <main className="dhikr-page min-h-screen w-full bg-[rgb(var(--color-background))] font-sans text-[rgb(var(--color-text))]">
            <section aria-label="Tasbih digital Nawaetu" className="relative flex h-[100dvh] w-full max-w-full flex-col items-center overflow-hidden bg-transparent bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))]">
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--color-primary))]" /></div>}>
                    <DhikrCounter />
                </Suspense>
            </section>

            <article className="mx-auto w-full max-w-3xl space-y-5 px-5 py-10 pb-28 leading-relaxed sm:px-8">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-strong))] sm:text-3xl">
                    Tasbih online untuk menghitung dzikir harian
                </h1>
                <p>
                    Nawaetu menyediakan tasbih digital dan penghitung dzikir online yang bisa digunakan langsung dari browser. Pilih bacaan dzikir, ikuti target hitungannya, lalu ketuk area penghitung setiap selesai membaca. Kamu juga bisa melihat jumlah dzikir hari ini, streak, dan riwayat hitungan.
                </p>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-[rgb(var(--color-text-strong))]">
                        Cara menggunakan penghitung dzikir
                    </h2>
                    <ol className="list-inside list-decimal space-y-1">
                        <li>Pilih bacaan atau rangkaian dzikir dari menu tasbih.</li>
                        <li>Ketuk area penghitung satu kali untuk setiap bacaan.</li>
                        <li>Pantau progres target, jumlah harian, streak, dan riwayatmu.</li>
                    </ol>
                </section>

                <p>
                    Tasbih online ini membantu mencatat hitungan; untuk bacaan, tata cara, dan tuntunan ibadah, lihat juga <Link href="/dua" className="underline underline-offset-4">kumpulan doa dan dzikir beserta sumbernya</Link> di Nawaetu.
                </p>
            </article>
        </main>
    );
}
