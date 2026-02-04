import SurahList, { Chapter } from "@/components/quran/SurahList";
import { getKemenagChapters } from "@/lib/kemenag-api";

async function getChapters(): Promise<Chapter[]> {
    // Using Kemenag API for authentic Indonesian Quran standard
    return await getKemenagChapters();
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
