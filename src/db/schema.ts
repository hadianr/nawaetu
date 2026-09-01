/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { pgTable, text, timestamp, integer, uuid, primaryKey, date, boolean, index, uniqueIndex, jsonb, pgEnum, real, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// --- Enums ---
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "settlement", "expired", "failed"]);
export const intentionTypeEnum = pgEnum("intention_type", ["daily", "prayer", "custom"]);
export const streakDayStatusEnum = pgEnum("streak_day_status", ["qualified", "frozen", "repaired"]);
export const progressionOriginEnum = pgEnum("progression_origin", ["server", "guest_import", "backfill"]);
export const hasanahSourceEnum = pgEnum("hasanah_source", [
    "mission",
    "prayer",
    "quran",
    "dhikr",
    "intention",
    "streak_milestone",
    "reversal",
    "adjustment",
]);

// --- Fasting Tracker Enums (v2.0.0) ---
export const fastingStatusEnum = pgEnum("fasting_status", [
    "fasting",       // ✅ Puasa penuh
    "not_fasting",   // ❌ Tidak puasa (sengaja/tanpa uzur)
    "sick",          // 🤒 Sakit
    "traveling",     // ✈️ Safar
    "menstruation",  // 🌸 Haid
    "postpartum",    // 🌺 Nifas
    "pregnant",      // 🤰 Hamil
    "breastfeeding", // 🤱 Menyusui
    "elderly",       // 👴 Lansia/sakit permanen
]);

export const fastingConsequenceEnum = pgEnum("fasting_consequence", [
    "none",   // Puasa → tidak ada kewajiban
    "qadha",  // Wajib mengganti puasa
    "fidyah", // Wajib bayar fidyah
    "choice", // Pilihan qadha atau fidyah (ikhtilaf madzhab)
]);

export const tarawehChoiceEnum = pgEnum("taraweh_choice", ["8", "20"]);
export const tarawehLocationEnum = pgEnum("taraweh_location", ["masjid", "rumah"]);
export const prayerLocationEnum = pgEnum("prayer_location", ["masjid", "rumah", "keduanya"]);

// --- Users & Auth (Compatible with NextAuth.js) ---

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),

    // Intention Streak Tracking
    intentionStreakCurrent: integer("intention_streak_current").default(0),
    intentionStreakLongest: integer("intention_streak_longest").default(0),
    lastIntentionDate: date("last_intention_date"),

    // Muhsinin & Donation Tracking (v1.6.0)
    isMuhsinin: boolean("is_muhsinin").default(false),
    muhsininSince: timestamp("muhsinin_since"),
    totalInfaq: integer("total_infaq").default(0), // Track total donation amount

    // User Preferences (v1.7.0)
    gender: genderEnum("gender"),
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
    intentionText: text("intention_text").notNull(),
    intentionType: intentionTypeEnum("intention_type").default("daily"), // 'daily', 'prayer', 'custom'
    intentionDate: timestamp("intention_date", { mode: "date" }).notNull(),

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
        userIdDateIdx: index("intention_user_id_date_idx").on(table.userId, table.intentionDate),
    };
});

// --- Mission History (v1.7.3) ---

export const userCompletedMissions = pgTable("user_completed_missions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    missionId: text("mission_id").notNull(),
    hasanahEarned: integer("hasanah_earned").default(0),
    completedAt: timestamp("completed_at").defaultNow(),
    completedDate: date("completed_date"), // YYYY-MM-DD

    // Metadata for sync validity
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        userIdIdx: index("ucm_user_id_idx").on(table.userId),
        missionIdIdx: index("ucm_mission_id_idx").on(table.missionId),
        uniqueUserMission: uniqueIndex("ucm_user_mission_unique").on(table.userId, table.missionId, table.completedDate),
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
    quranReadingSeconds: integer("quran_reading_seconds").default(0),
    hasanahGained: integer("hasanah_gained").default(0),
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

// --- Canonical Streak & Progression (v2) ---

export const userStreakDays = pgTable("user_streak_days", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    localDate: date("local_date").notNull(),
    status: streakDayStatusEnum("status").notNull().default("qualified"),
    source: hasanahSourceEnum("source").notNull(),
    sourceId: text("source_id").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    timezone: text("timezone").notNull(),
    origin: progressionOriginEnum("origin").notNull().default("server"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userDateUnique: uniqueIndex("user_streak_days_user_date_unique").on(table.userId, table.localDate),
    userDateIdx: index("user_streak_days_user_date_idx").on(table.userId, table.localDate),
    sourceIdNotEmpty: check("user_streak_days_source_id_not_empty", sql`length(${table.sourceId}) > 0`),
    timezoneNotEmpty: check("user_streak_days_timezone_not_empty", sql`length(${table.timezone}) > 0`),
}));

