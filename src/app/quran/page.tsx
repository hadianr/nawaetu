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

import { Suspense } from "react";
import QuranBrowser from "@/components/quran/QuranBrowser";
import SurahListSkeleton from "@/components/skeleton/SurahListSkeleton";
import QuranPageClient from "@/components/quran/QuranPageClient";

import { pageMetadata } from "@/lib/seo";

// ISR: List surah tidak pernah berubah — cache 24 jam
export const revalidate = 86400;

export const metadata = pageMetadata(
    "Baca Al-Qur'an Online dan Terjemahan",
    "Baca Al-Qur'an 30 juz dengan terjemahan Bahasa Indonesia, tafsir, dan audio di Nawaetu.",
    "/quran",
);

export default function QuranPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(var(--color-background),0))] px-4 pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <div className="w-full max-w-none space-y-6 xl:max-w-4xl">
                <QuranPageClient />

                <Suspense fallback={<SurahListSkeleton />}>
                    <QuranBrowser />
                </Suspense>
            </div>
        </div>
    );
}
