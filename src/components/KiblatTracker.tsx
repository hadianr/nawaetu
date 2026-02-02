"use client";

import { useEffect } from "react";
import { trackKiblatView } from "@/lib/analytics";

export default function KiblatTracker() {
    useEffect(() => {
        trackKiblatView();
    }, []);

    return null;
}