export const userStreakState = pgTable("user_streak_state", {
    userId: text("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    currentDays: integer("current_days").notNull().default(0),
    longestDays: integer("longest_days").notNull().default(0),
    lastStreakDate: date("last_streak_date"),
    freezesAvailable: integer("freezes_available").notNull().default(0),
    timezone: text("timezone").notNull().default("UTC"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    currentDaysNonnegative: check("user_streak_state_current_days_nonnegative", sql`${table.currentDays} >= 0`),
    longestDaysValid: check("user_streak_state_longest_days_valid", sql`${table.longestDays} >= ${table.currentDays}`),
    freezesNonnegative: check("user_streak_state_freezes_nonnegative", sql`${table.freezesAvailable} >= 0`),
}));

export const hasanahLedger = pgTable("hasanah_ledger", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    source: hasanahSourceEnum("source").notNull(),
    sourceId: text("source_id").notNull(),
    amount: integer("amount").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    origin: progressionOriginEnum("origin").notNull().default("server"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userSourceUnique: uniqueIndex("hasanah_ledger_user_source_unique").on(table.userId, table.source, table.sourceId),
    userOccurredAtIdx: index("hasanah_ledger_user_occurred_at_idx").on(table.userId, table.occurredAt),
    sourceIdNotEmpty: check("hasanah_ledger_source_id_not_empty", sql`length(${table.sourceId}) > 0`),
}));

export const userProgressState = pgTable("user_progress_state", {
    userId: text("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    hasanahTotal: integer("hasanah_total").notNull().default(0),
    level: integer("level").notNull().default(1),
    levelRuleVersion: integer("level_rule_version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    hasanahTotalNonnegative: check("user_progress_state_hasanah_nonnegative", sql`${table.hasanahTotal} >= 0`),
    levelPositive: check("user_progress_state_level_positive", sql`${table.level} >= 1`),
    ruleVersionPositive: check("user_progress_state_rule_version_positive", sql`${table.levelRuleVersion} >= 1`),
}));

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

    latitude: real("latitude"),
    longitude: real("longitude"),
    city: text("city"),

    // Timezone for accurate prayer time scheduling (e.g., "Asia/Makassar", "UTC")
    timezone: text("timezone"),

    // Geographic data (Kabupaten/Kota level — NOT kecamatan)
    // Populated via reverse geocoding from lat/lng when user sets prayer location
    country: text("country"),
    countryCode: text("country_code"), // ISO 3166-1 alpha-2 e.g., "id", "my", "sg"

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

// --- Ramadhan Fasting Log (v2.0.0) ---
// One row per user per hijri day per hijri year.
// Offline-first: localStorage is source of truth, this table is synced from client.
export const ramadhanFastingLog = pgTable("ramadhan_fasting_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    hijriYear: integer("hijri_year").notNull(),  // e.g. 1446, 1447
    hijriDay: integer("hijri_day").notNull(),    // 1–30
    status: fastingStatusEnum("status").notNull().default("fasting"),
    consequence: fastingConsequenceEnum("consequence").notNull().default("none"),
    madzhab: text("madzhab"),  // "syafii" | "hanafi" | "maliki" | "hanbali" | null
    note: text("note"),
    qadhaDone: boolean("qadha_done").default(false), // qadha or fidyah already fulfilled
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userYearDayUnique: uniqueIndex("rfl_user_year_day_unique").on(table.userId, table.hijriYear, table.hijriDay),
    userYearIdx: index("rfl_user_year_idx").on(table.userId, table.hijriYear),
}));

