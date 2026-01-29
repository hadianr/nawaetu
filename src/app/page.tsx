import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import PrayerTimesDisplay from "@/components/PrayerTimesDisplay";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import LastReadWidget from "@/components/LastReadWidget";
import HomeHeader from "@/components/HomeHeader";
import NextPrayerWidget from "@/components/NextPrayerWidget";
import MissionsWidget from "@/components/MissionsWidget";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-6 font-sans sm:px-6">

      <main className="flex w-full max-w-md flex-col items-center gap-4 pb-24">

        {/* 1. Header & Greeting */}
        <HomeHeader />

        {/* 2. Ramadhan Countdown (Hero) */}
        <section className="w-full animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100">
          <RamadhanCountdown />
        </section>

        {/* 3. Quick Status Grid */}
        <section className="w-full grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-3 fade-in duration-700 delay-200">
          <div className="w-full h-32">
            <NextPrayerWidget />
          </div>
          <div className="w-full h-32">
            <LastReadWidget />
          </div>
        </section>

        {/* 4. Daily Missions */}
        <section className="w-full animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          <MissionsWidget />
        </section>

        {/* 5. Prayer Times List */}
        <section className="w-full">
          <Suspense fallback={<PrayerCardSkeleton />}>
            <PrayerTimesDisplay />
          </Suspense>
        </section>

      </main>
      {/* AI Mentor FAB */}
      <Link
        href="/tanya-ustadz"
        className="fixed bottom-24 right-4 z-40 group animate-in zoom-in duration-500 delay-1000 slide-in-from-bottom-10"
      >
        <div className="absolute inset-0 bg-[rgb(var(--color-primary))] rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
        <div className="relative w-14 h-14 bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] rounded-full flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
          <Sparkles className="w-7 h-7 text-white fill-white/20" />
        </div>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tanya Ustadz
        </span>
      </Link>
    </div>
  );
}
