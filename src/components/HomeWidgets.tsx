"use client";

import LastReadWidget from "@/components/LastReadWidget";
import MissionsWidget from "@/components/MissionsWidget";

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
