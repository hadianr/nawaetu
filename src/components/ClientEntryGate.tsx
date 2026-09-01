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
import { useSession } from "next-auth/react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import { sendGAEvent } from "@/lib/analytics/analytics";

interface ClientEntryGateProps {
    children: React.ReactNode;
}

/** Legacy boolean, current versions, and unknown truthy markers all mean done. */
export function hasCompletedOnboarding(marker: string | null): boolean {
    return typeof marker === "string" && marker.trim().length > 0;
}

function markerFamily(marker: string | null): "missing" | "legacy_boolean" | "current" | "legacy_unknown" {
    if (!marker) return "missing";
    if (marker === "true") return "legacy_boolean";
    if (marker === "v2") return "current";
    return "legacy_unknown";
}

export default function ClientEntryGate({ children }: ClientEntryGateProps) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        try {
            // In Chrome Extension iframes, accessing localStorage might throw a SecurityError
            // if the user has blocked third-party cookies.
            let marker: string | null = null;
            let storageError = false;
            try {
                marker = window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
            } catch {
                console.warn("localStorage access denied (likely iframe restrictions). Automatically skipping onboarding.");
                marker = "storage-unavailable"; // Assume done to keep the app usable
                storageError = true;
            }

            // An authenticated account is a reliable returning-user signal even
            // when this device lost its local marker (e.g. PWA reinstall).
            const completed = hasCompletedOnboarding(marker);
            const bypassedForSession = !completed && status === "authenticated";
            sendGAEvent("onboarding_state_resolved", {
                status: completed || bypassedForSession ? "completed" : "needs_setup",
                marker_family: storageError ? "storage_error" : markerFamily(marker),
                user_mode: status === "authenticated" ? "authenticated" : "guest",
            });
            if (bypassedForSession) {
                sendGAEvent("onboarding_returning_user_bypass", { reason: "session" });
            }
            if (!completed && status !== "authenticated") {
                setShowOnboarding(true);
            }
        } catch (e) {
            console.error("Failed to check onboarding status", e);
        }
    }, [status]);

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
