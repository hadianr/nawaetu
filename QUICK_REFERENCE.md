# Quick Reference: New Architecture APIs

## 🚀 Quick Start

### 1. Storage Service (Replace localStorage)

```typescript
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();

// Get value (with default)
const name = storage.get<string>(STORAGE_KEYS.USER.NAME) ?? "Guest";

// Get optional value
const location = storage.getOptional<string>(STORAGE_KEYS.USER.LOCATION);

// Set value
storage.set(STORAGE_KEYS.USER.NAME, "Ahmad");

// Check existence
if (storage.has(STORAGE_KEYS.USER.NAME)) {
    console.log("User name exists");
}

// Remove value
storage.remove(STORAGE_KEYS.USER.NAME);

// Batch operations (RECOMMENDED for multiple keys)
const [name, title, location] = storage.getMany([
    STORAGE_KEYS.USER.NAME,
    STORAGE_KEYS.USER.TITLE,
    STORAGE_KEYS.USER.LOCATION
]);

storage.setMany([
    [STORAGE_KEYS.USER.NAME, "Ahmad"],
    [STORAGE_KEYS.USER.TITLE, "Hamba Allah"],
    [STORAGE_KEYS.USER.LOCATION, "Jakarta"]
]);
```

### 2. Activity Tracking (Replace activity-tracker.ts)

```typescript
import { useActivity } from "@/hooks/useActivity";

function MyComponent() {
    const {
        activity,      // Current activity data
        trackQuran,    // Track Quran reading
        trackTasbih,   // Track tasbih count
        logPrayer,     // Log prayer completion
        isPrayerLogged,// Check if prayer logged
        resetDaily     // Reset daily counters
    } = useActivity();
    
    return (
        <div>
            <p>Today's Quran: {activity.quranAyat} ayat</p>
            <p>Today's Tasbih: {activity.tasbihCount} times</p>
            <p>Prayers: {activity.prayersLogged.join(", ")}</p>
            
            <button onClick={() => trackQuran(10)}>
                Read 10 Ayat
            </button>
            
            <button onClick={() => trackTasbih(33)}>
                Tasbih 33x
            </button>
            
            <button onClick={() => logPrayer("Fajr")}>
                Log Fajr
            </button>
            
            {isPrayerLogged("Fajr") && <span>✅ Fajr logged!</span>}
        </div>
    );
}
```

### 3. Date Utilities (Replace duplicate formatters)

```typescript
import { DateUtils } from "@/lib/utils/date";

// Get date strings
const today = DateUtils.today();              // "2025-06-10"
const yesterday = DateUtils.yesterday();      // "2025-06-09"
const threeDaysAgo = DateUtils.daysAgo(3);   // "2025-06-07"

// Date comparisons
const date1 = new Date("2025-06-10");
const date2 = new Date("2025-06-09");

DateUtils.isAfter(date1, date2);   // true
DateUtils.isBefore(date1, date2);  // false
DateUtils.isSameDay(date1, date1); // true

// Date calculations
const days = DateUtils.daysBetween(date1, date2); // 1

// Date formatting
const formatted = DateUtils.format(new Date());          // "10 Juni 2025"
const short = DateUtils.formatShort(new Date());        // "10 Jun 2025"
const formatted_en = DateUtils.format(new Date(), "en-US"); // "June 10, 2025"

// Date parsing
const parsed = DateUtils.parse("2025-06-10"); // Date object
const isValid = DateUtils.isValid(new Date()); // true

// Timestamp
const timestamp = DateUtils.timestamp(); // 1749513600000
```

### 4. Storage Keys (Type-Safe Keys)

