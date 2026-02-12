import { NextRequest, NextResponse } from "next/server";

/**
 * Analytics API endpoint for Web Vitals metrics
 * Receives performance metrics from client and logs them
 */
export async function POST(request: NextRequest) {
    try {
        const metric = await request.json();

        // Log metrics in production for monitoring

        // TODO: In future, send to analytics service (Google Analytics, Vercel Analytics, etc.)
        // Example: await sendToGoogleAnalytics(metric);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
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
