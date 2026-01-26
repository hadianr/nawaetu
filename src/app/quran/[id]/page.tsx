import { Suspense } from "react";
import VerseBrowser from "@/components/quran/VerseBrowser";
import VerseListSkeleton from "@/components/skeleton/VerseListSkeleton";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SurahDetailPage({ params, searchParams }: PageProps) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] px-4 pt-8 pb-[80px] text-white font-sans sm:px-6">
            <Suspense fallback={<VerseListSkeleton />}>
                <VerseBrowser params={params} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
