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
        const REFRESH_GUARD_KEY = "nawaetu_last_chunk_reload";
        const REFRESH_THRESHOLD = 15000; // 15 seconds

        const handleError = (event: ErrorEvent | PromiseRejectionEvent | Event) => {
            // 1. Check for Javascript/Promise Errors via message
            const message = "message" in event ? event.message : (event as any).reason?.message || "";
            const isScriptErrorMessage =
                /Loading chunk .* failed/.test(message) ||
                /Unexpected token '<'.*at chunk/.test(message) ||
                message.includes("net::ERR_ABORTED 404") ||
                message.includes("Failed to fetch dynamically imported module");

            // 2. Check for Resource Loading Failures (CSS/JS tags)
            const target = event.target as HTMLElement;
            const isResourceError = target && (target.tagName === 'LINK' || target.tagName === 'SCRIPT');
            const resourceUrl = (target as any)?.href || (target as any)?.src || "";
            const isNextChunk = resourceUrl.includes('/_next/static/chunks/');

            if (isScriptErrorMessage || (isResourceError && isNextChunk)) {
                console.warn("[System] Chunk/Resource loading failed. System mismatch detected.", {
                    message,
                    url: resourceUrl,
                    tag: target?.tagName
                });

                // Infinite Loop Guard
                const now = Date.now();
                const lastReload = parseInt(sessionStorage.getItem(REFRESH_GUARD_KEY) || "0");

                if (now - lastReload < REFRESH_THRESHOLD) {
                    console.error("[System] Infinite reload loop prevented. Asset remains missing.", message);
                    return;
                }

                // Mark reload time and force reload
                if (typeof window !== "undefined") {
                    console.warn("[System] Reloading to fetch fresh assets...");
                    sessionStorage.setItem(REFRESH_GUARD_KEY, now.toString());
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
