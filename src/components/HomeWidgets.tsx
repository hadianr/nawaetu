"use client";

import dynamic from "next/dynamic";
import WidgetSkeleton from "@/components/skeleton/WidgetSkeleton";
import MissionSkeleton from "@/components/skeleton/MissionSkeleton";

const LastReadWidget = dynamic(() => import("@/components/LastReadWidget"), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const MissionsWidget = dynamic(() => import("@/components/MissionsWidget"), {
    loading: () => <MissionSkeleton />,
    ssr: false
});

export function HomeLastRead() {
    return (
        <div className="w-full h-32">
            <LastReadWidget />
        </div>
    );
}

export function HomeMissions() {
    return <MissionsWidget />;
}
