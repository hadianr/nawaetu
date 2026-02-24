"use client";

import QiblaCompass from "@/components/QiblaCompass";
import QiblaTracker from "@/components/QiblaTracker";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function QiblaPage() {
    const { currentTheme } = useTheme();
    const isDaylight = currentTheme === "daylight";

    return (
        <div className={cn(
            "flex h-[100dvh] w-screen flex-col items-center justify-center font-sans overflow-hidden fixed inset-0 transition-colors duration-500",
            isDaylight
                ? "bg-[#f8fafc] text-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]"
                : "bg-[#0a0a0a] text-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(var(--color-primary),0.15),transparent)]"
        )}>
            {/* Analytics Tracker */}
            <QiblaTracker />

            {/* Main Content - Centered & Full Width */}
            <div className="w-full h-full flex items-center justify-center relative">
                <QiblaCompass />
            </div>
        </div>
    );
}
