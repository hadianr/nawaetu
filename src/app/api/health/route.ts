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
import pkg from "../../../../package.json";

/**
 * Enhanced API Health Check
 * Verifies both app server, database connectivity, and system resources
 */
export async function GET() {
    const startTime = Date.now();
    const dbStatus = await checkConnection();
    const responseTime = Date.now() - startTime;

    const healthData = {
        status: dbStatus.success ? "ok" : "error",
        message: dbStatus.success ? "All systems operational" : "Database connection failed",
        environment: process.env.NODE_ENV,
        version: pkg.version,
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
            usage: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            status: process.memoryUsage().rss < 500 * 1024 * 1024 ? "healthy" : "heavy"
        },
        database: dbStatus.success ? "online" : "offline",
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
    };

    return NextResponse.json(healthData, {
        status: dbStatus.success ? 200 : 503
    });
}

