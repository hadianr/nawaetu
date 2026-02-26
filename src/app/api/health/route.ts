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
