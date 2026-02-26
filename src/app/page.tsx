/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  const now = new Date();
  // Server-side Ramadhan season check (Gregorian approximation 1447H)
  // Ramadhan 1447H: ~Feb 18 2026 to ~Mar 20 2026
  const RAMADHAN_START = new Date("2026-02-18T00:00:00+07:00");
  const RAMADHAN_END = new Date("2026-03-20T23:59:59+07:00");
  const isRamadhanSeason = now >= RAMADHAN_START && now <= RAMADHAN_END;

  const daysLeft = isRamadhanSeason ? 0 : Math.max(0, Math.floor((RAMADHAN_START.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return <HomeClient initialDaysLeft={daysLeft} isRamadhanSeason={isRamadhanSeason} />;
}
