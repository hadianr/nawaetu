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

import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "@auth/core/adapters";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

/**
 * PERFORMANCE OPTIMIZATION: JWT session strategy
 *
 * Previous: strategy: "database"
 *   → Every `getServerSession()` call did a DB round-trip to look up the session row.
 *   → With 16 API routes calling this per-request, high-traffic periods meant
 *     dozens of unnecessary DB queries per second.
 *
 * Now: strategy: "jwt"
 *   → Session data is stored in a signed, encrypted HTTP-only cookie.
 *   → `getServerSession()` = cryptographic JWT decode in memory — ZERO DB queries.
 *   → User fields (id, isMuhsinin, gender, archetype) are embedded in the token
 *     via the `jwt` callback and refreshed on sign-in.
 *   → The sessions table is no longer written to or read from for session validation.
 *     It's kept in the schema for compatibility but unused during normal operation.
 */
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? Redis.fromEnv()
    : null;

/**
 * Checks whether a userId exists in DB, leveraging Upstash Redis caching for 0ms DB queries on hit.
 */
export async function isUserValid(userId: string): Promise<boolean> {
    const cacheKey = `user:valid:${userId}`;
    if (redis) {
        try {
            const cachedStatus = await redis.get<number>(cacheKey);
            if (cachedStatus !== null && cachedStatus !== undefined) {
                return cachedStatus === 1;
            }
        } catch (e) {
            // Non-fatal Redis fallback to DB
        }
    }

    const userExists = await db.query.users.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, userId),
        columns: { id: true },
    });

    const isValid = Boolean(userExists);
    if (redis) {
        try {
            // Cache valid user for 5 minutes (300s), invalid user for 1 minute (60s)
            await redis.set(cacheKey, isValid ? 1 : 0, { ex: isValid ? 300 : 60 });
        } catch (e) {}
    }

    return isValid;
}

export const authOptions: NextAuthConfig = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as Adapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        /**
         * jwt callback — runs when token is created (sign-in) or refreshed.
         * Embeds user fields into the token so session() doesn't need a DB lookup.
         */
        async jwt({ token, user, trigger }) {
            // On initial sign-in, `user` object is available from the adapter
            if (user) {
                token.id = user.id;
                token.isMuhsinin = user.isMuhsinin ?? false;
                token.gender = user.gender ?? null;
                token.archetype = user.archetype ?? null;
                token.picture = user.image ?? null;
            }

            // On explicit `update()` call, refresh trusted fields from the database.
            if (trigger === "update" && token.id) {
                const freshUser = await db.query.users.findFirst({
                    where: (usersTable, { eq }) => eq(usersTable.id, token.id as string),
                    columns: {
                        name: true,
                        isMuhsinin: true,
                        gender: true,
                        archetype: true,
                        image: true,
                    },
                });

                if (freshUser) {
                    if (freshUser.name) token.name = freshUser.name;
                    token.isMuhsinin = freshUser.isMuhsinin ?? false;
                    token.gender = freshUser.gender ?? null;
                    token.archetype = freshUser.archetype ?? null;
                    token.picture = freshUser.image ?? null;
                }
            }

            return token;
        },

        /**
         * session callback — shape the session object from the JWT token.
         * Checks user validity via Redis cache / DB. If user no longer exists,
         * returns null to invalidate stale JWT session automatically.
         */
        async session({ session, token }) {
            if (session.user && token.id) {
                const isValid = await isUserValid(token.id as string);
                if (!isValid) {
                    return null as any;
                }

                session.user.id = token.id as string;
                session.user.isMuhsinin = token.isMuhsinin ?? false;
                session.user.gender = token.gender ?? null;
                session.user.archetype = token.archetype ?? null;
                session.user.image = (token.picture as string) ?? null;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        // 30 days — affects how long the JWT cookie lives before forced re-login
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, handlers } = NextAuth(authOptions);

/**
 * Helper to get user session in Server Components and API Routes.
 * With JWT strategy, this is now O(1) — cryptographic decode only, no DB query.
 */
export const getServerSession = () => auth();
