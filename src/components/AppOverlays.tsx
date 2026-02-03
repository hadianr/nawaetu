"use client";

import dynamic from "next/dynamic";

import OnboardingOverlay from "@/components/OnboardingOverlay";
const PWAInstallPrompt = dynamic(() => import("@/components/PWAInstallPrompt"), { ssr: false });

export default function AppOverlays() {
    return (
        <>
            <OnboardingOverlay />
            <PWAInstallPrompt />
        </>
    );
}
