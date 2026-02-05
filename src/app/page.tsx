import { Metadata } from "next";

// Critical components - load immediately
import HomeHeader from "@/components/HomeHeader";
import DeferredBelowFold from "@/components/home/DeferredBelowFold";

// Above-the-fold priority components
import RamadhanCountdown from "@/components/RamadhanCountdown";


export const metadata: Metadata = {
  title: "Nawaetu - #NiatAjaDulu | Habit Tracker Ibadah dengan Gamifikasi",
  description: "Build ibadah habits dengan gamifikasi: Daily Missions, Streak System, XP & Leveling. Lengkap dengan Asisten Muslim AI, Al Quran, dan Jadwal Sholat.",
  alternates: {
    canonical: "https://nawaetu.com",
  },
  openGraph: {
    title: "Nawaetu - #NiatAjaDulu",
    description: "Build ibadah habits dengan gamifikasi: Daily Missions, Streak, XP. Luruskan niat, konsisten beramal.",
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nawaetu - #NiatAjaDulu",
    description: "Habit tracker ibadah dengan gamifikasi! Daily Missions, Streak System, Al Quran, & Jadwal Sholat.",
  },
};

export default function Home() {
  const daysLeft = Math.max(0, Math.floor((new Date("2026-02-18T00:00:00+07:00").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <>
      <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] px-4 py-6 font-sans sm:px-6">

        <main className="flex w-full max-w-md flex-col items-center gap-4 pb-nav">

          {/* 1. Header & Greeting */}
          <HomeHeader />

          {/* 2. Ramadhan Countdown (Hero) - Critical for LCP */}
          <section className="w-full">
            <RamadhanCountdown initialDays={daysLeft} />
          </section>

          <DeferredBelowFold />

        </main>

      </div>
    </>
  );
}
