# Migration Guide: Old API → New Repository Pattern

## Overview

This guide helps you migrate components from the old localStorage-based API to the new repository pattern with proper abstraction.

## Benefits of Migration

✅ **Type Safety** - Centralized storage keys with TypeScript
✅ **Error Handling** - Proper error handling for quota exceeded, storage unavailable
✅ **Testability** - Easy to mock repositories for testing
✅ **Scalability** - Easy to swap localStorage for API calls
✅ **Performance** - Built-in caching and batching
✅ **DRY** - No duplicate date formatting or storage logic

## Migration Patterns

### Pattern 1: Direct localStorage → StorageService

**Before:**
```tsx
import { useState, useEffect } from "react";

function MyComponent() {
    const [count, setCount] = useState(0);
    
    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("my_count");
        if (saved) setCount(parseInt(saved, 10));
    }, []);
    
    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("my_count", count.toString());
    }, [count]);
    
    return <div>{count}</div>;
}
```

**After:**
```tsx
import { useState, useEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

function MyComponent() {
    const [count, setCount] = useState(0);
    const storage = getStorageService();
    
    // Load from storage
    useEffect(() => {
        const saved = storage.getOptional<number>(STORAGE_KEYS.MY_COUNT);
        if (saved !== null) setCount(saved);
    }, []);
    
    // Save to storage
    useEffect(() => {
        storage.set(STORAGE_KEYS.MY_COUNT, count);
    }, [count]);
    
    return <div>{count}</div>;
}
```

**Improvements:**
- ✅ Type-safe storage key (no typos)
- ✅ Type-safe value retrieval
- ✅ Error handling built-in
- ✅ Easy to swap for API storage

### Pattern 2: Activity Tracking → useActivity Hook

**Before:**
```tsx
import { useState, useEffect } from "react";
import { trackTasbih, getActivityData } from "@/lib/activity-tracker";

function TasbihComponent() {
    const [todayCount, setTodayCount] = useState(0);
    
    useEffect(() => {
        const activity = getActivityData();
        setTodayCount(activity.tasbihCount);
    }, []);
    
    const handleClick = () => {
        trackTasbih(1);
        setTodayCount(prev => prev + 1);
    };
    
    return <button onClick={handleClick}>Count: {todayCount}</button>;
}
```

**After:**
```tsx
import { useActivity } from "@/hooks/useActivity";

function TasbihComponent() {
    const { activity, trackTasbih } = useActivity();
    
    const handleClick = () => {
        trackTasbih(1);
    };
    
    return <button onClick={handleClick}>Count: {activity.tasbihCount}</button>;
}
```

**Improvements:**
- ✅ No manual state management
- ✅ Automatic updates on storage events
- ✅ No need to call getActivityData
- ✅ Simplified component logic

### Pattern 3: Date Formatting → DateUtils

**Before:**
```tsx
function getTodayString() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('id-ID').format(date);
}
```

**After:**
```tsx
import { DateUtils } from "@/lib/utils/date";

const todayString = DateUtils.today();
const formatted = DateUtils.format(new Date());
```

**Improvements:**
- ✅ No duplicate implementations
- ✅ Consistent formatting across app
- ✅ More utility methods available

### Pattern 4: Multiple Storage Keys → STORAGE_KEYS

**Before:**
```tsx
localStorage.setItem("tasbih_count", "10");
localStorage.setItem("tasbih_target", "100");
localStorage.setItem("tasbih_daily_count", "5");
// Risk: typos like "tasbih_coun" won't be caught
```

**After:**
```tsx
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();
storage.setMany([
    [STORAGE_KEYS.TASBIH.COUNT, 10],
    [STORAGE_KEYS.TASBIH.TARGET, 100],
    [STORAGE_KEYS.TASBIH.DAILY_COUNT, 5]
]);
// TypeScript will catch typos at compile time
```

**Improvements:**
- ✅ Type-safe keys
- ✅ Batch operations for performance
- ✅ Compile-time error detection

## Example: Migrating TasbihCounter.tsx

### Current Implementation (13 localStorage calls)

