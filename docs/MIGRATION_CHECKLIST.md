# 🚀 Migration Generation Checklist

**Quick reference for generating database migrations**

---

## Pre-Generation

- [ ] Changes made to `src/db/schema.ts`
- [ ] Reviewed schema for syntax errors
- [ ] Clear on what concept this migration represents

---

## Generation Steps

### 1️⃣ Generate Migration File
```bash
npx drizzle-kit generate
```
- [ ] Command ran successfully
- [ ] Migration file created in `drizzle/`
- [ ] Note the auto-generated filename (e.g., `0003_sweet_lion.sql`)

### 2️⃣ Rename to Descriptive Name
```bash
cd drizzle
mv 0003_sweet_lion.sql 0003_add_mission_tracking.sql
```
- [ ] File renamed from random name to descriptive name
- [ ] Pattern: `{idx}_{action}_{concept}.sql`

### 3️⃣ Update Migration Journal
Edit `drizzle/meta/_journal.json`:
```json
{
  "tag": "0003_add_mission_tracking"  // Must match filename (without .sql)
}
```
- [ ] `tag` field updated to match new filename
- [ ] JSON syntax valid (use JSON validator if unsure)

### 4️⃣ Add Documentation Header
Edit `drizzle/0003_add_mission_tracking.sql`:

Add at the top:
```sql
-- ============================================================================
-- Migration: 0003_add_mission_tracking.sql
-- Date Created: 2026-02-12
-- Description: Add mission/quest system for gamification
-- Changes:
--   NEW TABLE:
--     - mission (User mission/quest tracking)
--   NEW COLUMNS:
--     - user.total_missions_completed (Integer counter)
-- ============================================================================
```

- [ ] Header added with all sections filled
- [ ] Date matches today's date
- [ ] Description is clear and concise
- [ ] All changes documented (NEW TABLE, NEW COLUMNS, MODIFIED, etc.)

### 5️⃣ Verify SQL Quality
- [ ] Migration SQL looks syntactically correct
- [ ] Check for typos in table/column names
- [ ] Foreign key constraints look correct
- [ ] Default values are sensible

### 6️⃣ Test Migration Locally
```bash
npx drizzle-kit push
```
- [ ] Migration applied successfully
- [ ] No SQL errors in output
- [ ] Database schema updated correctly

### 7️⃣ Export TypeScript Types
Edit `src/db/schema.ts`:
```typescript
export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;
```
- [ ] Type exports added for new tables
- [ ] Types match schema definition

### 8️⃣ Commit to Git
```bash
git add drizzle/0003_add_mission_tracking.sql
git add drizzle/meta/_journal.json
git add src/db/schema.ts
git commit -m "chore(db): add mission tracking system

- Create mission table with user references
- Add total_missions_completed counter
- Include completion timestamps"
```

- [ ] Migration file added
- [ ] Journal updated
- [ ] Schema file updated
- [ ] Commit message is descriptive

---

## Naming Patterns Quick Ref

```
create_[feature]                → 0003_create_mission_system.sql
add_[table]_[concept]           → 0003_add_user_settings.sql
add_[feature]_[columns]         → 0003_add_notification_preferences.sql
refactor_[table]                → 0003_refactor_user_schema.sql
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `tag` doesn't match filename | Update `_journal.json` |
| File not renamed | `mv old_name.sql new_name.sql` |
| Migration won't push | Check SQL syntax, verify schema.ts matches |
| Missing documentation | Add header comment block |
| TypeScript errors | Export missing types in schema.ts |

---

## Full Workflow Command Sequence

```bash
# 1. Update schema
vim src/db/schema.ts

# 2. Generate migration
npx drizzle-kit generate

# 3. Rename file (replace 0003_random_name.sql with YOUR filename)
cd drizzle
mv 0003_random_name.sql 0003_your_descriptive_name.sql

# 4. Edit migration header (add documentation)
vim 0003_your_descriptive_name.sql

# 5. Update journal
vim meta/_journal.json

# 6. Test locally
npx drizzle-kit push

# 7. Update types in schema
vim ../src/db/schema.ts

# 8. Stage and commit
cd ..
git add drizzle/0003_your_descriptive_name.sql
git add drizzle/meta/_journal.json
git add src/db/schema.ts
git commit -m "chore(db): [your descriptive message]"

# 9. Done!
```

---

## When to Create New Migration

✅ Create new migration when:
- Adding new table(s)
- Adding new column(s) to existing tables
- Modifying column types/constraints
- Adding foreign keys
- Creating indexes

❌ Don't create new migration for:
- Data seeding (use separate seed script)
- Comments/documentation only
- Metadata changes (handled by drizzle-kit)

---

**📖 Full Guide:** [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

**Questions?** Check the migration history: `drizzle/0000_*.sql`
