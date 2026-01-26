
import { Suspense } from "react";
import PrayerTimesDisplay from "@/components/PrayerTimesDisplay";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pt-8 pb-32 px-6 text-white font-sans overflow-x-hidden">

      {/* Top Bar Branding - Minimal & Premium */}
      <header className="w-full max-w-md flex items-center justify-between mb-8 animate-in slide-in-from-top-4 fade-in duration-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-white font-bold text-sm tracking-tighter">N</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white/90">
            Nawaetu
          </h1>
        </div>
      </header>

      <main className="flex w-full max-w-md flex-col items-center gap-6">
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
