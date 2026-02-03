import "./tajweed.css";
import Link from "next/link";
import { ChevronLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import QuranBrowser from "@/components/quran/QuranBrowser";
import SurahListSkeleton from "@/components/skeleton/SurahListSkeleton";

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
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 pt-8 pb-32 text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">Al-Qur'an Digital</h1>
                        <p className="text-xs text-white/60">Lebih dari sekedar membaca</p>
                    </div>
                </div>

                <Suspense fallback={<SurahListSkeleton />}>
                    <QuranBrowser />
                </Suspense>
            </div>
        </div>
    );
}
