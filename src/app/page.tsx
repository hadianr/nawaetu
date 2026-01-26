
import { Suspense } from "react";
import PrayerTimesDisplay from "@/components/PrayerTimesDisplay";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] p-6 text-white font-sans">
      <main className="flex w-full max-w-md flex-col items-center gap-8">

        {/* Header Section */}
        {/* Header Section */}
        <header className="relative text-center space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-700">
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-b from-white via-white/90 to-emerald-200/60 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Nawaetu
            </h1>
            <div className="absolute -inset-x-20 -top-20 -bottom-20 bg-emerald-500/10 blur-[100px] rounded-full opacity-50 -z-10 pointer-events-none" />
          </div>

          <div className="space-y-3">
            <p className="text-xl md:text-2xl font-semibold text-emerald-100/90 tracking-wide">
              Tata Niat, Jaga Istiqomah
            </p>
            <p className="text-sm font-arabic text-emerald-300/60 tracking-wider uppercase text-xs">
              "Innamal A'malu Binniyat"
            </p>
          </div>
        </header>

        {/* PPR Demo Section with Suspense */}
        <section className="w-full">
          <Suspense fallback={<PrayerCardSkeleton />}>
            <PrayerTimesDisplay />
          </Suspense>
        </section>

      </main>
    </div>
  );
}
