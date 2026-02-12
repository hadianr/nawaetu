import { cookies } from "next/headers";
import VerseList from "@/components/quran/VerseList";
import { DEFAULT_SETTINGS } from "@/data/settings-data";
import { getKemenagChapter, getKemenagVerses, getVerseAudioUrl } from "@/lib/kemenag-api";

interface VerseBrowserProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerseBrowser({ params, searchParams }: VerseBrowserProps) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;

    try {
        // Get settings from cookies
        const cookieStore = await cookies();
        const reciterCookie = cookieStore.get("settings_reciter");
        const reciterId = reciterCookie ? parseInt(reciterCookie.value) : DEFAULT_SETTINGS.reciter;

        const perPageCookie = cookieStore.get("settings_verses_per_page");
        const perPage = perPageCookie ? parseInt(perPageCookie.value) : DEFAULT_SETTINGS.versesPerPage;

        const localeCookie = cookieStore.get("settings_locale");
        const locale = localeCookie ? localeCookie.value : DEFAULT_SETTINGS.locale;

        // Fetch data from Kemenag API (via quran-api-id wrapper)
        console.log(`[VerseBrowser] Fetching chapter ${id}, page ${currentPage}...`);
        const chapter = await getKemenagChapter(id);
        const versesData = await getKemenagVerses(id, currentPage, perPage, locale);

        if (!chapter) {
            throw new Error(`Chapter ${id} not found`);
        }

        if (!versesData || versesData.length === 0) {
            throw new Error(`No verses found for chapter ${id}, page ${currentPage}`);
        }

        // Enhance verses with audio URLs from selected reciter (override default audio)
        const verses = versesData.map((verse: any) => ({
            ...verse,
            audio: {
                url: getVerseAudioUrl(verse.id, reciterId),
            }
        }));

        const totalPages = Math.ceil(chapter.verses_count / perPage);

        console.log(`[VerseBrowser] Successfully loaded ${verses.length} verses, total pages: ${totalPages}`);

        return (
            <VerseList
                chapter={chapter}
                verses={verses}
                audioUrl="" // Not needed - each verse has its own audio URL
                currentPage={currentPage}
                totalPages={totalPages}
                currentReciterId={reciterId}
                currentLocale={locale}
            />
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[VerseBrowser] ERROR: Failed to load chapter ${id}:`, errorMessage);
        
        // Return error UI instead of crashing
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold text-red-500">⚠️ Gagal Memuat Surah</h2>
                    <p className="text-slate-400">{errorMessage}</p>
                    <p className="text-sm text-slate-500">
                        Silakan coba lagi atau periksa koneksi internet Anda.
                    </p>
                    <div className="pt-4">
                        <a 
                            href="/quran" 
                            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            Kembali ke Daftar Surah
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
