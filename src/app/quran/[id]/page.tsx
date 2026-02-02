import { Suspense } from "react";
import VerseBrowser from "@/components/quran/VerseBrowser";
import VerseListSkeleton from "@/components/skeleton/VerseListSkeleton";
import QuranTracker from "@/components/quran/QuranTracker";

export const dynamic = 'force-dynamic';

async function getChapterInfo(id: string) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=id`);
        if (!res.ok) return null;
        return (await res.json()).chapter;
    } catch (e) {
        return null;
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SurahDetailPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const chapter = await getChapterInfo(params.id);

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] px-4 pt-0 md:pt-8 pb-[80px] text-white font-sans sm:px-6">
            {chapter && (
                <QuranTracker
                    name={chapter.name_simple}
                    count={chapter.verses_count}
                />
            )}
            <Suspense fallback={<VerseListSkeleton />}>
                <VerseBrowser params={props.params} searchParams={props.searchParams} />
            </Suspense>
        </div>
    );
}
