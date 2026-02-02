"use client";

import QiblaCompass from "@/components/QiblaCompass";
import { ArrowLeft } from "lucide-react";
import { trackKiblatView } from "@/lib/analytics";
import { useEffect, useState } from "react";

export default function KiblatPage() {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Track usage
        trackKiblatView();

        const handleOrientation = (event: DeviceOrientationEvent) => {
            // This part of the useEffect seems incomplete in the provided snippet.
            // I'm adding it as is, assuming it's part of a larger intended change.
        };
    }, []); // Added dependency array for useEffect

    return (
        <div className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] text-white font-sans overflow-hidden fixed inset-0">
            {/* Main Content - Centered & Full Width */}
            <div className="w-full h-full flex items-center justify-center relative">
                <QiblaCompass />
            </div>
        </div>
    );
}
