import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// ============================================================================
// Drizzle ORM Configuration
// 📖 Migration Guide: See docs/DATABASE_MIGRATION_GUIDE.md
// 🔄 Workflow: Generate → Rename → Document → Commit → Push
// ============================================================================

// Load environment variables from .env.local
config({ path: ".env.local" });

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config;
