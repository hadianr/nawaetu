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

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Client component entry point
import HomeEntry from "@/components/home/HomeEntry";

export const metadata: Metadata = pageMetadata(
  "Aplikasi Muslim untuk Ibadah Harian",
  "Al-Qur'an, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah, kalender Hijriah, Ramadhan, jurnal niat, misi harian, dan Tanya Nawaetu.",
  "/",
);

export default function Home() {
  return <HomeEntry />;
}
