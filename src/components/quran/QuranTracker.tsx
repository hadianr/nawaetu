"use client";

import { useEffect } from "react";
import { trackQuranRead } from "@/lib/analytics";

interface QuranTrackerProps {
    name: string;
    count: number;
}

export default function QuranTracker({ name, count }: QuranTrackerProps) {
    useEffect(() => {
        trackQuranRead(name, count);
    }, [name, count]);

    return null;
}