```tsx
// In useEffect - Initial load
const savedCount = localStorage.getItem("tasbih_count");
const savedTarget = localStorage.getItem("tasbih_target");
const savedZikirId = localStorage.getItem("tasbih_zikir_id");
const savedDaily = localStorage.getItem("tasbih_daily_count");
const savedStreak = localStorage.getItem("tasbih_streak");
const savedDate = localStorage.getItem("tasbih_last_date");

// In separate useEffects - Save on change
useEffect(() => { localStorage.setItem("tasbih_count", count.toString()); }, [count]);
useEffect(() => { localStorage.setItem("tasbih_target", target ? target.toString() : "inf"); }, [target]);
useEffect(() => { if (activeZikirId) localStorage.setItem("tasbih_zikir_id", activeZikirId); }, [activeZikirId]);
useEffect(() => { localStorage.setItem("tasbih_daily_count", dailyCount.toString()); }, [dailyCount]);
useEffect(() => { localStorage.setItem("tasbih_streak", streak.toString()); }, [streak]);
useEffect(() => { if (lastZikirDate) localStorage.setItem("tasbih_last_date", lastZikirDate); }, [lastZikirDate]);
```

### Proposed Migration (Cleaner, Type-Safe)

```tsx
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

// In component
const storage = getStorageService();

// Initial load (use getMany for batch read)
useEffect(() => {
    const [
        savedCount,
        savedTarget,
        savedZikirId,
        savedDaily,
        savedStreak,
        savedDate
    ] = storage.getMany([
        STORAGE_KEYS.TASBIH.COUNT,
        STORAGE_KEYS.TASBIH.TARGET,
        STORAGE_KEYS.TASBIH.ZIKIR_ID,
        STORAGE_KEYS.TASBIH.DAILY_COUNT,
        STORAGE_KEYS.TASBIH.STREAK,
        STORAGE_KEYS.TASBIH.LAST_DATE
    ]);
    
    if (savedCount) setCount(savedCount as number);
    if (savedTarget) setTarget(savedTarget === "inf" ? null : savedTarget as number);
    if (savedZikirId) setActiveZikirId(savedZikirId as string);
    if (savedDaily) setDailyCount(savedDaily as number);
    if (savedStreak) setStreak(savedStreak as number);
    if (savedDate) setLastZikirDate(savedDate as string);
}, []);

// Save all at once when state changes
useEffect(() => {
    storage.setMany([
        [STORAGE_KEYS.TASBIH.COUNT, count],
        [STORAGE_KEYS.TASBIH.TARGET, target ?? "inf"],
        [STORAGE_KEYS.TASBIH.ZIKIR_ID, activeZikirId],
        [STORAGE_KEYS.TASBIH.DAILY_COUNT, dailyCount],
        [STORAGE_KEYS.TASBIH.STREAK, streak],
        [STORAGE_KEYS.TASBIH.LAST_DATE, lastZikirDate]
    ]);
}, [count, target, activeZikirId, dailyCount, streak, lastZikirDate]);
```

**Improvements:**
- ✅ 13 localStorage calls → 2 storage calls (1 batch read, 1 batch write)
- ✅ Type-safe keys
- ✅ Better performance (batching)
- ✅ Easy to swap for API storage later

## Migration Checklist

### Phase 1: Simple Components (Week 2, Days 1-2)

- [ ] **PatternOverlay.tsx** - Simple localStorage for settings
- [ ] **OnboardingOverlay.tsx** - Boolean flags in storage
- [ ] **PWAInstallPrompt.tsx** - Dismiss state tracking
- [ ] **InfaqModal.tsx** - Modal state persistence

### Phase 2: Medium Components (Week 2, Days 3-5)

- [ ] **TasbihCounter.tsx** - Multiple storage keys (use batch operations)
- [ ] **QiblaCompass.tsx** - Settings persistence
- [ ] **MissionDetailDialog.tsx** - Mission state tracking
- [ ] **UserProfileDialog.tsx** - Profile data

### Phase 3: Complex Components (Week 2, Days 6-7)

- [ ] **QuranBrowser.tsx** - Reading progress tracking
- [ ] **VerseBrowser.tsx** - Verse navigation state
- [ ] **BookmarkEditDialog.tsx** - Bookmark management
- [ ] **PrayerTimesDisplay.tsx** - Prayer logging

### Phase 4: Remove Old API (Week 3)

- [ ] Verify all components using new API
- [ ] Remove deprecated functions from activity-tracker.ts
- [ ] Update documentation
- [ ] Remove backward compatibility layer

## Testing After Migration

