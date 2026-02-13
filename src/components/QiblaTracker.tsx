"use client";

import { useEffect } from "react";
import { trackKiblatView } from "@/lib/analytics";

export default function QiblaTracker() {
    useEffect(() => {
        trackKiblatView();
    }, []);

    return null;
}
