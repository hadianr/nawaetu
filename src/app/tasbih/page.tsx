import { Suspense } from "react";
import TasbihCounter from "@/components/TasbihCounter";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tasbih Digital Online - Counter Dzikir Gratis | Nawaetu",
    description: "Tasbih digital online untuk dzikir harian. Counter tasbih gratis dengan fitur simpan otomatis, target dzikir, dan riwayat. Praktis untuk Subhanallah, Alhamdulillah, Allahu Akbar.",
    keywords: ["Tasbih Digital", "Counter Dzikir", "Tasbih Online", "Dzikir Counter", "Tasbih Gratis", "Subhanallah Counter"],
    alternates: {
        canonical: "https://nawaetu.com/tasbih",
    },
};

export default function TasbihPage() {
    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--color-primary))]" /></div>}>
                <TasbihCounter />
            </Suspense>
        </div>
    );
}
