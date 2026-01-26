import VerseList from "@/components/quran/VerseList";

interface VerseBrowserProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getChapter(id: string) {
    const res = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=id`);
    if (!res.ok) throw new Error("Failed to fetch chapter info");
    return (await res.json()).chapter;
}

async function getVerses(id: string, page: number = 1) {
    const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=id&words=true&translations=33&fields=text_uthmani,text_uthmani_tajweed,audio&page=${page}&per_page=20`
    );
    if (!res.ok) throw new Error("Failed to fetch verses");
    const data = await res.json();
    return data.verses;
}

async function getAudio(id: string) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${id}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.audio_file.audio_url;
    } catch (e) {
        return null;
    }
}

async function getVerseAudio(id: string, page: number = 1) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${id}?per_page=20&page=${page}`);
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

    // Parallel fetching
    const [chapter, versesData, audioUrl, verseAudioData] = await Promise.all([
        getChapter(id),
        getVerses(id, currentPage),
        getAudio(id),
        getVerseAudio(id, currentPage)
    ]);

    // Merge audio data into verses
    const verses = versesData.map((verse: any) => {
        const audio = verseAudioData.find((a: any) => a.verse_key === verse.verse_key);
        return {
            ...verse,
            audio: {
                url: audio ? `https://verses.quran.com/${audio.url}` : ""
            }
        };
    });

    const totalPages = Math.ceil(chapter.verses_count / 20);

    return (
        <VerseList
            chapter={chapter}
            verses={verses}
            audioUrl={audioUrl}
            currentPage={currentPage}
            totalPages={totalPages}
        />
    );
}
