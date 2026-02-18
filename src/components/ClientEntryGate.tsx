"use client";

import { useState, useLayoutEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import OnboardingOverlay from "@/components/OnboardingOverlay";

interface ClientEntryGateProps {
    children: React.ReactNode;
}

export default function ClientEntryGate({ children }: ClientEntryGateProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useLayoutEffect(() => {
        // Run this synchronously before paint to prevent flash
        try {
            const hasCompletedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);

            if (!hasCompletedOnboarding) {
                setShowOnboarding(true);
            }
        } catch (e) {
            console.error("Failed to check onboarding status", e);
        } finally {
            setIsChecking(false);
        }
    }, []);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Optionally reload or just state change
        // State change is smoother
    };

    if (isChecking) {
        // Return a splash screen that matches the app background to be invisible
        return (
            <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[9999]">
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
            </div>
        );
    }

    if (showOnboarding) {
        return <OnboardingOverlay onComplete={handleOnboardingComplete} />;
    }

    return <>{children}</>;
}
