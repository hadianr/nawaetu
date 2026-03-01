"use client";

import { useEffect } from "react";

/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 * 
 * Component to handle Next.js chunk loading errors (404)
 * which often happen after a new deployment when user has an old session open.
 */
export default function ChunkErrorHandler() {
    useEffect(() => {
        const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
            const message = "message" in event ? event.message : (event as any).reason?.message || "";

            // Check for chunk loading errors
            const isChunkError =
                /Loading chunk .* failed/.test(message) ||
                /Unexpected token '<'.*at chunk/.test(message) ||
                message.includes("net::ERR_ABORTED 404") ||
                message.includes("Failed to fetch dynamically imported module");

            if (isChunkError) {
                console.warn("[System] Chunk loading failed. System mismatch detected. Reloading for latest version...", message);

                // Force reload from server bypassing cache if possible
                if (typeof window !== "undefined") {
                    window.location.reload();
                }
            }
        };

        window.addEventListener("error", handleError, true);
        window.addEventListener("unhandledrejection", handleError, true);

        return () => {
            window.removeEventListener("error", handleError, true);
            window.removeEventListener("unhandledrejection", handleError, true);
        };
    }, []);

    return null;
}
