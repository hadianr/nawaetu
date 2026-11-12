import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { cleanupGuestData } from "@/lib/maintenance/cleanup";

export const maxDuration = 30;

/**
 * Scheduled from outside (cron-job.org), like the push jobs: POST with `Authorization: Bearer $CRON_SECRET`.
 * Without `?apply=1` it only reports what it would delete.
 */
export async function POST(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return NextResponse.json({ error: "Maintenance is not configured" }, { status: 503 });
    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const result = await cleanupGuestData({ apply: new URL(request.url).searchParams.get("apply") === "1" });
        logger.info("Guest data cleanup", { route: "/api/maintenance/cleanup", ...result });
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        logger.error("Guest data cleanup failed", error, { route: "/api/maintenance/cleanup" });
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}
