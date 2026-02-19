import { Metadata } from "next";

// Client component entry point
import HomeClient from "@/components/home/HomeClient";

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
  const daysLeft = Math.max(0, Math.floor((new Date("2026-02-19T00:00:00+07:00").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return <HomeClient initialDaysLeft={daysLeft} />;
}
