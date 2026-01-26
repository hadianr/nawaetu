"use client";

import { RefreshCw } from "lucide-react";
import PrayerTimeCard from "@/components/PrayerTimeCard";
import PrayerCardSkeleton from "@/components/skeleton/PrayerCardSkeleton";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Button } from "@/components/ui/button";

export default function PrayerTimesDisplay() {
    const { data, loading, error, refreshLocation } = usePrayerTimes();

    if (loading) {
        return <PrayerCardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
                <p className="text-red-400 font-medium">{error}</p>
                <Button
                    variant="outline"
                    onClick={refreshLocation}
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry Location
                </Button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshLocation}
                    className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                    title="Refresh Location"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
            <PrayerTimeCard {...data} />
        </div>
    );
}
