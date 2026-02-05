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
