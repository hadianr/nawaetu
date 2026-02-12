# 📚 Adding New Entity Types - Implementation Guide

## Quick Reference

This guide shows how to add new entity types (journal, missions, etc.) to the offline-first sync system.

---

## Adding Journal Sync Support

### Step 1: Type Definition (Already Done ✅)

**File:** `src/lib/sync-queue.ts`

```typescript
export type SyncEntityType = 'bookmark' | 'setting' | 'journal' | 'mission' | 'mission_progress';
```

The `journal` type is already supported! No changes needed.

### Step 2: Database Schema

**File:** `src/db/schema.ts`

```typescript
// Already exists and ready:
export const intentions = pgTable("intention", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    
    niatText: text("niat_text").notNull(),
    niatType: text("niat_type").default("daily"),
    niatDate: date("niat_date").notNull(),
    
    reflectionText: text("reflection_text"),
    reflectionRating: integer("reflection_rating"),
    reflectedAt: timestamp("reflected_at", { mode: "date" }),
    
    isPrivate: boolean("is_private").default(true),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type Intention = typeof intentions.$inferSelect;
export type NewIntention = typeof intentions.$inferInsert;
```

### Step 3: API Handler

**File:** `src/app/api/user/sync/route.ts`

The handler already exists! Here it is:

```typescript
async function handleIntentionSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update' | 'delete'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(intentions)
                .values({
                    userId,
                    niatText: data.niatText,
                    niatType: data.niatType,
                    niatDate: data.niatDate,
                    reflectionText: data.reflectionText,
                    reflectionRating: data.reflectionRating,
                    isPrivate: data.isPrivate ?? true,
                    createdAt: new Date(data.createdAt) || new Date(),
                })
                .returning({ id: intentions.id });

            return { id: entry.id, cloudId: result[0]?.id };
        } else if (action === 'delete') {
            if (data.cloudId) {
                await db.delete(intentions).where(eq(intentions.id, data.cloudId));
            }
            return { id: entry.id };
        }

        throw new Error(`Unknown action: ${action}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Sync] Intention sync failed for ${entry.id}:`, errorMessage);
        return { id: entry.id, error: errorMessage };
    }
}
```

And it's already registered in the POST handler:

```typescript
// In POST /api/user/sync handler
switch (entry.type) {
    case 'bookmark':
        return await handleBookmarkSync(userId, entry, entry.action);
    case 'intention':  // ← Already here!
        return await handleIntentionSync(userId, entry, entry.action);
    case 'setting':
        return await handleSettingSync(userId, entry, entry.action);
    default:
        throw new Error(`Unknown entity type: ${entry.type}`);
}
```

### Step 4: Use in Components

**Example: IntentionJournalWidget.tsx**

```typescript
import { syncQueue } from '@/lib/sync-queue';
import { toast } from 'sonner';

export function IntentionJournalWidget() {
    const handleAddIntention = async (niatText: string) => {
        try {
            // Add to sync queue
            const entryId = syncQueue.addToQueue('journal', 'create', {
                niatText,
                niatType: 'daily',
                niatDate: new Date().toISOString().split('T')[0],
                isPrivate: true,
                createdAt: new Date().toISOString(),
            });

            console.log(`✅ Intention added to queue: ${entryId}`);
            
            // Show feedback
            toast.success('Niat dicatat! Akan tersimpan ke cloud...');
        } catch (error) {
            toast.error('Gagal menambah niat');
            console.error(error);
        }
    };

    return (
        // Component JSX
    );
}
```

📌 **Journal sync is already fully implemented!**

---

## Adding Mission Sync Support

### Step 1: Type Definition

**File:** `src/lib/sync-queue.ts`

```typescript
// Already in the union! ✅
export type SyncEntityType = 'bookmark' | 'setting' | 'journal' | 'mission' | 'mission_progress';
```

### Step 2: Create Database Table

**File:** `src/db/schema.ts`

Add after the `intentions` table:

```typescript
export const userMissions = pgTable("user_mission", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    
    // Mission reference
    missionId: text("mission_id").notNull(),  // e.g., 'sholat_subuh'
    missionTitle: text("mission_title").notNull(),  // e.g., 'Sholat Subuh'
    
    // Status tracking
    status: text("status").notNull(),  // 'pending', 'in_progress', 'completed'
    
    // Rewards
    xpEarned: integer("xp_earned").default(0),
    
    // Timestamps
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for TypeScript
export type UserMission = typeof userMissions.$inferSelect;
export type NewUserMission = typeof userMissions.$inferInsert;
```

### Step 3: Generate & Run Migration

