# 📋 Database Migration Guidelines

**Last Updated:** February 12, 2026  
**Version:** 1.0

---

## 📌 Overview

This guide documents best practices for generating and managing Drizzle ORM migrations in the Nawaetu project. Follow these steps every time you add new schema changes.

---

## 🔄 Migration Generation Workflow

### **Step 1: Update Schema File**

Edit `src/db/schema.ts` with your table/column changes:

```typescript
// Example: Add new table
export const missions = pgTable("mission", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
```

### **Step 2: Generate Migration File**

```bash
npx drizzle-kit generate
```

**Output:**
```
✓ Drizzle ORM created migration 'drizzle/0003_new_table_xyz.sql'
```

⚠️ **Note:** Drizzle auto-generates random names like `new_table_xyz`. We'll rename this.

### **Step 3: Rename Migration File (CRUCIAL)**

**Before renaming, identify:**
- What new tables are being created?
- What columns are being added/modified?
- What concept does this migration represent?

**Naming Convention:**

```
{idx}_{action}_{concept}.sql

Examples:
0000_create_core_tables.sql                    ← Initial setup
0001_create_intention_and_streaks.sql          ← New feature adds
0002_create_transaction_and_settings.sql       ← Payment system
0003_add_mission_tracking.sql                  ← Column additions
0004_add_last_read_quran_progress.sql          ← Feature enhancement
```

**Rename Command:**

```bash
cd drizzle
# Change FROM auto-generated name TO descriptive name
mv 0003_new_table_xyz.sql 0003_add_mission_tracking.sql
```

### **Step 4: Update Migration Journal**

Edit `drizzle/meta/_journal.json` - Update the `tag` field:

```json
{
  "entries": [
    // ... previous entries ...
    {
      "idx": 3,
      "version": "7",
      "when": 1770999456789,
      "tag": "0003_add_mission_tracking",  // ← Change THIS (remove random part)
      "breakpoints": true
    }
  ]
}
```

### **Step 5: Add Documentation Header**

Open the renamed migration file and add header comment:

```sql
-- ============================================================================
-- Migration: 0003_add_mission_tracking.sql
-- Date Created: 2026-02-12
-- Description: Add mission/quest system for gamification
-- Changes:
--   NEW TABLE:
--     - mission (User mission/quest tracking with completion status)
--   NEW COLUMNS:
--     - user.total_missions_completed (Integer counter)
-- ============================================================================

CREATE TABLE "mission" (
   ...
);
```

**Header Template:**

```sql
-- ============================================================================
-- Migration: FILENAME.sql
-- Date Created: YYYY-MM-DD
-- Description: [Clear explanation of what this migration does]
-- Changes:
--   NEW TABLE:
--     - [table_name] ([purpose + key columns])
--   NEW COLUMNS:
--     - [table_name].[column_name] ([type + purpose])
--   MODIFIED COLUMNS:
--     - [table_name].[column_name] ([what changed])
--   DROPPED:
--     - [table_name].[column_name] (reason if relevant)
-- ============================================================================
```

### **Step 6: Verify in Git**

```bash
# Stage migration with renamed descriptive name
git add drizzle/0003_add_mission_tracking.sql
git add drizzle/meta/_journal.json

# Commit with clear message
git commit -m "chore(db): add mission tracking system

- Create mission table with user references
- Add total_missions_completed counter to user table
- Include completion tracking timestamps"
```

### **Step 7: Push Migration to Database**

```bash
npx drizzle-kit push
```

**Expected output:**
```
✓ Pulling schema from database...
✓ Applying migration: 0003_add_mission_tracking
✓ Migration complete
```

---

## 📊 Migration File Naming Patterns

Use these patterns based on change type:

| Pattern | Example | Use Case |
|---------|---------|----------|
| `create_[feature]` | `create_mission_tracking.sql` | New tables for feature |
| `add_[concept]_[columns]` | `add_user_settings.sql` | Adding columns to existing tables |
| `refactor_[table]` | `refactor_user_schema.sql` | Restructuring existing tables |
| `add_[feature]_[related]` | `add_notification_preferences.sql` | Related feature columns |

---

## ✅ Checklist Before Each Migration

