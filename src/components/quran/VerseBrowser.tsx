import { cookies } from "next/headers";
import VerseList from "@/components/quran/VerseList";
import { DEFAULT_SETTINGS } from "@/data/settings-data";

interface VerseBrowserProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getChapter(id: string) {
    const res = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=id`);
    if (!res.ok) throw new Error("Failed to fetch chapter info");
    return (await res.json()).chapter;
}

async function getVerses(id: string, page: number = 1, perPage: number = 20) {
    const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=id&words=true&translations=33&fields=text_uthmani,text_uthmani_tajweed,audio&page=${page}&per_page=${perPage}`
    );
    if (!res.ok) throw new Error("Failed to fetch verses");
    const data = await res.json();
    return data.verses;
}

async function getAudio(id: string, reciterId: number) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.audio_file.audio_url;
    } catch (e) {
        return null;
    }
}

async function getVerseAudio(id: string, page: number = 1, reciterId: number, perPage: number = 20) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${id}?per_page=${perPage}&page=${page}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.audio_files;
    } catch (e) {
        return [];
    }
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

    // Parallel fetching with selected reciter and per_page
    const [chapter, versesData, audioUrl, verseAudioData] = await Promise.all([
        getChapter(id),
        getVerses(id, currentPage, perPage),
        getAudio(id, reciterId),
        getVerseAudio(id, currentPage, reciterId, perPage)
    ]);

    // Merge audio data and extract transliteration into verses
    const verses = versesData.map((verse: any) => {
        const audio = verseAudioData.find((a: any) => a.verse_key === verse.verse_key);

        // Extract and join transliteration from words
        const transliteration = verse.words
            ?.filter((word: any) => word.char_type_name === 'word') // Skip end markers
            ?.map((word: any) => word.transliteration?.text || '')
            .filter(Boolean)
            .join(' ') || '';

        return {
            ...verse,
            audio: {
                url: audio ? `https://verses.quran.com/${audio.url}` : ""
            },
            transliteration
        };
    });

    const totalPages = Math.ceil(chapter.verses_count / perPage);

    return (
        <VerseList
            chapter={chapter}
            verses={verses}
            audioUrl={audioUrl}
            currentPage={currentPage}
            totalPages={totalPages}
            currentReciterId={reciterId}
        />
    );
}
