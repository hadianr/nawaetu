import { Suspense } from "react";
import TasbihCounter from "@/components/TasbihCounter";
import { Loader2 } from "lucide-react";

export default function TasbihPage() {
    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            {/* Header */}
            <div className="absolute top-8 w-full text-center z-10 animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tasbih Digital</h1>
                <p className="text-white/60 text-sm">Zikir Penenang Hati</p>
            </div>

            {/* Main Content - Centered */}
            <div className="w-full h-full flex items-center justify-center relative px-4">
                <Suspense fallback={<Loader2 className="animate-spin text-emerald-500" />}>
                    <TasbihCounter />
                </Suspense>
            </div>
        </div>
    );
}
