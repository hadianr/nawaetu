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

    // Get settings from cookies
    const cookieStore = await cookies();
    const reciterCookie = cookieStore.get("settings_reciter");
    const reciterId = reciterCookie ? parseInt(reciterCookie.value) : DEFAULT_SETTINGS.reciter;

    const perPageCookie = cookieStore.get("settings_verses_per_page");
    const perPage = perPageCookie ? parseInt(perPageCookie.value) : DEFAULT_SETTINGS.versesPerPage;

    // Fetch data from Kemenag API (via quran-api-id wrapper)
    const chapter = await getKemenagChapter(id);
    const versesData = await getKemenagVerses(id, currentPage, perPage);

    // Enhance verses with audio URLs from selected reciter (override default audio)
    const verses = versesData.map((verse: any) => ({
        ...verse,
        audio: {
            url: getVerseAudioUrl(verse.id, reciterId),
        }
    }));

    const totalPages = Math.ceil(chapter.verses_count / perPage);

    return (
        <VerseList
            chapter={chapter}
            verses={verses}
            audioUrl="" // Not needed - each verse has its own audio URL
            currentPage={currentPage}
            totalPages={totalPages}
            currentReciterId={reciterId}
        />
    );
}
