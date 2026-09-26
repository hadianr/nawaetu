import { pageMetadata } from "@/lib/seo";
import HijriCalendarPageContent from "@/components/HijriCalendarPageContent";

export const metadata = pageMetadata(
    "Kalender Hijriah dan Hari Puasa Sunnah",
    "Lihat tanggal Hijriah, hari puasa sunnah, dan jadwal Ramadhan di kalender Nawaetu.",
    "/hijri-calendar",
);

export default async function HijriCalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const { view } = await searchParams;
    return <HijriCalendarPageContent initialView={view === "ramadan" ? "ramadan" : "month"} />;
}