```typescript
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

// Available keys organized by category:

// User
STORAGE_KEYS.USER.NAME
STORAGE_KEYS.USER.TITLE
STORAGE_KEYS.USER.LOCATION

// Activity
STORAGE_KEYS.ACTIVITY.DAILY_DATA
STORAGE_KEYS.ACTIVITY.QURAN_AYAT
STORAGE_KEYS.ACTIVITY.TASBIH_COUNT
STORAGE_KEYS.ACTIVITY.PRAYERS_LOGGED
STORAGE_KEYS.ACTIVITY.LAST_DATE

// Streak
STORAGE_KEYS.STREAK.CURRENT
STORAGE_KEYS.STREAK.LAST_DATE
STORAGE_KEYS.STREAK.LONGEST

// Missions
STORAGE_KEYS.MISSIONS.ACTIVE
STORAGE_KEYS.MISSIONS.COMPLETED
STORAGE_KEYS.MISSIONS.PROGRESS

// Quran
STORAGE_KEYS.QURAN.READING_PROGRESS
STORAGE_KEYS.QURAN.BOOKMARKS
STORAGE_KEYS.QURAN.LAST_READ

// Settings
STORAGE_KEYS.SETTINGS.THEME
STORAGE_KEYS.SETTINGS.LANGUAGE
STORAGE_KEYS.SETTINGS.NOTIFICATIONS

// Prayer
STORAGE_KEYS.PRAYER.TIMES_CACHE
STORAGE_KEYS.PRAYER.LOCATION

// AI
STORAGE_KEYS.AI.CHAT_HISTORY
STORAGE_KEYS.AI.PREFERENCES

// Tasbih
STORAGE_KEYS.TASBIH.COUNT
STORAGE_KEYS.TASBIH.TARGET
STORAGE_KEYS.TASBIH.DAILY_COUNT
STORAGE_KEYS.TASBIH.STREAK
STORAGE_KEYS.TASBIH.LAST_DATE
STORAGE_KEYS.TASBIH.ZIKIR_ID
STORAGE_KEYS.TASBIH.ZIKIR_LABEL

// UI
STORAGE_KEYS.UI.ONBOARDING_COMPLETE
STORAGE_KEYS.UI.INFAQ_MODAL_DISMISSED
STORAGE_KEYS.UI.INSTALL_PROMPT_DISMISSED
```

## 📋 Migration Cheat Sheet

### Before (Old Way) → After (New Way)

#### localStorage → StorageService
```typescript
// ❌ Before
const value = localStorage.getItem("my_key");
localStorage.setItem("my_key", "value");
localStorage.removeItem("my_key");

// ✅ After
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const storage = getStorageService();
const value = storage.get(STORAGE_KEYS.MY_KEY);
storage.set(STORAGE_KEYS.MY_KEY, "value");
storage.remove(STORAGE_KEYS.MY_KEY);
```

#### Multiple localStorage calls → Batch
```typescript
// ❌ Before
localStorage.setItem("key1", "value1");
localStorage.setItem("key2", "value2");
localStorage.setItem("key3", "value3");

// ✅ After
storage.setMany([
    [STORAGE_KEYS.KEY1, "value1"],
    [STORAGE_KEYS.KEY2, "value2"],
    [STORAGE_KEYS.KEY3, "value3"]
]);
```

#### Date formatting → DateUtils
```typescript
// ❌ Before
function getTodayString() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

const formatted = new Intl.DateTimeFormat('id-ID').format(new Date());

// ✅ After
import { DateUtils } from "@/lib/utils/date";

const today = DateUtils.today();
const formatted = DateUtils.format(new Date());
```

#### Activity tracking → useActivity
```typescript
// ❌ Before
import { trackQuranRead, getActivityData } from "@/lib/activity-tracker";

const [todayCount, setTodayCount] = useState(0);

useEffect(() => {
    const activity = getActivityData();
    setTodayCount(activity.quranAyat);
}, []);

const handleClick = () => {
    trackQuranRead(10);
    setTodayCount(prev => prev + 10);
};

// ✅ After
import { useActivity } from "@/hooks/useActivity";

const { activity, trackQuran } = useActivity();

const handleClick = () => {
    trackQuran(10);
    // State updates automatically!
};
```

## 🎯 Common Patterns

### Pattern 1: Load & Save State

```typescript
import { useState, useEffect } from "react";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

function MyComponent() {
    const [count, setCount] = useState(0);
    const storage = getStorageService();
    
    // Load on mount
    useEffect(() => {
        const saved = storage.getOptional<number>(STORAGE_KEYS.MY_COUNT);
        if (saved !== null) setCount(saved);
    }, []);
    
    // Save on change
    useEffect(() => {
        storage.set(STORAGE_KEYS.MY_COUNT, count);
    }, [count]);
    
    return <div>{count}</div>;
}
```

### Pattern 2: Batch Load & Save

```typescript
function MyComponent() {
    const [state, setState] = useState({ count: 0, target: 100, name: "" });
    const storage = getStorageService();
    
    // Load all at once
    useEffect(() => {
        const [count, target, name] = storage.getMany([
            STORAGE_KEYS.COUNT,
            STORAGE_KEYS.TARGET,
            STORAGE_KEYS.NAME
        ]);
        
        setState({
            count: count as number ?? 0,
            target: target as number ?? 100,
            name: name as string ?? ""
        });
    }, []);
    
    // Save all at once
    useEffect(() => {
        storage.setMany([
            [STORAGE_KEYS.COUNT, state.count],
            [STORAGE_KEYS.TARGET, state.target],
            [STORAGE_KEYS.NAME, state.name]
        ]);
    }, [state]);
    
    return <div>...</div>;
}
```

### Pattern 3: Conditional Storage

