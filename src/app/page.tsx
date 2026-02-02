import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, MessageCircle } from "lucide-react";
import PrayerTimesDisplay from "@/components/PrayerTimesDisplay";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import HomeHeader from "@/components/HomeHeader";
import NextPrayerWidget from "@/components/NextPrayerWidget";

// Skeletons
import WidgetSkeleton from "@/components/skeleton/WidgetSkeleton";
import MissionSkeleton from "@/components/skeleton/MissionSkeleton";

// Lazy Loaded Components
const LastReadWidget = dynamic(() => import("@/components/LastReadWidget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false
});
const MissionsWidget = dynamic(() => import("@/components/MissionsWidget"), {
  loading: () => <MissionSkeleton />,
  ssr: false
});

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jadwal Sholat & Ibadah Harian - Nawaetu",
  description: "Cek jadwal sholat hari ini, imsakiyah, dan waktu berbuka puasa yang akurat sesuai lokasi Anda.",
  alternates: {
    canonical: "https://nawaetu.com",
  },
};

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
      {/* AI Mentor Access Point */}
      <div className="fixed bottom-[90px] left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto w-full relative px-4">
          <Link
            href="/tanya-ustadz"
            className="absolute right-4 bottom-0 pointer-events-auto group animate-in slide-in-from-right-4 fade-in duration-700 delay-500"
          >
            <div className="relative flex items-center gap-2 bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] p-1 pr-4 pl-1.5 rounded-full border border-white/20 shadow-[0_8px_32px_rgba(var(--color-primary),0.3)] hover:scale-105 active:scale-95 transition-all">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[rgb(var(--color-primary))] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />

              {/* Icon Circle */}
              <div className="relative w-10 h-10 bg-black/20 rounded-full flex items-center justify-center border border-white/10">
                <MessageCircle className="w-5 h-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-300 animate-pulse" />
              </div>

              {/* Label */}
              <div className="relative flex flex-col">
                <span className="text-[11px] font-bold text-white leading-none">Tanya Nawaetu</span>
                <span className="text-[9px] text-white/70 leading-normal">Asisten Muslim AI</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
