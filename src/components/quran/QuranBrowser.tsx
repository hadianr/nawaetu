import SurahList, { Chapter } from "@/components/quran/SurahList";
import { getKemenagChapters } from "@/lib/kemenag-api";
import QuranErrorMessage from "./QuranErrorMessage";

async function getChapters(): Promise<Chapter[]> {
    // Using Kemenag API for authentic Indonesian Quran standard
    return await getKemenagChapters();
}

export default async function QuranBrowser() {
    try {
        const chapters = await getChapters();
        return <SurahList chapters={chapters} />;
    } catch (error) {
        return <QuranErrorMessage />;
    }
}
