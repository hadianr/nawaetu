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
import { AboutContent } from "@/app/about/AboutContent";

// English version of /about; same content, served at its own URL for English search.
export const revalidate = 604800;

export const metadata = pageMetadata(
    "Muslim App for Daily Worship",
    "Nawaetu Muslim app: Quran and tafsir, prayer times, qibla, dhikr, sourced hadith and duas, the Sirah, Hijri calendar, Ramadan, an intention journal, missions, statistics, and an AI Muslim assistant.",
    "/en/about",
    { locale: "en", languages: { id: "/about", en: "/en/about" } },
);

export default function EnglishAboutPage() {
    return <AboutContent lang="en" />;
}
