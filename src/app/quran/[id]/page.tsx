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
import VerseBrowser from "@/components/quran/VerseBrowser";
import VerseListSkeleton from "@/components/skeleton/VerseListSkeleton";

// ISR: Quran content is static — build once, serve forever
// Pre-generate all 114 surahs at build time. Cache for 7 days.
export const revalidate = 604800;

export async function generateStaticParams() {
    // Pre-build all 114 surahs at build time → zero CPU cost per request
    return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SurahDetailPage(props: PageProps) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[rgb(var(--color-canvas))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgb(var(--color-primary)/0.15),transparent)] px-4 pt-0 md:pt-8 pb-nav text-[rgb(var(--color-text))] font-sans sm:px-6">
            <Suspense fallback={<VerseListSkeleton />}>
                <VerseBrowser params={props.params} searchParams={props.searchParams} />
            </Suspense>
        </div>
    );
}
