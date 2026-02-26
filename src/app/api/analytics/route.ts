/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
