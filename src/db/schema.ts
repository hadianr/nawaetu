import { pgTable, text, timestamp, integer, uuid, primaryKey } from "drizzle-orm/pg-core";
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
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

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

// --- App Specific Logic ---

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
});

// Types for application use
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
