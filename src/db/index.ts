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

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured");

const sql = postgres(connectionString, {
    max: 1,
    // Fail fast during Supabase cold starts or network/provider outages instead
    // of holding a Vercel function until its 300-second platform limit.
    connect_timeout: 10,
    connection: {
        statement_timeout: 30_000,
        lock_timeout: 5_000,
    },
    prepare: false,
    ssl: "require",
});
export const db = drizzle(sql, { schema });

// postgres-js supports both ordinary queries and transactions on Supabase's
// transaction pooler. Keep this separate export for callers that require a
// transaction without changing their database dependency.
export const transactionDb = db;

/**
 * Health check function to verify database connectivity.
 */
export async function checkConnection() {
    try {
        await sql`SELECT 1`;
        return { success: true };
    } catch (error) {
        console.error("Database connection failed:", error);
        return { success: false, error };
    }
}
