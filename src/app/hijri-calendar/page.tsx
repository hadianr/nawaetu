import type { Metadata } from "next";
import HijriCalendarPageContent from "@/components/HijriCalendarPageContent";

export const metadata: Metadata = {
    title: "Hijri Calendar | Nawaetu",
    description: "Hijri dates, Sunnah fasting days, and Ramadan prayer times.",
};

export default async function HijriCalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>;
}) {
    const { view } = await searchParams;
    return <HijriCalendarPageContent initialView={view === "ramadan" ? "ramadan" : "month"} />;
}
