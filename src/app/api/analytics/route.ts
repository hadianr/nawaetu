import { NextRequest, NextResponse } from "next/server";
import { trackMetric, WebVitalMetric } from "@/lib/server-analytics";

/**
 * Analytics API endpoint for Web Vitals metrics
 * Receives performance metrics from client and logs them
 */
export async function POST(request: NextRequest) {
    try {
        const metric = await request.json() as WebVitalMetric;

        // Log metrics using the configured analytics provider
        await trackMetric(metric);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[Analytics API Error]", error);
        return NextResponse.json(
            { error: "Failed to process metric" },
            { status: 500 }
        );
    }
}

// Prevent GET requests
export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}
