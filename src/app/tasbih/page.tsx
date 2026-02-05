import { Suspense } from "react";
import TasbihCounter from "@/components/TasbihCounter";
import { Loader2 } from "lucide-react";

export default function TasbihPage() {
    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center bg-[rgb(var(--color-background))] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--color-primary))]" /></div>}>
                <TasbihCounter />
            </Suspense>
        </div>
    );
}
