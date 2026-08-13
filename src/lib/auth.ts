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
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { logger } from "@/lib/logger";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? Redis.fromEnv()
    : null;

/**
 * Checks whether a userId exists in DB, leveraging Upstash Redis caching for 0ms DB queries on hit.
 * Includes graceful exception handling so database spin-ups/transient drops never throw JWTSessionError.
 */
export async function isUserValid(userId: string): Promise<boolean> {
    if (!userId) return false;

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

    try {
        const [userExists] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const isValid = Boolean(userExists);

        if (redis) {
            try {
                // Cache valid user for 5 minutes (300s), invalid user for 1 minute (60s)
                await redis.set(cacheKey, isValid ? 1 : 0, { ex: isValid ? 300 : 60 });
            } catch (e) {}
        }

        return isValid;
    } catch (e) {
        // Safe fallback: if DB query fails (e.g. Neon DB cold start or transient connection error),
        // default to true so an active valid JWT session is not abruptly broken.
        logger.error("Failed to validate user in DB, falling back to valid", e, { userId });
        return true;
    }
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

            // On explicit `update()` call, refresh trusted fields from the database safely.
            if (trigger === "update" && token.id) {
                try {
                    const [freshUser] = await db
                        .select({
                            name: users.name,
                            isMuhsinin: users.isMuhsinin,
                            gender: users.gender,
                            archetype: users.archetype,
                            image: users.image,
                        })
                        .from(users)
                        .where(eq(users.id, token.id as string))
                        .limit(1);

                    if (freshUser) {
                        if (freshUser.name) token.name = freshUser.name;
                        token.isMuhsinin = freshUser.isMuhsinin ?? false;
                        token.gender = freshUser.gender ?? null;
                        token.archetype = freshUser.archetype ?? null;
                        token.picture = freshUser.image ?? null;
                    }
                } catch (e) {
                    logger.error("Failed to refresh JWT user from DB", e);
                }
            }

            return token;
        },

        /**
         * session callback — shape the session object from the JWT token.
         * Checks user validity via Redis cache / DB. Wrapped in try-catch so transient DB errors
         * never cause NextAuth JWTSessionError crashes.
         */
        async session({ session, token }) {
            try {
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
            } catch (error) {
                logger.error("Error in session callback, preserving token session", error);
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
