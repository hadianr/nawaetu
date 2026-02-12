import { pgTable, text, timestamp, integer, uuid, primaryKey, date, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

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
    settings: text("settings"), // JSON: { theme, muadzin, calculationMethod, locale }

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
    status: text("status").notNull(), // 'pending', 'settlement', 'expired', 'failed'

    // Mayar Specifics
    mayarId: text("mayar_id").unique(), // Transaction ID from Mayar (Set by webhook)
    paymentLinkId: text("payment_link_id").unique(), // Payment Link ID from Create (Set by app)
    paymentUrl: text("payment_url"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
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
    niatType: text("niat_type").default("daily"), // 'daily', 'prayer', 'custom'
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
});

export const pushSubscriptions = pgTable("push_subscription", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    deviceType: text("device_type"), // 'ios', 'android', 'web'
    active: integer("active").default(1), // 1 for active, 0 for inactive

    // Prayer notification preferences (JSON: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true })
    prayerPreferences: text("prayer_preferences"),

    // User location for prayer time calculation (JSON: { lat: number, lng: number, city: string })
    userLocation: text("user_location"),

    // Timezone for accurate prayer time scheduling (e.g., "Asia/Jakarta")
    timezone: text("timezone"),

    // Track last sent notification for each prayer to prevent duplicates (JSON: { fajr: "2024-02-11", dhuhr: "2024-02-11" })
    lastNotificationSent: text("last_notification_sent"),

    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
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
