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
        }
    }, []);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        // Optionally reload or just state change
        // State change is smoother
    };

    return (
        <>
            {children}
            {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} />}
        </>
    );
}
