"use client";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import OnboardingOverlay from "@/components/OnboardingOverlay";

interface ClientEntryGateProps {
    children: React.ReactNode;
}

export default function ClientEntryGate({ children }: ClientEntryGateProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        try {
            // In Chrome Extension iframes, accessing localStorage might throw a SecurityError
            // if the user has blocked third-party cookies.
            let hasCompletedOnboarding = null;
            try {
                hasCompletedOnboarding = window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
            } catch (storageError) {
                console.warn("localStorage access denied (likely iframe restrictions). Automatically skipping onboarding.");
                hasCompletedOnboarding = "true"; // Assume true to not block the app
            }

            if (!hasCompletedOnboarding) {
                setShowOnboarding(true);
            }
        } catch (e) {
            console.error("Failed to check onboarding status", e);
        } finally {
            setIsChecking(false);
        }
    }, []);

    // Do not leave Safari (or a blocked storage context) on an opaque SSR fallback forever.
    useEffect(() => {
        if (!isChecking) return;
        const timeout = window.setTimeout(() => setIsChecking(false), 4000);
        return () => window.clearTimeout(timeout);
    }, [isChecking]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Optionally reload or just state change
        // State change is smoother
    };

    return (
        <>
            {/* Show a non-intrusive loading indicator if checking takes longer than expected */}
            {
                isChecking && (
                    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white px-6 text-center">
                        <div className="relative mb-6">
                            <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-emerald-500/80 font-medium animate-pulse">
                            Menghubungkan ke Nawaetu...
                        </p>
                        <p className="mt-2 text-xs text-white/40 max-w-[200px]">
                            Jika halaman tetap kosong, pastikan browser Anda mengizinkan cookie pihak ketiga.
                        </p>
                    </div>
                )
            }

            {/* Always render children for SSR and SEO. Use opacity to prevent FOUC elegantly. */}
            <div
                style={{
                    opacity: isChecking ? 0 : 1,
                    transition: 'opacity 0.4s ease-in-out',
                    visibility: isChecking ? 'hidden' : 'visible'
                }}
            >
                {children}
            </div>

            {/* Mount the onboarding overlay above the application if needed */}
            {
                !isChecking && showOnboarding && (
                    <OnboardingOverlay onComplete={handleOnboardingComplete} />
                )
            }
        </>
    );
}
