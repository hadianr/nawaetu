"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Progressively load non-visual global elements
const NotificationWatcher = dynamic(() => import("@/components/NotificationWatcher"), { ssr: false });
const FCMHandler = dynamic(() => import("@/components/FCMHandler"), { ssr: false });
const AnalyticsLoader = dynamic(() => import("@/components/AnalyticsLoader"), { ssr: false });
const DataSyncer = dynamic(() => import("@/components/DataSyncer"), { ssr: false });
const AdvancedDataSyncer = dynamic(() => import("@/components/AdvancedDataSyncer"), { ssr: false });
const AppOverlays = dynamic(() => import("@/components/AppOverlays"), { ssr: false });

export default function DeferredLayoutComponents() {
    return (
        <Suspense fallback={null}>
            <AnalyticsLoader />
            <DataSyncer />
            <AdvancedDataSyncer />
            <NotificationWatcher />
            <AppOverlays />
            <FCMHandler />
        </Suspense>
    );
}