```bash
# 1. Generate migration
npx drizzle-kit generate

# 2. Rename to descriptive name
cd drizzle
ls  # Note the auto-generated name, e.g., 0003_wild_bear.sql
mv 0003_wild_bear.sql 0003_add_user_missions.sql

# 3. Update journal tag
# Edit drizzle/meta/_journal.json
# Change the tag from "0003_wild_bear" to "0003_add_user_missions"

# 4. Push to database
cd ..
npx drizzle-kit push

# 5. Verify success - you should see:
# ✓ Pulling schema from database...
# ✓ Applying migration: 0003_add_user_missions
# ✓ Migration complete
```

See [DATABASE_MIGRATION_GUIDE.md](docs/DATABASE_MIGRATION_GUIDE.md) for detailed steps.

### Step 4: Add API Handler

**File:** `src/app/api/user/sync/route.ts`

Add the handler function after `handleIntentionSync`:

```typescript
/**
 * Handle mission sync
 */
async function handleUserMissionSync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update' | 'delete'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;

        if (action === 'create' || action === 'update') {
            // Check if mission already exists (by userId + missionId)
            const existing = await db.query.userMissions.findFirst({
                where: (userMissions, { eq, and }) =>
                    and(
                        eq(userMissions.userId, userId),
                        eq(userMissions.missionId, data.missionId)
                    ),
            });

            if (existing) {
                // Update existing mission
                await db
                    .update(userMissions)
                    .set({
                        status: data.status,
                        xpEarned: data.xpEarned,
                        completedAt: data.completedAt ? new Date(data.completedAt) : null,
                        updatedAt: new Date(),
                    })
                    .where(eq(userMissions.id, existing.id));

                return { id: entry.id, cloudId: existing.id };
            } else {
                // Create new mission
                const result = await db
                    .insert(userMissions)
                    .values({
                        userId,
                        missionId: data.missionId,
                        missionTitle: data.missionTitle,
                        status: data.status,
                        xpEarned: data.xpEarned,
                        completedAt: data.completedAt ? new Date(data.completedAt) : null,
                        createdAt: new Date(data.createdAt) || new Date(),
                    })
                    .returning({ id: userMissions.id });

                return { id: entry.id, cloudId: result[0]?.id };
            }
        } else if (action === 'delete') {
            // Delete mission
            if (data.cloudId) {
                await db.delete(userMissions).where(eq(userMissions.id, data.cloudId));
            }
            return { id: entry.id };
        }

        throw new Error(`Unknown action: ${action}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Sync] Mission sync failed for ${entry.id}:`, errorMessage);
        return { id: entry.id, error: errorMessage };
    }
}
```

Then register it in the POST handler's switch statement:

```typescript
// In POST /api/user/sync handler, within the for loop:
switch (entry.type) {
    case 'bookmark':
        return await handleBookmarkSync(userId, entry, entry.action);
    case 'intention':
        return await handleIntentionSync(userId, entry, entry.action);
    case 'mission':  // ← ADD THIS
        return await handleUserMissionSync(userId, entry, entry.action);
    case 'setting':
        return await handleSettingSync(userId, entry, entry.action);
    default:
        throw new Error(`Unknown entity type: ${entry.type}`);
}
```

### Step 5: Use in Components

**Example: MissionCard.tsx**

```typescript
import { syncQueue } from '@/lib/sync-queue';
import { toast } from 'sonner';

interface MissionCardProps {
    mission: {
        id: string;
        title: string;
        xpReward: number;
    };
}

export function MissionCard({ mission }: MissionCardProps) {
    const handleCompleteMission = async () => {
        try {
            // Add to sync queue
            const entryId = syncQueue.addToQueue('mission', 'create', {
                missionId: mission.id,
                missionTitle: mission.title,
                status: 'completed',
                xpEarned: mission.xpReward,
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            });

            console.log(`✅ Mission completed and queued: ${entryId}`);
            
            // Show feedback
            toast.success(`+${mission.xpReward} XP! 🎉`);
        } catch (error) {
            toast.error('Gagal menyimpan mission');
            console.error(error);
        }
    };

    return (
        <button
            onClick={handleCompleteMission}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
            Selesaikan Mission (+{mission.xpReward} XP)
        </button>
    );
}
```

### Step 6: Testing

```typescript
// In browser console:

// 1. Check queue after completing mission
window.syncQueue.getStats();
// Output: { queueSize: 1, pending: 1, ... }

// 2. Go offline (Chrome DevTools Network tab → Offline)

// 3. Complete another mission
// Should queue without errors

// 4. Check stats again
window.syncQueue.getStats();
// Output: { queueSize: 2, pending: 2, ... }

// 5. Go online again (uncheck Offline)

// 6. Wait 2 seconds for sync

// 7. Check if marked as synced
const allEntries = window.syncQueue.getQueue();
console.table(allEntries.map(e => ({ id: e.id, type: e.type, status: e.status })));
// Should show status: 'synced'
```

---

## Template for Other Entity Types

### Quick Template