- [ ] Updated `src/db/schema.ts` with all changes
- [ ] Ran `npx drizzle-kit generate` successfully
- [ ] **Renamed** migration file to descriptive name (NOT auto-generated random name)
- [ ] Updated `drizzle/meta/_journal.json` tag field
- [ ] Added **documentation header** with date, description, and detailed changes
- [ ] Verified SQL syntax looks correct
- [ ] Ran `npx drizzle-kit push` and confirmed success
- [ ] Committed to git with descriptive message
- [ ] Updated any related TypeScript type exports in schema.ts

---

## 🐛 Common Mistakes to Avoid

### ❌ **Mistake 1: Not Renaming File**
```bash
# WRONG - Keep auto-generated name
git add drizzle/0003_wild_firebird.sql

# RIGHT - Rename to descriptive name
mv 0003_wild_firebird.sql 0003_add_mission_tracking.sql
git add drizzle/0003_add_mission_tracking.sql
```

### ❌ **Mistake 2: Forgetting to Update _journal.json**
```json
// WRONG - Doesn't match filename
"tag": "0003_wild_firebird"

// RIGHT - Matches the renamed file
"tag": "0003_add_mission_tracking"
```

### ❌ **Mistake 3: No Documentation Header**
```sql
-- WRONG - No context
CREATE TABLE "mission" (...)

-- RIGHT - Clear documentation
-- ============================================================================
-- Migration: 0003_add_mission_tracking.sql
-- Date Created: 2026-02-12
-- Description: Add mission/quest system for gamification
-- ============================================================================
CREATE TABLE "mission" (...)
```

### ❌ **Mistake 4: Inconsistent Naming**
```sql
-- WRONG - Mix of styles
0003_add_missions.sql         (snake_case)
0004_AddNotifications.sql     (PascalCase)
0005_create_new_feature.sql   (descriptive)

-- RIGHT - Consistent pattern
0003_add_mission_tracking.sql
0004_add_notification_preferences.sql
0005_create_transaction_system.sql
```

---

## 📚 Current Migration History

```
0000_create_core_tables.sql
├── account (NextAuth SSO)
├── bookmark (Quran bookmarks)
├── push_subscription (FCM tokens)
├── session (Auth sessions)
├── user (Core user data)
└── verificationToken (Email verification)

0001_create_intention_and_streaks.sql
├── NEW TABLE: intention (Journal/Niat entries)
├── ADD: push_subscription.prayer_preferences
├── ADD: push_subscription.user_location
├── ADD: push_subscription.timezone
├── ADD: user.niat_streak_current
├── ADD: user.niat_streak_longest
└── ADD: user.last_niat_date

0002_create_transaction_and_settings.sql
├── NEW TABLE: transaction (Mayar.id payments)
├── ADD: push_subscription.last_notification_sent
├── ADD: user.is_muhsinin
├── ADD: user.muhsinin_since
├── ADD: user.total_infaq
└── ADD: user.settings (JSON for all user preferences)
```

---

## 🎯 Best Practices Summary

1. **Descriptive Names** - File names should explain purpose, not be random
2. **Documentation** - Add header comments explaining what changed
3. **TypeScript Sync** - Always update TypeScript types after schema changes
4. **Git Tracking** - Commit migration files (they're part of version control)
5. **One Concept Per Migration** - Don't mix unrelated changes
6. **Date Tracking** - Include creation date in header
7. **Consistency** - Follow established naming patterns

---

## 📞 Quick Reference

**Generate migration:**
```bash
npx drizzle-kit generate
```

**Push to database:**
```bash
npx drizzle-kit push
```

**View migration status:**
```bash
npx drizzle-kit introspect
```

**Rename file:**
```bash
cd drizzle
mv OLD_NAME.sql NEW_NAME.sql
```

**Update journal (manual):**
```bash
# Edit drizzle/meta/_journal.json
# Change "tag": "old_name" to "tag": "new_name"
```

---

## 📖 Additional Resources

- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Database Schema (src/db/schema.ts)](../../src/db/schema.ts)
- [Migration Files (drizzle/)](../drizzle/)

---

**Last Reviewed:** February 12, 2026  
**Maintained By:** Nawaetu Dev Team
