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
        const handleError = (event: ErrorEvent | PromiseRejectionEvent | Event) => {
            // 1. Check for Javascript/Promise Errors via message
            const message = "message" in event ? event.message : (event as any).reason?.message || "";
            const isScriptErrorMessage =
                /Loading chunk .* failed/.test(message) ||
                /Unexpected token '<'.*at chunk/.test(message) ||
                message.includes("net::ERR_ABORTED 404") ||
                message.includes("Failed to fetch dynamically imported module");

            // 2. Check for Resource Loading Failures (CSS/JS tags)
            // Resource errors don't bubble, so we listen in capture phase (handled by addEventListener third param)
            const target = event.target as HTMLElement;
            const isResourceError = target && (target.tagName === 'LINK' || target.tagName === 'SCRIPT');
            const resourceUrl = (target as any)?.href || (target as any)?.src || "";
            const isNextChunk = resourceUrl.includes('/_next/static/chunks/');

            if (isScriptErrorMessage || (isResourceError && isNextChunk)) {
                console.warn("[System] Chunk/Resource loading failed. System mismatch detected. Reloading...", {
                    message,
                    url: resourceUrl,
                    tag: target?.tagName
                });

                // Force reload
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
