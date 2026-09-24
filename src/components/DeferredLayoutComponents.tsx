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

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { WebVitals } from "@/components/WebVitals";
import { useTheme } from "@/context/ThemeContext";

// Progressively load non-visual global elements
const NotificationWatcher = dynamic(() => import("@/components/NotificationWatcher"), { ssr: false });
const AnalyticsLoader = dynamic(() => import("@/components/AnalyticsLoader"), { ssr: false });
const DataSyncer = dynamic(() => import("@/components/DataSyncer"), { ssr: false });
const OfflineIndicator = dynamic(() => import("@/components/OfflineIndicator"), { ssr: false });
const GuestSyncManager = dynamic(
    () => import("@/components/auth/GuestSyncManager").then(({ GuestSyncManager }) => ({ default: GuestSyncManager })),
    { ssr: false },
);
const AppOverlays = dynamic(() => import("@/components/AppOverlays"), { ssr: false });
const DynamicTitle = dynamic(() => import("@/components/DynamicTitle"), { ssr: false });
const Toploader = dynamic(() => import("@/components/ui/Toploader"), { ssr: false });
const SpeedInsights = dynamic(
    () => import("@vercel/speed-insights/next").then(({ SpeedInsights }) => ({ default: SpeedInsights })),
    { ssr: false },
);
const PatternOverlay = dynamic(() => import("@/components/PatternOverlay"), { ssr: false });

function ThemePatternOverlay() {
    const { theme } = useTheme();

    if (!theme.pattern || theme.pattern.type === "none") return null;
    return <PatternOverlay />;
}

export default function DeferredLayoutComponents() {
    const [deferredReady, setDeferredReady] = useState(false);

    useEffect(() => {
        const loadDeferredComponents = () => setDeferredReady(true);
        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
            cancelIdleCallback?: (handle: number) => void;
        };

        if (idleWindow.requestIdleCallback) {
            const idleId = idleWindow.requestIdleCallback(loadDeferredComponents, { timeout: 3000 });
            return () => idleWindow.cancelIdleCallback?.(idleId);
        }

        const timeoutId = window.setTimeout(loadDeferredComponents, 3000);
        return () => window.clearTimeout(timeoutId);
    }, []);

    return (
        <Suspense fallback={null}>
            <AnalyticsLoader />
            <DataSyncer />
            <AppOverlays />
            <WebVitals />
            <ThemePatternOverlay />
            {deferredReady && (
                <>
                    <OfflineIndicator />
                    <NotificationWatcher />
                    <GuestSyncManager />
                    <DynamicTitle />
                    <Toploader />
                    <SpeedInsights />
                </>
            )}
        </Suspense>
    );
}
