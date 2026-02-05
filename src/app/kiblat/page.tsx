import QiblaCompass from "@/components/QiblaCompass";
import KiblatTracker from "@/components/KiblatTracker";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Arah Kiblat Online Akurat - Nawaetu",
    description: "Cari arah kiblat online tanpa aplikasi (kompas kiblat). Akurat menggunakan GPS dan sensor HP. Temukan kiblat di mana saja.",
    keywords: ["Arah Kiblat", "Kompas Kiblat", "Kiblat Online", "Arah Ka'bah", "Kompas Sholat"],
    alternates: {
        canonical: "https://nawaetu.com/kiblat",
    },
};

export default function KiblatPage() {
    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            {/* Analytics Tracker */}
            <KiblatTracker />

            {/* Main Content - Centered & Full Width */}
            <div className="w-full h-full flex items-center justify-center relative">
                <QiblaCompass />
            </div>
        </div>
    );
}
