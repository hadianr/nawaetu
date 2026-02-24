import { pgTable, text, timestamp, integer, uuid, primaryKey, date, boolean, index, uniqueIndex, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// --- Enums ---
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const archetypeEnum = pgEnum("archetype", ["beginner", "striver", "dedicated"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "settlement", "expired", "failed"]);
export const niatTypeEnum = pgEnum("niat_type", ["daily", "prayer", "custom"]);

// --- Users & Auth (Compatible with NextAuth.js) ---

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),

    // Niat Streak Tracking
    niatStreakCurrent: integer("niat_streak_current").default(0),
    niatStreakLongest: integer("niat_streak_longest").default(0),
    lastNiatDate: date("last_niat_date"),

    // Muhsinin & Donation Tracking (v1.6.0)
    isMuhsinin: boolean("is_muhsinin").default(false),
    muhsininSince: timestamp("muhsinin_since"),
    totalInfaq: integer("total_infaq").default(0), // Track total donation amount

    // User Preferences (v1.7.0)
    gender: genderEnum("gender"),
    archetype: archetypeEnum("archetype"),
    settings: jsonb("settings"), // JSON: { theme, muadzin, calculationMethod, locale }

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ... (accounts, sessions, verificationTokens tables remain same)

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => {
    return {
        userIdIdx: index("session_user_id_idx").on(table.userId),
    };
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

// --- Transactions / Payments (Mayar.id) ---

export const transactions = pgTable("transaction", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").references(() => users.id), // Can be null if guest, but ideally linked

    // Payment Details
    amount: integer("amount").notNull(),
    status: transactionStatusEnum("status").notNull(), // 'pending', 'settlement', 'expired', 'failed'

    // Mayar Specifics
    mayarId: text("mayar_id").unique(), // Transaction ID from Mayar (Set by webhook)
    paymentLinkId: text("payment_link_id").unique(), // Payment Link ID from Create (Set by app)
    paymentUrl: text("payment_url"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("transaction_user_id_idx").on(table.userId),
        // Compound index for filtering by status and sorting by date
        statusCreatedAtIdx: index("transaction_status_created_at_idx").on(table.status, table.createdAt),
    };
});

// ... (bookmarks, intentions, pushSubscriptions remain the same)

export const bookmarks = pgTable("bookmark", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Link to User

    // Quran Data
    surahId: integer("surah_id").notNull(),
    surahName: text("surah_name").notNull(),
    verseId: integer("verse_id").notNull(),
    verseText: text("verse_text").notNull(), // Arabic logic
    translationText: text("translation_text"), // v1.8.5 - added translation

    key: text("key").notNull(), // Compound key logic "2:255" for easy querying

    note: text("note"),
    tags: text("tags").array(), // Use PostgreSQL Array type

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
    return {
        keyIdx: index("bookmark_key_idx").on(table.key),
        userKeyUniqueIdx: uniqueIndex("bookmark_user_key_unique_idx").on(table.userId, table.key),
    };
});

// --- Intention Journal ---

export const intentions = pgTable("intention", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    // Intention data
    niatText: text("niat_text").notNull(),
    niatType: niatTypeEnum("niat_type").default("daily"), // 'daily', 'prayer', 'custom'
    niatDate: date("niat_date").notNull(),

    // Reflection data (optional)
    reflectionText: text("reflection_text"),
    reflectionRating: integer("reflection_rating"), // 1-5 scale
    reflectedAt: timestamp("reflected_at", { mode: "date" }),

    // Privacy
    isPrivate: boolean("is_private").default(true),

    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("intention_user_id_idx").on(table.userId),
        userIdDateIdx: index("intention_user_id_date_idx").on(table.userId, table.niatDate),
    };
});

// --- Mission History (v1.7.3) ---

export const userCompletedMissions = pgTable("user_completed_missions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    missionId: text("mission_id").notNull(),
    xpEarned: integer("xp_earned").default(0),
    completedAt: timestamp("completed_at").defaultNow(),

    // Metadata for sync validity
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("ucm_user_id_idx").on(table.userId),
        missionIdIdx: index("ucm_mission_id_idx").on(table.missionId),
        uniqueUserMission: uniqueIndex("ucm_user_mission_unique").on(table.userId, table.missionId),
    };
});

// --- Daily Activity Tracking (v1.7.3) ---

export const dailyActivities = pgTable("daily_activities", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    date: date("date").notNull(), // YYYY-MM-DD

    quranAyat: integer("quran_ayat").default(0),
    tasbihCount: integer("tasbih_count").default(0),

    // Stored as JSON array of strings e.g. ["Fajr", "Dhuhr"]
    prayersLogged: jsonb("prayers_logged").$type<string[]>().default([]),

    lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("da_user_id_idx").on(table.userId),
        userIdDateIdx: uniqueIndex("da_user_id_date_unique").on(table.userId, table.date),
    };
});

// --- Chat History (v1.8.0) ---

export const chatSessions = pgTable("chat_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    title: text("title"),
    messages: jsonb("messages").$type<{ role: 'user' | 'assistant', content: string, timestamp: number, id: string }[]>().default([]),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("chat_sessions_user_id_idx").on(table.userId),
        updatedAtIdx: index("chat_sessions_updated_at_idx").on(table.updatedAt),
    };
});

export const pushSubscriptions = pgTable("push_subscription", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    deviceType: text("device_type"), // 'ios', 'android', 'web'
    active: integer("active").default(1), // 1 for active, 0 for inactive

    // Prayer notification preferences (JSON: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true })
    prayerPreferences: jsonb("prayer_preferences"),

    // User location for prayer time calculation (JSON: { lat: number, lng: number, city: string })
    userLocation: jsonb("user_location"), // Deprecated in favor of columns below, keeping for migration
    latitude: real("latitude"),
    longitude: real("longitude"),
    city: text("city"),

    // Timezone for accurate prayer time scheduling (e.g., "Asia/Jakarta")
    timezone: text("timezone"),

    // Track last sent notification for each prayer to prevent duplicates (JSON: { fajr: "2024-02-11", dhuhr: "2024-02-11" })
    lastNotificationSent: jsonb("last_notification_sent"),

    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("push_subscription_user_id_idx").on(table.userId),
        // Index for location-based broadcasting
        cityIdx: index("ps_city_idx").on(table.city),
    };
});

// Types for application use
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type Intention = typeof intentions.$inferSelect;
export type NewIntention = typeof intentions.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type UserCompletedMission = typeof userCompletedMissions.$inferSelect;
export type NewUserCompletedMission = typeof userCompletedMissions.$inferInsert;
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type NewDailyActivity = typeof dailyActivities.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export const userReadingState = pgTable("user_reading_state", {
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }).primaryKey(),

    // Normalized Data
    surahId: integer("surah_id"),
    surahName: text("surah_name"),
    verseId: integer("verse_id"),
    lastReadAt: timestamp("last_read_at", { mode: 'date' }).defaultNow(),

    updatedAt: timestamp("updatedAt", { mode: 'date' }).defaultNow(),
}, (table) => {
    return {
        // Index for analytics on most read surahs
        surahIdIdx: index("urs_surah_id_idx").on(table.surahId),
    };
});

export const userReadingStateRelations = relations(userReadingState, ({ one }) => ({
    user: one(users, {
        fields: [userReadingState.userId],
        references: [users.id],
    }),
}));
