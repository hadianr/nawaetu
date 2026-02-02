"use client";

import dynamic from "next/dynamic";

const OnboardingOverlay = dynamic(() => import("@/components/OnboardingOverlay"), { ssr: false });
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });

export default function AppOverlays() {
    return (
        <>
            <OnboardingOverlay />
            <PWAInstallPrompt />
        </>
    );
}
