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

import { cookies } from "next/headers";
import Link from "next/link";
import VerseList from "@/components/quran/VerseList";
import QuranTracker from "@/components/quran/QuranTracker";
import { DEFAULT_SETTINGS } from "@/data/settings-data";
import { getKemenagChapter, getKemenagVerses, getVerseAudioUrl } from "@/lib/quran/kemenag-api";

interface VerseBrowserProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type VerseBrowserData = {
    chapter: Awaited<ReturnType<typeof getKemenagChapter>>;
    verses: Awaited<ReturnType<typeof getKemenagVerses>>;
    totalPages: number;
};

async function loadVerseBrowserData(
    id: string,
    currentPage: number,
    perPage: number,
    locale: string,
    reciterId: number,
): Promise<VerseBrowserData> {
    const chapterId = Number(id);
    if (Number.isNaN(chapterId) || chapterId < 1 || chapterId > 114) {
        throw new Error(`Invalid chapter ID: ${id}. Must be 1-114`);
    }

    const [chapter, versesData] = await Promise.all([
        getKemenagChapter(id),
        getKemenagVerses(id, currentPage, perPage, locale),
    ]);

    if (versesData.length === 0) {
        throw new Error(`No verses returned for chapter ${chapterId}`);
    }

    const verses = versesData.map((verse) => ({
        ...verse,
        audio: {
            url: verse.id ? getVerseAudioUrl(verse.id, reciterId) : "",
        },
    }));

    return {
        chapter,
        verses,
        totalPages: Math.ceil(chapter.verses_count / perPage),
    };
}

export default async function VerseBrowser({ params, searchParams }: VerseBrowserProps) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = Math.max(1, Number(page) || 1);

    const cookieStore = await cookies();
    const reciterCookie = cookieStore.get("settings_reciter");
    const reciterId = reciterCookie ? parseInt(reciterCookie.value) : DEFAULT_SETTINGS.reciter;
    const perPageCookie = cookieStore.get("settings_verses_per_page");
    const perPage = perPageCookie ? parseInt(perPageCookie.value) : DEFAULT_SETTINGS.versesPerPage;
    const localeCookie = cookieStore.get("settings_locale");
    const locale = localeCookie ? localeCookie.value : DEFAULT_SETTINGS.locale;

    let data: VerseBrowserData;
    try {
        data = await loadVerseBrowserData(id, currentPage, perPage, locale, reciterId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold text-red-500">⚠️ Gagal Memuat Surah</h2>
                    <p className="text-slate-400">{errorMessage}</p>
                    <p className="text-sm text-slate-500">
                        Silakan coba lagi atau periksa koneksi internet Anda.
                    </p>
                    <div className="pt-4">
                        <Link
                            href="/quran"
                            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            Kembali ke Daftar Surah
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <QuranTracker name={data.chapter.name_simple} count={data.chapter.verses_count} />
            <VerseList
                chapter={data.chapter}
                verses={data.verses}
                audioUrl=""
                currentPage={currentPage}
                totalPages={data.totalPages}
                currentReciterId={reciterId}
                currentLocale={locale}
            />
        </>
    );
}
