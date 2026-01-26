import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import QuranBrowser from "@/components/quran/QuranBrowser";
import SurahListSkeleton from "@/components/skeleton/SurahListSkeleton";

export default function QuranPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] px-4 py-8 text-white font-sans sm:px-6">
            <div className="w-full max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Al-Quran</h1>
                        <p className="text-sm text-white/60">Baca dan Dengarkan Al-Qur'an</p>
                    </div>
                </div>

                <Suspense fallback={<SurahListSkeleton />}>
                    <QuranBrowser />
                </Suspense>
            </div>
        </div>
    );
}
