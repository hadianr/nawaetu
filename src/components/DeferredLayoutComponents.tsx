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
const WebVitals = dynamic(
    () => import("@/components/WebVitals").then(({ WebVitals }) => ({ default: WebVitals })),
    { ssr: false },
);
const SpeedInsights = dynamic(
    () => import("@vercel/speed-insights/next").then(({ SpeedInsights }) => ({ default: SpeedInsights })),
    { ssr: false },
);

export default function DeferredLayoutComponents() {
    return (
        <Suspense fallback={null}>
            <OfflineIndicator />
            <AnalyticsLoader />
            <DataSyncer />
            <NotificationWatcher />
            <GuestSyncManager />
            <AppOverlays />
            <DynamicTitle />
            <Toploader />
            <WebVitals />
            <SpeedInsights />
        </Suspense>
    );
}
