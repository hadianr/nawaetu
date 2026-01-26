import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] p-6 text-white font-sans">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-start">
                    <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:bg-white/10 hover:text-white">
                        <Link href="/">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <span className="text-4xl">⚙️</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
                    <p className="text-white/60">Coming Soon</p>
                </div>
            </div>
        </div>
    );
}
