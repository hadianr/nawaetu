import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured");

const sql = postgres(connectionString, { max: 1 });

try {
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'user_streak_days',
        'user_streak_state',
        'hasanah_ledger',
        'user_progress_state'
      )
    order by table_name
  `;
  const [{ count }] = await sql`
    select count(*)::int as count
    from information_schema.table_constraints
    where table_schema = 'public'
      and constraint_name in (
        'user_streak_days_source_id_not_empty',
        'user_streak_days_timezone_not_empty',
        'user_streak_state_current_days_nonnegative',
        'user_streak_state_longest_days_valid',
        'user_streak_state_freezes_nonnegative',
        'hasanah_ledger_source_id_not_empty',
        'user_progress_state_hasanah_nonnegative',
        'user_progress_state_level_positive',
        'user_progress_state_rule_version_positive'
      )
  `;
  const migrations = await sql`
    select id, created_at
    from drizzle.__drizzle_migrations
    order by created_at
  `;
  const legacyTables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('sirah_user_progress', 'sirah_bookmarks', 'ramadhan_daily_log', 'ramadhan_taraweh_log')
  `;

  const actualTables = tables.map(({ table_name }) => table_name);
  if (legacyTables.length !== 4) {
    throw new Error(`Pre-migration schema incomplete: ${legacyTables.length}/4 legacy checkpoint tables`);
  }
  if (actualTables.length !== 4 || count !== 9) {
    const watermark = migrations.at(-1)?.created_at ?? "none";
    throw new Error(`Migration incomplete: ${actualTables.length}/4 tables, ${count}/9 checks; legacy checkpoint 4/4; Drizzle watermark ${watermark}`);
  }

  console.log(`Progression migration verified: ${actualTables.length} tables, ${count} checks`);
} finally {
  await sql.end();
}