```typescript
// 1. Type Definition (Already in SyncEntityType union)
export type SyncEntityType = '...' | 'new_entity' | ...;

// 2. Database Table
export const newEntities = pgTable("new_entity", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    
    // Entity-specific fields
    data1: text("data1"),
    data2: integer("data2"),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export type NewEntity = typeof newEntities.$inferSelect;

// 3. API Handler
async function handleNewEntitySync(
    userId: string,
    entry: SyncQueueEntry,
    action: 'create' | 'update' | 'delete'
): Promise<{ id: string; cloudId?: string } | { id: string; error: string }> {
    try {
        const data = entry.data;
        
        if (action === 'create' || action === 'update') {
            const result = await db
                .insert(newEntities)
                .values({
                    userId,
                    data1: data.data1,
                    data2: data.data2,
                    createdAt: new Date(data.createdAt) || new Date(),
                })
                .returning({ id: newEntities.id });
            
            return { id: entry.id, cloudId: result[0]?.id };
        } else if (action === 'delete') {
            if (data.cloudId) {
                await db.delete(newEntities).where(eq(newEntities.id, data.cloudId));
            }
            return { id: entry.id };
        }
        
        throw new Error(`Unknown action: ${action}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Sync] Entity sync failed:`, errorMessage);
        return { id: entry.id, error: errorMessage };
    }
}

// 4. Register handler in POST /api/user/sync
case 'new_entity':
    return await handleNewEntitySync(userId, entry, entry.action);

// 5. Use in component
syncQueue.addToQueue('new_entity', 'create', {
    data1: 'value',
    data2: 123,
    createdAt: new Date().toISOString(),
});
```

---

## Verification Checklist

### Before Committing

- [ ] SyncEntityType updated (if not already)
- [ ] Database table defined in schema.ts
- [ ] Type exports added (e.g., `export type Mission`)
- [ ] Migration generated and renamed
- [ ] Migration _journal.json updated
- [ ] API handler function created
- [ ] Handler registered in POST switch statement
- [ ] Component uses syncQueue.addToQueue()
- [ ] Console logs appear with `[SyncQueue]` and `[Sync]` prefixes
- [ ] Queue entry appears offline
- [ ] Entry syncs when online

### Database Testing

```bash
# 1. Push migration
npx drizzle-kit push

# 2. Verify table exists
npx drizzle-kit introspect

# 3. Try sync manually (if possible)
# Use API testing tool or browser fetch

# 4. Check database with:
npx drizzle-kit studio
```

### Git Workflow

```bash
# 1. Stage changes
git add src/db/schema.ts
git add src/app/api/user/sync/route.ts
git add drizzle/
git add src/components/...  # if modified components

# 2. Commit
git commit -m "feat: add mission sync support

- Create user_mission table in database
- Add handleUserMissionSync API handler
- Update POST /api/user/sync to handle missions
- Add MissionCard component integration"

# 3. Push
git push origin main
```

---

## Troubleshooting

### Issue: "Unknown entity type: mission"

**Cause:** Handler not registered in switch statement

**Fix:**
```typescript
// src/app/api/user/sync/route.ts, around line 200
switch (entry.type) {
    case 'mission':  // ← Make sure this exists
        return await handleUserMissionSync(...);
}
```

### Issue: Queue entries not syncing

**Cause:** No session or network issue

**Check:**
```typescript
// In browser console
window.syncQueue.getStats();
// Should show pending > 0

// Check network
// DevTools → Network → find /api/user/sync calls
// Should show 200 status

// Check console logs
// Filter: "[Sync]" - should show sync attempts
```

### Issue: TypeError: data.createdAt is undefined

**Cause:** Missing required field when adding to queue

**Fix:**
```typescript
// WRONG:
syncQueue.addToQueue('mission', 'create', {
    missionId: '123',
    status: 'completed',
    // Missing createdAt!
});

// RIGHT:
syncQueue.addToQueue('mission', 'create', {
    missionId: '123',
    status: 'completed',
    createdAt: new Date().toISOString(),  // ← Add this
});
```

### Issue: Migration won't apply

**Cause:** Tag in _journal.json doesn't match filename

**Fix:**
```bash
# 1. Check filename
ls drizzle/*.sql | grep -v snapshot

# 2. Check _journal.json
cat drizzle/meta/_journal.json | grep tag

# 3. Make sure they match
# If not: edit _journal.json to match filename

# 4. Try again
npx drizzle-kit push
```

---

## References

- [SCALABILITY_ARCHITECTURE_REVIEW.md](SCALABILITY_ARCHITECTURE_REVIEW.md) - Full architecture guide
- [DATABASE_MIGRATION_GUIDE.md](docs/DATABASE_MIGRATION_GUIDE.md) - Database migration details
- [src/lib/sync-queue.ts](src/lib/sync-queue.ts) - Queue implementation
- [src/app/api/user/sync/route.ts](src/app/api/user/sync/route.ts) - Sync API

---

**Last Updated:** February 12, 2026  
**Status:** Ready for Implementation ✅  