```typescript
function MyComponent() {
    const storage = getStorageService();
    
    const saveIfChanged = (key: string, value: any) => {
        const current = storage.get(key);
        if (current !== value) {
            storage.set(key, value);
            console.log(`Updated ${key}`);
        }
    };
    
    return <button onClick={() => saveIfChanged(STORAGE_KEYS.COUNT, 10)}>
        Save if changed
    </button>;
}
```

### Pattern 4: Debounced Save

```typescript
import { useMemo } from "react";
import { debounce } from "lodash";

function MyComponent() {
    const [search, setSearch] = useState("");
    const storage = getStorageService();
    
    const debouncedSave = useMemo(
        () => debounce((value: string) => {
            storage.set(STORAGE_KEYS.SEARCH_QUERY, value);
        }, 500),
        []
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSave(value);
    };
    
    return <input value={search} onChange={handleChange} />;
}
```

## 🔧 Advanced Usage

### Custom Repository

```typescript
// src/core/repositories/my.repository.ts
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export interface MyData {
    id: string;
    name: string;
    count: number;
}

export interface MyRepository {
    getData(): MyData;
    saveData(data: MyData): void;
    increment(): void;
}

export class LocalMyRepository implements MyRepository {
    private storage = getStorageService();
    
    getData(): MyData {
        return this.storage.get<MyData>(STORAGE_KEYS.MY_DATA) ?? {
            id: "default",
            name: "Default",
            count: 0
        };
    }
    
    saveData(data: MyData): void {
        this.storage.set(STORAGE_KEYS.MY_DATA, data);
        window.dispatchEvent(new CustomEvent("my_data_updated"));
    }
    
    increment(): void {
        const data = this.getData();
        data.count++;
        this.saveData(data);
    }
}

let repository: MyRepository | null = null;

export function getMyRepository(): MyRepository {
    if (!repository) {
        repository = new LocalMyRepository();
    }
    return repository;
}
```

### Custom Hook

```typescript
// src/hooks/useMyData.ts
import { useState, useEffect } from "react";
import { getMyRepository } from "@/core/repositories/my.repository";

export function useMyData() {
    const repository = getMyRepository();
    const [data, setData] = useState(repository.getData());
    
    useEffect(() => {
        const handleUpdate = () => {
            setData(repository.getData());
        };
        
        window.addEventListener("my_data_updated", handleUpdate);
        return () => window.removeEventListener("my_data_updated", handleUpdate);
    }, []);
    
    return {
        data,
        increment: () => repository.increment(),
        saveData: (newData) => repository.saveData(newData)
    };
}
```

## ⚠️ Common Mistakes

### ❌ Don't: Parse manually
```typescript
const data = localStorage.getItem("key");
const parsed = JSON.parse(data); // Error if null!
```

### ✅ Do: Use storage service
```typescript
const data = storage.get<MyType>(STORAGE_KEYS.MY_KEY);
```

---

### ❌ Don't: Hardcode keys
```typescript
localStorage.setItem("user_name", name); // Typo-prone
```

### ✅ Do: Use constants
```typescript
storage.set(STORAGE_KEYS.USER.NAME, name);
```

---

### ❌ Don't: Multiple individual calls
```typescript
storage.set(STORAGE_KEYS.KEY1, value1);
storage.set(STORAGE_KEYS.KEY2, value2);
storage.set(STORAGE_KEYS.KEY3, value3);
```

### ✅ Do: Batch operations
```typescript
storage.setMany([
    [STORAGE_KEYS.KEY1, value1],
    [STORAGE_KEYS.KEY2, value2],
    [STORAGE_KEYS.KEY3, value3]
]);
```

---

### ❌ Don't: Duplicate date formatters
```typescript
function formatDate(date: Date) {
    return new Intl.DateTimeFormat('id-ID').format(date);
}
```

### ✅ Do: Use DateUtils
```typescript
DateUtils.format(date);
```

---

### ❌ Don't: Manual activity state management
```typescript
const [activity, setActivity] = useState(getActivityData());

const track = () => {
    trackQuran(10);
    setActivity(getActivityData()); // Manual update
};
```

### ✅ Do: Use hook
```typescript
const { activity, trackQuran } = useActivity();
// Auto-updates!
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visual architecture diagrams
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Detailed migration guide
- **[REFACTORING_IMPLEMENTATION.md](./REFACTORING_IMPLEMENTATION.md)** - Full implementation details
- **[PRIORITY_1_STATUS.md](./PRIORITY_1_STATUS.md)** - Current status and metrics

## 🎓 Learning Resources

- **Adapter Pattern**: https://refactoring.guru/design-patterns/adapter
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html
- **Singleton Pattern**: https://refactoring.guru/design-patterns/singleton
- **Factory Pattern**: https://refactoring.guru/design-patterns/factory-method

---

**Version:** 1.0.0  
**Last Updated:** 2025-06-10  
**Status:** ✅ Ready to Use
