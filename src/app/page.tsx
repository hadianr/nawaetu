
import { Suspense } from "react";
import PrayerTimesDisplay from "@/components/PrayerTimesDisplay";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] p-6 text-white font-sans">
      <main className="flex w-full max-w-md flex-col items-center gap-8">

        {/* Header Section */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-300 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">
            Nawaetu
          </h1>
          <p className="text-lg text-white/80 font-medium italic">
            "Innamal A'malu Binniyat"
          </p>
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
