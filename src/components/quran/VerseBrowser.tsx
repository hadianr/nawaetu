import { cookies } from "next/headers";
import VerseList from "@/components/quran/VerseList";
import QuranTracker from "@/components/quran/QuranTracker";
import { DEFAULT_SETTINGS } from "@/data/settings-data";
import { getKemenagChapter, getKemenagVerses, getVerseAudioUrl } from "@/lib/kemenag-api";

interface VerseBrowserProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerseBrowser({ params, searchParams }: VerseBrowserProps) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = Math.max(1, Number(page) || 1);

    try {
        // Validate chapter ID
        const chapterId = Number(id);
        if (isNaN(chapterId) || chapterId < 1 || chapterId > 114) {
            throw new Error(`Invalid chapter ID: ${id}. Must be 1-114`);
        }

        // Get settings from cookies
        const cookieStore = await cookies();
        const reciterCookie = cookieStore.get("settings_reciter");
        const reciterId = reciterCookie ? parseInt(reciterCookie.value) : DEFAULT_SETTINGS.reciter;

        const perPageCookie = cookieStore.get("settings_verses_per_page");
        const perPage = perPageCookie ? parseInt(perPageCookie.value) : DEFAULT_SETTINGS.versesPerPage;

        const localeCookie = cookieStore.get("settings_locale");
        const locale = localeCookie ? localeCookie.value : DEFAULT_SETTINGS.locale;

        // Fetch data with explicit error handling
        const startTime = Date.now();
        
        const [chapter, versesData] = await Promise.all([
            getKemenagChapter(id),
            getKemenagVerses(id, currentPage, perPage, locale)
        ]);

        if (!chapter) {
            throw new Error(`Chapter ${chapterId} not found or invalid`);
        }

        if (!Array.isArray(versesData) || versesData.length === 0) {
            throw new Error(`No verses returned for chapter ${chapterId}`);
        }

        // Safely enhance verses with audio URLs
        const verses = versesData.map((verse: any) => ({
            ...verse,
            audio: {
                url: verse?.id ? getVerseAudioUrl(verse.id, reciterId) : "",
            }
        }));

        const totalPages = Math.ceil(chapter.verses_count / perPage);
        const elapsedMs = Date.now() - startTime;


        return (
            <>
                <QuranTracker name={chapter.name_simple} count={chapter.verses_count} />
                <VerseList
                    chapter={chapter}
                    verses={verses}
                    audioUrl=""
                    currentPage={currentPage}
                    totalPages={totalPages}
                    currentReciterId={reciterId}
                    currentLocale={locale}
                />
            </>
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
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