```tsx
// Test 1: Storage service works
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();
storage.set(STORAGE_KEYS.TEST_KEY, "test-value");
console.log(storage.get(STORAGE_KEYS.TEST_KEY)); // "test-value"

// Test 2: Activity hook works
import { useActivity } from "@/hooks/useActivity";

function TestComponent() {
    const { activity, trackQuran } = useActivity();
    
    useEffect(() => {
        trackQuran(10);
        console.log("Quran count:", activity.quranAyat); // Should be 10
    }, []);
    
    return null;
}

// Test 3: DateUtils works
import { DateUtils } from "@/lib/utils/date";

console.log("Today:", DateUtils.today()); // "2025-06-10"
console.log("Yesterday:", DateUtils.yesterday()); // "2025-06-09"
console.log("Is same day:", DateUtils.isSameDay(new Date(), new Date())); // true
```

## Common Issues

### Issue 1: "Cannot find module @/core/infrastructure/storage"

**Solution:** Make sure tsconfig.json has the correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: TypeScript error "Property 'MY_KEY' does not exist"

**Solution:** Add your key to STORAGE_KEYS in `src/lib/constants/storage-keys.ts`:
```typescript
export const STORAGE_KEYS = {
    MY_KEY: "my_key" as const,
    // ... other keys
} as const;
```

### Issue 3: Storage not updating across tabs

**Solution:** The StorageService automatically listens to storage events. If you need custom behavior:
```tsx
useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEYS.MY_KEY) {
            // Handle cross-tab update
        }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

### Issue 4: Need to migrate to API storage

**Solution:** Create APIStorageAdapter:
```typescript
// src/core/infrastructure/storage/api-storage.adapter.ts
import { StorageAdapter } from "./adapter";

export class APIStorageAdapter implements StorageAdapter {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async get<T>(key: string): Promise<T | null> {
        const response = await fetch(`${this.baseUrl}/storage/${key}`);
        if (!response.ok) return null;
        return response.json();
    }
    
    async set<T>(key: string, value: T): Promise<void> {
        await fetch(`${this.baseUrl}/storage/${key}`, {
            method: "PUT",
            body: JSON.stringify(value),
            headers: { "Content-Type": "application/json" }
        });
    }
    
    // ... implement other methods
}

// Then in factory.ts
export class StorageFactory {
    static create(type: StorageType, options?: any): StorageAdapter {
        switch (type) {
            case "localStorage":
                return new LocalStorageAdapter();
            case "api":
                return new APIStorageAdapter(options.baseUrl);
            // ... other types
        }
    }
}
```

## Performance Considerations

### Use Batch Operations

```tsx
// ❌ Bad: Multiple individual calls
storage.set(STORAGE_KEYS.KEY1, value1);
storage.set(STORAGE_KEYS.KEY2, value2);
storage.set(STORAGE_KEYS.KEY3, value3);

// ✅ Good: Single batch call
storage.setMany([
    [STORAGE_KEYS.KEY1, value1],
    [STORAGE_KEYS.KEY2, value2],
    [STORAGE_KEYS.KEY3, value3]
]);
```

### Use Repository Cache

```tsx
// ❌ Bad: Multiple getActivity calls
const activity1 = repository.getActivity();
const activity2 = repository.getActivity(); // Reads from storage again

// ✅ Good: Repository caches internally
const activity = repository.getActivity(); // Cached for 5 seconds
```

### Debounce Frequent Updates

```tsx
import { useMemo } from "react";
import { debounce } from "lodash";

// Debounce storage writes for rapidly changing values
const debouncedSave = useMemo(
    () => debounce((value: number) => {
        storage.set(STORAGE_KEYS.TASBIH.COUNT, value);
    }, 500),
    []
);

const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    debouncedSave(newCount);
};
```

## Next Steps

1. ✅ Read this migration guide
2. ✅ Test new API with simple component
3. ✅ Migrate Phase 1 components (simple storage)
4. ⏳ Migrate Phase 2 components (batch operations)
5. ⏳ Migrate Phase 3 components (complex state)
6. ⏳ Remove backward compatibility layer
7. ⏳ Prepare for API storage (when backend ready)

## Questions?

See [REFACTORING_IMPLEMENTATION.md](./REFACTORING_IMPLEMENTATION.md) for detailed architecture documentation.

---

**Last Updated:** 2025-06-10  
**Version:** 1.0.0  
**Status:** Priority 1 Implementation Complete ✅
