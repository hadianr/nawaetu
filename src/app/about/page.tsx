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

import { pageMetadata } from "@/lib/seo";
import { AboutContent } from "./AboutContent";

// ISR: Static marketing page — cache for 7 days
export const revalidate = 604800;

export const metadata = pageMetadata(
    "Aplikasi Muslim untuk Ibadah Harian",
    "Aplikasi Muslim Nawaetu: Al-Qur'an dan tafsir, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah Nabawiyah, kalender Hijriah, Ramadhan, jurnal niat, misi, statistik, dan Asisten Muslim AI.",
    "/about",
    { locale: "id", languages: { id: "/about", en: "/en/about" } },
);

export default function AboutPage() {
    return <AboutContent lang="id" />;
}