export const ramadhanTarawehLog = pgTable("ramadhan_taraweh_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    hijriYear: integer("hijri_year").notNull(),
    hijriDay: integer("hijri_day").notNull(),
    choice: tarawehChoiceEnum("choice"), // '8', '20', or null if deleted
    location: tarawehLocationEnum("location"), // 'masjid' or 'rumah'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userYearDayUnique: uniqueIndex("rtl_user_year_day_unique").on(table.userId, table.hijriYear, table.hijriDay),
    userYearIdx: index("rtl_user_year_idx").on(table.userId, table.hijriYear),
}));

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
export type UserStreakDay = typeof userStreakDays.$inferSelect;
export type NewUserStreakDay = typeof userStreakDays.$inferInsert;
export type UserStreakState = typeof userStreakState.$inferSelect;
export type HasanahLedgerEntry = typeof hasanahLedger.$inferSelect;
export type UserProgressState = typeof userProgressState.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type RamadhanFastingLog = typeof ramadhanFastingLog.$inferSelect;
export type NewRamadhanFastingLog = typeof ramadhanFastingLog.$inferInsert;
export type RamadhanTarawehLog = typeof ramadhanTarawehLog.$inferSelect;
export type NewRamadhanTarawehLog = typeof ramadhanTarawehLog.$inferInsert;
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
// --- Ramadhan Daily Log (prayer location + sunnah checklist, v2.0) ---
// Tracks per-day: fardhu prayer location habit + sunnah prayers done
export const ramadhanDailyLog = pgTable("ramadhan_daily_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    hijriYear: integer("hijri_year").notNull(),
    hijriDay: integer("hijri_day").notNull(), // 1–30

    // Individual fardhu prayers at masjid (true = at masjid, false = at rumah/home, null = not logged)
    fajrAtMasjid: boolean("fajr_at_masjid"),
    dhuhrAtMasjid: boolean("dhuhr_at_masjid"),
    asrAtMasjid: boolean("asr_at_masjid"),
    maghribAtMasjid: boolean("maghrib_at_masjid"),
    ishaAtMasjid: boolean("isha_at_masjid"),

    // Sunnah prayers done today
    dhuha: boolean("dhuha").default(false),
    rawatibQabl: boolean("rawatib_qabl").default(false),  // Sunnah before fardhu (Qabliyah)
    rawatibBad: boolean("rawatib_bad").default(false),   // Sunnah after fardhu (Ba'diyah)
    witir: boolean("witir").default(false),
    istikharah: boolean("istikharah").default(false),
    hajat: boolean("hajat").default(false),
    taubat: boolean("taubat").default(false),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userYearDayIdx: uniqueIndex("rdl_user_year_day_unique").on(table.userId, table.hijriYear, table.hijriDay),
    userIdIdx: index("rdl_user_id_idx").on(table.userId),
}));

export type RamadhanDailyLog = typeof ramadhanDailyLog.$inferSelect;
export type NewRamadhanDailyLog = typeof ramadhanDailyLog.$inferInsert;

// --- User Feedback Table (v1.11.0) ---
export const userFeedback = pgTable("user_feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'bug' | 'feature'
    message: text("message").notNull(),
    deviceInfo: jsonb("device_info").notNull(), // browser, OS, app version, screen size, user-agent
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
    user: one(users, {
        fields: [userFeedback.userId],
        references: [users.id],
    }),
}));

export type UserFeedback = typeof userFeedback.$inferSelect;
export type NewUserFeedback = typeof userFeedback.$inferInsert;

// --- Sirah Nabawiyah User State Tables ---
export const sirahUserProgress = pgTable("sirah_user_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    sectionId: text("section_id").notNull(),
    chapterSlug: text("chapter_slug").notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (table) => ({
    userSectionIdx: uniqueIndex("sirah_user_section_unique").on(table.userId, table.sectionId),
    userIdIdx: index("sirah_user_progress_user_idx").on(table.userId),
}));

export const sirahBookmarks = pgTable("sirah_bookmarks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    sectionId: text("section_id").notNull(),
    chapterSlug: text("chapter_slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userBookmarkIdx: uniqueIndex("sirah_user_bookmark_unique").on(table.userId, table.sectionId),
    userIdIdx: index("sirah_bookmarks_user_idx").on(table.userId),
}));

export type SirahUserProgress = typeof sirahUserProgress.$inferSelect;
export type SirahBookmark = typeof sirahBookmarks.$inferSelect;
