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
  description: "Build ibadah habits dengan gamifikasi: Daily Missions, Streak System, Hasanah & Leveling. Lengkap dengan Asisten Muslim AI, Al Quran, dan Jadwal Sholat.",
  alternates: {
    canonical: "https://nawaetu.com",
  },
  openGraph: {
    title: "Nawaetu - #NiatAjaDulu",
    description: "Build ibadah habits dengan gamifikasi: Daily Missions, Streak, Hasanah. Luruskan niat, konsisten beramal.",
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

// ISR: Homepage structure is static, dynamic content (prayer times, user data)
// is loaded client-side. Cache for 1 hour.
export const revalidate = 3600;

export default function Home() {
  // Homepage logic is now fully client-side for dynamic time-based components
  // (prayer times, countdowns) while the shell remains static and ISR-optimized.
  return <HomeClient />;
}
