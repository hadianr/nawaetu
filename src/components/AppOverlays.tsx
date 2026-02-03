"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import OnboardingOverlay from "@/components/OnboardingOverlay";
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });

export default function AppOverlays() {
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);

    useEffect(() => {
        const show = () => setShowPwaPrompt(true);

        const onInteraction = () => {
            show();
            document.removeEventListener("click", onInteraction);
            document.removeEventListener("scroll", onInteraction);
            document.removeEventListener("keydown", onInteraction);
            document.removeEventListener("touchstart", onInteraction);
        };

        document.addEventListener("click", onInteraction, { once: true, passive: true });
        document.addEventListener("scroll", onInteraction, { once: true, passive: true });
        document.addEventListener("keydown", onInteraction, { once: true, passive: true });
        document.addEventListener("touchstart", onInteraction, { once: true, passive: true });

        return () => {
            document.removeEventListener("click", onInteraction);
            document.removeEventListener("scroll", onInteraction);
            document.removeEventListener("keydown", onInteraction);
            document.removeEventListener("touchstart", onInteraction);
        };
    }, []);

    return (
        <>
            <OnboardingOverlay />
            {showPwaPrompt ? <PWAInstallPrompt /> : null}
        </>
    );
}
