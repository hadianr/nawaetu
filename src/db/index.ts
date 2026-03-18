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

import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as pgDrizzle } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

import * as schema from "./schema";

import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Determine which driver to use based on the connection string
const connectionString = process.env.DATABASE_URL || "";
export const isNeon = connectionString.includes("neon.tech");

// Define a common interface for the database regardless of the underlying driver
// We cast the exported db to `any` because the Neon and PostgresJS signatures slightly
// differ internally in Drizzle, causing TS errors on `.returning()`. The runtime
// behavior for our select/insert/update/delete operations is identical.
export const db = (isNeon
    ? neonDrizzle({ client: neon(connectionString), schema })
    : pgDrizzle(postgres(connectionString), { schema })) as any as NeonHttpDatabase<typeof schema> & PostgresJsDatabase<typeof schema>;

/**
 * Health check function to verify database connectivity.
 * Useful for monitoring and graceful error handling.
 */
export async function checkConnection() {
    try {
        if (isNeon) {
            const sql = neon(connectionString);
            await sql`SELECT 1`;
        } else {
            const sql = postgres(connectionString);
            await sql`SELECT 1`;
            await sql.end(); // Don't leave connection hanging in health check
        }
        return { success: true };
    } catch (error) {
        console.error("Database connection failed:", error);
        return { success: false, error };
    }
}
