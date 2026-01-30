import Link from "next/link";
import { ChevronLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import QuranBrowser from "@/components/quran/QuranBrowser";
import SurahListSkeleton from "@/components/skeleton/SurahListSkeleton";

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
                        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--color-primary-light))]">Al-Quran</h1>
                        <p className="text-sm text-white/60">Baca dan Dengarkan Al-Qur'an</p>
                    </div>

                    <Button variant="outline" size="sm" asChild className="ml-auto rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-xs gap-2">
                        <Link href="/bookmarks">
                            <Bookmark className="w-4 h-4" />
                            <span className="hidden sm:inline">Tanda Baca</span>
                        </Link>
                    </Button>
                </div>

                <Suspense fallback={<SurahListSkeleton />}>
                    <QuranBrowser />
                </Suspense>
            </div>
        </div>
    );
}
