import "./tajweed.css";
import { Suspense } from "react";
import QuranBrowser from "@/components/quran/QuranBrowser";
import SurahListSkeleton from "@/components/skeleton/SurahListSkeleton";
import QuranPageClient from "@/components/quran/QuranPageClient";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Baca Al Quran Online & Terjemahan - Nawaetu",
    description: "Baca Al Quran digital 30 Juz lengkap dengan terjemahan Bahasa Indonesia, tafsir, dan audio. Gratis dan tanpa iklan.",
    alternates: {
        canonical: "https://nawaetu.com/quran",
    },
};

export default function QuranPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-nav text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-6">
                <QuranPageClient />

                <Suspense fallback={<SurahListSkeleton />}>
                    <QuranBrowser />
                </Suspense>
            </div>
        </div>
    );
}
