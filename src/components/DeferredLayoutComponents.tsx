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
const FCMHandler = dynamic(() => import("@/components/FCMHandler"), { ssr: false });
const AnalyticsLoader = dynamic(() => import("@/components/AnalyticsLoader"), { ssr: false });
const DataSyncer = dynamic(() => import("@/components/DataSyncer"), { ssr: false });
const AdvancedDataSyncer = dynamic(() => import("@/components/AdvancedDataSyncer"), { ssr: false });
const OfflineIndicator = dynamic(() => import("@/components/OfflineIndicator"), { ssr: false });

export default function DeferredLayoutComponents() {
    return (
        <Suspense fallback={null}>
            <OfflineIndicator />
            <AnalyticsLoader />
            <DataSyncer />
            <AdvancedDataSyncer />
            <NotificationWatcher />
            <FCMHandler />
        </Suspense>
    );
}
