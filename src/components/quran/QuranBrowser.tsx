import SurahList, { Chapter } from "@/components/quran/SurahList";

async function getChapters(): Promise<Chapter[]> {
    // Add a small artificial delay to demonstrate streaming if needed, 
    // but simpler to just fetch.
    // The API is fast, but Suspense will handle the network duration.
    const res = await fetch("https://api.quran.com/api/v4/chapters?language=id");
    if (!res.ok) {
        throw new Error("Failed to fetch chapters");
    }
    const data = await res.json();
    return data.chapters;
}

export default async function QuranBrowser() {
    try {
        const chapters = await getChapters();
        return <SurahList chapters={chapters} />;
    } catch (error) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                <div className="rounded-full bg-red-500/10 p-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8 text-red-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium text-white">Failed to load Quran data</p>
                    <p className="text-sm text-white/50">
                        Please check your internet connection and try again.
                    </p>
                </div>
            </div>
        );
    }
}
