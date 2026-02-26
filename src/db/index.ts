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

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cache the database connection in development to prevent hot-reloading
 * from creating too many connections.
 */
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// Use DATABASE_URL from .env
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL || "");

if (process.env.NODE_ENV !== "production") {
    globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

/**
 * Health check function to verify database connectivity.
 * Useful for monitoring and graceful error handling.
 */
export async function checkConnection() {
    try {
        // Simple query to verify connection
        await conn`SELECT 1`;
        return { success: true };
    } catch (error) {
        console.error("Database connection failed:", error);
        return { success: false, error };
    }
}
