import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daily Missions - Misi Ibadah Harian | Nawaetu",
    description: "Selesaikan misi ibadah harian, kumpulkan XP, naik level, dan jaga streak. Gamifikasi ibadah yang membuat konsistensi lebih mudah dan menyenangkan.",
    keywords: ["Daily Missions", "Misi Harian", "Habit Tracker Ibadah", "Gamifikasi Islam", "Streak Ibadah", "XP Leveling"],
    alternates: {
        canonical: "https://nawaetu.com/misi",
    },
};

export default function MisiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
