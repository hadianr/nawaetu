import { NextResponse } from "next/server";
import { checkConnection } from "@/db";

/**
 * API Health Check
 * Verifies both app server and database connectivity
 */
export async function GET() {
    const dbStatus = await checkConnection();

    if (!dbStatus.success) {
        return NextResponse.json(
            {
                status: "error",
                message: "Database connection failed",
                database: "offline",
                timestamp: new Date().toISOString()
            },
            { status: 503 } // Service Unavailable
        );
    }

    return NextResponse.json({
        status: "ok",
        message: "All systems operational",
        database: "online",
        timestamp: new Date().toISOString()
    });
}
